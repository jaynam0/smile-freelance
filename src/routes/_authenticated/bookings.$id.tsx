import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send, Star, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Route = createFileRoute("/_authenticated/bookings/$id")({
  head: () => ({
    meta: [
      { title: "Booking — Craftroll" },
      { name: "description", content: "Booking details, live chat, and reviews." },
      { property: "og:title", content: "Booking — Craftroll" },
      { property: "og:description", content: "Manage this booking." },
    ],
  }),
  component: BookingPage,
});

type Booking = {
  id: string; title: string; description: string | null; status: string;
  client_id: string; freelancer_id: string; scheduled_for: string | null; price: number | null; created_at: string;
};
type Message = { id: string; booking_id: string; sender_id: string; body: string; created_at: string };
type Review = { id: string; reviewer_id: string; reviewee_id: string; rating: number; comment: string | null };

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-900",
  accepted: "bg-blue-100 text-blue-900",
  declined: "bg-red-100 text-red-900",
  completed: "bg-emerald-100 text-emerald-900",
  cancelled: "bg-gray-100 text-gray-700",
};

function BookingPage() {
  const { id } = Route.useParams();
  const [uid, setUid] = useState<string | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [profiles, setProfiles] = useState<Map<string, { full_name: string | null; avatar_url: string | null }>>(new Map());
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initial load
  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      setUid(u.user?.id ?? null);
      const { data: b } = await supabase.from("bookings").select("*").eq("id", id).maybeSingle();
      setBooking(b);
      if (b) {
        const [{ data: msgs }, { data: rvs }, { data: ps }] = await Promise.all([
          supabase.from("messages").select("*").eq("booking_id", id).order("created_at"),
          supabase.from("reviews").select("*").eq("booking_id", id),
          supabase.from("profiles").select("id, full_name, avatar_url").in("id", [b.client_id, b.freelancer_id]),
        ]);
        setMessages(msgs ?? []);
        setReviews(rvs ?? []);
        setProfiles(new Map(ps?.map((p) => [p.id, p])));
      }
      setLoading(false);
    })();
  }, [id]);

  // Realtime messages
  useEffect(() => {
    const ch = supabase.channel(`msg-${id}`).on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages", filter: `booking_id=eq.${id}` },
      (payload) => {
        setMessages((prev) => prev.some((m) => m.id === (payload.new as Message).id) ? prev : [...prev, payload.new as Message]);
      },
    ).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [id]);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }); }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !uid) return;
    const body = input.trim();
    setInput("");
    const { error } = await supabase.from("messages").insert({ booking_id: id, sender_id: uid, body });
    if (error) { toast.error(error.message); setInput(body); }
  }

  async function setStatus(status: string) {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else { setBooking(booking ? { ...booking, status } : null); toast.success(`Booking ${status}`); }
  }

  if (loading) return <div className="min-h-screen bg-background"><Header /><p className="p-12 text-center text-muted-foreground">Loading…</p></div>;
  if (!booking) return <div className="min-h-screen bg-background"><Header /><p className="p-12 text-center">Booking not found.</p></div>;

  const isClient = uid === booking.client_id;
  const isFreelancer = uid === booking.freelancer_id;
  const otherId = isClient ? booking.freelancer_id : booking.client_id;
  const other = profiles.get(otherId);
  const myReview = reviews.find((r) => r.reviewer_id === uid);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_320px]">
        <div>
          <Link to="/dashboard" className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="mr-1 h-4 w-4" />Back</Link>

          {/* Booking header */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{booking.title}</h1>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[booking.status] ?? "bg-gray-100"}`}>{booking.status}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {isClient ? "with " : "from "}<Link to="/freelancer/$id" params={{ id: otherId }} className="font-medium text-foreground underline">{other?.full_name ?? "Unknown"}</Link>
                  {booking.scheduled_for && ` · ${new Date(booking.scheduled_for).toLocaleString()}`}
                  {booking.price && ` · $${booking.price}`}
                </p>
              </div>
            </div>
            {booking.description && <p className="mt-4 whitespace-pre-wrap text-sm">{booking.description}</p>}

            {/* Actions */}
            <div className="mt-4 flex flex-wrap gap-2">
              {isFreelancer && booking.status === "pending" && (<>
                <Button size="sm" onClick={() => setStatus("accepted")}>Accept</Button>
                <Button size="sm" variant="outline" onClick={() => setStatus("declined")}>Decline</Button>
              </>)}
              {booking.status === "accepted" && (
                <Button size="sm" onClick={() => setStatus("completed")}><CheckCircle2 className="mr-1.5 h-4 w-4" />Mark completed</Button>
              )}
              {(booking.status === "pending" || booking.status === "accepted") && (
                <Button size="sm" variant="outline" onClick={() => setStatus("cancelled")}>Cancel</Button>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="mt-6 flex h-[500px] flex-col rounded-2xl border border-border bg-card">
            <div className="border-b border-border p-4 font-semibold">Conversation</div>
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.length === 0 ? <p className="text-center text-sm text-muted-foreground">Say hello 👋</p> :
                messages.map((m) => {
                  const mine = m.sender_id === uid;
                  const sender = profiles.get(m.sender_id);
                  return (
                    <div key={m.id} className={`flex gap-2 ${mine ? "flex-row-reverse" : ""}`}>
                      <Avatar className="h-7 w-7"><AvatarImage src={sender?.avatar_url ?? undefined} /><AvatarFallback className="text-xs">{(sender?.full_name ?? "?").slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                      <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${mine ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                        <p className="whitespace-pre-wrap">{m.body}</p>
                        <p className={`mt-0.5 text-[10px] ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                      </div>
                    </div>
                  );
                })}
            </div>
            <form onSubmit={send} className="flex gap-2 border-t border-border p-3">
              <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message…" />
              <Button type="submit" size="icon"><Send className="h-4 w-4" /></Button>
            </form>
          </div>
        </div>

        {/* Sidebar: review */}
        <aside className="space-y-4">
          {booking.status === "completed" && !myReview && (
            <ReviewForm bookingId={booking.id} revieweeId={otherId} otherName={other?.full_name ?? "them"}
              onSubmitted={(r) => setReviews([...reviews, r])} />
          )}
          <ReviewsSummary reviews={reviews} profiles={profiles} />
        </aside>
      </main>
    </div>
  );
}

function ReviewForm({ bookingId, revieweeId, otherName, onSubmitted }: {
  bookingId: string; revieweeId: string; otherName: string; onSubmitted: (r: Review) => void;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { data, error } = await supabase.from("reviews").insert({
      booking_id: bookingId, reviewer_id: u.user.id, reviewee_id: revieweeId, rating, comment: comment || null,
    }).select().single();
    setBusy(false);
    if (error) toast.error(error.message);
    else if (data) { toast.success("Review submitted"); onSubmitted(data); }
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-5">
      <h3 className="font-semibold">Rate {otherName}</h3>
      <p className="mt-1 text-xs text-muted-foreground">Booking is complete — share your experience.</p>
      <div className="mt-3 flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button key={i} type="button" onClick={() => setRating(i)}>
            <Star className={`h-6 w-6 ${i <= rating ? "fill-accent text-accent" : "text-muted-foreground/30"}`} />
          </button>
        ))}
      </div>
      <Textarea rows={3} className="mt-3" placeholder="Optional comment…" value={comment} onChange={(e) => setComment(e.target.value)} />
      <Button type="submit" className="mt-3 w-full" disabled={busy}>{busy ? "Sending…" : "Submit review"}</Button>
    </form>
  );
}

function ReviewsSummary({ reviews, profiles }: { reviews: Review[]; profiles: Map<string, { full_name: string | null; avatar_url: string | null }> }) {
  if (reviews.length === 0) return null;
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="font-semibold">Reviews for this booking</h3>
      <div className="mt-3 space-y-3">
        {reviews.map((r) => {
          const rev = profiles.get(r.reviewer_id);
          return (
            <div key={r.id} className="rounded-lg border border-border p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">{rev?.full_name ?? "Someone"}</div>
                <div className="flex">{[1, 2, 3, 4, 5].map((i) => <Star key={i} className={`h-3.5 w-3.5 ${i <= r.rating ? "fill-accent text-accent" : "text-muted-foreground/30"}`} />)}</div>
              </div>
              {r.comment && <p className="mt-1 text-xs text-muted-foreground">{r.comment}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
