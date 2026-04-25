// src/main.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

/**
 * JaipurCircle: SSR + SPA hybrid boot
 *
 * Important:
 * - Public SEO pages such as /jaipur/:slug may be fully rendered by Supabase Edge SSR.
 * - If SSR content exists for a locality page, DO NOT hydrate React into #root.
 * - Hydrating with a mismatched React tree will replace/patch the SSR HTML and cause the
 *   "new UI flashes, then old UI appears" problem.
 *
 * Current rule:
 * - /jaipur/:slug + #ssr-prerender present => keep SSR HTML as source of truth.
 * - everything else => normal React SPA mount.
 */

function hasSSRMarker(): boolean {
  return !!document.getElementById("ssr-prerender");
}

function isSSRLocalityPage(): boolean {
  const path = window.location.pathname;

  // Match /jaipur/:slug, but avoid generic collection/index paths if needed.
  // Examples that should skip React:
  // /jaipur/vaishali-nagar
  // /jaipur/mansarovar
  //
  // Examples that should still allow React unless separately SSR-rendered:
  // /jaipur
  // /jaipur/localities
  const parts = path.split("/").filter(Boolean);

  return parts.length === 2 && parts[0] === "jaipur";
}

function bootstrap() {
  const rootEl = document.getElementById("root");

  if (!rootEl) {
    console.error("[Bootstrap] Root element not found");
    return;
  }

  const shouldKeepSSR =
    hasSSRMarker() &&
    rootEl.hasChildNodes() &&
    isSSRLocalityPage();

  if (shouldKeepSSR) {
    console.log("[Bootstrap] SSR locality page detected — React mount skipped.");
    return;
  }

  console.log("[Bootstrap] Mounting React SPA");

  createRoot(rootEl).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

bootstrap();
