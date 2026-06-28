import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import "./index.css";
import App from "./App";

import { LanguageProvider } from "./contexts/LanguageContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HelmetProvider>
      <LanguageProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <App />
        </BrowserRouter>
      </LanguageProvider>
    </HelmetProvider>
  </StrictMode>
);
