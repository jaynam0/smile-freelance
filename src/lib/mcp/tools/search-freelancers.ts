import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "search_freelancers",
  title: "Search freelancers",
  description: "Search freelancer profiles by category, skill, or max hourly rate.",
  inputSchema: {
    category: z.string().optional(),
    skill: z.string().optional(),
    max_hourly_rate: z.number().nonnegative().optional(),
    limit: z.number().int().min(1).max(100).default(20),
  },
  annotations: { readOnlyHint: true, openWorldHint: false },
  handler: async ({ category, skill, max_hourly_rate, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const sb = supabaseForUser(ctx);
    let q = sb
      .from("profiles")
      .select("id, full_name, headline, bio, category, skills, hourly_rate, years_experience, portfolio_url")
      .limit(limit);
    if (category) q = q.eq("category", category);
    if (skill) q = q.contains("skills", [skill]);
    if (max_hourly_rate != null) q = q.lte("hourly_rate", max_hourly_rate);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { freelancers: data ?? [] },
    };
  },
});
