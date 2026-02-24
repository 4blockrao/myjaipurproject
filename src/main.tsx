// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

/**
 * JaipurCircle: SSR + SPA hybrid boot
 *
 * Goals:
 * 1) /stories/* is SSR-only -> DO NOT mount React there (it would wipe SSR HTML)
 * 2) Kill old PWA/ServiceWorker caches that can hijack requests and cause
 *    "HTML shown as text" / blank pages in normal browser (incognito works).
 */

async function nukeOldServiceWorkerAndCaches() {
  try {
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }

    // Clear common runtime caches (best-effort)
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((k) => {
          // remove anything Workbox/VitePWA-ish + general app caches
          const lk = k.toLowerCase();
          if (
            lk.includes("workbox") ||
            lk.includes("vite") ||
            lk.includes("pwa") ||
            lk.includes("precache") ||
            lk.includes("runtime") ||
            lk.includes("jc") ||
            lk.includes("jaipurcircle")
          ) {
            return caches.delete(k);
          }
          return Promise.resolve(false);
        })
      );
    }
  } catch (e) {
    // Don’t brick the app if cleanup fails.
    console.warn("[PWA cleanup] failed:", e);
  }
}

function shouldSkipReactMount(): boolean {
  const path = window.location.pathname || "";
  const isStoriesRoute = /^\/stories(\/|$)/i.test(path);

  // SSR HTML returned by your edge functions includes this marker.
  const hasSSRPrerender = !!document.getElementById("ssr-prerender");

  return isStoriesRoute || hasSSRPrerender;
}

(async function bootstrap() {
  // Always attempt to remove old SW/caches first (safe + best-effort)
  await nukeOldServiceWorkerAndCaches();

  // SSR-only routes: do not mount React
  if (shouldSkipReactMount()) {
    console.log("[SSR] Skipping React mount for:", window.location.pathname);
    return;
  }

  const rootEl = document.getElementById("root");
  if (!rootEl) return;

  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
})();