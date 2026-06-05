import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "./index";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T): T =>
  useSelector(selector);

// ─── Cart selectors ───────────────────────────────────────────
export const useCart = () => useAppSelector((s) => s.cart);

export const useCartItemCount = () =>
  useAppSelector((s) =>
    s.cart.items.reduce((sum, item) => sum + item.quantity, 0)
  );

export const useCartSubtotal = () =>
  useAppSelector((s) =>
    s.cart.items.reduce(
      (sum, item) => sum + item.selling_price * item.quantity,
      0
    )
  );

// ─── Wishlist selectors ───────────────────────────────────────
export const useWishlist = () => useAppSelector((s) => s.wishlist.productIds);

export const useIsWishlisted = (productId: string) =>
  useAppSelector((s) => s.wishlist.productIds.includes(productId));

// ─── Auth selectors ───────────────────────────────────────────
export const useAuth = () => useAppSelector((s) => s.auth);
export const useUser = () => useAppSelector((s) => s.auth.user);
export const useProfile = () => useAppSelector((s) => s.auth.profile);
export const useIsAdmin = () =>
  useAppSelector((s) => s.auth.profile?.is_admin ?? false);

// ─── UI selectors ─────────────────────────────────────────────
export const useUI = () => useAppSelector((s) => s.ui);
export const useCartOpen = () => useAppSelector((s) => s.ui.cartOpen);
