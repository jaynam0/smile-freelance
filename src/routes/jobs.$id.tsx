import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/jobs/$id")({
  head: () => ({
    meta: [
      { title: "Job — Craftroll" },
      { name: "description", content: "Job details and proposal submission." },
      { property: "og:title", content: "Job — Craftroll" },
      { property: "og:description", content: "Submit a proposal on Craftroll." },
    ],
  }),
  component: JobDetail,
});

type Job = {
  id: string; title: string; description: string; category: string | null;
  skills: string[] | null; budget_type: "fixed" | "hourly";
  budget_min: number | null; budget_max: number | null; status: string;
  client_id: string; created_at: string;
};
type Proposal = {
  id: string; job_post_id: string; freelancer_id: string;
  cover_letter: string; bid_amount: number; estimated_days: number | null;
  status: string; created_at: string;
};

function JobDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [client, setClient] = useState<{ full_name: string | null } | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [myProposal, setMyProposal] = useState<Proposal | null>(null);
  const [allProposals, setAllProposals] = useState<Proposal[]>([]);
  const [freelancers, setFreelancers] = useState<Map<string, { full_name: string | null; avatar_url: string | null }>>(new Map());
  const [loading, setLoading] = useState(true);

  const [cover, setCover] = useState("");
  const [bid, setBid] = useState("");
  const [days, setDays] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      setUid(u.user?.id ?? null);

      const { data: j } = await supabase.from("job_posts").select("*").eq("id", id).maybeSingle();
      setJob(j as Job | null);
      if (!j) { setLoading(false); return; }

      const { data: c } = await supabase.from("profiles").select("full_name").eq("id", j.client_id).maybeSingle();
      setClient(c);

      if (u.user) {
        if (u.user.id === j.client_id) {
          const { data: props } = await supabase.from("proposals").select("*").eq("job_post_id", id).order("created_at");
          setAllProposals((props ?? []) as Proposal[]);
          const fids = (props ?? []).map((p: Proposal) => p.freelancer_id);
          if (fids.length) {
            const { data: fs } = await supabase.from("profiles").select("id, full_name, avatar_url").in("id", fids);
            setFreelancers(new Map(fs?.map((f: { id: string; full_name: string | null; avatar_url: string | null }) => [f.id, f])));
          }
        } else {
          const { data: mp } = await supabase.from("proposals").select("*").eq("job_post_id", id).eq("freelancer_id", u.user.id).maybeSingle();
          setMyProposal(mp as Proposal | null);
        }
      }
      setLoading(false);
    })();
  }, [id]);

  async function submitProposal(e: React.FormEvent) {
    e.preventDefault();
    if (!uid || !job) return;
    setSubmitting(true);
    const { data, error } = await supabase.from("proposals").insert({
      job_post_id: job.id, freelancer_id: uid,
      cover_letter: cover, bid_amount: Number(bid),
      estimated_days: days ? Number(days) : null,
    }).select().single();
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    setMyProposal(data as Proposal);
    toast.success("Proposal submitted");
    setCover(""); setBid(""); setDays("");
  }

  async function acceptProposal(p: Proposal) {
    if (!job) return;
    const { data: booking, error } = await supabase.from("bookings").insert({
      client_id: job.client_id, freelancer_id: p.freelancer_id,
      title: job.title, description: job.description,
      price: p.bid_amount, status: "accepted",
      contract_type: job.budget_type,
      hourly_rate: job.budget_type === "hourly" ? p.bid_amount : null,
      job_post_id: job.id,
    }).select().single();
    if (error) { toast.error(error.message); return; }
    await supabase.from("proposals").update({ status: "accepted" }).eq("id", p.id);
    await supabase.from("proposals").update({ status: "rejected" }).eq("job_post_id", job.id).neq("id", p.id);
    await supabase.from("job_posts").update({ status: "closed" }).eq("id", job.id);
    toast.success("Proposal accepted — booking created");
    navigate({ to: "/bookings/$id", params: { id: booking.id } });
  }

  if (loading) return <div className="min-h-screen bg-background"><Header /><p className="p-12 text-center text-muted-foreground">Loading…</p></div>;
  if (!job) return <div className="min-h-screen bg-background"><Header /><p className="p-12 text-center">Job not found.</p></div>;

  const isOwner = uid === job.client_id;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <Link to="/jobs" className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="mr-1 h-4 w-4" />All jobs</Link>

        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{job.title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">Posted by {client?.full_name ?? "Client"} · {new Date(job.created_at).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p className="font-medium">{job.budget_min && job.budget_max ? `$${job.budget_min}–${job.budget_max}` : job.budget_min ? `$${job.budget_min}+` : "Open"}</p>
              <p className="text-xs text-muted-foreground">{job.budget_type}</p>
            </div>
          </div>
          <p className="mt-4 whitespace-pre-wrap text-sm">{job.description}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {job.category && <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">{job.category}</span>}
            {(job.skills ?? []).map((s) => <span key={s} className="rounded-full bg-secondary px-2 py-0.5 text-xs">{s}</span>)}
          </div>
          {job.status !== "open" && <p className="mt-4 text-sm font-medium text-muted-foreground">Status: {job.status}</p>}
        </div>

        {isOwner ? (
          <section className="mt-6 rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">Proposals ({allProposals.length})</h2>
            {allProposals.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No proposals yet.</p> : (
              <div className="mt-4 space-y-3">
                {allProposals.map((p) => {
                  const f = freelancers.get(p.freelancer_id);
                  return (
                    <div key={p.id} className="rounded-xl border border-border p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <Link to="/freelancer/$id" params={{ id: p.freelancer_id }} className="font-medium hover:text-accent">{f?.full_name ?? "Freelancer"}</Link>
                          <p className="mt-1 text-sm">${p.bid_amount}{p.estimated_days ? ` · ${p.estimated_days} days` : ""} · <span className="text-muted-foreground">{p.status}</span></p>
                          <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{p.cover_letter}</p>
                        </div>
                        {p.status === "pending" && job.status === "open" && (
                          <Button size="sm" onClick={() => acceptProposal(p)}>Accept</Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        ) : uid && job.status === "open" ? (
          myProposal ? (
            <section className="mt-6 rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold">Your proposal</h2>
              <p className="mt-2 text-sm">${myProposal.bid_amount}{myProposal.estimated_days ? ` · ${myProposal.estimated_days} days` : ""} · <span className="text-muted-foreground">{myProposal.status}</span></p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{myProposal.cover_letter}</p>
            </section>
          ) : (
            <form onSubmit={submitProposal} className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold">Submit a proposal</h2>
              <div><Label htmlFor="cl">Cover letter</Label><Textarea id="cl" rows={6} required value={cover} onChange={(e) => setCover(e.target.value)} placeholder="Why you're the right fit…" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="bid">Bid ($)</Label><Input id="bid" type="number" min="1" required value={bid} onChange={(e) => setBid(e.target.value)} /></div>
                <div><Label htmlFor="days">Estimated days</Label><Input id="days" type="number" min="1" value={days} onChange={(e) => setDays(e.target.value)} /></div>
              </div>
              <Button type="submit" disabled={submitting}>{submitting ? "Sending…" : "Submit proposal"}</Button>
            </form>
          )
        ) : !uid ? (
          <p className="mt-6 rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            <Link to="/auth" className="font-medium text-foreground underline">Sign in</Link> to submit a proposal.
          </p>
        ) : null}
      </main>
    </div>
  );
}
