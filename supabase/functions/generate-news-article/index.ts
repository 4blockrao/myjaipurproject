import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const REQUEST_TIMEOUT_MS = 30000;

// Helper to create timeout promise
const createTimeout = (ms: number): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Request timeout after ${ms}ms`)), ms);
  });
};

// Helper for delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch with retry logic
async function fetchWithRetry(
  url: string, 
  options: RequestInit, 
  retries: number = MAX_RETRIES
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${retries} - Fetching AI gateway`);
      
      const response = await Promise.race([
        fetch(url, options),
        createTimeout(REQUEST_TIMEOUT_MS)
      ]) as Response;
      
      // Don't retry on client errors (4xx) except rate limits
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        return response;
      }
      
      // Retry on server errors (5xx) or rate limits
      if (response.status >= 500 || response.status === 429) {
        console.log(`Received ${response.status}, will retry...`);
        if (attempt < retries) {
          await delay(RETRY_DELAY_MS * attempt); // Exponential backoff
          continue;
        }
      }
      
      return response;
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt} failed:`, error.message);
      
      if (attempt < retries) {
        await delay(RETRY_DELAY_MS * attempt);
      }
    }
  }
  
  throw lastError || new Error('All retry attempts failed');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log('=== Generate News Article Request Started ===');

  try {
    const { topic, category, locality } = await req.json();
    
    if (!topic) {
      console.log('Error: Topic is required');
      return new Response(JSON.stringify({ error: 'Topic is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(JSON.stringify({ error: 'AI service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const categoryContext = category ? `Category: ${category}` : '';
    const localityContext = locality ? `Locality: ${locality}, Jaipur` : 'Jaipur, Rajasthan';

    const systemPrompt = `You are a professional local news journalist for JaipurCircle.com, a hyperlocal news platform for Jaipur, Rajasthan, India. 

Your task is to write engaging, SEO-optimized news articles about Jaipur.

Guidelines:
- Write in a professional yet accessible tone
- Focus on local relevance and community impact
- Include specific details about locations, people, and events when relevant
- Use SEO-friendly headlines and subheadings
- Keep articles between 400-800 words
- Include relevant quotes when appropriate (you can create realistic fictional quotes from local officials, residents, or experts)
- Write in English but can include Hindi terms with translations where culturally appropriate

For SEO optimization:
- Create compelling headlines under 60 characters
- Write meta descriptions under 160 characters
- Include location-specific keywords naturally
- Use structured content with clear sections`;

    const userPrompt = `Write a complete news article about the following topic:

Topic: ${topic}
${categoryContext}
Location Context: ${localityContext}

Please provide the response in the following JSON format:
{
  "title": "Headline (under 60 characters)",
  "excerpt": "Brief summary for preview (under 200 characters)",
  "content": "Full article content in markdown format with proper headings",
  "meta_title": "SEO title (under 60 characters)",
  "meta_description": "SEO meta description (under 160 characters)",
  "meta_keywords": ["keyword1", "keyword2", "keyword3"],
  "suggested_tags": ["tag1", "tag2", "tag3"]
}`;

    console.log('Generating article for topic:', topic, '| Category:', category);

    const response = await fetchWithRetry('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again in a few seconds.',
          retryAfter: 5
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '5' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add funds.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ error: 'Failed to generate article. Please try again.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const generatedContent = data.choices[0]?.message?.content;

    if (!generatedContent) {
      console.error('No content in AI response');
      return new Response(JSON.stringify({ error: 'No content generated' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse JSON response with better error handling
    let articleData;
    try {
      let jsonContent = generatedContent;
      // Remove markdown code blocks if present
      if (jsonContent.includes('```json')) {
        jsonContent = jsonContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonContent.includes('```')) {
        jsonContent = jsonContent.replace(/```\n?/g, '');
      }
      articleData = JSON.parse(jsonContent.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Return structured fallback if parsing fails
      articleData = {
        title: topic.substring(0, 60),
        excerpt: generatedContent.substring(0, 200),
        content: generatedContent,
        meta_title: topic.substring(0, 60),
        meta_description: generatedContent.substring(0, 160),
        meta_keywords: [category || 'jaipur', 'news', locality || 'local'],
        suggested_tags: [category || 'general'],
      };
    }

    const duration = Date.now() - startTime;
    console.log(`Article generated successfully in ${duration}ms`);

    return new Response(JSON.stringify(articleData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`Error in generate-news-article (${duration}ms):`, error);
    
    const errorMessage = error.message?.includes('timeout') 
      ? 'Request timed out. The AI service is slow. Please try again.'
      : error.message || 'Unknown error occurred';
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
