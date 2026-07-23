import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, Star, Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Route = createFileRoute("/browse")({
  head: () => ({
    meta: [
      { title: "Browse freelancers — Craftroll" },
      { name: "description", content: "Search Craftroll's directory of freelancers by skill, category, rate, and rating." },
      { property: "og:title", content: "Browse freelancers — Craftroll" },
      { property: "og:description", content: "Find the right freelancer for your project." },
    ],
  }),
  component: Browse,
});

const CATEGORIES = ["Design", "Development", "Writing", "Marketing", "Video & Animation", "Data & AI", "Admin & Support", "Other"];

type Freelancer = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  headline: string | null;
  hourly_rate: number | null;
  skills: string[] | null;
  category: string | null;
  years_experience: number | null;
  avg_rating?: number;
  review_count?: number;
};

function Browse() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [maxRate, setMaxRate] = useState("");
  const [minRating, setMinRating] = useState("");
  const [items, setItems] = useState<Freelancer[]>([]);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [uid, setUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: u } = await supabase.auth.getUser();
      setUid(u.user?.id ?? null);

      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "freelancer");
      const ids = (roles ?? []).map((r) => r.user_id);
      if (!ids.length) { setItems([]); setLoading(false); return; }

      const [{ data: profiles }, { data: reviews }, savedRes] = await Promise.all([
        supabase.from("profiles").select("*").in("id", ids),
        supabase.from("reviews").select("reviewee_id, rating").in("reviewee_id", ids),
        u.user ? supabase.from("saved_freelancers").select("freelancer_id").eq("client_id", u.user.id) : Promise.resolve({ data: [] as { freelancer_id: string }[] }),
      ]);

      const stats = new Map<string, { sum: number; n: number }>();
      (reviews ?? []).forEach((r) => {
        const s = stats.get(r.reviewee_id) ?? { sum: 0, n: 0 };
        s.sum += r.rating; s.n += 1; stats.set(r.reviewee_id, s);
      });

      setItems((profiles ?? []).map((p) => {
        const s = stats.get(p.id);
        return { ...p, avg_rating: s ? s.sum / s.n : undefined, review_count: s?.n ?? 0 };
      }));
      setSaved(new Set((savedRes.data ?? []).map((r) => r.freelancer_id)));
      setLoading(false);
    })();
  }, []);

  async function toggleSave(fid: string) {
    if (!uid) { toast.error("Sign in to save freelancers"); return; }
    if (saved.has(fid)) {
      await supabase.from("saved_freelancers").delete().eq("client_id", uid).eq("freelancer_id", fid);
      const s = new Set(saved); s.delete(fid); setSaved(s);
    } else {
      const { error } = await supabase.from("saved_freelancers").insert({ client_id: uid, freelancer_id: fid });
      if (error) toast.error(error.message);
      else setSaved(new Set([...saved, fid]));
    }
  }

  const filtered = useMemo(() => items.filter((f) => {
    if (q) {
      const hay = `${f.full_name ?? ""} ${f.headline ?? ""} ${(f.skills ?? []).join(" ")}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    if (category && f.category !== category) return false;
    if (maxRate && (f.hourly_rate ?? 0) > Number(maxRate)) return false;
    if (minRating && (f.avg_rating ?? 0) < Number(minRating)) return false;
    return true;
  }), [items, q, category, maxRate, minRating]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-3xl font-bold">Find your freelancer</h1>
        <p className="mt-2 text-muted-foreground">Browse the directory and send a booking request.</p>

        <div className="mt-6 grid gap-3 md:grid-cols-[1fr_180px_140px_140px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search name, skill, or headline…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm">
            <option value="">All categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <Input type="number" placeholder="Max $/hr" value={maxRate} onChange={(e) => setMaxRate(e.target.value)} />
          <select value={minRating} onChange={(e) => setMinRating(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm">
            <option value="">Any rating</option>
            <option value="4">4★ &amp; up</option>
            <option value="4.5">4.5★ &amp; up</option>
          </select>
        </div>

        {loading ? (
          <p className="mt-12 text-center text-sm text-muted-foreground">Loading…</p>
        ) : filtered.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-border p-12 text-center">
            <p className="text-muted-foreground">No freelancers match your filters.</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((f) => (
              <div key={f.id} className="group relative rounded-2xl border border-border bg-card p-6 transition hover:border-accent hover:shadow-md">
                {uid && (
                  <button onClick={() => toggleSave(f.id)} className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-accent" aria-label="Save">
                    {saved.has(f.id) ? <BookmarkCheck className="h-4 w-4 fill-accent text-accent" /> : <Bookmark className="h-4 w-4" />}
                  </button>
                )}
                <Link to="/freelancer/$id" params={{ id: f.id }} className="block">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={f.avatar_url ?? undefined} />
                      <AvatarFallback>{(f.full_name ?? "?").slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 pr-6">
                      <h3 className="truncate font-semibold group-hover:text-accent">{f.full_name ?? "Unnamed"}</h3>
                      <p className="truncate text-xs text-muted-foreground">{f.headline ?? "Freelancer"}</p>
                    </div>
                  </div>
                  {(f.category || f.years_experience) && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      {f.category}{f.category && f.years_experience ? " · " : ""}{f.years_experience ? `${f.years_experience}+ yrs` : ""}
                    </p>
                  )}
                  <div className="mt-3 flex items-center justify-between text-sm">
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
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
