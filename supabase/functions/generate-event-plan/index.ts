import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, pdfBase64 } = await req.json();

    if (!text && !pdfBase64) {
      return new Response(JSON.stringify({ error: "Missing text or pdfBase64" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userContent = pdfBase64
      ? `Extract event details from this PDF document (base64 encoded). The PDF content in base64: ${pdfBase64.substring(0, 50000)}`
      : `Extract event details from the following document text:\n\n${text}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    const aiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ parts: [{ text: userContent }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("Gemini API error:", aiResponse.status, errText);
      return new Response(JSON.stringify({ error: `Gemini API error: ${aiResponse.status} ${errText}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawContent) {
      return new Response(JSON.stringify({ error: "No content returned from Gemini" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const plan = parseJsonResponse(rawContent);

    return new Response(JSON.stringify({ plan }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-event-plan:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function parseJsonResponse(raw: string): any {
  try {
    return JSON.parse(raw);
  } catch {
    const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) return JSON.parse(match[1].trim());
    const objMatch = raw.match(/\{[\s\S]*\}/);
    if (objMatch) return JSON.parse(objMatch[0]);
    throw new Error("Could not parse AI response as JSON");
  }
}
