import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Your profile — Craftroll" },
      { name: "description", content: "Update your Craftroll profile, skills and rate." },
      { property: "og:title", content: "Your profile — Craftroll" },
      { property: "og:description", content: "Edit your Craftroll profile." },
    ],
  }),
  component: ProfilePage,
});

const CATEGORIES = ["Design", "Development", "Writing", "Marketing", "Video & Animation", "Data & AI", "Admin & Support", "Other"];

function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);
  const [form, setForm] = useState({
    full_name: "", headline: "", bio: "", hourly_rate: "", skills: "", avatar_url: "",
    category: "", years_experience: "", resume_url: "", portfolio_url: "",
  });

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const [{ data: p }, { data: r }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", u.user.id),
      ]);
      setRoles((r ?? []).map((x: { role: string }) => x.role));
      if (p) setForm({
        full_name: p.full_name ?? "",
        headline: p.headline ?? "",
        bio: p.bio ?? "",
        hourly_rate: p.hourly_rate?.toString() ?? "",
        skills: (p.skills ?? []).join(", "),
        avatar_url: p.avatar_url ?? "",
        category: p.category ?? "",
        years_experience: p.years_experience?.toString() ?? "",
        resume_url: p.resume_url ?? "",
        portfolio_url: p.portfolio_url ?? "",
      });
      setLoading(false);
    })();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase.from("profiles").update({
      full_name: form.full_name,
      headline: form.headline || null,
      bio: form.bio || null,
      hourly_rate: form.hourly_rate ? Number(form.hourly_rate) : null,
      skills: form.skills ? form.skills.split(",").map((s) => s.trim()).filter(Boolean) : [],
      avatar_url: form.avatar_url || null,
      category: form.category || null,
      years_experience: form.years_experience ? Number(form.years_experience) : null,
      resume_url: form.resume_url || null,
      portfolio_url: form.portfolio_url || null,
    }).eq("id", u.user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profile saved");
  }

  async function becomeFreelancer() {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase.from("user_roles").insert({ user_id: u.user.id, role: "freelancer" });
    if (error) toast.error(error.message);
    else { toast.success("You're now listed as a freelancer"); setRoles([...roles, "freelancer"]); }
  }

  const isFreelancer = roles.includes("freelancer");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-3xl font-bold">Your profile</h1>
        <p className="mt-1 text-muted-foreground">Shown on your public freelancer page.</p>

        {loading ? <p className="mt-8 text-sm text-muted-foreground">Loading…</p> : (
          <form onSubmit={save} className="mt-8 space-y-5 rounded-2xl border border-border bg-card p-6">
            <div><Label htmlFor="n">Full name</Label><Input id="n" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required /></div>
            <div><Label htmlFor="a">Avatar URL</Label><Input id="a" value={form.avatar_url} onChange={(e) => setForm({ ...form, avatar_url: e.target.value })} placeholder="https://…" /></div>
            <div><Label htmlFor="h">Headline</Label><Input id="h" value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} placeholder="e.g. Senior Product Designer" /></div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cat">Category</Label>
                <select id="cat" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option value="">Select…</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div><Label htmlFor="yrs">Years of experience</Label><Input id="yrs" type="number" min="0" value={form.years_experience} onChange={(e) => setForm({ ...form, years_experience: e.target.value })} /></div>
            </div>

            <div><Label htmlFor="b">Bio</Label><Textarea id="b" rows={5} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></div>

            <div className="grid grid-cols-2 gap-4">
              <div><Label htmlFor="r">Hourly rate ($)</Label><Input id="r" type="number" min="0" step="1" value={form.hourly_rate} onChange={(e) => setForm({ ...form, hourly_rate: e.target.value })} /></div>
              <div><Label htmlFor="s">Skills (comma-separated)</Label><Input id="s" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="Figma, UX, Prototyping" /></div>
            </div>

            <div><Label htmlFor="res">Resume URL</Label><Input id="res" value={form.resume_url} onChange={(e) => setForm({ ...form, resume_url: e.target.value })} placeholder="https://drive.google.com/…" />
              <p className="mt-1 text-xs text-muted-foreground">Paste a link to your resume (Drive, Dropbox, Notion, etc.)</p></div>
            <div><Label htmlFor="port">Portfolio URL</Label><Input id="port" value={form.portfolio_url} onChange={(e) => setForm({ ...form, portfolio_url: e.target.value })} placeholder="https://…" /></div>

            <div className="flex items-center justify-between border-t border-border pt-5">
              <div className="text-sm">
                <p className="font-medium">Roles</p>
                <p className="text-muted-foreground">{roles.length ? roles.join(", ") : "client"}</p>
              </div>
              {!isFreelancer && <Button type="button" variant="outline" size="sm" onClick={becomeFreelancer}>Become a freelancer</Button>}
            </div>

            <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save profile"}</Button>
          </form>
        )}
      </main>
    </div>
  );
}
