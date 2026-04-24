// src/main.tsx
import React from "react";
import { hydrateRoot, createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const rootEl = document.getElementById("root");
const hasSSRContent = rootEl?.innerHTML?.length > 1000;

if (rootEl) {
  if (hasSSRContent) {
    console.log("[Bootstrap] SSR content detected - hydrating");
    hydrateRoot(rootEl, <App />);
  } else {
    console.log("[Bootstrap] No SSR content - creating root");
    createRoot(rootEl).render(<App />);
  }
}
