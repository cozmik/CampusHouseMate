import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Plus, Heart, MessageSquare, BedDouble, Search, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/lib/store";
import { Button } from "@housemates/shared-ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@housemates/shared-ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@housemates/shared-ui/tabs";
import { ListingCard } from "@/components/housemate/ListingCard";
import { StatusBadge } from "@/components/housemate/StatusBadge";
import { ConversationListItem } from "@/components/housemate/ConversationListItem";
import { cn } from "@housemates/shared-utils";
import { formatPrice, initials, roomTypeLabel } from "@housemates/shared-utils";
import type { Listing, ListingStatus } from "@housemates/shared-types";

const STATUS_OPTIONS: ListingStatus[] = ["available", "pending", "taken"];

export default function Dashboard() {
  const { currentUser, listings, fetchListings, getMyConversations, getSavedListings, savedListings } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [loadingMine, setLoadingMine] = useState(true);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [welcomeName, setWelcomeName] = useState<string | null>(null);
  const welcomed = useRef(false);

  useEffect(() => {
    if (!currentUser || welcomed.current) return;
    let stored: string | null = null;
    try {
      stored = sessionStorage.getItem("hmf.welcome");
    } catch {
      stored = null;
    }
    const fromState = Boolean((location.state as { welcome?: boolean } | null)?.welcome);
    if (!stored && !fromState) return;
    welcomed.current = true;
    const name = stored || currentUser.firstName || "there";
    try {
      sessionStorage.removeItem("hmf.welcome");
    } catch {
      /* ignore */
    }
    setWelcomeName(name);
    toast.success("Welcome to Housemates Finder", {
      description: `Hey ${name}, you're in. Confirming your email is optional but recommended.`,
      duration: 8000,
    });
    if (fromState) navigate(".", { replace: true, state: {} });
  }, [currentUser, location.state, navigate]);

  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;
    setLoadingMine(true);
    void fetchListings({ ownerId: currentUser.id }, 1, 50).then(() => {
      if (!cancelled) setLoadingMine(false);
    });
    return () => {
      cancelled = true;
    };
  }, [currentUser, fetchListings]);

  useEffect(() => {
    if (!currentUser) return;
    const ids = savedListings
      .filter((s) => s.userId === currentUser.id)
      .map((s) => s.listingId);
    if (!ids.length) {
      setLoadingSaved(false);
      return;
    }
    let cancelled = false;
    setLoadingSaved(true);
    void fetchListings({ ids }, 1, 50).then(() => {
      if (!cancelled) setLoadingSaved(false);
    });
    return () => {
      cancelled = true;
    };
  }, [currentUser, fetchListings, savedListings]);

  if (!currentUser) return null;

  const myListings = listings
    .filter((l) => l.ownerId === currentUser.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const myInterests = getMyConversations().filter((c) => c.seekerId === currentUser.id);
  const saved = getSavedListings();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {welcomeName && (
        <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 sm:px-5 sm:py-4">
          <p className="font-semibold text-foreground">Welcome to Housemates Finder</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Hey {welcomeName}, you're in. Confirming your email is optional but recommended.
          </p>
        </div>
      )}
      <div className="mb-8 flex items-center gap-4 sm:mb-10">
        <Avatar className="h-14 w-14">
          <AvatarImage src={currentUser.avatarUrl} alt={currentUser.fullName} />
          <AvatarFallback className="bg-primary/10 font-semibold text-primary">{initials(currentUser.fullName)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">{currentUser.fullName}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Manage your spaces, interests and saved listings.</p>
        </div>
      </div>

      <Tabs defaultValue="listings">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="listings" className="text-xs sm:text-sm">My listings<span className="ml-1 text-muted-foreground">{myListings.length}</span></TabsTrigger>
          <TabsTrigger value="interests" className="text-xs sm:text-sm">Interests<span className="ml-1 text-muted-foreground">{myInterests.length}</span></TabsTrigger>
          <TabsTrigger value="saved" className="text-xs sm:text-sm">Saved<span className="ml-1 text-muted-foreground">{saved.length}</span></TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="mt-6">
          {loadingMine && myListings.length === 0 ? (
            <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : myListings.length === 0 ? (
            <EmptyState icon={Plus} title="No listings yet" body="Post your first space and let incoming students find you." cta={{ label: "Post a space", to: "/post" }} />
          ) : (
            <div className="space-y-4">{myListings.map((l) => (<ListingRow key={l.id} listing={l} />))}</div>
          )}
        </TabsContent>

        <TabsContent value="interests" className="mt-6">
          {myInterests.length === 0 ? (
            <EmptyState icon={MessageSquare} title="No interests yet" body="Express interest in a space to start a conversation here." cta={{ label: "Browse spaces", to: "/browse" }} />
          ) : (
            <div className="divide-y divide-border/60 overflow-hidden rounded-2xl bg-card shadow-card">
              {myInterests.map((c) => (<ConversationListItem key={c.id} conversation={c} />))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="saved" className="mt-6">
          {loadingSaved && saved.length === 0 ? (
            <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : saved.length === 0 ? (
            <EmptyState icon={Heart} title="No saved listings" body="Tap the heart on any space to bookmark it for later." cta={{ label: "Browse spaces", to: "/browse" }} />
          ) : (
            <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">{saved.map((l) => (<ListingCard key={l.id} listing={l} showStatus />))}</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ListingRow({ listing }: { listing: Listing }) {
  const { getSchool, updateListingStatus } = useApp();
  const school = getSchool(listing.schoolId);
  const photo = listing.photos[0];
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-card p-4 shadow-card sm:flex-row sm:items-center">
      <Link to={`/listings/${listing.id}`} className="flex flex-1 items-center gap-4">
        <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
          {photo ? <img src={photo.url} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full w-full place-items-center text-muted-foreground"><BedDouble className="h-5 w-5" /></div>}
        </div>
        <div className="min-w-0">
          <StatusBadge status={listing.status} />
          <p className="mt-1.5 line-clamp-1 font-semibold">{listing.title}</p>
          <p className="line-clamp-1 text-xs text-muted-foreground">{school?.name} · {roomTypeLabel(listing.roomType)}</p>
          <p className="mt-0.5 text-sm font-bold text-primary">{formatPrice(listing.price, listing.pricePeriod)}</p>
        </div>
      </Link>
      <div className="flex shrink-0 flex-col gap-2 sm:items-end">
        <div className="flex gap-1.5">
          {STATUS_OPTIONS.map((s) => (
            <button key={s} type="button" onClick={() => { void updateListingStatus(listing.id, s); }} className={cn("rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition-colors", listing.status === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground")}>{s}</button>
          ))}
        </div>
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground"><Link to={`/listings/${listing.id}`}>View<ExternalLink className="h-3.5 w-3.5" /></Link></Button>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, body, cta }: { icon: React.ComponentType<{ className?: string }>; title: string; body: string; cta: { label: string; to: string } }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border py-20 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-muted text-muted-foreground"><Icon className="h-6 w-6" /></div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>
      <Button asChild className="mt-5"><Link to={cta.to}><Search className="h-4 w-4" />{cta.label}</Link></Button>
    </div>
  );
}
