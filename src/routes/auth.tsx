import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup"]).optional(),
  next: z.string().optional(),
});

function safeNext(next: string | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/dashboard";
  return next;
}

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in — Craftroll" },
      { name: "description", content: "Sign in or create your Craftroll account to hire or offer freelance work." },
      { property: "og:title", content: "Sign in — Craftroll" },
      { property: "og:description", content: "Access your Craftroll dashboard." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const search = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">(search.mode ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"client" | "freelancer">("client");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const next = safeNext(search.next);

  useEffect(() => { if (user) navigate({ to: next, replace: true }); }, [user, navigate, next]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}${next}`, data: { full_name: name } },
        });
        if (error) throw error;
        if (data.user) {
          await supabase.from("user_roles").insert({ user_id: data.user.id, role });
        }
        toast.success("Account created! Welcome.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in");
        navigate({ to: next, replace: true });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Auth failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}${next}`,
    });
    if (result.error) {
      toast.error("Google sign-in failed");
      setLoading(false);
      return;
    }
    if (result.redirected) return;
    // If no role yet, default to client
    const { data: userData } = await supabase.auth.getUser();
    if (userData.user) {
      const { data: roles } = await supabase.from("user_roles").select("id").eq("user_id", userData.user.id).limit(1);
      if (!roles?.length) {
        await supabase.from("user_roles").insert({ user_id: userData.user.id, role: "client" });
      }
    }
    navigate({ to: next, replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 block text-center font-display text-2xl font-semibold">Craftroll</Link>
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <h1 className="text-2xl font-semibold">{mode === "signup" ? "Create your account" : "Welcome back"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signup" ? "Start booking or offering freelance work." : "Sign in to your Craftroll account."}
          </p>

          <Button variant="outline" className="mt-6 w-full" onClick={handleGoogle} disabled={loading}>
            Continue with Google
          </Button>
          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> OR <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <>
                <div>
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                  <Label>I am a…</Label>
                  <RadioGroup value={role} onValueChange={(v) => setRole(v as "client" | "freelancer")} className="mt-2 grid grid-cols-2 gap-2">
                    <label className={`cursor-pointer rounded-lg border p-3 text-sm ${role === "client" ? "border-accent bg-accent/10" : "border-border"}`}>
                      <RadioGroupItem value="client" className="sr-only" />
                      <div className="font-medium">Client</div>
                      <div className="text-xs text-muted-foreground">Hiring talent</div>
                    </label>
                    <label className={`cursor-pointer rounded-lg border p-3 text-sm ${role === "freelancer" ? "border-accent bg-accent/10" : "border-border"}`}>
                      <RadioGroupItem value="freelancer" className="sr-only" />
                      <div className="font-medium">Freelancer</div>
                      <div className="text-xs text-muted-foreground">Offering services</div>
                    </label>
                  </RadioGroup>
                </div>
              </>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "…" : mode === "signup" ? "Create account" : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signup" ? "Already have an account?" : "New to Craftroll?"}{" "}
            <button className="font-medium text-foreground underline" onClick={() => setMode(mode === "signup" ? "signin" : "signup")}>
              {mode === "signup" ? "Sign in" : "Create one"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
