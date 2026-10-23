import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import "react-datepicker/dist/react-datepicker.css";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import App from "./App.jsx";
import { login } from "./redux/features/authSlice.js";
import { persistor, store } from "./redux/store.js";
import { toastAlert } from "./utils/SweetAlert.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.scss";
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslation from './locales/English.json';
import prTranslation from './locales/Portuguese.json';
import i18n from 'i18next'; 
import ReactGA from 'react-ga4';

const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
if (gaId && String(gaId).startsWith("G-")) {
  ReactGA.initialize(gaId);
  ReactGA.send("pageview");
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      English: {
        translation: enTranslation,
      },
      Portuguese: {
        translation: prTranslation,
      },
    },
    fallbackLng: 'English', 
    interpolation: {
      escapeValue: false,
    },
  });

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      throwOnError: (error) => {
        if (error.response?.status === 401) {
          toastAlert("error", error.response?.data?.message);
          store.dispatch(login(null));
        } else {
          toastAlert(
            "error",
            error?.response?.data?.message
              ? error?.response?.data?.message
              : error?.message
          );
        }
      },
    },
    mutations: {
      onError: (error) => {
        if (error.response?.status === 401) {
          toastAlert("error", error.response?.data?.message);
          store.dispatch(login(null));
        } else {
          toastAlert(
            "error",
            error?.response?.data?.message
              ? error?.response?.data?.message
              : error?.message
          );
        }
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <React.StrictMode>
            <App />
          </React.StrictMode>
        </BrowserRouter>
      </QueryClientProvider>
    </PersistGate>
  </Provider>
);
