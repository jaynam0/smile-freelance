import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Craftroll" },
      { name: "description", content: "Your Craftroll bookings and activity." },
      { property: "og:title", content: "Dashboard — Craftroll" },
      { property: "og:description", content: "Manage your freelance bookings." },
    ],
  }),
  component: Dashboard,
});

type Booking = {
  id: string; title: string; status: string; created_at: string; scheduled_for: string | null;
  client_id: string; freelancer_id: string; price: number | null;
};
type PMap = Map<string, { full_name: string | null; avatar_url: string | null }>;

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-900",
  accepted: "bg-blue-100 text-blue-900",
  declined: "bg-red-100 text-red-900",
  completed: "bg-emerald-100 text-emerald-900",
  cancelled: "bg-gray-100 text-gray-700",
};

function Dashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [profiles, setProfiles] = useState<PMap>(new Map());
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id ?? null;
      setUserId(uid);
      if (!uid) return;
      const { data } = await supabase.from("bookings").select("*")
        .or(`client_id.eq.${uid},freelancer_id.eq.${uid}`)
        .order("created_at", { ascending: false });
      setBookings(data ?? []);
      const ids = [...new Set((data ?? []).flatMap((b) => [b.client_id, b.freelancer_id]))];
      if (ids.length) {
        const { data: ps } = await supabase.from("profiles").select("id, full_name, avatar_url").in("id", ids);
        setProfiles(new Map(ps?.map((p) => [p.id, p])));
      }
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-12">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold">Your bookings</h1>
            <p className="mt-1 text-muted-foreground">Everything you're involved in.</p>
          </div>
        </div>

        {loading ? <p className="mt-12 text-sm text-muted-foreground">Loading…</p> : bookings.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-border p-12 text-center">
            <p className="text-muted-foreground">No bookings yet.</p>
            <Link to="/browse" className="mt-2 inline-block font-medium underline">Browse freelancers</Link>
          </div>
        ) : (
          <div className="mt-8 space-y-3">
            {bookings.map((b) => {
              const isClient = b.client_id === userId;
              const other = profiles.get(isClient ? b.freelancer_id : b.client_id);
              return (
                <Link key={b.id} to="/bookings/$id" params={{ id: b.id }} className="block rounded-xl border border-border bg-card p-5 transition hover:border-accent hover:shadow-sm">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10"><AvatarImage src={other?.avatar_url ?? undefined} /><AvatarFallback>{(other?.full_name ?? "?").slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate font-semibold">{b.title}</h3>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[b.status] ?? "bg-gray-100"}`}>{b.status}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {isClient ? "with " : "from "}{other?.full_name ?? "Unknown"} · {new Date(b.created_at).toLocaleDateString()}
                        {b.price ? ` · $${b.price}` : ""}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
