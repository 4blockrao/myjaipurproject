// Server-only Supabase client for loaders (RSC / generateStaticParams / generateMetadata).
//
// IMPORTANT: never import the Vite app's src/integrations/supabase/client.ts here — that file
// sets `storage: localStorage` at module load and will crash any server import (P0 blocker).
// This client sets persistSession:false and references no browser globals.
//
// Uses the service-role key when present (mirrors the edge function, bypasses RLS at build time);
// falls back to the anon/publishable key for local dev, which is fine for reading public content.

import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error(
    "Missing Supabase env: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) in web-next/.env.local",
  );
}

export const supabaseServer = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});
