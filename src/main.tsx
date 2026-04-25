// src/main.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

/**
 * JaipurCircle: SSR + SPA hybrid boot
 *
 * Public SEO pages such as:
 * - /jaipur/:slug
 * - /events/:slug
 *
 * may be fully rendered by Supabase Edge SSR.
 *
 * If SSR content exists for these pages, DO NOT hydrate or mount React into #root.
 * Hydrating with a mismatched React tree will replace/patch the SSR HTML and cause:
 * "new SSR UI flashes, then old React UI appears".
 *
 * Current rule:
 * - /jaipur/:slug + #ssr-prerender present => keep SSR HTML as source of truth.
 * - /events/:slug + #ssr-prerender present => keep SSR HTML as source of truth.
 * - everything else => normal React SPA mount.
 */

function hasSSRMarker(): boolean {
  return !!document.getElementById("ssr-prerender");
}

function getPathParts(): string[] {
  return window.location.pathname.split("/").filter(Boolean);
}

function isSSRLocalityPage(): boolean {
  const parts = getPathParts();

  // Match only /jaipur/:slug
  // Do not match /jaipur or deeper future cluster paths like /jaipur/:slug/restaurants
  return parts.length === 2 && parts[0] === "jaipur";
}

function isSSREventDetailPage(): boolean {
  const parts = getPathParts();

  // Match only /events/:slug
  if (parts.length !== 2 || parts[0] !== "events") {
    return false;
  }

  // These are event listing/filter pages, not event detail pages.
  // They should continue to use React unless separately handled as SSR-only later.
  const reservedEventRoutes = new Set([
    "today",
    "tomorrow",
    "this-week",
    "this-weekend",
    "next-month",
    "near-me",
    "category",
  ]);

  return !reservedEventRoutes.has(parts[1]);
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
    (isSSRLocalityPage() || isSSREventDetailPage());

  if (shouldKeepSSR) {
    console.log("[Bootstrap] SSR public SEO page detected — React mount skipped.");
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
