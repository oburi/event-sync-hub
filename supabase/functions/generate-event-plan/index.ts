import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SYSTEM_PROMPT = `You are an event planning assistant. Extract and return only valid JSON matching this schema:
{
  "title": "string - event title",
  "date": "string - ISO date (YYYY-MM-DD) or null if not found",
  "time": "string - time like '9:00 AM' or null",
  "location": "string - venue/location or null",
  "description": "string - 1-3 sentence summary of the event",
  "tasks": [
    {
      "title": "string - task name",
      "description": "string - brief description",
      "assignedRole": "string - role responsible e.g. 'Coordinator', 'Volunteer'",
      "time": "string - when this task happens or null",
      "location": "string - where this task happens or null"
    }
  ]
}
Extract as much structured information as possible from the provided text. Generate 3-8 logical tasks based on the event content. Return ONLY the JSON object, no markdown or explanation.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, pdfBase64 } = await req.json();

    if (!text && !pdfBase64) {
      return new Response(JSON.stringify({ error: 'Missing text or pdfBase64' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    // Try Gemini first, fall back to Lovable AI
    if (GEMINI_API_KEY && !pdfBase64) {
      try {
        const result = await callGeminiDirect(GEMINI_API_KEY, text!);
        return new Response(JSON.stringify({ plan: result }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (e) {
        console.log('Gemini direct failed, falling back to Lovable AI:', e.message);
      }
    }

    // Use Lovable AI gateway
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'No AI API key configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userContent = pdfBase64
      ? `Extract event details from this PDF document (base64 encoded). The PDF content in base64: ${pdfBase64.substring(0, 50000)}`
      : `Extract event details from the following document text:\n\n${text}`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userContent },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errText);
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add funds.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ error: `AI error: ${aiResponse.status}` }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content;

    if (!rawContent) {
      return new Response(JSON.stringify({ error: 'No content returned from AI' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const plan = parseJsonResponse(rawContent);

    return new Response(JSON.stringify({ plan }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-event-plan:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function callGeminiDirect(apiKey: string, text: string) {
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const resp = await fetch(geminiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ parts: [{ text: `Extract event details from:\n\n${text}` }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
    }),
  });
  if (!resp.ok) throw new Error(`Gemini ${resp.status}`);
  const data = await resp.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) throw new Error('No content from Gemini');
  return parseJsonResponse(raw);
}

function parseJsonResponse(raw: string): any {
  try {
    return JSON.parse(raw);
  } catch {
    const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) return JSON.parse(match[1].trim());
    // Try to find JSON object in the text
    const objMatch = raw.match(/\{[\s\S]*\}/);
    if (objMatch) return JSON.parse(objMatch[0]);
    throw new Error('Could not parse AI response as JSON');
  }
}
