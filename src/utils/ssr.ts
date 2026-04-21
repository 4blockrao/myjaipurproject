// src/utils/ssr.ts
// CREATE THIS FILE - it doesn't exist yet

export function isBot(userAgent: string): boolean {
  const botPatterns = [
    /Googlebot/i,
    /bingbot/i,
    /Baiduspider/i,
    /YandexBot/i,
    /DuckDuckBot/i,
    /Slurp/i,
    /facebookexternalhit/i,
    /WhatsApp/i,
    /Twitterbot/i,
    /LinkedInBot/i,
    /Pinterest/i,
    /TelegramBot/i,
    /GPTBot/i,
    /CCBot/i,
  ];
  return botPatterns.some(pattern => pattern.test(userAgent));
}

export async function fetchSSRContent(functionName: string, slug: string): Promise<string | null> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables');
      return null;
    }

    // Use the localhost URL for development, production URL for live
    const functionUrl = import.meta.env.DEV 
      ? `http://localhost:54321/functions/v1/${functionName}?slug=${slug}`
      : `${supabaseUrl}/functions/v1/${functionName}?slug=${slug}`;

    const response = await fetch(functionUrl, {
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });

    if (!response.ok) {
      console.error(`SSR function returned ${response.status}`);
      return null;
    }

    return await response.text();
  } catch (error) {
    console.error('Failed to fetch SSR content:', error);
    return null;
  }
}
