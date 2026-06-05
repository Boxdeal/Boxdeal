import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { CartItem, CartState, CouponValidationResult } from "@/types";

const initialState: CartState = {
  items: [],
  coupon: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<CartItem>) {
      const existing = state.items.find(
        (i) => i.product_id === action.payload.product_id
      );
      if (existing) {
        const newQty = existing.quantity + action.payload.quantity;
        existing.quantity = Math.min(newQty, existing.stock_quantity);
      } else {
        state.items.push(action.payload);
      }
    },

    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.product_id !== action.payload);
    },

    updateQuantity(
      state,
      action: PayloadAction<{ product_id: string; quantity: number }>
    ) {
      const item = state.items.find(
        (i) => i.product_id === action.payload.product_id
      );
      if (item) {
        item.quantity = Math.max(
          1,
          Math.min(action.payload.quantity, item.stock_quantity)
        );
      }
    },

    clearCart(state) {
      state.items = [];
      state.coupon = null;
    },

    applyCoupon(
      state,
      action: PayloadAction<CouponValidationResult & { code: string }>
    ) {
      state.coupon = action.payload;
    },

    removeCoupon(state) {
      state.coupon = null;
    },
  },
});

export const {
  addItem,
  removeItem,
  updateQuantity,
  clearCart,
  applyCoupon,
  removeCoupon,
} = cartSlice.actions;

export default cartSlice.reducer;
