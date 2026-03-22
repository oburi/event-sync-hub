import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function extractPageId(urlOrId: string): string | null {
  // Handle raw 32-char IDs (with or without dashes)
  const rawId = urlOrId.replace(/-/g, "");
  if (/^[a-f0-9]{32}$/i.test(rawId)) {
    return rawId.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, "$1-$2-$3-$4-$5");
  }
  // Extract from URL: last 32 hex chars before any query string
  const match = urlOrId.match(/([a-f0-9]{32})(?:\?|$)/i);
  if (match) {
    const id = match[1];
    return id.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, "$1-$2-$3-$4-$5");
  }
  return null;
}

interface NotionBlock {
  type: string;
  [key: string]: any;
}

function extractTextFromRichText(richText: any[]): string {
  return (richText || []).map((t: any) => t.plain_text || "").join("");
}

function blockToText(block: NotionBlock): string {
  const type = block.type;
  const content = block[type];
  if (!content) return "";

  switch (type) {
    case "paragraph":
    case "quote":
    case "callout":
      return extractTextFromRichText(content.rich_text);
    case "heading_1":
      return `# ${extractTextFromRichText(content.rich_text)}`;
    case "heading_2":
      return `## ${extractTextFromRichText(content.rich_text)}`;
    case "heading_3":
      return `### ${extractTextFromRichText(content.rich_text)}`;
    case "bulleted_list_item":
    case "numbered_list_item":
      return `• ${extractTextFromRichText(content.rich_text)}`;
    case "to_do":
      const checked = content.checked ? "✅" : "⬜";
      return `${checked} ${extractTextFromRichText(content.rich_text)}`;
    case "toggle":
      return extractTextFromRichText(content.rich_text);
    case "divider":
      return "---";
    case "table_row":
      return (content.cells || [])
        .map((cell: any[]) => extractTextFromRichText(cell))
        .join(" | ");
    default:
      if (content.rich_text) {
        return extractTextFromRichText(content.rich_text);
      }
      return "";
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const NOTION_API_KEY = Deno.env.get("NOTION_API_KEY")?.trim();
    console.log("NOTION_API_KEY length:", NOTION_API_KEY?.length, "prefix:", NOTION_API_KEY?.substring(0, 7));
    if (!NOTION_API_KEY) {
      return new Response(
        JSON.stringify({ error: "NOTION_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { pageUrl } = await req.json();
    if (!pageUrl) {
      return new Response(
        JSON.stringify({ error: "pageUrl is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const pageId = extractPageId(pageUrl);
    if (!pageId) {
      return new Response(
        JSON.stringify({ error: "Could not extract a valid Notion page ID from the URL. Make sure you're sharing a Notion page URL." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const headers = {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    };

    // Fetch page metadata for the title
    const pageRes = await fetch(`https://api.notion.com/v1/pages/${pageId}`, { headers });
    if (!pageRes.ok) {
      const err = await pageRes.json().catch(() => ({}));
      const msg = err.message || `Notion API error: ${pageRes.status}`;
      return new Response(
        JSON.stringify({ error: msg }),
        { status: pageRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const pageData = await pageRes.json();

    // Extract title from page properties
    let title = "Untitled";
    const props = pageData.properties || {};
    for (const key of Object.keys(props)) {
      const prop = props[key];
      if (prop.type === "title" && prop.title?.length > 0) {
        title = extractTextFromRichText(prop.title);
        break;
      }
    }

    // Fetch all blocks (paginated)
    let allBlocks: NotionBlock[] = [];
    let startCursor: string | undefined;
    let hasMore = true;

    while (hasMore) {
      const url = new URL(`https://api.notion.com/v1/blocks/${pageId}/children`);
      url.searchParams.set("page_size", "100");
      if (startCursor) url.searchParams.set("start_cursor", startCursor);

      const blocksRes = await fetch(url.toString(), { headers });
      if (!blocksRes.ok) {
        const err = await blocksRes.json().catch(() => ({}));
        return new Response(
          JSON.stringify({ error: err.message || `Failed to fetch blocks: ${blocksRes.status}` }),
          { status: blocksRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const blocksData = await blocksRes.json();
      allBlocks = allBlocks.concat(blocksData.results || []);
      hasMore = blocksData.has_more;
      startCursor = blocksData.next_cursor;
    }

    // Convert blocks to text
    const textLines = allBlocks
      .map(blockToText)
      .filter((line) => line.trim() !== "");

    const content = `# ${title}\n\n${textLines.join("\n\n")}`;

    return new Response(
      JSON.stringify({ content, title }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("fetch-notion-page error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
