import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Route = createFileRoute("/_authenticated/saved")({
  head: () => ({
    meta: [
      { title: "Saved freelancers — Craftroll" },
      { name: "description", content: "Freelancers you've saved for later." },
      { property: "og:title", content: "Saved freelancers — Craftroll" },
      { property: "og:description", content: "Your bookmarked freelancers." },
    ],
  }),
  component: SavedPage,
});

type F = { id: string; full_name: string | null; avatar_url: string | null; headline: string | null; hourly_rate: number | null };

function SavedPage() {
  const [items, setItems] = useState<F[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data: saves } = await supabase.from("saved_freelancers").select("freelancer_id").eq("client_id", u.user.id);
      const ids = (saves ?? []).map((s) => s.freelancer_id);
      if (!ids.length) { setItems([]); setLoading(false); return; }
      const { data } = await supabase.from("profiles").select("id, full_name, avatar_url, headline, hourly_rate").in("id", ids);
      setItems((data ?? []) as F[]);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-3xl font-bold">Saved freelancers</h1>
        {loading ? <p className="mt-8 text-sm text-muted-foreground">Loading…</p> :
          items.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-border p-12 text-center">
              <p className="text-muted-foreground">No saved freelancers yet.</p>
              <Link to="/browse" className="mt-2 inline-block font-medium underline">Browse the directory</Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {items.map((f) => (
                <Link key={f.id} to="/freelancer/$id" params={{ id: f.id }}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 hover:border-accent">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={f.avatar_url ?? undefined} />
                    <AvatarFallback>{(f.full_name ?? "?").slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold">{f.full_name ?? "Unnamed"}</h3>
                    <p className="truncate text-xs text-muted-foreground">{f.headline ?? "Freelancer"}</p>
                  </div>
                  <span className="text-sm font-medium">{f.hourly_rate ? `$${f.hourly_rate}/hr` : ""}</span>
                </Link>
              ))}
            </div>
          )}
      </main>
    </div>
  );
}
