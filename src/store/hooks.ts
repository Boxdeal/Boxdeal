import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "./index";
import { computeCouponDiscount } from "@/lib/utils/coupon";

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

// Live coupon discount, recomputed from the CURRENT subtotal so it always
// reflects the cart (item removed / quantity changed → discount updates).
export const useCartDiscount = () =>
  useAppSelector((s) => {
    const subtotal = s.cart.items.reduce(
      (sum, item) => sum + item.selling_price * item.quantity,
      0
    );
    return computeCouponDiscount(s.cart.coupon, subtotal);
  });

// ─── Wishlist selectors ───────────────────────────────────────
export const useWishlist = () => useAppSelector((s) => s.wishlist.productIds);

export const useIsWishlisted = (productId: string) =>
  useAppSelector((s) => s.wishlist.productIds.includes(productId));

// ─── Auth selectors ───────────────────────────────────────────
export const useUser = () => useAppSelector((s) => s.auth.user);
export const useProfile = () => useAppSelector((s) => s.auth.profile);
export const useIsAdmin = () =>
  useAppSelector((s) => s.auth.profile?.is_admin ?? false);

// ─── UI selectors ─────────────────────────────────────────────
export const useUI = () => useAppSelector((s) => s.ui);
export const useCartOpen = () => useAppSelector((s) => s.ui.cartOpen);
