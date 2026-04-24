// src/main.tsx
import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

/**
 * JaipurCircle: SSR + SPA hybrid boot
 *
 * - If SSR content exists (ssr-prerender marker) -> HYDRATE (preserve content)
 * - If no SSR content -> normal SPA mount
 */

function hasSSRMarker(): boolean {
  return !!document.getElementById("ssr-prerender");
}

function bootstrap() {
  const rootEl = document.getElementById("root");
  if (!rootEl) {
    console.error("[Bootstrap] Root element not found");
    return;
  }

  // Check if SSR content exists
  if (hasSSRMarker() && rootEl.hasChildNodes()) {
    // SSR content detected - hydrate it (preserve HTML, add React interactivity)
    console.log("[Bootstrap] SSR detected - hydrating React");
    hydrateRoot(rootEl, <App />);
  } else {
    // No SSR content - normal SPA mount
    console.log("[Bootstrap] No SSR - creating React root");
    createRoot(rootEl).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
  }
}

bootstrap();
