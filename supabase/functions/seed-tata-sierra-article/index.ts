import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const slug = 'tata-sierra-jaipur-price-booking-on-road-cost-showrooms-2025';

    const coverImage = '/images/tata-sierra-jaipur.png';

    // Check if article already exists - update if so
    const { data: existing } = await supabase
      .from('news_articles')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing) {
      // Update existing article with new cover image
      const { error: updateError } = await supabase
        .from('news_articles')
        .update({ 
          cover_image: coverImage,
          og_image: coverImage,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Article updated with new cover image',
          url: `/news/events/${slug}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const articleContent = `
<article class="prose prose-lg max-w-none">

<p class="lead text-xl text-muted-foreground">Welcome to the <strong>Tata Sierra Jaipur hub page</strong> on JaipurCircle — your city-focused guide for everything related to the Tata Sierra SUV in Jaipur & Rajasthan.</p>

<p>Here you'll find:</p>
<ul>
<li>On-road price trends in Jaipur</li>
<li>Booking amount & availability</li>
<li>Waiting period & delivery timelines</li>
<li>Variants & fuel options</li>
<li>Dealer & showroom references</li>
<li>Related news, comparisons & buyer resources</li>
</ul>

<p><em>This page is regularly updated to reflect local demand patterns and buyer interest in Jaipur.</em></p>

<hr/>

<h2>🏷️ Tata Sierra Price & Booking in Jaipur</h2>

<p>Browse localized Sierra resources for Jaipur buyers:</p>

<div class="bg-muted/30 p-6 rounded-lg my-6">
<h3 class="mt-0">Key Resources</h3>
<ul class="mb-0">
<li><strong>Tata Sierra Jaipur Booking Price</strong> — Token Amount & On-Road Price Guide (Booking amount, price range, waiting period & buyer interest)</li>
<li><strong>Tata Sierra On-Road Price in Jaipur</strong> — Variant-Wise Cost Breakdown (RTO, insurance, charges & ownership cost insights)</li>
<li><strong>Tata Sierra Petrol & Diesel Price Comparison in Jaipur</strong> — Fuel-wise price expectation & buyer preference trends</li>
</ul>
</div>

<p>These pages help Jaipur buyers get clarity before booking or finalizing a variant.</p>

<hr/>

<h2>🚗 Tata Sierra Variants & Buyer Interest in Jaipur</h2>

<p>The Tata Sierra is gaining attention among:</p>
<ul>
<li>Family buyers upgrading to a premium SUV</li>
<li>Highway travellers across Rajasthan</li>
<li>Nostalgia-driven Tata loyalists</li>
<li>Lifestyle & road-trip enthusiasts</li>
</ul>

<h3>Popular Buyer Search Journeys in Jaipur</h3>
<ul>
<li>Tata Sierra petrol vs diesel</li>
<li>Sierra automatic vs manual preference</li>
<li>Sierra price vs Harrier / Creta / Seltos</li>
<li>Sierra for highway & out-station travel</li>
</ul>

<div class="bg-primary/5 border-l-4 border-primary p-4 my-6">
<p class="mb-0"><strong>Explore More:</strong> Tata Sierra Variants Explained — Which One Makes Sense for Jaipur Buyers? | Best Variant of Tata Sierra for Highway Travel in Rajasthan</p>
</div>

<hr/>

<h2>⏳ Tata Sierra Waiting Period & Delivery Timelines (Jaipur)</h2>

<p>Due to strong national demand, the Sierra waiting period in Jaipur may vary based on:</p>
<ul>
<li>Engine & transmission type</li>
<li>Colour availability</li>
<li>Production batch allocation</li>
<li>Dealership inventory cycles</li>
</ul>

<div class="grid md:grid-cols-2 gap-4 my-6">
<div class="bg-muted/30 p-4 rounded-lg">
<h4 class="mt-0 text-base">⏱️ Estimated Waiting Period</h4>
<p class="text-2xl font-bold text-primary mb-0">3-6 Months</p>
<p class="text-sm text-muted-foreground mb-0">Depending on variant & colour</p>
</div>
<div class="bg-muted/30 p-4 rounded-lg">
<h4 class="mt-0 text-base">💰 Booking Token</h4>
<p class="text-2xl font-bold text-primary mb-0">₹10K - ₹25K</p>
<p class="text-sm text-muted-foreground mb-0">Varies by dealership</p>
</div>
</div>

<hr/>

<h2>🧭 Where to Book Tata Sierra in Jaipur</h2>

<p>Bookings are available through:</p>
<ul>
<li>Authorised Tata Motors dealerships in Jaipur</li>
<li>Official Tata Motors online booking portal</li>
<li>Showroom booking assistance & enquiry desks</li>
</ul>

<div class="bg-accent/10 p-6 rounded-lg my-6">
<h3 class="mt-0">🏢 Tata Motors Dealerships in Jaipur</h3>
<p>Key showroom locations across the city:</p>
<ul class="mb-0">
<li><strong>C-Scheme</strong> — Central Jaipur flagship showroom</li>
<li><strong>Vaishali Nagar</strong> — West Jaipur dealership</li>
<li><strong>Mansarovar</strong> — South Jaipur authorized dealer</li>
<li><strong>Tonk Road</strong> — Extended service center</li>
</ul>
</div>

<p><em>Coming soon on JaipurCircle: Dealership contact directory, showroom map locations, price enquiry & test drive request links</em></p>

<hr/>

<h2>🏙️ Why Tata Sierra Is Trending in Jaipur</h2>

<p>The Sierra revival has generated strong interest in Jaipur due to:</p>

<div class="grid md:grid-cols-2 gap-4 my-6">
<div class="flex items-start gap-3 p-4 bg-muted/20 rounded-lg">
<span class="text-2xl">🚙</span>
<div>
<h4 class="mt-0 mb-1 text-base">Nostalgic Appeal</h4>
<p class="text-sm text-muted-foreground mb-0">Emotional connection to the classic Sierra design</p>
</div>
</div>
<div class="flex items-start gap-3 p-4 bg-muted/20 rounded-lg">
<span class="text-2xl">🏔️</span>
<div>
<h4 class="mt-0 mb-1 text-base">Road-Trip Ready</h4>
<p class="text-sm text-muted-foreground mb-0">Suitability for Rajasthan inter-city drives</p>
</div>
</div>
<div class="flex items-start gap-3 p-4 bg-muted/20 rounded-lg">
<span class="text-2xl">👨‍👩‍👧‍👦</span>
<div>
<h4 class="mt-0 mb-1 text-base">Family Upgrade</h4>
<p class="text-sm text-muted-foreground mb-0">Growing regional SUV upgrade demand</p>
</div>
</div>
<div class="flex items-start gap-3 p-4 bg-muted/20 rounded-lg">
<span class="text-2xl">💪</span>
<div>
<h4 class="mt-0 mb-1 text-base">Lifestyle Positioning</h4>
<p class="text-sm text-muted-foreground mb-0">Upright SUV stance & premium positioning</p>
</div>
</div>
</div>

<hr/>

<h2>🔎 Tata Sierra Comparisons for Jaipur Buyers</h2>

<p>Many Jaipur buyers evaluate Sierra against other SUVs before booking. Here are the most common comparisons:</p>

<div class="overflow-x-auto my-6">
<table class="w-full">
<thead>
<tr>
<th>Comparison</th>
<th>Price Range (Jaipur)</th>
<th>Key Differentiator</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Sierra vs Harrier</strong></td>
<td>₹13-25L vs ₹15-26L</td>
<td>Design language & lifestyle positioning</td>
</tr>
<tr>
<td><strong>Sierra vs Hyundai Creta</strong></td>
<td>₹13-25L vs ₹11-20L</td>
<td>Size, features & brand preference</td>
</tr>
<tr>
<td><strong>Sierra vs Kia Seltos</strong></td>
<td>₹13-25L vs ₹11-20L</td>
<td>Value proposition & tech features</td>
</tr>
<tr>
<td><strong>Sierra vs Safari</strong></td>
<td>₹13-25L vs ₹16-28L</td>
<td>Seating capacity & family needs</td>
</tr>
</tbody>
</table>
</div>

<hr/>

<h2>📰 Tata Sierra News & Updates (Jaipur Focus)</h2>

<p>Stay updated with:</p>
<ul>
<li>Launch updates & booking trends</li>
<li>Buyer reactions & reviews</li>
<li>Price revisions & offers</li>
<li>Dealership insights & delivery stories</li>
</ul>

<hr/>

<h2>❓ Frequently Asked Questions — Tata Sierra in Jaipur</h2>

<div class="space-y-4 my-6">
<details class="bg-muted/20 rounded-lg p-4">
<summary class="font-semibold cursor-pointer">Is Tata Sierra available for booking in Jaipur?</summary>
<p class="mt-2 mb-0">Yes, bookings are available via authorised dealerships & online booking channels. You can book at any Tata Motors showroom in Jaipur or through the official Tata Motors website.</p>
</details>

<details class="bg-muted/20 rounded-lg p-4">
<summary class="font-semibold cursor-pointer">What is the Tata Sierra booking price in Jaipur?</summary>
<p class="mt-2 mb-0">The booking token in Jaipur is generally ₹10,000 to ₹25,000, depending on dealership policy and variant selected.</p>
</details>

<details class="bg-muted/20 rounded-lg p-4">
<summary class="font-semibold cursor-pointer">What is the expected on-road price in Jaipur?</summary>
<p class="mt-2 mb-0">The estimated on-road price range is approximately ₹13.4 lakh to ₹25 lakh, depending on variant, fuel type & configurations. This includes ex-showroom price, RTO charges, insurance, and other applicable fees.</p>
</details>

<details class="bg-muted/20 rounded-lg p-4">
<summary class="font-semibold cursor-pointer">What is the waiting period in Jaipur?</summary>
<p class="mt-2 mb-0">The waiting period may range between 3 to 6 months, depending on demand, variant selection, colour choice & allocation cycle.</p>
</details>

<details class="bg-muted/20 rounded-lg p-4">
<summary class="font-semibold cursor-pointer">Which Tata Sierra variant is best for Jaipur roads?</summary>
<p class="mt-2 mb-0">For city driving in Jaipur, the automatic variants are popular. For highway travel across Rajasthan, diesel variants with manual transmission offer better mileage and control.</p>
</details>
</div>

<hr/>

<h2>🏁 Explore More Tata Cars in Jaipur</h2>

<p>Explore other popular Tata vehicles in Jaipur:</p>

<div class="grid md:grid-cols-2 gap-4 my-6">
<a href="/jaipur/cars/tata-harrier" class="block p-4 bg-muted/20 rounded-lg hover:bg-muted/40 transition-colors no-underline">
<h4 class="mt-0 mb-1">Tata Harrier</h4>
<p class="text-sm text-muted-foreground mb-0">Price & Booking in Jaipur</p>
</a>
<a href="/jaipur/cars/tata-nexon" class="block p-4 bg-muted/20 rounded-lg hover:bg-muted/40 transition-colors no-underline">
<h4 class="mt-0 mb-1">Tata Nexon</h4>
<p class="text-sm text-muted-foreground mb-0">Price in Jaipur</p>
</a>
<a href="/jaipur/cars/tata-punch" class="block p-4 bg-muted/20 rounded-lg hover:bg-muted/40 transition-colors no-underline">
<h4 class="mt-0 mb-1">Tata Punch</h4>
<p class="text-sm text-muted-foreground mb-0">Price in Jaipur</p>
</a>
<a href="/jaipur/cars/tata-safari" class="block p-4 bg-muted/20 rounded-lg hover:bg-muted/40 transition-colors no-underline">
<h4 class="mt-0 mb-1">Tata Safari</h4>
<p class="text-sm text-muted-foreground mb-0">Price & Variants in Jaipur</p>
</a>
</div>

<hr/>

<h2>🎯 Why This Hub Page Helps Jaipur Buyers</h2>

<p>This page is designed to:</p>
<ul>
<li>Organize all Tata Sierra Jaipur content in one place</li>
<li>Improve discovery of price & booking resources</li>
<li>Serve as a central entry point for Sierra-related searches</li>
<li>Strengthen JaipurCircle's automotive topic authority</li>
</ul>

<div class="bg-primary/10 p-6 rounded-lg my-6 text-center">
<p class="text-lg font-semibold mb-2">Looking for the best Tata Sierra deal in Jaipur?</p>
<p class="text-muted-foreground mb-0">Bookmark this page for regular updates on pricing, availability, and dealership offers.</p>
</div>

</article>
`;

    const structuredData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Article",
          "@id": `https://jaipurcircle.com/news/events/${slug}#article`,
          "headline": "Tata Sierra in Jaipur — Price, Booking, On-Road Cost, Waiting Period & Showrooms (2025 Guide)",
          "description": "Complete guide to Tata Sierra in Jaipur. Get on-road price ₹13.4-25 lakh, booking amount ₹10-25K, waiting period 3-6 months, dealership locations & variant comparisons for 2025.",
          "datePublished": new Date().toISOString(),
          "dateModified": new Date().toISOString(),
          "author": {
            "@type": "Organization",
            "name": "JaipurCircle",
            "url": "https://jaipurcircle.com"
          },
          "publisher": {
            "@type": "Organization",
            "name": "JaipurCircle",
            "url": "https://jaipurcircle.com",
            "logo": {
              "@type": "ImageObject",
              "url": "https://jaipurcircle.com/logo.png"
            }
          },
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `https://jaipurcircle.com/news/events/${slug}`
          },
          "about": {
            "@type": "Product",
            "name": "Tata Sierra",
            "brand": {
              "@type": "Brand",
              "name": "Tata Motors"
            },
            "category": "SUV"
          }
        },
        {
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Is Tata Sierra available for booking in Jaipur?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, bookings are available via authorised dealerships & online booking channels."
              }
            },
            {
              "@type": "Question",
              "name": "What is the Tata Sierra booking price in Jaipur?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "The booking token in Jaipur is generally ₹10,000 to ₹25,000, depending on dealership policy."
              }
            },
            {
              "@type": "Question",
              "name": "What is the expected on-road price in Jaipur?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "The estimated on-road price range is approximately ₹13.4 lakh to ₹25 lakh, depending on variant & configurations."
              }
            },
            {
              "@type": "Question",
              "name": "What is the waiting period in Jaipur?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "The waiting period may range between 3 to 6 months, depending on demand & allocation cycle."
              }
            }
          ]
        },
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://jaipurcircle.com" },
            { "@type": "ListItem", "position": 2, "name": "Cars", "item": "https://jaipurcircle.com/jaipur/cars" },
            { "@type": "ListItem", "position": 3, "name": "Tata", "item": "https://jaipurcircle.com/jaipur/cars/tata" },
            { "@type": "ListItem", "position": 4, "name": "Sierra", "item": `https://jaipurcircle.com/news/events/${slug}` }
          ]
        },
        {
          "@type": "Product",
          "name": "Tata Sierra",
          "brand": {
            "@type": "Brand",
            "name": "Tata Motors"
          },
          "category": "SUV",
          "offers": {
            "@type": "AggregateOffer",
            "priceCurrency": "INR",
            "lowPrice": "1340000",
            "highPrice": "2500000",
            "offerCount": "6",
            "availability": "https://schema.org/PreOrder",
            "areaServed": {
              "@type": "City",
              "name": "Jaipur",
              "containedInPlace": {
                "@type": "State",
                "name": "Rajasthan"
              }
            }
          }
        }
      ]
    };

    const { data, error } = await supabase
      .from('news_articles')
      .insert({
        title: 'Tata Sierra in Jaipur — Price, Booking, On-Road Cost, Waiting Period & Showrooms (2025 Guide)',
        slug: slug,
        content: articleContent,
        excerpt: 'Complete guide to Tata Sierra in Jaipur. Get on-road price ₹13.4-25 lakh, booking amount ₹10-25K, waiting period 3-6 months, dealership locations, variant comparisons & buyer resources for 2025.',
        category: 'events',
        status: 'published',
        is_featured: true,
        locality: 'jaipur',
        cover_image: coverImage,
        meta_title: 'Tata Sierra Price in Jaipur 2025 | Booking, On-Road Cost & Showrooms',
        meta_description: 'Tata Sierra Jaipur price ₹13.4-25 lakh on-road. Booking amount ₹10-25K, waiting period 3-6 months. Find dealerships, variants & comparisons. Updated 2025 guide.',
        meta_keywords: [
          'tata sierra jaipur',
          'tata sierra price jaipur',
          'tata sierra on road price jaipur',
          'tata sierra booking jaipur',
          'tata sierra showroom jaipur',
          'tata sierra waiting period jaipur',
          'tata sierra dealer jaipur',
          'tata sierra 2025 jaipur',
          'sierra suv jaipur',
          'tata motors jaipur',
          'tata sierra rajasthan'
        ],
        tags: ['tata sierra', 'suv', 'cars', 'tata motors', 'jaipur', 'automotive', 'car booking', 'on-road price', '2025'],
        published_at: new Date().toISOString(),
        structured_data: structuredData,
        og_image: coverImage,
        canonical_url: `https://jaipurcircle.com/news/events/${slug}`
      })
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      throw error;
    }

    console.log('Article created successfully:', data.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Tata Sierra article published successfully',
        articleId: data.id,
        url: `/news/events/${slug}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
