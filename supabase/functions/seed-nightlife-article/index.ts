import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const NIGHTLIFE_ARTICLE = {
  title: 'Best Nightclubs in Jaipur — Top Clubs, Rooftop Lounges & Party Venues (2025 Guide)',
  slug: 'best-nightclubs-jaipur-top-clubs-lounges-party-venues-2025',
  excerpt: 'Discover the best nightclubs, rooftop lounges, and party venues in Jaipur. From premium clubs in C-Scheme to casual hangouts in Malviya Nagar — your complete 2025 nightlife guide with timings, entry prices, and locality tips.',
  category: 'events',
  locality: 'c-scheme',
  status: 'published',
  is_featured: true,
  is_ai_generated: false,
  meta_title: 'Best Nightclubs in Jaipur 2025 — Top Clubs, Lounges & Party Venues | JaipurCircle',
  meta_description: 'Explore top nightclubs & party venues in Jaipur — Blackout, Rosado, HOP, Zarza & more. Get timings, entry prices, dress codes & locality-wise nightlife guide for 2025.',
  meta_keywords: [
    'nightclubs in jaipur',
    'best clubs jaipur',
    'jaipur nightlife',
    'party venues jaipur',
    'rooftop lounges jaipur',
    'DJ clubs jaipur',
    'blackout club jaipur',
    'house of people jaipur',
    'rosado jaipur',
    'zarza jaipur',
    'jaipur pubs and bars',
    'nightlife c-scheme jaipur',
    'jaipur party places 2025'
  ],
  tags: [
    'nightlife',
    'clubs',
    'lounges',
    'party venues',
    'jaipur nightlife',
    'rooftop bars',
    'DJ nights',
    'c-scheme',
    'bais godam',
    'vaishali nagar',
    'malviya nagar'
  ],
  cover_image: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=1200&h=630&fit=crop',
  published_at: new Date().toISOString(),
  content: `## Jaipur Nightlife — Beyond Heritage, Into the Night

Jaipur isn't only about royal palaces and heritage streets — the city has grown into a vibrant nightlife destination with DJ clubs, rooftop lounges, premium bars, late-night music spaces, and celebration-friendly party venues spread across key localities.

Whether you're planning a weekend night out, a celebration evening with friends, or your first nightlife experience in Jaipur, this guide gives you a locality-based view of Jaipur's nightlife scene — along with vibes, crowd style, timings, and visiting tips.

---

## Where Nightlife Happens in Jaipur — Locality Guide

Jaipur's nightlife is mostly concentrated across a few key areas:

- **C-Scheme** — upscale lounges, premium clubs, high-energy party crowd
- **Bais Godam / Tonk Road belt** — DJ clubs, rooftop venues, late-night gatherings
- **Vaishali Nagar** — celebration dining + lounge party venues
- **Malviya Nagar & Jawahar Circle zone** — youth hangouts & rooftop music lounges

These areas are popular because they offer:

- Better road connectivity
- Nearby cafés, restaurants, and hotels
- Active evening social movement
- Multiple venues within short distance

If you're exploring Jaipur nightlife for the first time — these localities are the best starting points.

---

## Top Nightclubs & Party Venues in Jaipur

Below is a curated list of popular nightlife venues in Jaipur — with vibe highlights, crowd preferences, best visiting time, and approximate entry expectations.

### Blackout Club — C-Scheme

Located in one of Jaipur's most active nightlife zones, Blackout is known for its high-energy dance floor, terrace seating, DJ nights, and late-night party atmosphere.

| Detail | Info |
|--------|------|
| **Vibe** | Energetic, lively, music-focused |
| **Crowd Style** | Party-going, weekend-centric |
| **Best Time** | Fridays & Saturdays after 10 PM |
| **Entry Range** | ₹2,000 to ₹3,000 (varies by event) |

**Why people like it:**
- Active dance floor
- Terrace + indoor lounge sections
- Frequent theme & DJ nights

*Ideal for friends' night-outs and celebration evenings.*

---

### Rosado — Luxury Lounge & Kitchen (Vaishali Nagar)

Rosado blends fine-dining ambience with an upscale lounge-to-club nightlife transition, making it a popular choice for celebrations and special evenings.

| Detail | Info |
|--------|------|
| **Vibe** | Premium, stylish, elegant |
| **Best For** | Couples, celebrations, curated evenings |
| **Entry Range** | Around ₹3,000 per couple (event-dependent) |

**What people enjoy here:**
- Sophisticated interiors
- Panoramic lounge ambience
- Smooth transition into late-night music

*Great for evenings that begin with dinner and evolve into nightlife.*

---

### House of People (HOP) — Bais Godam

A well-known name in Jaipur's nightlife culture, House of People brings together live music evenings, DJ sets, dance floor energy, and themed party nights.

| Detail | Info |
|--------|------|
| **Vibe** | Social + dance atmosphere |
| **Crowd Type** | Mixed urban & traveler crowd |
| **Best Time** | Late evenings & weekends |
| **Entry Range** | Around ₹2,000 per couple |

**Highlights:**
- Live band nights (occasionally)
- Energetic late-night crowd
- Event-style party evenings

*Popular among regular city-nightlife patrons.*

---

### Zarza Club & Terrace — Bais Godam

Zarza offers a rooftop lounge experience that gradually shifts into a DJ-club nightlife environment — especially popular during evening and late-night hours.

| Detail | Info |
|--------|------|
| **Vibe** | Rooftop lounge + party ambience |
| **Crowd Style** | Celebration & group gatherings |
| **Best Time** | Sunset to late night |
| **Entry Range** | Around ₹2,500 for two |

**Why people choose it:**
- Open-air rooftop setting
- Relaxed evening start, energetic late hours
- Good for group outings

*Ideal for sunset gatherings that transition into nightlife plans.*

---

### Queen's Hub Night Club — Malviya Nagar

Queen's Hub offers a combination of dance floor section, rooftop hangout area, and casual nightlife atmosphere, making it popular for weekend outings.

| Detail | Info |
|--------|------|
| **Vibe** | Friendly, social, youth-centric |
| **Best For** | Friends' groups & casual party nights |
| **Entry Range** | Around ₹1,500 per couple |

**Highlights:**
- Separate dine + music space
- Relaxed yet lively crowd
- Comfortable for group plans

*A good option for fun, informal night-outs.*

---

### Teddy Club — Lal Kothi

Teddy Club is known for its casual nightlife setting, DJ music, budget-friendly entry expectations, and weekday social hangouts.

| Detail | Info |
|--------|------|
| **Vibe** | Energetic, informal, young crowd |
| **Entry Range** | ₹500 to ₹1,000 (varies by day) |

**Why people visit:**
- Accessible pricing
- Comfortable hangout vibe
- Suitable for weekday outings

*Great for first-time nightlife-goers and small groups.*

---

## Other Nightlife Spots Worth Exploring

Some more nightlife & lounge-style venues across Jaipur include:

- **F Bar & Lounge** — C-Scheme
- **Amigos Bar & Discotheque** — MI Road belt
- **Club Naila** — heritage-style casual party venue
- **Grunge** — Durgapura belt
- **60 ML Club** — Adarsh Nagar

These places typically offer:
- DJ music evenings
- Relaxed lounge ambience
- Social weekend gathering spaces

---

## Nightlife Tips for First-Time Visitors

### Best Days to Go Out

- **Weekdays** — lighter crowds, relaxed environment
- **Weekends** — bigger crowds, themed nights, higher demand
- **Special events / holidays** — advance booking recommended

### Dress Code Awareness

Most venues prefer:
- Smart casuals
- Neat & well-dressed entry
- Closed shoes for men in some clubs

*Dressing appropriately generally improves entry experience.*

### Timing & Dining Tips

- Many clubs also function as lounges & restaurants
- Evenings begin slow & become lively post 10:30 PM
- Arriving early helps with seating & smoother entry

---

## Final Take

Jaipur's nightlife has grown into a diverse mix of:

- High-energy DJ clubs
- Premium rooftop lounges
- Live-music social venues
- Casual celebration hangout spots

From upscale celebration spaces to relaxed group night-outs, the city offers nightlife experiences for every mood, crowd type, and occasion.

As Jaipur continues to evolve as a modern, socially vibrant city — its nightlife culture remains one of the most engaging ways to experience the city after dark.`,
  structured_data: {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Best Nightclubs in Jaipur — Top Clubs, Rooftop Lounges & Party Venues (2025 Guide)",
    "description": "Discover the best nightclubs, rooftop lounges, and party venues in Jaipur. From premium clubs in C-Scheme to casual hangouts in Malviya Nagar — your complete 2025 nightlife guide.",
    "author": {
      "@type": "Organization",
      "name": "JaipurCircle",
      "url": "https://www.jaipurcircle.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "JaipurCircle",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.jaipurcircle.com/logo.png"
      },
      "url": "https://www.jaipurcircle.com"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://www.jaipurcircle.com/news/events/best-nightclubs-jaipur-top-clubs-lounges-party-venues-2025"
    },
    "image": "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=1200&h=630&fit=crop",
    "keywords": "nightclubs in jaipur, best clubs jaipur, jaipur nightlife, party venues jaipur, rooftop lounges jaipur"
  }
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if article already exists
    const { data: existing } = await supabase
      .from('news_articles')
      .select('id, slug')
      .eq('slug', NIGHTLIFE_ARTICLE.slug)
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Article already exists',
          slug: existing.slug,
          url: `/news/events/${existing.slug}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert the article
    const { data, error } = await supabase
      .from('news_articles')
      .insert(NIGHTLIFE_ARTICLE)
      .select()
      .single();

    if (error) {
      console.error('Error inserting article:', error);
      throw error;
    }

    console.log('Nightlife article created successfully:', data.slug);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Article created successfully',
        slug: data.slug,
        url: `/news/events/${data.slug}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in seed-nightlife-article:', error);
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
