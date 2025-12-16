import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, category, locality } = await req.json();
    
    if (!topic) {
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

    console.log('Generating article for topic:', topic);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add funds.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ error: 'Failed to generate article' }), {
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

    // Try to parse as JSON, handling markdown code blocks
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
      // Return raw content if parsing fails
      articleData = {
        title: topic,
        excerpt: generatedContent.substring(0, 200),
        content: generatedContent,
        meta_title: topic,
        meta_description: generatedContent.substring(0, 160),
        meta_keywords: [],
        suggested_tags: [],
      };
    }

    console.log('Article generated successfully');

    return new Response(JSON.stringify(articleData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-news-article:', error);
    return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
