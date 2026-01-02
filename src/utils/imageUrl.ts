/**
 * Normalize external image URLs for reliable rendering in browsers.
 * - Trims whitespace
 * - Converts protocol-relative URLs (//) to https
 * - Upgrades http -> https to avoid mixed-content blocking
 * - Encodes spaces and other URI-unsafe characters
 */
export function normalizeImageUrl(input?: string | null): string | null {
  const raw = (input ?? '').trim();
  if (!raw) return null;

  let url = raw;
  if (url.startsWith('//')) url = `https:${url}`;
  if (url.startsWith('http://')) url = `https://${url.slice('http://'.length)}`;

  try {
    url = encodeURI(url);
  } catch {
    // ignore encoding errors
  }

  return url;
}
