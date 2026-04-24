// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

/**
 * JaipurCircle: SSR + SPA hybrid boot (safe)
 *
 * ✅ If SSR marker is present -> KEEP SSR HTML, React mounts in background for SPA navigation
 * ✅ If no SSR marker -> normal SPA mount
 */

function hasSSRMarker(): boolean {
  return !!document.getElementById("ssr-prerender");
}

function bootstrap() {
  const rootEl = document.getElementById("root");
  if (!rootEl) return;

  // SSR content detected -> keep visible HTML, mount React separately for SPA navigation
  if (hasSSRMarker() && rootEl.hasChildNodes()) {
    console.log("[SSR] SSR marker detected; keeping visible HTML");

    // Mount React on a separate hidden element to enable SPA navigation
    // This preserves the visible SSR content while allowing React Router to work
    let reactMount = document.getElementById("react-mount");
    if (!reactMount) {
      reactMount = document.createElement("div");
      reactMount.id = "react-mount";
      reactMount.style.display = "none";
      document.body.appendChild(reactMount);
    }

    ReactDOM.createRoot(reactMount).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
    return;
  }

  // No SSR content -> normal SPA mount
  console.log("[SSR] No SSR marker; creating React root");
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

bootstrap();
