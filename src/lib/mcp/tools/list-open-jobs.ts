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
  name: "list_open_jobs",
  title: "Browse open jobs",
  description: "List open job posts on the freelance marketplace, optionally filtered by category or skill.",
  inputSchema: {
    category: z.string().optional().describe("Filter by category (e.g. 'design', 'writing')."),
    skill: z.string().optional().describe("Filter by a required skill."),
    limit: z.number().int().min(1).max(100).default(20),
  },
  annotations: { readOnlyHint: true, openWorldHint: false },
  handler: async ({ category, skill, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const sb = supabaseForUser(ctx);
    let q = sb
      .from("job_posts")
      .select("id, title, description, category, skills, budget_type, budget_min, budget_max, client_id, created_at")
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (category) q = q.eq("category", category);
    if (skill) q = q.contains("skills", [skill]);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { jobs: data ?? [] },
    };
  },
});
