import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Briefcase, Sparkles, User as UserIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const DEMO_CREDENTIALS = [
  {
    role: "client" as const,
    label: "Demo Client",
    email: "client@test.com",
    password: "TestPassword!2026",
    badge: "Client",
    hint: "Hire & post jobs",
  },
  {
    role: "freelancer" as const,
    label: "Demo Freelancer",
    email: "freelancer@test.com",
    password: "TestPassword!2026",
    badge: "Freelancer",
    hint: "Offer services",
  },
];

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

  function handleFillCredentials(demoEmail: string, demoPassword: string, demoRole: "client" | "freelancer") {
    setEmail(demoEmail);
    setPassword(demoPassword);
    if (mode === "signup") {
      setRole(demoRole);
      setName(demoRole === "client" ? "Default Client" : "Default Freelancer");
    }
    toast.info(`Filled credentials for ${demoEmail}`);
  }

  async function handleQuickSignIn(demoEmail: string, demoPassword: string) {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: demoEmail, password: demoPassword });
      if (error) throw error;
      toast.success("Signed in successfully");
      navigate({ to: next, replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Auth failed");
    } finally {
      setLoading(false);
    }
  }

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

          {/* Default Demo Credentials */}
          <div className="mt-6 rounded-xl border border-dashed border-border bg-muted/40 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Default Test Credentials
              </div>
              <span className="text-[10px] text-muted-foreground">Demo Accounts</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DEMO_CREDENTIALS.map((demo) => {
                const Icon = demo.role === "client" ? UserIcon : Briefcase;
                return (
                  <div
                    key={demo.role}
                    className="flex flex-col justify-between rounded-lg border border-border bg-card/90 p-3 shadow-xs hover:border-primary/40 transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="flex items-center gap-1 text-xs font-semibold text-foreground">
                          <Icon className="h-3.5 w-3.5 text-primary" />
                          {demo.label}
                        </span>
                        <span className="text-[10px] rounded bg-primary/10 px-1.5 py-0.5 font-medium text-primary">
                          {demo.badge}
                        </span>
                      </div>
                      <p className="mt-1 font-mono text-[11px] text-muted-foreground truncate" title={demo.email}>
                        {demo.email}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 flex-1 px-2 text-xs"
                        onClick={() => handleFillCredentials(demo.email, demo.password, demo.role)}
                        disabled={loading}
                      >
                        Autofill
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        className="h-7 flex-1 px-2 text-xs"
                        onClick={() => handleQuickSignIn(demo.email, demo.password)}
                        disabled={loading}
                      >
                        Sign In
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-2.5 text-center text-[11px] text-muted-foreground">
              Default password: <code className="rounded bg-background px-1.5 py-0.5 font-mono text-[11px] text-foreground border border-border">TestPassword!2026</code>
            </p>
          </div>

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

