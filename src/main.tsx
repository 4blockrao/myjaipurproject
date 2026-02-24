import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Detect SSR-rendered pages (Supabase adds ?__ssr=1)
const isSSRPage =
  typeof window !== "undefined" &&
  window.location.search.includes("__ssr=1");

// Only mount React SPA if NOT an SSR page
if (!isSSRPage) {
  const rootElement = document.getElementById("root");

  if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
}