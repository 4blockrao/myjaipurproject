// Canonical URL helpers for publication content (news, guide, explore, story).
// Prevents legacy category-prefixed URLs like /news/Business/foo from being generated.

export const legacyNewsRedirectMap: Record<string, string> = {
  "rajasthan-royals-2025": "/story/rajasthan-royals-ipl-2026-jaipur-season",
  "new-nightlife-jaipur": "/explore/best-nightlife-places-jaipur",
  "jaipur-lit-fest-2025": "/story/jaipur-literature-festival-city-culture-guide",
  "heritage-conservation-jaipur": "/story/jaipur-heritage-conservation-old-city-guide",
  "top-cafes-jaipur": "/explore/best-cafes-in-jaipur",
  "jaipur-street-food": "/explore/best-street-food-in-jaipur",
  "weekend-getaways-jaipur": "/guide/weekend-getaways-from-jaipur",
  "new-business-parks-jaipur": "/story/jaipur-business-parks-startup-growth",
  "jaipur-school-timing-change-april-27-heatwave-2026": "/news/jaipur-school-timing-change-april-27-heatwave-2026",
  "rajasthan-heatwave-alert-april-2026": "/news/rajasthan-heatwave-alert-april-2026",
  "summer-health-tips-jaipur-2026": "/news/summer-health-tips-jaipur-2026",
};

export function getPublicationUrl(item: any): string {
  if (!item) return "/news";
  if (item.canonical_url) return item.canonical_url;
  const type = item.content_type || item.type;
  if (type === "news") return `/news/${item.slug}`;
  if (type === "guide") return `/guide/${item.slug}`;
  if (type === "explore") return `/explore/${item.slug}`;
  if (type === "story") return `/story/${item.slug}`;
  return `/news/${item.slug}`;
}

export function getNewsCardUrl(article: any): string {
  if (!article?.slug) return "/news";
  if (legacyNewsRedirectMap[article.slug]) {
    return legacyNewsRedirectMap[article.slug];
  }
  if (article.canonical_url) return article.canonical_url;
  if (article.content_type || article.type) return getPublicationUrl(article);
  return `/news/${article.slug}`;
}
