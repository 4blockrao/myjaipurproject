import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SITE_URL = 'https://jaipurcircle.com'

// @ts-ignore - Deno deploy config
Deno.serve({ verify: false }, async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const today = new Date().toISOString().split('T')[0]

    // Static pages
    const staticPages = [
      { loc: '/', changefreq: 'daily', priority: 1.0 },
      { loc: '/about', changefreq: 'monthly', priority: 0.8 },
      { loc: '/news', changefreq: 'hourly', priority: 0.9 },
      { loc: '/events', changefreq: 'daily', priority: 0.9 },
      { loc: '/deals', changefreq: 'daily', priority: 0.9 },
      { loc: '/categories', changefreq: 'weekly', priority: 0.7 },
      { loc: '/help', changefreq: 'monthly', priority: 0.5 },
      { loc: '/merchant-onboarding', changefreq: 'monthly', priority: 0.6 },
      { loc: '/referral-program', changefreq: 'monthly', priority: 0.7 },
      { loc: '/leaderboard', changefreq: 'daily', priority: 0.6 },
      { loc: '/merchants', changefreq: 'daily', priority: 0.8 },
      { loc: '/jaipur', changefreq: 'weekly', priority: 0.9 },
    ]

    const newsCategories = ['city', 'events', 'food', 'culture', 'business', 'sports']

    // Fetch all data in parallel
    const [newsRes, eventsRes, dealsRes, merchantsRes, localitiesRes] = await Promise.all([
      supabase.from('news_articles').select('slug, category, published_at').eq('status', 'published'),
      supabase.from('events').select('slug, updated_at').eq('status', 'published'),
      supabase.from('deals').select('id, updated_at').eq('approval_status', 'approved').eq('is_active', true),
      supabase.from('merchants').select('id, updated_at').eq('is_active', true),
      supabase.from('localities').select('slug, updated_at'),
    ])

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

    // Static pages
    for (const page of staticPages) {
      xml += `  <url>\n`
      xml += `    <loc>${SITE_URL}${page.loc}</loc>\n`
      xml += `    <lastmod>${today}</lastmod>\n`
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`
      xml += `    <priority>${page.priority}</priority>\n`
      xml += `  </url>\n`
    }

    // News category pages
    for (const category of newsCategories) {
      xml += `  <url>\n`
      xml += `    <loc>${SITE_URL}/news/${category}</loc>\n`
      xml += `    <lastmod>${today}</lastmod>\n`
      xml += `    <changefreq>daily</changefreq>\n`
      xml += `    <priority>0.8</priority>\n`
      xml += `  </url>\n`
    }

    // News articles
    for (const article of newsRes.data || []) {
      xml += `  <url>\n`
      xml += `    <loc>${SITE_URL}/news/${article.category}/${article.slug}</loc>\n`
      xml += `    <lastmod>${article.published_at?.split('T')[0] || today}</lastmod>\n`
      xml += `    <changefreq>weekly</changefreq>\n`
      xml += `    <priority>0.7</priority>\n`
      xml += `  </url>\n`
    }

    // Events
    for (const event of eventsRes.data || []) {
      xml += `  <url>\n`
      xml += `    <loc>${SITE_URL}/events/${event.slug}</loc>\n`
      xml += `    <lastmod>${event.updated_at?.split('T')[0] || today}</lastmod>\n`
      xml += `    <changefreq>weekly</changefreq>\n`
      xml += `    <priority>0.7</priority>\n`
      xml += `  </url>\n`
    }

    // Deals
    for (const deal of dealsRes.data || []) {
      xml += `  <url>\n`
      xml += `    <loc>${SITE_URL}/deal/${deal.id}</loc>\n`
      xml += `    <lastmod>${deal.updated_at?.split('T')[0] || today}</lastmod>\n`
      xml += `    <changefreq>daily</changefreq>\n`
      xml += `    <priority>0.7</priority>\n`
      xml += `  </url>\n`
    }

    // Merchants
    for (const merchant of merchantsRes.data || []) {
      xml += `  <url>\n`
      xml += `    <loc>${SITE_URL}/merchant/${merchant.id}</loc>\n`
      xml += `    <lastmod>${merchant.updated_at?.split('T')[0] || today}</lastmod>\n`
      xml += `    <changefreq>weekly</changefreq>\n`
      xml += `    <priority>0.6</priority>\n`
      xml += `  </url>\n`
    }

    // Localities
    for (const locality of localitiesRes.data || []) {
      xml += `  <url>\n`
      xml += `    <loc>${SITE_URL}/jaipur/${locality.slug}</loc>\n`
      xml += `    <lastmod>${locality.updated_at?.split('T')[0] || today}</lastmod>\n`
      xml += `    <changefreq>weekly</changefreq>\n`
      xml += `    <priority>0.8</priority>\n`
      xml += `  </url>\n`
    }

    xml += '</urlset>'

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return new Response(JSON.stringify({ error: 'Failed to generate sitemap' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
