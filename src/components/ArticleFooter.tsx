import { Link } from 'react-router-dom';

interface ArticleFooterProps {
  campaignSlug?: string;
  category?: string;
  articleType?: string;
}

export default function ArticleFooter({ campaignSlug, category, articleType }: ArticleFooterProps) {
  return (
    <div className="mt-8 border-t pt-6 space-y-4">
      {/* Campaign Link */}
      {campaignSlug && (
        <div className="bg-pink-50 p-4 rounded-lg border border-pink-100">
          <p className="text-sm">
            📢 This is part of our{' '}
            <Link to={`/${campaignSlug}`} className="font-bold text-pink-600 hover:underline">
              {campaignSlug === 'ipl-2026' ? 'IPL 2026 in Jaipur campaign' : campaignSlug}
            </Link>
            . Get all match guides, ticket updates, and stadium info.
          </p>
        </div>
      )}

      {/* Related Guides Link */}
      {category && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <p className="text-sm font-medium mb-2">📚 More {category} guides</p>
          <Link to={`/guides?category=${category}`} className="text-sm text-pink-600 hover:underline">
            Browse all {category} guides →
          </Link>
        </div>
      )}

      {/* WhatsApp CTA for News Flashes */}
      {articleType === 'news_flash' && (
        <div className="bg-green-50 p-4 rounded-lg border border-green-100 text-center">
          <p className="text-sm font-medium mb-2">📱 Get instant updates on WhatsApp</p>
          <a
            href="https://wa.me/919XXXXXXXXX?text=Hi%20I%20want%20to%20join%20JaipurCircle%20alerts"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700"
          >
            Join WhatsApp Alerts →
          </a>
        </div>
      )}
    </div>
  );
}
