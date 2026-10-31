"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const MESSAGES = {
  cart:     "Please log in to add items to your cart",
  wishlist: "Please log in to save items to your wishlist",
} as const;

/**
 * Cart and wishlist are for logged-in customers only. Call the returned
 * function before adding: it resolves true when logged in; otherwise it shows
 * a message, sends the guest to /login (and back here afterwards) and
 * resolves false.
 */
export function useRequireLogin() {
  const router = useRouter();
  const pathname = usePathname();

  return useCallback(async (action: keyof typeof MESSAGES): Promise<boolean> => {
    const { data: { session } } = await getSupabaseBrowserClient().auth.getSession();
    if (session?.user) return true;

    toast.info(MESSAGES[action]);
    router.push(`/login?redirect=${encodeURIComponent(pathname || "/")}`);
    return false;
  }, [router, pathname]);
}
