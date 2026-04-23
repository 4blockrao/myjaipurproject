import { Helmet } from 'react-helmet-async';

interface NewsSEOProps {
  article: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    content: string;
    cover_image?: string | null;
    og_image?: string | null;
    category: string;
    locality?: string | null;
    tags?: string[] | null;
    published_at?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    meta_title?: string | null;
    meta_description?: string | null;
    meta_keywords?: string[] | null;
    canonical_url?: string | null;
    author_id?: string | null;
    view_count?: number | null;
    like_count?: number | null;
    word_count?: number | null;
    reading_time_minutes?: number | null;
  };
  source?: 'articles' | 'news_articles';
}

const BASE_URL = 'https://jaipurcircle.com';
const SITE_NAME = 'JaipurCircle';
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1200&h=630&fit=crop';

/**
 * Comprehensive News Article SEO Component
 * Implements NewsArticle schema, optimized for Google News, Discover, and Top Stories
 * Enhanced with Speakable schema and word count for AI crawlers
 */
export const NewsSEO = ({ article }: NewsSEOProps) => {
  const canonicalUrl = article.canonical_url || `${BASE_URL}/news/${article.category}/${article.slug}`;
  const pageTitle = article.meta_title || `${article.title} | ${SITE_NAME} News`;
  const pageDescription = article.meta_description || article.excerpt || article.content.slice(0, 160).replace(/[#*>\-]/g, '').trim();
  const articleImage = article.cover_image || article.og_image || DEFAULT_IMAGE;
  const publishedDate = article.published_at || article.created_at;
  const modifiedDate = article.updated_at || publishedDate;
  const wordCount = article.word_count || article.content.split(/\s+/).filter(Boolean).length;
  const readingTime = article.reading_time_minutes || Math.max(1, Math.ceil(wordCount / 200));

  // Generate keywords
  const keywords = [
    article.title,
    `${article.category} news Jaipur`,
    'Jaipur news',
    'Jaipur local news',
    article.locality && `${article.locality} news`,
    'Pink City news',
    'Rajasthan news',
    ...(article.tags || []),
    ...(article.meta_keywords || [])
  ].filter(Boolean).join(', ');

  // NewsArticle Schema.org structured data - Enhanced for Google News
  const newsArticleSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    '@id': canonicalUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl
    },
    headline: article.title,
    alternativeHeadline: article.excerpt?.slice(0, 110) || undefined,
    description: pageDescription,
    image: {
      '@type': 'ImageObject',
      url: articleImage,
      width: 1200,
      height: 630
    },
    datePublished: publishedDate,
    dateModified: modifiedDate,
    wordCount: wordCount,
    timeRequired: `PT${readingTime}M`,
    author: {
      '@type': 'Organization',
      name: 'JaipurCircle Newsroom',
      url: BASE_URL
    },
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: SITE_NAME,
      url: BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo.png`,
        width: 600,
        height: 60
      }
    },
    articleSection: article.category,
    keywords: article.tags?.join(', ') || article.category,
    inLanguage: 'en-IN',
    isAccessibleForFree: true,
    copyrightYear: new Date().getFullYear(),
    copyrightHolder: {
      '@type': 'Organization',
      name: SITE_NAME
    },
    ...(article.locality && {
      locationCreated: {
        '@type': 'Place',
        name: article.locality,
        address: {
          '@type': 'PostalAddress',
          addressLocality: article.locality,
          addressRegion: 'Rajasthan',
          addressCountry: 'India'
        }
      }
    })
  };

  // Speakable Schema - For voice search and Google Assistant
  const speakableSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${canonicalUrl}#webpage`,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['article h1', 'article [itemprop="description"]', 'article [itemprop="articleBody"] p:first-of-type']
    },
    url: canonicalUrl
  };

  // Breadcrumb Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: BASE_URL
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'News',
        item: `${BASE_URL}/news`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: article.category.charAt(0).toUpperCase() + article.category.slice(1),
        item: `${BASE_URL}/news/${article.category}`
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: article.title,
        item: canonicalUrl
      }
    ]
  };

  // WebPage Schema
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${canonicalUrl}#webpage`,
    url: canonicalUrl,
    name: pageTitle,
    description: pageDescription,
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${BASE_URL}#website`,
      name: SITE_NAME,
      url: BASE_URL
    },
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: articleImage
    },
    datePublished: publishedDate,
    dateModified: modifiedDate,
    inLanguage: 'en-IN',
    potentialAction: {
      '@type': 'ReadAction',
      target: canonicalUrl
    }
  };

  // Organization Schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    '@id': `${BASE_URL}#organization`,
    name: SITE_NAME,
    url: BASE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${BASE_URL}/logo.png`
    },
    sameAs: [
      'https://twitter.com/jaipurcircle',
      'https://facebook.com/jaipurcircle',
      'https://instagram.com/jaipurcircle'
    ]
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="title" content={pageTitle} />
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="JaipurCircle Newsroom" />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="googlebot-news" content="index, follow" />
      <meta name="bingbot" content="index, follow" />
      
      {/* News-specific meta */}
      <meta name="news_keywords" content={article.tags?.join(', ') || article.category} />
      <meta name="syndication-source" content={canonicalUrl} />
      <meta name="original-source" content={canonicalUrl} />
      
      {/* Canonical */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="article" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={article.title} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={articleImage} />
      <meta property="og:image:secure_url" content={articleImage} />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={article.title} />
      <meta property="og:locale" content="en_IN" />
      
      {/* Article-specific Open Graph */}
      <meta property="article:published_time" content={publishedDate || ''} />
      <meta property="article:modified_time" content={modifiedDate || ''} />
      <meta property="article:section" content={article.category} />
      <meta property="article:author" content="JaipurCircle Newsroom" />
      <meta property="article:publisher" content={BASE_URL} />
      {article.tags?.map((tag, i) => (
        <meta key={i} property="article:tag" content={tag} />
      ))}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@jaipurcircle" />
      <meta name="twitter:creator" content="@jaipurcircle" />
      <meta name="twitter:title" content={article.title} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={articleImage} />
      <meta name="twitter:image:alt" content={article.title} />
      
      {/* Location Meta */}
      <meta name="geo.region" content="IN-RJ" />
      <meta name="geo.placename" content={article.locality || 'Jaipur, Rajasthan'} />
      <meta name="geo.position" content="26.9124;75.7873" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(newsArticleSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(webPageSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(speakableSchema)}
      </script>
    </Helmet>
  );
};

export default NewsSEO;
