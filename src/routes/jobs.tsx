import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, Briefcase, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/jobs")({
  head: () => ({
    meta: [
      { title: "Open jobs — Craftroll" },
      { name: "description", content: "Browse open freelance jobs. Filter by category and budget, then submit a proposal." },
      { property: "og:title", content: "Open jobs — Craftroll" },
      { property: "og:description", content: "Freelance jobs looking for talent." },
    ],
  }),
  component: JobsPage,
});

const CATEGORIES = ["Design", "Development", "Writing", "Marketing", "Video & Animation", "Data & AI", "Admin & Support", "Other"];

type Job = {
  id: string; title: string; description: string; category: string | null;
  skills: string[] | null; budget_type: "fixed" | "hourly";
  budget_min: number | null; budget_max: number | null; status: string;
  created_at: string; client_id: string;
};

function JobsPage() {
  const [items, setItems] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("job_posts").select("*").eq("status", "open").order("created_at", { ascending: false });
      setItems((data ?? []) as Job[]);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => items.filter((j) => {
    if (cat && j.category !== cat) return false;
    if (q) {
      const hay = `${j.title} ${j.description} ${(j.skills ?? []).join(" ")}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  }), [items, q, cat]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Open jobs</h1>
            <p className="mt-2 text-muted-foreground">Browse projects and submit a proposal.</p>
          </div>
          <Button asChild><Link to="/jobs/new"><Plus className="mr-1.5 h-4 w-4" />Post a job</Link></Button>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search jobs…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
          </div>
          <select value={cat} onChange={(e) => setCat(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
            <option value="">All categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {loading ? <p className="mt-12 text-center text-sm text-muted-foreground">Loading…</p> :
          filtered.length === 0 ? (
            <div className="mt-12 rounded-2xl border border-dashed border-border p-12 text-center">
              <Briefcase className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-3 text-muted-foreground">No open jobs yet.</p>
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              {filtered.map((j) => (
                <Link key={j.id} to="/jobs/$id" params={{ id: j.id }}
                  className="block rounded-2xl border border-border bg-card p-6 transition hover:border-accent hover:shadow-md">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold">{j.title}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{j.description}</p>
                    </div>
                    <div className="shrink-0 text-right text-sm">
                      <p className="font-medium">
                        {j.budget_min && j.budget_max ? `$${j.budget_min}–${j.budget_max}` : j.budget_min ? `$${j.budget_min}+` : "Open budget"}
                      </p>
                      <p className="text-xs text-muted-foreground">{j.budget_type === "hourly" ? "hourly" : "fixed"}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {j.category && <span className="rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground">{j.category}</span>}
                    {(j.skills ?? []).slice(0, 5).map((s) => <span key={s} className="rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground">{s}</span>)}
                    <span className="ml-auto">Posted {new Date(j.created_at).toLocaleDateString()}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
      </main>
    </div>
  );
}
