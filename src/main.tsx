// src/main.tsx
import React from "react";
import { hydrateRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

/**
 * JaipurCircle: SSR + SPA hybrid boot (safe)
 *
 * ✅ If SSR marker is present -> HYDRATE (preserve content, add interactivity)
 * ✅ If no SSR marker -> normal SPA mount
 */

function hasSSRMarker(): boolean {
  return !!document.getElementById("ssr-prerender");
}

function bootstrap() {
  const rootEl = document.getElementById("root");
  if (!rootEl) return;

  // SSR content detected -> hydrate it (preserve HTML, add React interactivity)
  if (hasSSRMarker() && rootEl.hasChildNodes()) {
    console.log("[SSR] SSR marker detected; hydrating React");
    hydrateRoot(rootEl, <App />);
    return;
  }

  // No SSR content -> normal SPA mount
  console.log("[SSR] No SSR marker; creating React root");
  const { createRoot } = ReactDOM;
  createRoot(rootEl).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

bootstrap();
