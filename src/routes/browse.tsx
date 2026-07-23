import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Route = createFileRoute("/browse")({
  head: () => ({
    meta: [
      { title: "Browse freelancers — Craftroll" },
      { name: "description", content: "Search Craftroll's directory of freelancers by skill, rate, and rating." },
      { property: "og:title", content: "Browse freelancers — Craftroll" },
      { property: "og:description", content: "Find the right freelancer for your project." },
    ],
  }),
  component: Browse,
});

type Freelancer = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  headline: string | null;
  hourly_rate: number | null;
  skills: string[] | null;
  avg_rating?: number;
  review_count?: number;
};

function Browse() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      // Get freelancer user_ids
      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "freelancer");
      const ids = (roles ?? []).map((r) => r.user_id);
      if (!ids.length) { setItems([]); setLoading(false); return; }
      const { data: profiles } = await supabase.from("profiles").select("*").in("id", ids);
      const { data: reviews } = await supabase.from("reviews").select("reviewee_id, rating").in("reviewee_id", ids);
      const stats = new Map<string, { sum: number; n: number }>();
      (reviews ?? []).forEach((r) => {
        const s = stats.get(r.reviewee_id) ?? { sum: 0, n: 0 };
        s.sum += r.rating; s.n += 1; stats.set(r.reviewee_id, s);
      });
      const enriched: Freelancer[] = (profiles ?? []).map((p) => {
        const s = stats.get(p.id);
        return { ...p, avg_rating: s ? s.sum / s.n : undefined, review_count: s?.n ?? 0 };
      });
      setItems(enriched);
      setLoading(false);
    })();
  }, []);

  const filtered = items.filter((f) => {
    if (!q) return true;
    const hay = `${f.full_name ?? ""} ${f.headline ?? ""} ${(f.skills ?? []).join(" ")}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-3xl font-bold">Find your freelancer</h1>
        <p className="mt-2 text-muted-foreground">Browse the directory and send a booking request.</p>

        <div className="relative mt-6 max-w-lg">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name, skill, or headline…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>

        {loading ? (
          <p className="mt-12 text-center text-sm text-muted-foreground">Loading…</p>
        ) : filtered.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-border p-12 text-center">
            <p className="text-muted-foreground">No freelancers yet. Be the first —</p>
            <Link to="/auth" search={{ mode: "signup" }} className="mt-2 inline-block font-medium underline">create a freelancer account</Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((f) => (
              <Link key={f.id} to="/freelancer/$id" params={{ id: f.id }} className="group rounded-2xl border border-border bg-card p-6 transition hover:border-accent hover:shadow-md">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={f.avatar_url ?? undefined} />
                    <AvatarFallback>{(f.full_name ?? "?").slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold group-hover:text-accent">{f.full_name ?? "Unnamed"}</h3>
                    <p className="truncate text-xs text-muted-foreground">{f.headline ?? "Freelancer"}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="font-medium">{f.hourly_rate ? `$${f.hourly_rate}/hr` : "Rate on request"}</span>
                  {f.review_count ? (
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                      {f.avg_rating?.toFixed(1)} <span className="text-xs">({f.review_count})</span>
                    </span>
                  ) : <span className="text-xs text-muted-foreground">No reviews yet</span>}
                </div>
                {f.skills && f.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {f.skills.slice(0, 4).map((s) => (
                      <span key={s} className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">{s}</span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
