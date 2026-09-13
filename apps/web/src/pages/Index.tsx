import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Search, MessagesSquare, KeyRound, ShieldCheck, Wallet, Users, Sparkles } from "lucide-react";
import { useApp } from "@/lib/store";
import { Button } from "@housemates/shared-ui/button";
import { Skeleton } from "@housemates/shared-ui/skeleton";
import { SchoolStateSearch } from "@/components/housemate/SchoolStateSearch";
import { ListingCard } from "@/components/housemate/ListingCard";
import { schoolTypeLabel } from "@housemates/shared-utils";
import type { Listing, School } from "@housemates/shared-types";

export default function Index() {
  const { fetchListings, fetchSchoolCounts, schools } = useApp();
  const navigate = useNavigate();
  const [recent, setRecent] = useState<Listing[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      fetchListings({ status: "available" }, 1, 6),
      fetchSchoolCounts(),
    ]).then(([page, schoolCounts]) => {
      if (cancelled) return;
      setRecent(page.items);
      setCounts(schoolCounts);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [fetchListings, fetchSchoolCounts]);

  const trending = [...schools]
    .map((s) => ({ school: s, count: counts[s.id] ?? 0 }))
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
      <section className="relative bg-hero">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl sm:h-96 sm:w-96" />
          <div className="absolute -right-16 top-16 h-80 w-80 rounded-full bg-coral/20 blur-3xl sm:h-[26rem] sm:w-[26rem]" />
        </div>
        <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 md:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />Handing over your lodge? Find your replacement.
            </span>
            <h1 className="mt-6 text-balance text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl">
              Find your next hostel, <span className="text-gradient">the student way</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
              Housemates Finder connects outgoing students with new ones taking over their space. Pick your school, chat with the current occupant, and move in with confidence.
            </p>
          </div>
          <div className="mx-auto mt-10 max-w-2xl sm:mt-12"><SchoolStateSearch /></div>
          <div className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-muted-foreground sm:mt-10">
            {trust.map((t) => (<span key={t.label} className="inline-flex items-center gap-1.5"><t.icon className="h-4 w-4 text-primary" />{t.label}</span>))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mb-6 flex items-end justify-between sm:mb-8">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Trending schools</h2>
            <p className="mt-1 text-sm text-muted-foreground">Campuses with the most available spaces right now.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/browse")} className="shrink-0">All schools<ArrowRight className="h-4 w-4" /></Button>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-6">
            {trending.map(({ school, count }) => (<SchoolChip key={school.id} school={school} count={count} />))}
          </div>
        )}
      </section>

      <section className="bg-secondary/30 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">How Housemates Finder works</h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">Three simple steps from search to keys.</p>
          <div className="mt-10 grid gap-5 sm:mt-12 md:grid-cols-3 md:gap-6">
            {steps.map((s, i) => (
              <div key={s.title} className="relative rounded-2xl bg-card p-7 shadow-card sm:p-8">
                <span className="absolute right-5 top-5 text-3xl font-black text-primary/10">{i + 1}</span>
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary"><s.icon className="h-5 w-5" /></span>
                <h3 className="mt-5 font-bold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mb-6 flex items-end justify-between sm:mb-8">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Fresh on the block</h2>
            <p className="mt-1 text-sm text-muted-foreground">Recently posted available spaces.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/browse")} className="shrink-0">Browse all<ArrowRight className="h-4 w-4" /></Button>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-[4/3] rounded-2xl" />
                <Skeleton className="mt-3 h-4 w-3/4" />
                <Skeleton className="mt-2 h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
            No listings yet — be the first to post a space.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((l) => (<ListingCard key={l.id} listing={l} />))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-gradient-primary p-10 text-primary-foreground shadow-elevated sm:p-16">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">Got a space to hand over?</h2>
            <p className="mt-3 text-primary-foreground/90">Post it in minutes and let incoming students find you. It's free.</p>
            <Button size="lg" variant="secondary" className="mt-7 bg-background text-foreground hover:bg-background/90" onClick={() => navigate("/post")}>Post your space<ArrowRight className="h-4 w-4" /></Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function SchoolChip({ school, count }: { school: School; count: number }) {
  return (
    <Link to={`/browse?school=${encodeURIComponent(school.id)}`} className="group flex flex-col gap-1.5 rounded-2xl bg-card p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{schoolTypeLabel(school.type)}</span>
      <span className="line-clamp-2 text-sm font-semibold leading-snug">{school.name}</span>
      <span className="mt-auto flex items-center justify-between pt-3">
        <span className="text-xs text-muted-foreground">{school.state}</span>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">{count} {count === 1 ? "space" : "spaces"}</span>
      </span>
    </Link>
  );
}
