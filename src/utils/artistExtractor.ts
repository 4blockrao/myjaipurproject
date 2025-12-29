/**
 * Artist name extraction utility
 * Extracts performer/artist names from event titles and tags
 */

// Common patterns for extracting artist names from event titles
const TITLE_PATTERNS = [
  // "Show Name — Artist Name" (most common format)
  /[—–\-]\s*(.+?)(?:\s+live|\s+stand-?up|\s+tour)?$/i,
  // "Artist Name — Show Name" 
  /^([^—–\-]+?)(?:\s*[—–\-]\s*.+)?$/,
  // "Show by Artist Name"
  /by\s+(.+?)(?:\s+live|\s+in\s+jaipur)?$/i,
  // "Artist Name Live"
  /^(.+?)\s+live(?:\s*[—–\-]|\s+in\s+)?/i,
];

// Known artist name mappings for popular performers
const KNOWN_ARTISTS: Record<string, string> = {
  'vipul-goyal': 'Vipul Goyal',
  'zakir-khan': 'Zakir Khan',
  'vir-das': 'Vir Das',
  'aakash-gupta': 'Aakash Gupta',
  'anuv-jain': 'Anuv Jain',
  'anubhav-singh-bassi': 'Anubhav Singh Bassi',
  'jubin-nautiyal': 'Jubin Nautiyal',
  'sunidhi-chauhan': 'Sunidhi Chauhan',
  'sanam': 'Sanam',
  'prateek-kuhad': 'Prateek Kuhad',
  'arijit-singh': 'Arijit Singh',
  'ap-dhillon': 'AP Dhillon',
  'diljit-dosanjh': 'Diljit Dosanjh',
  'karan-aujla': 'Karan Aujla',
  'akshay-srivastava': 'Akshay Srivastava',
  'rajat-sood': 'Rajat Sood',
  'pranav-sharma': 'Pranav Sharma',
  'samay-raina': 'Samay Raina',
  'abhishek-upmanyu': 'Abhishek Upmanyu',
  'kunal-kamra': 'Kunal Kamra',
  'rahul-subramanian': 'Rahul Subramanian',
  'neeti-mohan': 'Neeti Mohan',
  'amit-trivedi': 'Amit Trivedi',
  'shreya-ghoshal': 'Shreya Ghoshal',
  'armaan-malik': 'Armaan Malik',
};

export interface ExtractedArtist {
  name: string;
  slug: string;
  category: 'music' | 'comedy' | 'speaker' | 'performer';
}

/**
 * Extract artist name from event title
 */
export function extractArtistFromTitle(title: string): string | null {
  // Clean up the title
  const cleanTitle = title.trim();
  
  // Try each pattern
  for (const pattern of TITLE_PATTERNS) {
    const match = cleanTitle.match(pattern);
    if (match && match[1]) {
      const artistName = match[1].trim();
      // Filter out generic event names
      if (!isGenericEventName(artistName)) {
        return artistName;
      }
    }
  }
  
  // Fallback: use first part before common separators
  const parts = cleanTitle.split(/\s*[—–\-:]\s*/);
  if (parts[0] && !isGenericEventName(parts[0])) {
    return parts[0].trim();
  }
  
  return null;
}

/**
 * Check if a name is a generic event name rather than an artist
 */
function isGenericEventName(name: string): boolean {
  const genericPatterns = [
    /^jaipur/i,
    /^open\s+mic/i,
    /^comedy\s+(night|festival|show)/i,
    /^music\s+(festival|night)/i,
    /^workshop/i,
    /^festival/i,
    /^exhibition/i,
    /^conference/i,
    /^meetup/i,
    /^the\s+/i,
    /\d{4}$/,  // Ends with year
  ];
  
  return genericPatterns.some(pattern => pattern.test(name.trim()));
}

/**
 * Generate URL-friendly slug from artist name
 */
export function generateArtistSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, '') // Remove apostrophes
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ''); // Trim hyphens from start/end
}

/**
 * Get artist name from slug (reverse lookup)
 */
export function getArtistNameFromSlug(slug: string): string {
  // Check known artists first
  if (KNOWN_ARTISTS[slug]) {
    return KNOWN_ARTISTS[slug];
  }
  
  // Convert slug to title case
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Determine artist category based on event category
 */
export function getArtistCategory(eventCategory: string): ExtractedArtist['category'] {
  const categoryMap: Record<string, ExtractedArtist['category']> = {
    'music': 'music',
    'comedy': 'comedy',
    'stand-up': 'comedy',
    'concert': 'music',
    'workshop': 'speaker',
    'talk': 'speaker',
    'conference': 'speaker',
    'theater': 'performer',
    'theatre': 'performer',
    'dance': 'performer',
  };
  
  return categoryMap[eventCategory.toLowerCase()] || 'performer';
}

/**
 * Extract artist info from an event
 */
export function extractArtistFromEvent(event: {
  title: string;
  category: string;
  tags?: string[] | null;
  organizer_name?: string | null;
}): ExtractedArtist | null {
  // First try extracting from title
  const nameFromTitle = extractArtistFromTitle(event.title);
  
  if (nameFromTitle) {
    return {
      name: nameFromTitle,
      slug: generateArtistSlug(nameFromTitle),
      category: getArtistCategory(event.category),
    };
  }
  
  // Try getting from tags (look for artist-related tags)
  if (event.tags?.length) {
    for (const tag of event.tags) {
      // Check if tag matches a known artist
      const normalizedTag = tag.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      if (KNOWN_ARTISTS[normalizedTag]) {
        return {
          name: KNOWN_ARTISTS[normalizedTag],
          slug: normalizedTag,
          category: getArtistCategory(event.category),
        };
      }
    }
  }
  
  return null;
}

/**
 * Check if an event likely has a featured artist/performer
 */
export function eventHasArtist(event: {
  category: string;
  title: string;
}): boolean {
  const artistCategories = ['music', 'comedy', 'stand-up', 'concert'];
  
  // Check category
  if (artistCategories.includes(event.category.toLowerCase())) {
    return true;
  }
  
  // Check title for performer indicators
  const performerIndicators = [
    /live/i,
    /tour/i,
    /show/i,
    /stand.?up/i,
    /concert/i,
  ];
  
  return performerIndicators.some(pattern => pattern.test(event.title));
}
