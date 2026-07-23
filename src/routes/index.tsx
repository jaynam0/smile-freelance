import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, MessageSquare, Star, CalendarCheck, ShieldCheck, Sparkle, Quote } from "lucide-react";
import { Header } from "@/components/Header";

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
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-10 md:pt-16">
        {/* Hero */}
        <section className="relative">
          <div className="flex flex-col gap-4">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Booking · Messaging · Reviews
            </span>
            <h1 className="max-w-4xl text-5xl leading-[1.02] md:text-7xl">
              Hire freelancers.<br />
              <span className="italic text-accent">Run the whole project</span> in one place.
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground md:text-xl">
              Browse talent, send a booking request, chat in real time, and leave a review when the job is done — no spreadsheets, no email threads.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <Link
                to="/browse"
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                Browse freelancers
                <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/auth"
                search={{ mode: "signup" }}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-medium hover:border-foreground/30"
              >
                Become a freelancer
              </Link>
            </div>
          </div>
        </section>

        {/* Bento */}
        <section className="mt-16 grid auto-rows-[minmax(160px,auto)] grid-cols-1 gap-4 md:grid-cols-6 md:gap-5">
          {/* Big feature */}
          <div className="relative overflow-hidden rounded-3xl bg-primary p-8 text-primary-foreground md:col-span-4 md:row-span-2 md:p-10">
            <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent/25 blur-3xl" />
            <div className="absolute right-10 bottom-10 hidden h-40 w-40 rounded-full border border-accent/40 md:block" />
            <div className="absolute right-16 bottom-16 hidden h-24 w-24 rounded-full border border-accent/60 md:block" />
            <div className="relative flex h-full flex-col justify-between gap-8">
              <div>
                <CalendarCheck className="h-7 w-7 text-accent" />
                <h2 className="mt-6 text-4xl leading-tight md:text-5xl">
                  Every booking, from <span className="italic text-accent">request</span> to review.
                </h2>
                <p className="mt-4 max-w-md text-sm text-primary-foreground/70 md:text-base">
                  A single command center for scope, status, files and payment — so nothing lives in a lost email.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {["Pending", "Accepted", "In progress", "Completed", "Reviewed"].map((s, i) => (
                  <span
                    key={s}
                    className={`rounded-full border px-3 py-1.5 ${i === 2 ? "border-accent bg-accent text-accent-foreground" : "border-primary-foreground/20 text-primary-foreground/80"}`}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Realtime chat */}
          <div className="rounded-3xl border border-border bg-card p-6 md:col-span-2">
            <MessageSquare className="h-6 w-6 text-accent" />
            <h3 className="mt-4 text-2xl">Realtime chat</h3>
            <p className="mt-1 text-sm text-muted-foreground">Threaded per booking. Files welcome.</p>
            <div className="mt-5 space-y-2">
              <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-xs">Can we push launch to Friday?</div>
              <div className="ml-auto max-w-[70%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-xs text-primary-foreground">Works for me — locking scope.</div>
            </div>
          </div>

          {/* Two-way reviews */}
          <div className="rounded-3xl border border-border bg-card p-6 md:col-span-2">
            <Star className="h-6 w-6 text-accent" />
            <h3 className="mt-4 text-2xl">Two-way reviews</h3>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-display text-5xl text-foreground">4.9</span>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                ))}
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Both sides rate each other after every completed booking.</p>
          </div>

          {/* Quote / trust */}
          <div className="rounded-3xl border border-border bg-secondary p-6 md:col-span-3">
            <Quote className="h-6 w-6 text-accent" />
            <p className="mt-4 font-display text-2xl leading-snug text-foreground">
              "Feels like the client and I are actually on the same team."
            </p>
            <p className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">— Freelance designer, in beta</p>
          </div>

          {/* Trust */}
          <div className="rounded-3xl border border-border bg-card p-6 md:col-span-3">
            <ShieldCheck className="h-6 w-6 text-accent" />
            <h3 className="mt-4 text-2xl">Trust, built in</h3>
            <p className="mt-1 text-sm text-muted-foreground">Verified profiles, public ratings, and a transparent booking history — so you can pick with confidence.</p>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                { k: "12k+", v: "Bookings" },
                { k: "3.2k", v: "Freelancers" },
                { k: "98%", v: "On-time" },
              ].map((s) => (
                <div key={s.v} className="rounded-2xl border border-border bg-background p-3">
                  <div className="font-display text-2xl">{s.k}</div>
                  <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mt-20">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-3xl md:text-4xl">How it works</h2>
            <Sparkle className="h-5 w-5 text-accent" />
          </div>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { n: "01", t: "Discover", d: "Browse the directory. Filter by skill, rate and rating." },
              { n: "02", t: "Book", d: "Send a request with scope and budget. Get an answer fast." },
              { n: "03", t: "Deliver", d: "Chat, ship the work, then leave a two-way review." },
            ].map((s) => (
              <li key={s.n} className="rounded-3xl border border-border bg-card p-6">
                <div className="font-display text-4xl text-accent">{s.n}</div>
                <h3 className="mt-3 text-xl">{s.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* CTA */}
        <section className="mt-20 overflow-hidden rounded-3xl border border-border bg-primary p-10 text-primary-foreground md:p-14">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="max-w-2xl text-4xl leading-tight md:text-5xl">
                Ready to run your next project the <span className="italic text-accent">simple way?</span>
              </h2>
              <p className="mt-3 max-w-lg text-sm text-primary-foreground/70">Free to join. Pay only when you book.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/browse" className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-medium text-accent-foreground hover:brightness-105">
                Browse freelancers <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link to="/auth" search={{ mode: "signup" }} className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/25 px-5 py-3 text-sm font-medium hover:bg-primary-foreground/10">
                Become a freelancer
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted-foreground md:flex-row">
          <span className="font-display text-base text-foreground">Craftroll</span>
          <span>© {new Date().getFullYear()} Craftroll. Built for both sides.</span>
        </div>
      </footer>
    </div>
  );
}
