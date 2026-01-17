import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";
import prerender from "vite-plugin-prerender";

type DealRouteRow = { id: string; slug: string | null };

async function fetchDealRoutesForPrerender(): Promise<string[]> {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return [];

  // Use PostgREST directly (no supabase-js in build config)
  const url = new URL(`${supabaseUrl}/rest/v1/deals`);
  url.searchParams.set("select", "id,slug");
  url.searchParams.set("limit", "10000");

  const res = await fetch(url.toString(), {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
  });

  if (!res.ok) return [];

  const rows = (await res.json()) as DealRouteRow[];

  const routes: string[] = [];
  for (const row of rows) {
    // Legacy UUID route (must keep working)
    routes.push(`/deal/${row.id}`);

    // Canonical slug route when available
    if (row.slug) routes.push(`/deals/${row.slug}`);
  }

  return routes;
}

// https://vitejs.dev/config/
export default defineConfig(async ({ mode, command }) => {
  // Only prerender on production build
  const isProdBuild = command === "build" && mode === "production";

  const dealRoutes = isProdBuild ? await fetchDealRoutesForPrerender() : [];

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === "development" && componentTagger(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["favicon.png", "robots.txt"],
        manifest: {
          name: "JaipurCircle - Deals & Rewards",
          short_name: "JaipurCircle",
          description: "Discover amazing deals, earn JaiCoins, and save more in Jaipur",
          theme_color: "#e91e63",
          background_color: "#ffffff",
          display: "standalone",
          orientation: "portrait",
          scope: "/",
          start_url: "/",
          icons: [
            {
              src: "/pwa-192x192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any maskable",
            },
            {
              src: "/pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable",
            },
          ],
          categories: ["shopping", "lifestyle", "finance"],
          screenshots: [],
          shortcuts: [
            {
              name: "Browse Deals",
              short_name: "Deals",
              url: "/deals",
              icons: [{ src: "/pwa-192x192.png", sizes: "192x192" }],
            },
            {
              name: "My Wallet",
              short_name: "Wallet",
              url: "/wallet",
              icons: [{ src: "/pwa-192x192.png", sizes: "192x192" }],
            },
          ],
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 6 * 1024 * 1024, // 6 MiB
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "google-fonts-cache",
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
      }),

      // Build-time prerender for Deal pages ONLY
      isProdBuild &&
        prerender({
          staticDir: path.join(__dirname, "dist"),

          // These are the routes that will become real HTML files in /dist
          // making them visible in "View Page Source" with no JS execution.
          routes: dealRoutes,

          // We wait for the deal page to load its data and fire this event
          captureAfterDocumentEvent: "prerender-ready",

          // Safety timeout so build can't hang forever
          captureAfterTime: 15000,
        }),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
