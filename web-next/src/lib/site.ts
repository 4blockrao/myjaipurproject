// Site-wide constants and formatting helpers, ported from the locality-ssr edge function.
// Server-safe: no browser globals referenced at module load.

export const SITE_NAME = "JaipurCircle";
export const BASE_URL = (process.env.SITE_ORIGIN ?? "https://www.jaipurcircle.com").replace(/\/+$/, "");
export const DEFAULT_IMAGE = `${BASE_URL}/og-default.jpg`;

export function truncate(str: string | null | undefined, max: number): string {
  if (!str) return "";
  if (str.length <= max) return str;
  return str.slice(0, max - 3) + "...";
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "TBA";
  return new Date(dateStr).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

// JSON-LD escaping. Do NOT HTML-escape JSON-LD (that produces invalid schema — the bug
// commit 78e788b fixed in merchant-ssr). Only neutralize the three characters that could
// break out of a <script> block, using unicode escapes that stay valid JSON.
export function escJson(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}
