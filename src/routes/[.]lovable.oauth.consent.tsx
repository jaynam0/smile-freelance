import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

type OAuthNs = {
  getAuthorizationDetails: (id: string) => Promise<{ data: AuthzDetails | null; error: { message: string } | null }>;
  approveAuthorization: (id: string) => Promise<{ data: AuthzResult | null; error: { message: string } | null }>;
  denyAuthorization: (id: string) => Promise<{ data: AuthzResult | null; error: { message: string } | null }>;
};
type AuthzDetails = {
  client?: { name?: string; logo_uri?: string } | null;
  redirect_url?: string;
  redirect_to?: string;
};
type AuthzResult = { redirect_url?: string; redirect_to?: string };

function oauthNs(): OAuthNs {
  return (supabase.auth as unknown as { oauth: OAuthNs }).oauth;
}

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      const next = location.pathname + location.searchStr;
      throw redirect({ to: "/auth", search: { next } as never });
    }
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await oauthNs().getAuthorizationDetails(authorizationId);
    if (error) throw error;
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="mx-auto max-w-md p-8">
      <h1 className="text-xl font-semibold">Couldn't load this request</h1>
      <p className="mt-2 text-sm text-muted-foreground">{String((error as Error)?.message ?? error)}</p>
    </main>
  ),
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const { data, error } = approve
      ? await oauthNs().approveAuthorization(authorization_id)
      : await oauthNs().denyAuthorization(authorization_id);
    if (error) { setBusy(false); setError(error.message); return; }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) { setBusy(false); setError("No redirect returned by the authorization server."); return; }
    window.location.href = target;
  }

  const name = details?.client?.name ?? "an app";

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
        <h1 className="font-display text-2xl font-semibold">Connect {name} to Craftroll</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This will let {name} act on your Craftroll account — browsing jobs and freelancers,
          posting jobs, submitting proposals, and reading or sending booking messages as you.
        </p>
        {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
        <div className="mt-6 flex gap-2">
          <Button className="flex-1" disabled={busy} onClick={() => decide(true)}>
            {busy ? "…" : "Approve"}
          </Button>
          <Button variant="outline" className="flex-1" disabled={busy} onClick={() => decide(false)}>
            Deny
          </Button>
        </div>
      </div>
    </main>
  );
}
