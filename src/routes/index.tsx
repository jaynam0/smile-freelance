import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MessageSquare, Star, CalendarCheck, ShieldCheck } from "lucide-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Craftroll — Hire & manage freelance talent" },
      { name: "description", content: "Browse skilled freelancers, book projects, chat in real time, and leave reviews once the work is done." },
      { property: "og:title", content: "Craftroll — Freelance booking portal" },
      { property: "og:description", content: "Everything you need to hire, manage and pay freelancers." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,oklch(0.75_0.15_55/0.15),transparent_50%),radial-gradient(circle_at_80%_60%,oklch(0.28_0.05_235/0.10),transparent_50%)]" />
          <div className="mx-auto max-w-6xl px-4 py-24 md:py-32">
            <div className="max-w-2xl">
              <span className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                Booking · Messaging · Reviews
              </span>
              <h1 className="mt-6 text-5xl font-bold leading-[1.05] md:text-6xl">
                Hire freelancers. Manage the whole project in one place.
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                Browse talent, send a booking request, chat in real time, and leave a review when the job is done. Simple, transparent, and built for both sides.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link to="/browse">Browse freelancers <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/auth" search={{ mode: "signup" }}>Become a freelancer</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-card/50">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 py-20 md:grid-cols-4">
            {[
              { icon: CalendarCheck, title: "Structured bookings", desc: "Request, accept, complete — every stage tracked." },
              { icon: MessageSquare, title: "Realtime messaging", desc: "Discuss scope, deliverables and files without leaving." },
              { icon: Star, title: "Two-way reviews", desc: "Both sides rate each other after every completed booking." },
              { icon: ShieldCheck, title: "Trust built in", desc: "Public ratings and profiles help you pick with confidence." },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-border bg-background p-6">
                <f.icon className="h-6 w-6 text-accent" />
                <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Craftroll
      </footer>
    </div>
  );
}
