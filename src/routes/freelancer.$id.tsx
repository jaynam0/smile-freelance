import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Star, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const Route = createFileRoute("/freelancer/$id")({
  head: () => ({
    meta: [
      { title: "Freelancer profile — Craftroll" },
      { name: "description", content: "View this freelancer's profile, skills, and reviews." },
      { property: "og:title", content: "Freelancer profile — Craftroll" },
      { property: "og:description", content: "View this freelancer's profile and reviews." },
    ],
  }),
  component: FreelancerProfile,
});

type Profile = { id: string; full_name: string | null; avatar_url: string | null; headline: string | null; bio: string | null; hourly_rate: number | null; skills: string[] | null };
type Review = { id: string; rating: number; comment: string | null; created_at: string; reviewer_id: string; reviewer?: { full_name: string | null; avatar_url: string | null } };

function FreelancerProfile() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: p } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
      setProfile(p);
      const { data: rs } = await supabase.from("reviews").select("*").eq("reviewee_id", id).order("created_at", { ascending: false });
      if (rs?.length) {
        const reviewerIds = [...new Set(rs.map((r: Review) => r.reviewer_id))];
        const { data: revProfiles } = await supabase.from("profiles").select("id, full_name, avatar_url").in("id", reviewerIds);
        const map = new Map(revProfiles?.map((rp: { id: string; full_name: string | null; avatar_url: string | null }) => [rp.id, rp]));
        setReviews(rs.map((r: Review) => ({ ...r, reviewer: map.get(r.reviewer_id) })));
      } else setReviews([]);
      setLoading(false);
    })();
  }, [id]);

  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  if (loading) return <div className="min-h-screen bg-background"><Header /><p className="p-12 text-center text-muted-foreground">Loading…</p></div>;
  if (!profile) return <div className="min-h-screen bg-background"><Header /><p className="p-12 text-center">Freelancer not found.</p></div>;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-12">
        <Link to="/browse" className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="mr-1 h-4 w-4" />Back to browse</Link>

        <div className="rounded-2xl border border-border bg-card p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.avatar_url ?? undefined} />
                <AvatarFallback>{(profile.full_name ?? "?").slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold">{profile.full_name ?? "Unnamed"}</h1>
                <p className="mt-1 text-muted-foreground">{profile.headline ?? "Freelancer"}</p>
                {reviews.length > 0 && (
                  <div className="mt-2 flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    <span className="font-medium">{avg.toFixed(1)}</span>
                    <span className="text-muted-foreground">· {reviews.length} review{reviews.length === 1 ? "" : "s"}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{profile.hourly_rate ? `$${profile.hourly_rate}` : "—"}</div>
              <div className="text-xs text-muted-foreground">per hour</div>
              {user && user.id !== profile.id ? (
                <BookDialog freelancerId={profile.id} onBooked={(bid) => navigate({ to: "/bookings/$id", params: { id: bid } })} />
              ) : !user ? (
                <Button asChild className="mt-4"><Link to="/auth">Sign in to book</Link></Button>
              ) : null}
            </div>
          </div>

          {profile.bio && <p className="mt-6 whitespace-pre-wrap text-sm text-foreground/90">{profile.bio}</p>}

          {profile.skills && profile.skills.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {profile.skills.map((s) => <span key={s} className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">{s}</span>)}
            </div>
          )}
        </div>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">Reviews</h2>
          {reviews.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No reviews yet.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8"><AvatarImage src={r.reviewer?.avatar_url ?? undefined} /><AvatarFallback>{(r.reviewer?.full_name ?? "?").slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{r.reviewer?.full_name ?? "Anonymous"}</div>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((i) => <Star key={i} className={`h-3.5 w-3.5 ${i <= r.rating ? "fill-accent text-accent" : "text-muted-foreground/30"}`} />)}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</div>
                  </div>
                  {r.comment && <p className="mt-3 text-sm">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function BookDialog({ freelancerId, onBooked }: { freelancerId: string; onBooked: (id: string) => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase.from("bookings").insert({
      client_id: user.id,
      freelancer_id: freelancerId,
      title, description,
      scheduled_for: scheduledFor || null,
      price: price ? Number(price) : null,
    }).select().single();
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Booking request sent");
    setOpen(false);
    if (data) onBooked(data.id);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button className="mt-4">Book this freelancer</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New booking request</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div><Label htmlFor="t">Project title</Label><Input id="t" value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
          <div><Label htmlFor="d">Details</Label><Textarea id="d" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label htmlFor="s">Preferred date</Label><Input id="s" type="datetime-local" value={scheduledFor} onChange={(e) => setScheduledFor(e.target.value)} /></div>
            <div><Label htmlFor="p">Proposed budget ($)</Label><Input id="p" type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} /></div>
          </div>
          <Button type="submit" disabled={loading} className="w-full">{loading ? "Sending…" : "Send request"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
