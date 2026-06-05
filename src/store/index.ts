import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import cartReducer from "./slices/cartSlice";
import wishlistReducer from "./slices/wishlistSlice";
import authReducer from "./slices/authSlice";
import uiReducer from "./slices/uiSlice";

// Custom storage wrapper to handle errors gracefully
const noopStorage = {
  getItem: async () => null,
  setItem: async () => {},
  removeItem: async () => {},
};

const createStorage = () => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return storage;
    }
  } catch {
    // Fall back to noop storage if localStorage is unavailable
  }
  return noopStorage;
};

const persistConfig = {
  key: "boxdeal-root",
  version: 1,
  storage: createStorage(),
  whitelist: ["cart", "wishlist"],
};

const rootReducer = combineReducers({
  cart:     cartReducer,
  wishlist: wishlistReducer,
  auth:     authReducer,
  ui:       uiReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
