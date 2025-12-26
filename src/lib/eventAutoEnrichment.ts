/**
 * Event Auto-Enrichment Engine
 * Generates Jaipur-context content, FAQs, locality tips, and SEO metadata
 * This makes JaipurCircle pages more valuable than the source
 */

export interface EventEnrichmentInput {
  title: string;
  category: string;
  locality: string | null;
  venue_name: string | null;
  organizer_name: string | null;
  is_free: boolean;
  ticket_price: number | null;
  start_date: string;
  tags: string[];
  source_platform?: string;
  source_url?: string;
}

export interface EnrichedEventContent {
  // Enhanced description with Jaipur context
  enrichedDescription: string;
  shortDescription: string;
  
  // Attendee-focused content
  whyAttend: string[];
  whatToExpect: string[];
  localityTips: string[];
  
  // Dynamic FAQ
  faq: Array<{ question: string; answer: string }>;
  
  // SEO metadata
  metaTitle: string;
  metaDescription: string;
  
  // Source attribution
  sourceAttribution: {
    platform: string;
    ticketUrl: string;
    disclaimer: string;
  } | null;
}

/**
 * Category-specific content templates
 */
const categoryTemplates: Record<string, {
  whyAttend: string[];
  whatToExpect: string[];
  audienceType: string;
}> = {
  comedy: {
    whyAttend: [
      'Laugh out loud with Jaipur\'s best comedy entertainment',
      'Experience live stand-up in an intimate setting',
      'Perfect stress-buster after a long week',
      'Connect with fellow comedy enthusiasts in the city',
    ],
    whatToExpect: [
      'Sharp, relatable humor',
      'Interactive audience moments',
      'Comfortable seating arrangements',
      'Refreshments available at venue',
    ],
    audienceType: 'comedy lovers, young professionals, couples',
  },
  music: {
    whyAttend: [
      'Experience world-class live music in Jaipur',
      'Create unforgettable memories with stunning performances',
      'Feel the energy of a live concert crowd',
      'Discover new music and artists',
    ],
    whatToExpect: [
      'High-energy performances',
      'Professional sound and lighting',
      'Crowd-favorite songs and new releases',
      'Merchandise and food stalls',
    ],
    audienceType: 'music enthusiasts, concert-goers, fans',
  },
  party: {
    whyAttend: [
      'Celebrate in style at Jaipur\'s premier party venue',
      'Ring in the occasion with like-minded party-goers',
      'Experience premium entertainment and ambiance',
      'Create memories that last a lifetime',
    ],
    whatToExpect: [
      'Curated music and entertainment',
      'Premium food and beverages',
      'Dress code may apply',
      'Networking opportunities',
    ],
    audienceType: 'party enthusiasts, socialites, celebration seekers',
  },
  workshop: {
    whyAttend: [
      'Learn new skills from expert instructors in Jaipur',
      'Hands-on experience in a supportive environment',
      'Take home something you created yourself',
      'Connect with fellow learners and enthusiasts',
    ],
    whatToExpect: [
      'Step-by-step guided instruction',
      'All materials provided',
      'Small batch sizes for personalized attention',
      'Certificate of completion (if applicable)',
    ],
    audienceType: 'learners, hobbyists, skill-seekers',
  },
  art: {
    whyAttend: [
      'Immerse yourself in Jaipur\'s vibrant art scene',
      'Discover local and national artistic talent',
      'Gain new perspectives through visual storytelling',
      'Support the arts community in your city',
    ],
    whatToExpect: [
      'Curated art displays and installations',
      'Artist interactions and talks',
      'Photography opportunities',
      'Guided tours available',
    ],
    audienceType: 'art lovers, culture enthusiasts, collectors',
  },
  business: {
    whyAttend: [
      'Network with industry leaders in Jaipur',
      'Gain insights from expert speakers',
      'Discover new business opportunities',
      'Stay updated with industry trends',
    ],
    whatToExpect: [
      'Keynote presentations',
      'Panel discussions',
      'Networking sessions',
      'Business card exchange opportunities',
    ],
    audienceType: 'professionals, entrepreneurs, business leaders',
  },
};

/**
 * Locality-specific tips and context
 */
const localityTipsMap: Record<string, string[]> = {
  'c-scheme': [
    'C-Scheme is well-connected with ample parking options',
    'Several cafes and restaurants nearby for pre/post event dining',
    'Auto-rickshaws and cabs easily available in the area',
    'Premium shopping options at nearby Ashok Nagar if you arrive early',
  ],
  'sitapura': [
    'Plan extra travel time as Sitapura is on the outskirts',
    'Ample parking available at JECC venue',
    'Limited food options nearby - eat before you come',
    'Cab booking recommended for return journey',
  ],
  'malviya-nagar': [
    'Malviya Nagar is well-connected by public transport',
    'Multiple dining options on 80 Feet Road nearby',
    'Street parking available in residential areas',
    'Metro connectivity makes travel convenient',
  ],
  'raja-park': [
    'Raja Park is centrally located with easy access',
    'Famous street food options nearby after the event',
    'Good auto-rickshaw connectivity',
    'Parking can be challenging - arrive early',
  ],
  'vaishali-nagar': [
    'Vaishali Nagar offers good connectivity via Ring Road',
    'Multiple malls and eateries in the vicinity',
    'Metro station nearby for public transport',
    'Well-lit and safe area for evening events',
  ],
  'mansarovar': [
    'Mansarovar is accessible via Metro Line',
    'Good food courts at nearby World Trade Park',
    'Ample parking at most venues',
    'Family-friendly area with good safety',
  ],
  'jln-marg': [
    'JLN Marg is the cultural hub of Jaipur',
    'Jawahar Kala Kendra and other cultural venues nearby',
    'Good public transport connectivity',
    'Premium dining options in the area',
  ],
};

/**
 * Generate dynamic FAQ based on event type
 */
function generateFAQ(input: EventEnrichmentInput): Array<{ question: string; answer: string }> {
  const faqs: Array<{ question: string; answer: string }> = [];
  
  // Universal FAQs
  faqs.push({
    question: `What is the venue for ${input.title}?`,
    answer: input.venue_name 
      ? `The event will be held at ${input.venue_name}${input.locality ? ` in ${input.locality.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}, Jaipur` : ', Jaipur'}.`
      : 'Venue details will be updated soon. Check back for the latest information.',
  });

  faqs.push({
    question: `How much do tickets cost for ${input.title}?`,
    answer: input.is_free 
      ? 'This is a free event! Registration may be required for entry.'
      : input.ticket_price 
        ? `Tickets start from ₹${input.ticket_price}. Early booking is recommended to secure the best seats.`
        : 'Ticket prices will be announced soon. Stay tuned for updates.',
  });

  faqs.push({
    question: 'How can I reach the venue?',
    answer: input.locality 
      ? `The venue is located in ${input.locality.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}, Jaipur. You can reach by cab, auto-rickshaw, or personal vehicle. Check JaipurCircle's locality guide for detailed directions and nearby landmarks.`
      : 'The venue is in Jaipur. We recommend using Google Maps for the most accurate directions.',
  });

  // Category-specific FAQs
  if (input.category === 'comedy') {
    faqs.push({
      question: 'Is the comedy show suitable for all ages?',
      answer: 'Most stand-up comedy shows contain adult humor and are recommended for audiences 16+. Please check the event description for specific age restrictions.',
    });
  }

  if (input.category === 'music') {
    faqs.push({
      question: 'Are cameras and phones allowed?',
      answer: 'Camera policies vary by event. Generally, phones are allowed for personal photos but professional cameras may be restricted. Flash photography is usually not permitted during performances.',
    });
  }

  if (input.category === 'party') {
    faqs.push({
      question: 'Is there a dress code?',
      answer: 'Many party events have smart casual or themed dress codes. Check the event details for specific requirements. When in doubt, smart casuals work for most Jaipur party venues.',
    });
  }

  // Add organizer FAQ if available
  if (input.organizer_name) {
    faqs.push({
      question: `Who is organizing ${input.title}?`,
      answer: `This event is organized by ${input.organizer_name}. They are known for hosting quality events in Jaipur.`,
    });
  }

  return faqs;
}

/**
 * Generate source attribution block
 */
function generateSourceAttribution(
  sourcePlatform?: string,
  sourceUrl?: string
): EnrichedEventContent['sourceAttribution'] {
  if (!sourcePlatform && !sourceUrl) return null;

  const platformNames: Record<string, string> = {
    bookmyshow: 'BookMyShow',
    insider: 'Paytm Insider',
    meetup: 'Meetup',
    eventbrite: 'Eventbrite',
  };

  return {
    platform: platformNames[sourcePlatform || ''] || sourcePlatform || 'Partner Platform',
    ticketUrl: sourceUrl || '',
    disclaimer: 'Ticket purchase is handled by the ticketing partner. JaipurCircle provides local context and discovery to help you make informed decisions.',
  };
}

/**
 * Main auto-enrichment function
 */
export function autoEnrichEvent(input: EventEnrichmentInput): EnrichedEventContent {
  const template = categoryTemplates[input.category] || categoryTemplates.music;
  const localityName = input.locality?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Jaipur';
  
  // Generate enriched description
  const enrichedDescription = `
**${input.title}** is coming to ${localityName}! ${template.audienceType.charAt(0).toUpperCase() + template.audienceType.slice(1)} across Jaipur are excited for this upcoming ${input.category} event${input.venue_name ? ` at ${input.venue_name}` : ''}.

${input.organizer_name ? `Presented by **${input.organizer_name}**, this event promises` : 'This event promises'} an unforgettable experience for everyone attending.

**Event Highlights:**
${template.whatToExpect.map(item => `• ${item}`).join('\n')}

**Why You Should Attend:**
${template.whyAttend.slice(0, 3).map(item => `• ${item}`).join('\n')}

${input.is_free ? '🎟️ **Free Entry** - Registration may be required' : input.ticket_price ? `🎟️ **Tickets starting from ₹${input.ticket_price}**` : ''}

${input.locality ? `📍 Located in **${localityName}**, one of Jaipur's popular ${input.category === 'party' || input.category === 'music' ? 'entertainment' : 'event'} destinations.` : ''}

Join fellow ${template.audienceType} for this exciting event in the Pink City!
`.trim();

  // Generate short description
  const shortDescription = `${input.title}${input.venue_name ? ` at ${input.venue_name}` : ''} in ${localityName}. ${input.is_free ? 'Free entry!' : input.ticket_price ? `Tickets from ₹${input.ticket_price}.` : ''} Perfect for ${template.audienceType}.`.trim();

  // Get locality tips
  const localityTips = input.locality && localityTipsMap[input.locality] 
    ? localityTipsMap[input.locality]
    : [
        'Plan your travel in advance for a hassle-free experience',
        'Check venue parking availability before you leave',
        'Arrive 15-30 minutes early to avoid last-minute rush',
        'Keep your ticket/confirmation handy for quick entry',
      ];

  // Generate SEO metadata
  const eventDate = new Date(input.start_date);
  const monthYear = eventDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  
  const metaTitle = `${input.title} in Jaipur ${monthYear} | ${input.venue_name || localityName} | Book Tickets`;
  const metaDescription = `Book tickets for ${input.title} in ${localityName}, Jaipur. ${input.is_free ? 'Free event!' : input.ticket_price ? `Starting ₹${input.ticket_price}.` : ''} ${input.venue_name ? `Venue: ${input.venue_name}.` : ''} Get event details, directions & local tips.`;

  return {
    enrichedDescription,
    shortDescription,
    whyAttend: template.whyAttend,
    whatToExpect: template.whatToExpect,
    localityTips,
    faq: generateFAQ(input),
    metaTitle: metaTitle.slice(0, 60),
    metaDescription: metaDescription.slice(0, 160),
    sourceAttribution: generateSourceAttribution(input.source_platform, input.source_url),
  };
}

/**
 * Generate series continuity content
 */
export function generateSeriesContinuity(
  seriesName: string,
  pastEditions: Array<{ year: number; slug: string }>,
  upcomingEditions: Array<{ year: number; slug: string }>
): {
  continuityText: string;
  internalLinks: Array<{ label: string; href: string }>;
} {
  const pastLinks = pastEditions.map(e => ({
    label: `${seriesName} ${e.year}`,
    href: `/events/past/${e.slug}`,
  }));

  const upcomingLinks = upcomingEditions.map(e => ({
    label: `${seriesName} ${e.year}`,
    href: `/events/${e.slug}`,
  }));

  const continuityText = pastEditions.length > 0
    ? `${seriesName} has been a beloved event in Jaipur for ${pastEditions.length + 1} editions. Join the tradition this year!`
    : `${seriesName} brings exciting entertainment to Jaipur. Be part of this amazing event!`;

  return {
    continuityText,
    internalLinks: [...pastLinks, ...upcomingLinks],
  };
}
