import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Search, MessagesSquare, KeyRound, ShieldCheck, Wallet, Users, Sparkles } from "lucide-react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { SchoolStateSearch } from "@/components/housemate/SchoolStateSearch";
import { ListingCard } from "@/components/housemate/ListingCard";
import { schoolTypeLabel } from "@/lib/format";
import type { School } from "@/lib/types";

export default function Index() {
  const { listings, schools } = useApp();
  const navigate = useNavigate();

  const recent = [...listings]
    .filter((l) => l.status === "available")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  const counts = new Map<string, number>();
  for (const l of listings) {
    if (l.status === "available") counts.set(l.schoolId, (counts.get(l.schoolId) ?? 0) + 1);
  }
  const trending = [...schools]
    .map((s) => ({ school: s, count: counts.get(s.id) ?? 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const steps = [
    { icon: Search, title: "Find a space", body: "Search by your school, or browse by state and LGA to see lodges near campus." },
    { icon: MessagesSquare, title: "Chat & agree", body: "Express interest to start a private thread. Share contact details only when you're both ready." },
    { icon: KeyRound, title: "Hand over in person", body: "Meet on campus, inspect the room, and settle payment face-to-face. No money in the app." },
  ];
  const trust = [
    { icon: Wallet, label: "Free to use" },
    { icon: ShieldCheck, label: "Contact sharing on your terms" },
    { icon: Users, label: "Built for students" },
  ];

  return (
    <div>
      <section className="relative overflow-hidden bg-hero">
        <div className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full bg-primary/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 top-10 h-80 w-80 rounded-full bg-coral/25 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:py-16 md:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />Handing over your lodge? Find your replacement.
            </span>
            <h1 className="mt-4 text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
              Find your next hostel, <span className="text-gradient">the student way</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
              HouseMate connects outgoing students with new ones taking over their space. Pick your school, chat with the current occupant, and move in with confidence.
            </p>
          </div>
          <div className="mx-auto mt-8 max-w-2xl"><SchoolStateSearch /></div>
          <div className="mx-auto mt-6 flex max-w-2xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            {trust.map((t) => (<span key={t.label} className="inline-flex items-center gap-1.5"><t.icon className="h-4 w-4 text-primary" />{t.label}</span>))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold">Trending schools</h2>
            <p className="text-sm text-muted-foreground">Campuses with the most available spaces right now.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/browse")}>All schools<ArrowRight className="h-4 w-4" /></Button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {trending.map(({ school, count }) => (<SchoolChip key={school.id} school={school} count={count} />))}
        </div>
      </section>

      <section className="border-y border-border/60 bg-secondary/30">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-center text-2xl font-bold">How HouseMate works</h2>
          <p className="mt-1 text-center text-sm text-muted-foreground">Three simple steps from search to keys.</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.title} className="relative rounded-2xl border border-border/70 bg-card p-6 shadow-card">
                <span className="absolute right-4 top-4 text-3xl font-black text-primary/10">{i + 1}</span>
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary"><s.icon className="h-5 w-5" /></span>
                <h3 className="mt-4 font-bold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold">Fresh on the block</h2>
            <p className="text-sm text-muted-foreground">Recently posted available spaces.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/browse")}>Browse all<ArrowRight className="h-4 w-4" /></Button>
        </div>
        {recent.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
            No listings yet — be the first to post a space.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((l) => (<ListingCard key={l.id} listing={l} />))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="overflow-hidden rounded-3xl bg-gradient-primary p-8 text-primary-foreground shadow-elevated sm:p-12">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">Got a space to hand over?</h2>
            <p className="mt-2 text-primary-foreground/90">Post it in minutes and let incoming students find you. It's free.</p>
            <Button size="lg" variant="secondary" className="mt-6 bg-background text-foreground hover:bg-background/90" onClick={() => navigate("/post")}>Post your space<ArrowRight className="h-4 w-4" /></Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function SchoolChip({ school, count }: { school: School; count: number }) {
  return (
    <Link to={`/browse?school=${encodeURIComponent(school.id)}`} className="group flex flex-col gap-1 rounded-2xl border border-border/70 bg-card p-4 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elevated">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{schoolTypeLabel(school.type)}</span>
      <span className="line-clamp-2 text-sm font-semibold leading-snug">{school.name}</span>
      <span className="mt-auto flex items-center justify-between pt-2">
        <span className="text-xs text-muted-foreground">{school.state}</span>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">{count} {count === 1 ? "space" : "spaces"}</span>
      </span>
    </Link>
  );
}
