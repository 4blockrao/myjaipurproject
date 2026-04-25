// src/main.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

/**
 * JaipurCircle: SSR + SPA hybrid boot
 *
 * Public SEO pages rendered by Supabase/Vercel SSR include #ssr-prerender.
 * When that marker exists on a known public route, React must NOT mount,
 * otherwise the SPA can overwrite the SSR UI.
 */

function hasSSRMarker(): boolean {
  return !!document.getElementById("ssr-prerender");
}

function getPathParts(): string[] {
  return window.location.pathname.split("/").filter(Boolean);
}

function isKnownPublicSEOPath(): boolean {
  const parts = getPathParts();

  if (parts.length === 0) return false;

  const first = parts[0];

  // Locality pages: /jaipur/:slug
  if (first === "jaipur" && parts.length >= 2) return true;

  // Event hub, event filters, event categories, event details:
  // /events
  // /events/
  // /events/today
  // /events/category/comedy
  // /events/:slug
  if (first === "events") return true;

  // Public entity pages
  if (first === "venues" && parts.length >= 2) return true;
  if (first === "artists" && parts.length >= 2) return true;

  // Editorial pages, only if SSR marker exists
  if (first === "stories") return true;
  if (first === "news") return true;
  if (first === "guides") return true;

  return false;
}

function bootstrap() {
  const rootEl = document.getElementById("root");

  if (!rootEl) {
    console.error("[Bootstrap] Root element not found");
    return;
  }

  const shouldKeepSSR = hasSSRMarker() && rootEl.hasChildNodes() && isKnownPublicSEOPath();

  if (shouldKeepSSR) {
    console.log("[Bootstrap] Public SSR page detected — React mount skipped.");
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
