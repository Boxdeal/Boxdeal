"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "react-redux";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCartItems, clearCart } from "@/store/slices/cartSlice";
import { setWishlist } from "@/store/slices/wishlistSlice";
import type { RootState } from "@/store";
import type { CartItem } from "@/types";

// One cart and one wishlist per account, shared by every device.
//
// The browser keeps a working copy (Redux + localStorage); the account copy
// lives on the server (/api/user/activity). This component keeps them in step:
//   • On login, the saved copy is MERGED into this device's copy — same product
//     on both sides keeps the larger quantity, never the sum — and saved back.
//   • Every local change is saved to the account.
//   • When the tab regains focus, and every 30s while visible, the account copy
//     is pulled, so a change made on another device shows up here.
// A small marker in localStorage remembers which account this device's copy
// belongs to and whether it has changes not yet saved, so a reload never
// throws away an unsaved change and never re-merges a stale copy.
// On logout the device copy is cleared — it belongs to the account.

const META_KEY = "boxdeal-account-sync";
const CART_DEBOUNCE_MS = 800;
const WISHLIST_DEBOUNCE_MS = 300;
const POLL_MS = 30_000;

interface SyncMeta {
  userId: string;
  cartDirty: boolean;
  wishDirty: boolean;
}

function readMeta(): SyncMeta | null {
  try {
    const raw = localStorage.getItem(META_KEY);
    return raw ? (JSON.parse(raw) as SyncMeta) : null;
  } catch {
    return null;
  }
}

function writeMeta(meta: SyncMeta | null) {
  try {
    if (meta) localStorage.setItem(META_KEY, JSON.stringify(meta));
    else localStorage.removeItem(META_KEY);
  } catch {
    /* storage disabled */
  }
}

function markDirty(userId: string, field: "cartDirty" | "wishDirty", dirty: boolean) {
  const meta = readMeta();
  // Only track changes for the account this device copy already belongs to;
  // anything else gets merged on the next login sync anyway.
  if (meta?.userId !== userId) return;
  writeMeta({ ...meta, [field]: dirty });
}

const cartKey = (items: CartItem[]) =>
  JSON.stringify(items.map((i) => [i.product_id, i.quantity]));
const wishKey = (ids: string[]) => [...ids].sort().join(",");

/** Saved cart + this device's cart, without doubling shared items. */
function mergeCart(server: CartItem[], local: CartItem[]): CartItem[] {
  const byId = new Map(server.map((i) => [i.product_id, { ...i }]));
  for (const l of local) {
    const s = byId.get(l.product_id);
    if (s) s.quantity = Math.max(s.quantity, l.quantity);
    else byId.set(l.product_id, { ...l });
  }
  return [...byId.values()].map((i) => ({
    ...i,
    quantity: i.stock_quantity > 0 ? Math.min(i.quantity, i.stock_quantity) : i.quantity,
  }));
}

function mergeWishlist(server: string[], local: string[]): string[] {
  return [...new Set([...server, ...local])];
}

async function post(body: object): Promise<boolean> {
  try {
    const r = await fetch("/api/user/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
    });
    return r.ok;
  } catch {
    return false;
  }
}

const cartBody = (items: CartItem[]) => ({
  cart: items.map((i) => ({
    product_id: i.product_id,
    quantity: i.quantity,
    price: i.selling_price,
    name: i.name,
  })),
});

export function CustomerActivitySync() {
  const store = useStore<RootState>();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((s) => s.cart.items);
  const wishlistIds = useAppSelector((s) => s.wishlist.productIds);

  const [userId, setUserId] = useState<string | null>(null);
  // True once this login's first sync with the account has finished.
  const [ready, setReady] = useState(false);
  const userRef = useRef<string | null>(null);
  // What the account is known to hold — local copies equal to these are
  // already saved and need no push.
  const savedCart = useRef<string | null>(null);
  const savedWish = useRef<string | null>(null);
  const pulling = useRef(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      const id = session?.user?.id ?? null;
      userRef.current = id;
      if (event === "SIGNED_OUT") {
        writeMeta(null);
        dispatch(clearCart());
        dispatch(setWishlist([]));
      }
      setUserId(id);
    });
    return () => data.subscription.unsubscribe();
  }, [dispatch]);

  const pushCart = useCallback(async (uid: string, items: CartItem[]) => {
    if (userRef.current !== uid) return;
    const key = cartKey(items);
    if (await post(cartBody(items))) {
      savedCart.current = key;
      if (cartKey(store.getState().cart.items) === key) markDirty(uid, "cartDirty", false);
    }
  }, [store]);

  const pushWishlist = useCallback(async (uid: string, ids: string[]) => {
    if (userRef.current !== uid) return;
    const key = wishKey(ids);
    if (await post({ wishlist: ids })) {
      savedWish.current = key;
      if (wishKey(store.getState().wishlist.productIds) === key) markDirty(uid, "wishDirty", false);
    }
  }, [store]);

  const pull = useCallback(async (uid: string) => {
    if (pulling.current || userRef.current !== uid) return;
    pulling.current = true;
    try {
      const before = store.getState();
      const cartAtStart = cartKey(before.cart.items);
      const wishAtStart = wishKey(before.wishlist.productIds);

      const res = await fetch("/api/user/activity", { cache: "no-store" });
      if (!res.ok || userRef.current !== uid) return;
      const server = (await res.json()) as { cart: CartItem[]; wishlist: string[] };

      const now = store.getState();
      const meta = readMeta();
      const sameAccount = meta?.userId === uid;
      // Claim this device copy for the account before saving anything.
      if (!sameAccount) writeMeta({ userId: uid, cartDirty: true, wishDirty: true });
      const pending: Promise<void>[] = [];

      // A change made while this request was in flight wins; its own save is
      // already queued (a first-login merge still runs — it keeps that change).
      // Otherwise:
      //   first login on this device → merge, then save the merged copy
      //   unsaved local change       → keep it, and save it
      //   nothing pending here       → take the account copy (another device
      //                                 changed it, or prices/stock moved)

      // ── Cart ──
      if (!sameAccount || cartKey(now.cart.items) === cartAtStart) {
        const local = now.cart.items;
        const save = !sameAccount || meta.cartDirty;
        const next = !sameAccount ? mergeCart(server.cart, local)
                   : meta.cartDirty ? local
                   : server.cart;
        if (!save) savedCart.current = cartKey(next);
        if (JSON.stringify(next) !== JSON.stringify(local)) dispatch(setCartItems(next));
        if (save) pending.push(pushCart(uid, next));
      }

      // ── Wishlist ──
      if (!sameAccount || wishKey(now.wishlist.productIds) === wishAtStart) {
        const local = now.wishlist.productIds;
        const save = !sameAccount || meta.wishDirty;
        const next = !sameAccount ? mergeWishlist(server.wishlist, local)
                   : meta.wishDirty ? local
                   : server.wishlist;
        if (!save) savedWish.current = wishKey(next);
        if (wishKey(next) !== wishKey(local)) dispatch(setWishlist(next));
        if (save) pending.push(pushWishlist(uid, next));
      }

      await Promise.all(pending);
      setReady(true);
    } catch {
      /* offline — try again on the next focus / tick */
    } finally {
      pulling.current = false;
    }
  }, [store, dispatch, pushCart, pushWishlist]);

  // A new login: forget what was known, then sync with the account.
  useEffect(() => {
    setReady(false);
    if (!userId) {
      savedCart.current = null;
      savedWish.current = null;
      return;
    }
    const s = store.getState();
    const meta = readMeta();
    // If this device copy already belongs to the account and has no unsaved
    // change, it matches what the account held when it was last saved.
    savedCart.current = meta?.userId === userId && !meta.cartDirty ? cartKey(s.cart.items) : null;
    savedWish.current = meta?.userId === userId && !meta.wishDirty ? wishKey(s.wishlist.productIds) : null;
    pull(userId);

    const onVisible = () => {
      if (document.visibilityState === "visible") pull(userId);
    };
    const timer = setInterval(onVisible, POLL_MS);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [userId, store, pull]);

  // Local cart edits → account.
  useEffect(() => {
    if (!userId || userRef.current !== userId) return;
    const key = cartKey(cartItems);
    if (key === savedCart.current) return;
    markDirty(userId, "cartDirty", true);
    if (!ready) return;   // the login sync will save it
    const t = setTimeout(() => pushCart(userId, cartItems), CART_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [userId, ready, cartItems, pushCart]);

  // Local wishlist edits → account.
  useEffect(() => {
    if (!userId || userRef.current !== userId) return;
    const key = wishKey(wishlistIds);
    if (key === savedWish.current) return;
    markDirty(userId, "wishDirty", true);
    if (!ready) return;
    const t = setTimeout(() => pushWishlist(userId, wishlistIds), WISHLIST_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [userId, ready, wishlistIds, pushWishlist]);

  return null;
}
