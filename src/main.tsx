// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

/**
 * JaipurCircle: SSR + SPA hybrid boot (safe)
 *
 * ✅ If the response is SSR HTML (edge functions), it includes:
 *    <div id="ssr-prerender">...</div>
 *    In that case we MUST NOT mount React, otherwise it will wipe SSR HTML.
 *
 * ✅ If SSR marker is NOT present, we always mount SPA
 *    (prevents blank pages on /stories when SSR isn't being served to this user).
 */

function hasSSRMarker(): boolean {
  return !!document.getElementById("ssr-prerender");
}

(function bootstrap() {
  // SSR response detected -> keep SSR HTML intact, do not mount SPA.
  if (hasSSRMarker()) {
    console.log("[SSR] SSR marker detected; skipping React mount.");
    return;
  }

  // Normal SPA boot
  const rootEl = document.getElementById("root");
  if (!rootEl) return;

  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
})();