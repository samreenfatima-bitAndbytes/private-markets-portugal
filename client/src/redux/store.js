// store.js
import { configureStore } from "@reduxjs/toolkit";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import authSlice from "./features/authSlice";
import sliderSlice from "./features/sliderSlice";
import languageSlice from "./features/languageSlice";
import cartSlice from "./features/cartSlice";

const store = configureStore({
  reducer: {
    auth: persistReducer(
      {
        key: "auth_v2",
        storage,
      },
      authSlice
    ),
    sidebar: persistReducer(
      {
        key: "slider",
        storage,
      },
      sliderSlice
    ),

    language: persistReducer(
      {
        key: "setLanguage",
        storage,
      },
      languageSlice
    ),
    cart: persistReducer(
      {
        key: "cart",
        storage,
      },
      cartSlice
    ),
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

const persistor = persistStore(store);

export { persistor, store };
