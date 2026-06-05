import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { UIState } from "@/types";

const initialState: UIState = {
  cartOpen: false,
  mobileMenuOpen: false,
  searchOpen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    openCart(state) {
      state.cartOpen = true;
    },
    closeCart(state) {
      state.cartOpen = false;
    },
    toggleCart(state) {
      state.cartOpen = !state.cartOpen;
    },

    openMobileMenu(state) {
      state.mobileMenuOpen = true;
    },
    closeMobileMenu(state) {
      state.mobileMenuOpen = false;
    },

    openSearch(state) {
      state.searchOpen = true;
    },
    closeSearch(state) {
      state.searchOpen = false;
    },
    toggleSearch(state) {
      state.searchOpen = !state.searchOpen;
    },

    closeAllPanels(state) {
      state.cartOpen = false;
      state.mobileMenuOpen = false;
      state.searchOpen = false;
    },

    setCartOpen(state, action: PayloadAction<boolean>) {
      state.cartOpen = action.payload;
    },
  },
});

export const {
  openCart,
  closeCart,
  toggleCart,
  openMobileMenu,
  closeMobileMenu,
  openSearch,
  closeSearch,
  toggleSearch,
  closeAllPanels,
  setCartOpen,
} = uiSlice.actions;

export default uiSlice.reducer;
