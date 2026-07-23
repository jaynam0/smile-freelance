import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";

export const Route = createFileRoute("/_authenticated/proposals")({
  head: () => ({
    meta: [
      { title: "My proposals — Craftroll" },
      { name: "description", content: "Track proposals you've submitted to jobs." },
      { property: "og:title", content: "My proposals — Craftroll" },
      { property: "og:description", content: "Your submitted proposals." },
    ],
  }),
  component: MyProposals,
});

type Row = {
  id: string; bid_amount: number; estimated_days: number | null; status: string;
  created_at: string; cover_letter: string;
  job_posts: { id: string; title: string; status: string } | null;
};

function MyProposals() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data } = await supabase.from("proposals")
        .select("id, bid_amount, estimated_days, status, created_at, cover_letter, job_posts:job_post_id(id, title, status)")
        .eq("freelancer_id", u.user.id).order("created_at", { ascending: false });
      setRows((data ?? []) as unknown as Row[]);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-3xl font-bold">My proposals</h1>
        {loading ? <p className="mt-8 text-sm text-muted-foreground">Loading…</p> :
          rows.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-border p-12 text-center">
              <p className="text-muted-foreground">You haven't submitted any proposals yet.</p>
              <Link to="/jobs" className="mt-2 inline-block font-medium underline">Browse open jobs</Link>
            </div>
          ) : (
            <div className="mt-8 space-y-3">
              {rows.map((r) => (
                <Link key={r.id} to="/jobs/$id" params={{ id: r.job_posts?.id ?? "" }}
                  className="block rounded-2xl border border-border bg-card p-5 hover:border-accent">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{r.job_posts?.title ?? "Job"}</h3>
                      <p className="mt-1 text-sm">${r.bid_amount}{r.estimated_days ? ` · ${r.estimated_days} days` : ""}</p>
                    </div>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">{r.status}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{r.cover_letter}</p>
                </Link>
              ))}
            </div>
          )}
      </main>
    </div>
  );
}
