/**
 * Event Auto-Enrichment Engine (V2)
 * Master Prompt Implementation for JaipurCircle Event Pages
 * 
 * Generates 8 structured sections:
 * 1. About Event (Value Summary)
 * 2. Highlights
 * 3. Performer/Artist Context
 * 4. Venue & Locality Guide
 * 5. Attendee Tips
 * 6. Ticket & Registration Notes
 * 7. Related Links
 * 8. FAQs
 */

export interface EventEnrichmentInput {
  title: string;
  category: string;
  locality: string | null;
  venue_name: string | null;
  venue_address?: string | null;
  organizer_name: string | null;
  is_free: boolean;
  ticket_price: number | null;
  start_date: string;
  end_date?: string | null;
  tags: string[];
  source_platform?: string;
  source_url?: string;
  performer_name?: string;
  is_recurring?: boolean;
  series_name?: string;
}

export interface EnrichedEventContent {
  // Section 1: About Event (Value Summary)
  aboutEvent: {
    summary: string;
    targetAudience: string;
    whyPeopleAttend: string;
  };
  
  // Section 2: Event Highlights
  highlights: string[];
  
  // Section 3: Performer/Artist Context
  performerContext: {
    background: string;
    whyThisMatters: string;
    jaipurRelevance: string;
  } | null;
  
  // Section 4: Venue & Locality Guide
  venueGuide: {
    bestTimeToArrive: string;
    parkingNotes: string;
    transportModes: string[];
    nearbyOptions: string[];
  };
  
  // Section 5: Attendee Tips
  attendeeTips: {
    dressCode: string;
    seatingExpectation: string;
    weatherSafety: string;
    generalTips: string[];
  };
  
  // Section 6: Ticket & Registration Notes
  ticketNotes: {
    pricingContext: string;
    refundPolicy: string;
    callToAction: string;
    disclaimer: string;
  };
  
  // Section 7: Related Internal Links
  relatedLinks: Array<{
    type: 'category' | 'locality' | 'series' | 'venue' | 'similar';
    label: string;
    href: string;
  }>;
  
  // Section 8: FAQs
  faq: Array<{ question: string; answer: string }>;
  
  // Legacy fields for backward compatibility
  enrichedDescription: string;
  shortDescription: string;
  whyAttend: string[];
  whatToExpect: string[];
  localityTips: string[];
  
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
  dressCode: string;
  typicalDuration: string;
  crowdVibe: string;
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
    audienceType: 'comedy lovers, young professionals, couples looking for a fun night out',
    dressCode: 'Smart casual to casual - comfort is key for a laughter-filled evening',
    typicalDuration: '60-90 minutes',
    crowdVibe: 'Energetic, laughter-filled, interactive',
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
    audienceType: 'music enthusiasts, concert-goers, fans, couples',
    dressCode: 'Casual comfortable attire - you\'ll want to move and dance',
    typicalDuration: '2-3 hours',
    crowdVibe: 'High-energy, dancing, singing along',
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
    dressCode: 'Smart casuals to semi-formal - check event details for specific theme',
    typicalDuration: '4-6 hours',
    crowdVibe: 'Glamorous, celebratory, social',
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
    audienceType: 'learners, hobbyists, skill-seekers, creative minds',
    dressCode: 'Comfortable clothes you don\'t mind getting messy',
    typicalDuration: '2-4 hours',
    crowdVibe: 'Focused, collaborative, creative',
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
    audienceType: 'art lovers, culture enthusiasts, collectors, photography buffs',
    dressCode: 'Smart casual - galleries and exhibitions are relaxed settings',
    typicalDuration: '1-2 hours',
    crowdVibe: 'Reflective, appreciative, cultured',
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
    audienceType: 'professionals, entrepreneurs, business leaders, startups',
    dressCode: 'Business formals or smart business casuals',
    typicalDuration: '4-8 hours',
    crowdVibe: 'Professional, networking-focused, knowledge-seeking',
  },
  sports: {
    whyAttend: [
      'Experience the thrill of live sports in Jaipur',
      'Cheer for your favorite teams with fellow fans',
      'Feel the stadium atmosphere',
      'Create memories with friends and family',
    ],
    whatToExpect: [
      'Exciting live action',
      'Team merchandise available',
      'Food and beverage stalls',
      'Fan activities and contests',
    ],
    audienceType: 'sports fans, families, groups of friends',
    dressCode: 'Team colors recommended - casual and comfortable',
    typicalDuration: '2-4 hours',
    crowdVibe: 'Passionate, cheering, competitive spirit',
  },
};

/**
 * Locality-specific venue and travel information
 */
const localityInfoMap: Record<string, {
  tips: string[];
  transport: string[];
  parking: string;
  nearby: string[];
  arrivalTime: string;
  safety: string;
}> = {
  'c-scheme': {
    tips: [
      'C-Scheme is well-connected with ample parking options',
      'Several cafes and restaurants nearby for pre/post event dining',
      'Auto-rickshaws and cabs easily available in the area',
      'Premium shopping options at nearby Ashok Nagar if you arrive early',
    ],
    transport: ['Ola/Uber readily available', 'Auto-rickshaws from major points', 'Bus connectivity via city routes'],
    parking: 'Multiple paid parking lots available. Street parking possible in evenings.',
    nearby: ['Cafes on MI Road', 'Restaurants at Panch Batti', 'Shopping at Ashok Nagar'],
    arrivalTime: '15-20 minutes early recommended',
    safety: 'Well-lit area, safe for evening events. Police presence in the area.',
  },
  'sitapura': {
    tips: [
      'Plan extra travel time as Sitapura is on the outskirts',
      'Ample parking available at JECC venue',
      'Limited food options nearby - eat before you come',
      'Cab booking recommended for return journey',
    ],
    transport: ['Personal vehicle recommended', 'Pre-book cab for return', 'Limited auto availability'],
    parking: 'Large free parking at most Sitapura venues.',
    nearby: ['Limited options - venue food stalls usually available', 'Hotels on Tonk Road'],
    arrivalTime: '30-45 minutes early to account for traffic and parking',
    safety: 'Industrial area - stick to main roads. Event security usually good.',
  },
  'malviya-nagar': {
    tips: [
      'Malviya Nagar is well-connected by public transport',
      'Multiple dining options on 80 Feet Road nearby',
      'Street parking available in residential areas',
      'Metro connectivity makes travel convenient',
    ],
    transport: ['Metro Station nearby', 'Bus routes available', 'Cabs and autos readily available'],
    parking: 'Street parking in residential areas. Some venues have dedicated parking.',
    nearby: ['Restaurants on 80 Feet Road', 'WTP Mall', 'Cafes and fast food'],
    arrivalTime: '20 minutes early',
    safety: 'Residential area, very safe for evening events.',
  },
  'raja-park': {
    tips: [
      'Raja Park is centrally located with easy access',
      'Famous street food options nearby after the event',
      'Good auto-rickshaw connectivity',
      'Parking can be challenging - arrive early',
    ],
    transport: ['Auto-rickshaws from all major points', 'Bus connectivity', 'Central location for cabs'],
    parking: 'Limited street parking. Some venues have parking - confirm in advance.',
    nearby: ['Famous chaat at Raja Park market', 'Local eateries', 'Street food options'],
    arrivalTime: '25-30 minutes early due to parking challenges',
    safety: 'Busy commercial area, well-lit and safe.',
  },
  'vaishali-nagar': {
    tips: [
      'Vaishali Nagar offers good connectivity via Ring Road',
      'Multiple malls and eateries in the vicinity',
      'Metro station nearby for public transport',
      'Well-lit and safe area for evening events',
    ],
    transport: ['Metro connectivity', 'Ring Road access', 'Ample cabs and autos'],
    parking: 'Good parking at malls and commercial areas.',
    nearby: ['Element Mall', 'Multiple restaurants', 'Cafes and lounges'],
    arrivalTime: '15-20 minutes early',
    safety: 'Upscale residential area, very safe.',
  },
  'mansarovar': {
    tips: [
      'Mansarovar is accessible via Metro Line',
      'Good food courts at nearby World Trade Park',
      'Ample parking at most venues',
      'Family-friendly area with good safety',
    ],
    transport: ['Metro station in area', 'Good bus connectivity', 'Cabs readily available'],
    parking: 'Large parking at WTP and commercial venues.',
    nearby: ['World Trade Park', 'Food courts', 'Multiple dining options'],
    arrivalTime: '20 minutes early',
    safety: 'Family residential area, excellent safety.',
  },
  'jln-marg': {
    tips: [
      'JLN Marg is the cultural hub of Jaipur',
      'Jawahar Kala Kendra and other cultural venues nearby',
      'Good public transport connectivity',
      'Premium dining options in the area',
    ],
    transport: ['Major road with bus routes', 'Cabs and autos readily available', 'Easy access from all parts'],
    parking: 'Venue parking usually available at cultural centers.',
    nearby: ['JKK cafeteria', 'Upscale restaurants', 'Art galleries'],
    arrivalTime: '15-20 minutes early',
    safety: 'Premium area, very safe, well-patrolled.',
  },
};

/**
 * Generate comprehensive FAQ based on event data
 */
function generateComprehensiveFAQ(input: EventEnrichmentInput): Array<{ question: string; answer: string }> {
  const faqs: Array<{ question: string; answer: string }> = [];
  const localityName = input.locality?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Jaipur';
  const template = categoryTemplates[input.category] || categoryTemplates.music;
  
  // Venue FAQ
  faqs.push({
    question: `What is the venue for ${input.title}?`,
    answer: input.venue_name 
      ? `The event will be held at ${input.venue_name}${input.locality ? ` in ${localityName}, Jaipur` : ', Jaipur'}.${input.venue_address ? ` Address: ${input.venue_address}` : ''}`
      : 'Venue details will be updated soon. Check back for the latest information.',
  });

  // Ticket pricing FAQ
  faqs.push({
    question: `How much do tickets cost for ${input.title}?`,
    answer: input.is_free 
      ? 'This is a free event! Registration may be required for entry. We recommend registering early to secure your spot.'
      : input.ticket_price 
        ? `Tickets start from ₹${input.ticket_price}. Early booking is recommended to secure the best seats and avoid last-minute disappointment.`
        : 'Ticket prices will be announced soon. Follow JaipurCircle for updates.',
  });

  // How to reach FAQ
  faqs.push({
    question: 'How can I reach the venue?',
    answer: input.locality 
      ? `The venue is located in ${localityName}, Jaipur. You can reach by cab (Ola/Uber), auto-rickshaw, or personal vehicle. ${localityInfoMap[input.locality]?.transport.join('. ') || 'Check Google Maps for accurate directions.'}`
      : 'The venue is in Jaipur. We recommend using Google Maps for the most accurate directions.',
  });

  // Duration FAQ
  faqs.push({
    question: `How long is ${input.title}?`,
    answer: `Typical ${input.category} events run for ${template.typicalDuration}. We recommend arriving early and planning for potential encore or extended segments.`,
  });

  // Dress code FAQ
  faqs.push({
    question: 'What should I wear?',
    answer: template.dressCode,
  });

  // Category-specific FAQs
  if (input.category === 'comedy') {
    faqs.push({
      question: 'Is the comedy show suitable for all ages?',
      answer: 'Most stand-up comedy shows contain adult humor and are recommended for audiences 16+. Please check the event description for specific age restrictions.',
    });
    faqs.push({
      question: 'Can I take photos during the show?',
      answer: 'Flash photography and video recording are typically not allowed during comedy performances as they can distract the performer. Phone usage may be restricted.',
    });
  }

  if (input.category === 'music') {
    faqs.push({
      question: 'Are cameras and phones allowed?',
      answer: 'Camera policies vary by event. Generally, phones are allowed for personal photos but professional cameras may be restricted. Flash photography is usually not permitted during performances.',
    });
    faqs.push({
      question: 'Can I bring food and drinks?',
      answer: 'Outside food and beverages are typically not allowed. Most venues have refreshment counters inside.',
    });
  }

  if (input.category === 'party') {
    faqs.push({
      question: 'Is there an age limit?',
      answer: 'Most party events in Jaipur require guests to be 21+ with valid government ID. Some events may be 18+. Please check the specific event details.',
    });
  }

  if (input.category === 'workshop') {
    faqs.push({
      question: 'Do I need to bring any materials?',
      answer: 'Most workshops provide all necessary materials. However, you may want to bring a notebook for personal notes. Check event description for any specific requirements.',
    });
  }

  // Organizer FAQ
  if (input.organizer_name) {
    faqs.push({
      question: `Who is organizing ${input.title}?`,
      answer: `This event is organized by ${input.organizer_name}. They are known for hosting quality events in Jaipur and ensuring excellent attendee experience.`,
    });
  }

  // Parking FAQ
  if (input.locality && localityInfoMap[input.locality]) {
    faqs.push({
      question: 'Is parking available at the venue?',
      answer: localityInfoMap[input.locality].parking,
    });
  }

  // Cancellation FAQ
  faqs.push({
    question: 'What is the cancellation/refund policy?',
    answer: 'Refund policies vary by event and ticketing platform. Please check the terms while booking. For paid events, refunds may be available up to 24-48 hours before the event.',
  });

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
    disclaimer: 'Ticket purchase is handled by the ticketing partner. JaipurCircle provides local context, venue guidance, and discovery to help you make informed decisions about attending.',
  };
}

/**
 * Generate related internal links
 */
function generateRelatedLinks(input: EventEnrichmentInput): EnrichedEventContent['relatedLinks'] {
  const links: EnrichedEventContent['relatedLinks'] = [];
  
  // Category link
  links.push({
    type: 'category',
    label: `More ${input.category.charAt(0).toUpperCase() + input.category.slice(1)} Events`,
    href: `/events?category=${input.category}`,
  });
  
  // Locality link
  if (input.locality) {
    const localityName = input.locality.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    links.push({
      type: 'locality',
      label: `Events in ${localityName}`,
      href: `/jaipur/${input.locality}/events`,
    });
  }
  
  // Series link if applicable
  if (input.series_name) {
    links.push({
      type: 'series',
      label: `${input.series_name} Series`,
      href: `/events/series/${input.series_name.toLowerCase().replace(/\s+/g, '-')}`,
    });
  }
  
  // Venue link if available
  if (input.venue_name) {
    const venueSlug = input.venue_name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    links.push({
      type: 'venue',
      label: `More at ${input.venue_name}`,
      href: `/events/venue/${venueSlug}`,
    });
  }
  
  return links;
}

/**
 * Main auto-enrichment function - V2 with 8 structured sections
 */
export function autoEnrichEvent(input: EventEnrichmentInput): EnrichedEventContent {
  const template = categoryTemplates[input.category] || categoryTemplates.music;
  const localityName = input.locality?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Jaipur';
  const localityInfo = input.locality ? localityInfoMap[input.locality] : null;
  
  // Section 1: About Event
  const aboutEvent = {
    summary: `${input.title} brings ${template.crowdVibe.toLowerCase()} experience to ${localityName}. ${input.is_free ? 'This free event' : 'This event'} is perfect for ${template.audienceType}.`,
    targetAudience: template.audienceType,
    whyPeopleAttend: `People attend for the ${template.crowdVibe.toLowerCase()} atmosphere, quality entertainment, and the chance to connect with like-minded enthusiasts in Jaipur.`,
  };
  
  // Section 2: Highlights
  const eventDate = new Date(input.start_date);
  const highlights = [
    `Duration: Approximately ${template.typicalDuration}`,
    `Crowd vibe: ${template.crowdVibe}`,
    input.organizer_name ? `Presented by ${input.organizer_name}` : null,
    input.series_name ? `Part of the ${input.series_name} series` : null,
    input.is_recurring ? 'Recurring edition - join the tradition!' : null,
    ...template.whatToExpect.slice(0, 3),
  ].filter(Boolean) as string[];
  
  // Section 3: Performer Context (if applicable)
  const performerContext = input.performer_name ? {
    background: `${input.performer_name} is a renowned ${input.category === 'music' ? 'artist' : input.category === 'comedy' ? 'comedian' : 'performer'} known for captivating audiences with their unique style.`,
    whyThisMatters: `This ${input.category} performance in Jaipur offers a rare opportunity to experience ${input.performer_name} live in an intimate setting.`,
    jaipurRelevance: `${input.performer_name}'s performance in Jaipur adds to the city's growing reputation as a cultural hub for quality entertainment.`,
  } : null;
  
  // Section 4: Venue & Locality Guide
  const venueGuide = {
    bestTimeToArrive: localityInfo?.arrivalTime || '15-30 minutes before the event starts',
    parkingNotes: localityInfo?.parking || 'Check with venue for parking availability. Cab/auto drop-off recommended.',
    transportModes: localityInfo?.transport || ['Ola/Uber', 'Auto-rickshaw', 'Personal vehicle'],
    nearbyOptions: localityInfo?.nearby || ['Cafes and restaurants within 1km', 'Food stalls at venue (usually available)'],
  };
  
  // Section 5: Attendee Tips
  const attendeeTips = {
    dressCode: template.dressCode,
    seatingExpectation: input.category === 'music' || input.category === 'party' 
      ? 'Mostly standing with some seating areas. Arrive early for better spots.'
      : 'Assigned seating usually available. Premium seats may offer better views.',
    weatherSafety: `Jaipur ${eventDate.getMonth() >= 3 && eventDate.getMonth() <= 6 ? 'summers can be hot - stay hydrated' : eventDate.getMonth() >= 10 || eventDate.getMonth() <= 1 ? 'winters can be cool - carry a light jacket for outdoor venues' : 'weather is pleasant during this season'}. ${localityInfo?.safety || 'The area is generally safe for evening events.'}`,
    generalTips: [
      'Keep your ticket/registration confirmation handy',
      'Carry a valid ID for entry verification',
      'Check venue policies on bags and prohibited items',
      'Save the venue location on your phone before heading out',
    ],
  };
  
  // Section 6: Ticket & Registration Notes
  const ticketNotes = {
    pricingContext: input.is_free 
      ? 'Free entry with registration. Limited spots may be available.'
      : input.ticket_price 
        ? `Tickets starting from ₹${input.ticket_price}. Early bird discounts may be available.`
        : 'Pricing to be announced. Register interest to get notified.',
    refundPolicy: 'Refund policies are set by the ticketing partner. Typically, refunds are available up to 24-48 hours before the event.',
    callToAction: input.source_url 
      ? 'Book your tickets through our ticketing partner for a secure transaction.'
      : 'Register your interest and we\'ll notify you when tickets are available.',
    disclaimer: 'JaipurCircle helps you discover events. Ticket purchases are processed by the official ticketing partner.',
  };
  
  // Section 7: Related Links
  const relatedLinks = generateRelatedLinks(input);
  
  // Section 8: FAQs
  const faq = generateComprehensiveFAQ(input);
  
  // Legacy: Generate enriched description for backward compatibility
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
  const localityTips = localityInfo?.tips || [
    'Plan your travel in advance for a hassle-free experience',
    'Check venue parking availability before you leave',
    'Arrive 15-30 minutes early to avoid last-minute rush',
    'Keep your ticket/confirmation handy for quick entry',
  ];

  // Generate SEO metadata
  const monthYear = eventDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  
  const metaTitle = `${input.title} in Jaipur ${monthYear} | ${input.venue_name || localityName} | Book Tickets`;
  const metaDescription = `Book tickets for ${input.title} in ${localityName}, Jaipur. ${input.is_free ? 'Free event!' : input.ticket_price ? `Starting ₹${input.ticket_price}.` : ''} ${input.venue_name ? `Venue: ${input.venue_name}.` : ''} Get event details, directions, attendee tips & local insights.`;

  return {
    // New V2 sections
    aboutEvent,
    highlights,
    performerContext,
    venueGuide,
    attendeeTips,
    ticketNotes,
    relatedLinks,
    faq,
    
    // Legacy fields
    enrichedDescription,
    shortDescription,
    whyAttend: template.whyAttend,
    whatToExpect: template.whatToExpect,
    localityTips,
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
