import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/jobs/mine")({
  head: () => ({
    meta: [
      { title: "My job posts — Craftroll" },
      { name: "description", content: "Job posts you've published on Craftroll." },
      { property: "og:title", content: "My job posts — Craftroll" },
      { property: "og:description", content: "Manage your job posts." },
    ],
  }),
  component: MyJobs,
});

type Job = { id: string; title: string; status: string; created_at: string; budget_type: string };

function MyJobs() {
  const [items, setItems] = useState<(Job & { proposal_count: number })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data: jobs } = await supabase.from("job_posts").select("id, title, status, created_at, budget_type").eq("client_id", u.user.id).order("created_at", { ascending: false });
      const ids = (jobs ?? []).map((j: Job) => j.id);
      const counts = new Map<string, number>();
      if (ids.length) {
        const { data: props } = await supabase.from("proposals").select("job_post_id").in("job_post_id", ids);
        (props ?? []).forEach((p: { job_post_id: string }) => counts.set(p.job_post_id, (counts.get(p.job_post_id) ?? 0) + 1));
      }
      setItems((jobs ?? []).map((j: Job) => ({ ...j, proposal_count: counts.get(j.id) ?? 0 })));
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-12">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My job posts</h1>
          <Button asChild><Link to="/jobs/new"><Plus className="mr-1.5 h-4 w-4" />New job</Link></Button>
        </div>
        {loading ? <p className="mt-8 text-sm text-muted-foreground">Loading…</p> :
          items.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-border p-12 text-center">
              <p className="text-muted-foreground">You haven't posted a job yet.</p>
            </div>
          ) : (
            <div className="mt-8 space-y-3">
              {items.map((j: Job) => (
                <Link key={j.id} to="/jobs/$id" params={{ id: j.id }}
                  className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 hover:border-accent">
                  <div>
                    <h3 className="font-semibold">{j.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{j.budget_type} · posted {new Date(j.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-medium">{j.proposal_count} proposal{j.proposal_count === 1 ? "" : "s"}</p>
                    <p className="text-xs text-muted-foreground">{j.status}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
      </main>
    </div>
  );
}
