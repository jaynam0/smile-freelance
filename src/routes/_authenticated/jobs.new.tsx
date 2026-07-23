import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/jobs/new")({
  head: () => ({
    meta: [
      { title: "Post a job — Craftroll" },
      { name: "description", content: "Post a freelance job and receive proposals from vetted freelancers." },
      { property: "og:title", content: "Post a job — Craftroll" },
      { property: "og:description", content: "Post a freelance job on Craftroll." },
    ],
  }),
  component: NewJob,
});

const CATEGORIES = ["Design", "Development", "Writing", "Marketing", "Video & Animation", "Data & AI", "Admin & Support", "Other"];

function NewJob() {
  const navigate = useNavigate();
  const [f, setF] = useState({
    title: "", description: "", category: "", skills: "",
    budget_type: "fixed" as "fixed" | "hourly", budget_min: "", budget_max: "",
  });
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { data, error } = await supabase.from("job_posts").insert({
      client_id: u.user.id,
      title: f.title, description: f.description,
      category: f.category || null,
      skills: f.skills ? f.skills.split(",").map((s) => s.trim()).filter(Boolean) : [],
      budget_type: f.budget_type,
      budget_min: f.budget_min ? Number(f.budget_min) : null,
      budget_max: f.budget_max ? Number(f.budget_max) : null,
    }).select().single();
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Job posted");
    navigate({ to: "/jobs/$id", params: { id: data.id } });
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-3xl font-bold">Post a job</h1>
        <p className="mt-1 text-muted-foreground">Describe your project. Freelancers will submit proposals.</p>

        <form onSubmit={submit} className="mt-8 space-y-5 rounded-2xl border border-border bg-card p-6">
          <div><Label htmlFor="t">Title</Label><Input id="t" required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="e.g. Landing page redesign" /></div>
          <div><Label htmlFor="d">Description</Label><Textarea id="d" required rows={6} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="c">Category</Label>
              <select id="c" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}
                className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="">Select…</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div><Label htmlFor="s">Skills (comma-separated)</Label><Input id="s" value={f.skills} onChange={(e) => setF({ ...f, skills: e.target.value })} placeholder="React, Figma" /></div>
          </div>

          <div>
            <Label>Budget type</Label>
            <div className="mt-1 flex gap-2">
              {(["fixed", "hourly"] as const).map((t) => (
                <button type="button" key={t} onClick={() => setF({ ...f, budget_type: t })}
                  className={`flex-1 rounded-md border px-4 py-2 text-sm ${f.budget_type === t ? "border-accent bg-accent/10 font-medium" : "border-border"}`}>
                  {t === "fixed" ? "Fixed price" : "Hourly"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="bmin">Budget min ($)</Label><Input id="bmin" type="number" min="0" value={f.budget_min} onChange={(e) => setF({ ...f, budget_min: e.target.value })} /></div>
            <div><Label htmlFor="bmax">Budget max ($)</Label><Input id="bmax" type="number" min="0" value={f.budget_max} onChange={(e) => setF({ ...f, budget_max: e.target.value })} /></div>
          </div>

          <Button type="submit" disabled={busy}>{busy ? "Posting…" : "Post job"}</Button>
        </form>
      </main>
    </div>
  );
}
