import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Route = createFileRoute("/_authenticated/messages")({
  head: () => ({
    meta: [
      { title: "Messages — Craftroll" },
      { name: "description", content: "All your Craftroll booking conversations." },
      { property: "og:title", content: "Messages — Craftroll" },
      { property: "og:description", content: "Your Craftroll inbox." },
    ],
  }),
  component: Inbox,
});

type Row = { id: string; title: string; client_id: string; freelancer_id: string; last?: string | null };

function Inbox() {
  const [rows, setRows] = useState<Row[]>([]);
  const [profiles, setProfiles] = useState<Map<string, { full_name: string | null; avatar_url: string | null }>>(new Map());
  const [uid, setUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      setUid(u.user.id);
      const { data: bs } = await supabase.from("bookings").select("id, title, client_id, freelancer_id")
        .or(`client_id.eq.${u.user.id},freelancer_id.eq.${u.user.id}`)
        .in("status", ["pending", "accepted", "completed"])
        .order("updated_at", { ascending: false });
      const bookings = bs ?? [];
      // fetch last message per booking
      const withLast: Row[] = [];
      for (const b of bookings) {
        const { data: m } = await supabase.from("messages").select("body").eq("booking_id", b.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
        withLast.push({ ...b, last: m?.body ?? null });
      }
      setRows(withLast);
      const ids = [...new Set(bookings.flatMap((b: Row) => [b.client_id, b.freelancer_id]))];
      if (ids.length) {
        const { data: ps } = await supabase.from("profiles").select("id, full_name, avatar_url").in("id", ids);
        setProfiles(new Map(ps?.map((p: { id: string; full_name: string | null; avatar_url: string | null }) => [p.id, p])));
      }
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold">Messages</h1>
        {loading ? <p className="mt-8 text-sm text-muted-foreground">Loading…</p> : rows.length === 0 ? (
          <p className="mt-8 text-sm text-muted-foreground">No conversations yet. Book a freelancer to start chatting.</p>
        ) : (
          <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-card">
            {rows.map((r) => {
              const other = profiles.get(r.client_id === uid ? r.freelancer_id : r.client_id);
              return (
                <Link key={r.id} to="/bookings/$id" params={{ id: r.id }} className="flex items-center gap-3 p-4 hover:bg-secondary/50">
                  <Avatar className="h-10 w-10"><AvatarImage src={other?.avatar_url ?? undefined} /><AvatarFallback>{(other?.full_name ?? "?").slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between"><span className="truncate font-medium">{other?.full_name ?? "Unknown"}</span><span className="text-xs text-muted-foreground">{r.title}</span></div>
                    <p className="truncate text-sm text-muted-foreground">{r.last ?? "No messages yet"}</p>
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
