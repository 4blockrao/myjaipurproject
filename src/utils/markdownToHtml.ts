import { marked, Renderer, Tokens } from 'marked';

/**
 * Configure marked for SEO-optimized HTML output
 * - Adds proper semantic structure
 * - Creates crawlable internal links
 * - Adds accessibility attributes
 */

// Custom renderer for SEO-optimized output
const renderer = new Renderer();

// Add rel="noopener" to external links, keep internal links clean
renderer.link = ({ href, title, tokens }: Tokens.Link) => {
  const text = tokens.map((t: any) => t.raw || t.text || '').join('');
  const isExternal = href.startsWith('http') && !href.includes('jaipurcircle.com');
  const rel = isExternal ? ' rel="noopener noreferrer" target="_blank"' : '';
  const titleAttr = title ? ` title="${title}"` : '';
  return `<a href="${href}"${titleAttr}${rel}>${text}</a>`;
};

// Add proper heading structure with IDs for anchor links
renderer.heading = ({ tokens, depth }: Tokens.Heading) => {
  const text = tokens.map((t: any) => t.raw || t.text || '').join('');
  const slug = text.toLowerCase().replace(/[^\w]+/g, '-');
  return `<h${depth} id="${slug}">${text}</h${depth}>`;
};

// Add figure wrapper for images with alt text
renderer.image = ({ href, title, text }: Tokens.Image) => {
  const altText = text || title || 'Article image';
  const titleAttr = title ? ` title="${title}"` : '';
  return `<figure><img src="${href}" alt="${altText}"${titleAttr} loading="lazy" />${title ? `<figcaption>${title}</figcaption>` : ''}</figure>`;
};

marked.use({ renderer, gfm: true, breaks: true });

/**
 * Convert markdown content to SEO-optimized HTML
 * Pre-rendered at publish time to avoid runtime conversion
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) return '';
  
  try {
    const html = marked.parse(markdown);
    return typeof html === 'string' ? html : '';
  } catch (error) {
    console.error('Error converting markdown to HTML:', error);
    return '';
  }
}

/**
 * Calculate word count from content
 */
export function calculateWordCount(content: string): number {
  if (!content) return 0;
  return content.split(/\s+/).filter(Boolean).length;
}

/**
 * Calculate reading time in minutes (avg 200 words/min)
 */
export function calculateReadingTime(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / 200));
}

/**
 * Strip HTML tags for plain text extraction
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * Generate excerpt from content if not provided
 */
export function generateExcerpt(content: string, maxLength: number = 160): string {
  const plainText = stripHtml(markdownToHtml(content));
  if (plainText.length <= maxLength) return plainText;
  return plainText.slice(0, maxLength).replace(/\s+\S*$/, '') + '...';
}
