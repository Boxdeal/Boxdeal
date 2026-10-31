import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { WishlistState } from "@/types";

const initialState: WishlistState = {
  productIds: [],
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    toggleWishlist(state, action: PayloadAction<string>) {
      const idx = state.productIds.indexOf(action.payload);
      if (idx === -1) {
        state.productIds.push(action.payload);
      } else {
        state.productIds.splice(idx, 1);
      }
    },
    // Replace the whole list — used by the account sync.
    setWishlist(state, action: PayloadAction<string[]>) {
      state.productIds = action.payload;
    },
  },
});

export const { toggleWishlist, setWishlist } = wishlistSlice.actions;

export default wishlistSlice.reducer;
