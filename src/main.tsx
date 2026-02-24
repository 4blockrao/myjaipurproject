// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

/**
 * JaipurCircle Hybrid SSR Guard
 *
 * We SSR /stories/* at the edge (Supabase functions) and want users + bots
 * to see that SSR HTML. If React mounts, it will wipe the SSR DOM and render
 * the SPA route (currently blank), causing a white screen.
 *
 * So: do NOT mount React on /stories or any page that includes #ssr-prerender.
 */
(function bootstrap() {
  try {
    const path = window.location.pathname || "";
    const isStoriesRoute = /^\/stories(\/|$)/i.test(path);

    // If the SSR function returned HTML, it includes this element.
    const hasSSRPrerender = !!document.getElementById("ssr-prerender");

    if (isStoriesRoute || hasSSRPrerender) {
      // Optional: debug while stabilizing (remove later)
      // eslint-disable-next-line no-console
      console.log("[SSR] Skipping React mount for:", path, {
        isStoriesRoute,
        hasSSRPrerender,
      });
      return;
    }

    const rootEl = document.getElementById("root");
    if (!rootEl) return;

    ReactDOM.createRoot(rootEl).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (e) {
    // If something goes wrong, don't brick the site.
    // eslint-disable-next-line no-console
    console.error("[bootstrap] failed:", e);
  }
})();