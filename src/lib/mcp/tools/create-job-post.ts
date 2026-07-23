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
  name: "create_job_post",
  title: "Post a job",
  description: "Create a new open job post as the signed-in user (client).",
  inputSchema: {
    title: z.string().trim().min(3).max(200),
    description: z.string().trim().min(10),
    category: z.string().trim().optional(),
    skills: z.array(z.string()).max(20).optional(),
    budget_type: z.enum(["fixed", "hourly"]).default("fixed"),
    budget_min: z.number().nonnegative().optional(),
    budget_max: z.number().nonnegative().optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const sb = supabaseForUser(ctx);
    const { data, error } = await sb
      .from("job_posts")
      .insert({ ...input, client_id: ctx.getUserId() })
      .select()
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Job posted: ${data.id}` }],
      structuredContent: { job: data },
    };
  },
});
