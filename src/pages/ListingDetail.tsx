import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Heart, MapPin, CalendarDays, BedDouble, Users, MessageSquare, ShieldCheck, Sparkles, Check, Clock, Flag } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PhotoGallery } from "@/components/housemate/PhotoGallery";
import { StatusBadge } from "@/components/housemate/StatusBadge";
import { ReportDialog } from "@/components/housemate/ReportDialog";
import { formatDate, formatPrice, genderLabel, initials, periodLabelLong, roomTypeLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ListingStatus } from "@/lib/types";

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getListing, getProfile, getSchool, currentUser, isSaved, toggleSave, getConversationForListing, expressInterest, updateListingStatus } = useApp();

  const listing = id ? getListing(id) : undefined;

  if (!listing) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Listing not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">This space may have been removed.</p>
        <Button asChild className="mt-6"><Link to="/browse">Back to browse</Link></Button>
      </div>
    );
  }

  const owner = getProfile(listing.ownerId);
  const school = getSchool(listing.schoolId);
  const isOwner = currentUser?.id === listing.ownerId;
  const saved = isSaved(listing.id);
  const existingConv = getConversationForListing(listing.id);
  const prefs = listing.seekerPreferences;

  const onExpress = async () => {
    if (!currentUser) { navigate("/login"); return; }
    if (isOwner) return;
    if (existingConv) { navigate(`/messages/${existingConv.id}`); return; }
    const convId = await expressInterest(listing.id);
    if (convId) navigate(`/messages/${convId}`);
    else toast.error("Could not start a conversation.");
  };

  const onSave = () => {
    if (!currentUser) { navigate("/login"); return; }
    void toggleSave(listing.id);
  };

  const statusOptions: ListingStatus[] = ["available", "pending", "taken"];

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-5 text-muted-foreground"><ArrowLeft className="h-4 w-4" />Back</Button>
      <div className="grid gap-8 lg:grid-cols-5 lg:gap-10">
        <div className="space-y-7 lg:col-span-3">
          <PhotoGallery photos={listing.photos} />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <StatusBadge status={listing.status} />
              <span className="text-sm text-muted-foreground">Posted {formatDate(listing.createdAt)}</span>
            </div>
            <h1 className="text-2xl font-bold leading-tight sm:text-3xl">{listing.title}</h1>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{school?.name} · {listing.area ? `${listing.area}, ` : ""}{listing.lga}, {listing.state}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <Fact icon={BedDouble} label="Room type" value={roomTypeLabel(listing.roomType)} />
            <Fact icon={Users} label="Gender" value={genderLabel(listing.genderPreference)} />
            <Fact icon={CalendarDays} label="Available" value={formatDate(listing.availableFrom)} />
            <Fact icon={Sparkles} label="Billing" value={periodLabelLong(listing.pricePeriod)} />
          </div>
          {listing.description && (
            <div>
              <h2 className="mb-2 text-lg font-bold">About this space</h2>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{listing.description}</p>
            </div>
          )}
          {prefs && (prefs.tags.length > 0 || prefs.note) && (
            <div className="rounded-2xl bg-secondary/40 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary"><Sparkles className="h-4 w-4" /></span>
                <div>
                  <h2 className="font-bold leading-tight">Seeker preferences</h2>
                  <p className="text-xs text-muted-foreground">What the current occupant is looking for.</p>
                </div>
              </div>
              {prefs.tags.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {prefs.tags.map((t) => (<span key={t} className="inline-flex items-center gap-1 rounded-full bg-card px-3 py-1 text-xs font-medium shadow-card"><Check className="h-3 w-3 text-primary" />{t}</span>))}
                </div>
              )}
              {prefs.note && <p className="text-sm text-muted-foreground">{prefs.note}</p>}
            </div>
          )}
          <div className="flex items-start gap-2.5 rounded-2xl bg-warning/5 p-4 text-sm sm:p-5">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
            <p className="text-muted-foreground"><span className="font-semibold text-foreground">Stay safe.</span> Meet on or around campus before paying. HouseMate never handles money — share contact details only inside the chat when you're comfortable.</p>
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="space-y-4 lg:sticky lg:top-24">
            <div className="rounded-3xl bg-card p-6 shadow-elevated sm:p-7">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold">{formatPrice(listing.price, listing.pricePeriod)}</span>
                <Button variant="outline" size="icon" onClick={onSave} className={cn("h-9 w-9 rounded-full", saved && "border-primary text-primary")}><Heart className={cn("h-4 w-4", saved && "fill-current")} /></Button>
              </div>
              {isOwner ? (
                <div className="mt-4 space-y-3">
                  <p className="rounded-lg bg-secondary/60 p-2.5 text-center text-xs font-medium text-muted-foreground">This is your listing</p>
                  <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase text-muted-foreground">Update status</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {statusOptions.map((s) => (
                        <button key={s} type="button" onClick={() => { void updateListingStatus(listing.id, s); }} className={cn("rounded-lg border px-2 py-2 text-xs font-semibold capitalize transition-colors", listing.status === s ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground")}>{s}</button>
                      ))}
                    </div>
                  </div>
                  <Button asChild variant="outline" className="w-full"><Link to="/dashboard"><MessageSquare className="h-4 w-4" />Go to dashboard</Link></Button>
                </div>
              ) : (
                <div className="mt-4 space-y-2">
                  <Button className="w-full bg-gradient-primary shadow-glow" size="lg" onClick={onExpress}><MessageSquare className="h-4 w-4" />{existingConv ? "Open chat" : "Express interest"}</Button>
                  {existingConv ? (
                    <p className="flex items-center justify-center gap-1 text-center text-xs text-muted-foreground"><Clock className="h-3 w-3" />You already started a conversation about this space.</p>
                  ) : (
                    <p className="text-center text-xs text-muted-foreground">Starts a private chat. No payment, no commitment.</p>
                  )}
                </div>
              )}
              {owner && (
                <div className="mt-5 border-t border-border pt-4">
                  <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Posted by</p>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-11 w-11">
                      <AvatarImage src={owner.avatarUrl} alt={owner.fullName} />
                      <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">{initials(owner.fullName)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{owner.fullName}</p>
                      <p className="truncate text-xs text-muted-foreground">{getSchool(owner.schoolId ?? "")?.name ?? "Student"}</p>
                    </div>
                  </div>
                  {owner.bio && <p className="mt-2 text-xs text-muted-foreground">{owner.bio}</p>}
                </div>
              )}
              {!isOwner && (
                <ReportDialog
                  targetType="listing"
                  targetId={listing.id}
                  contextLabel={listing.title}
                  trigger={
                    <button
                      type="button"
                      className="mt-4 flex w-full items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-destructive"
                    >
                      <Flag className="h-3.5 w-3.5" />
                      Report this listing
                    </button>
                  }
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Fact({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary/40 p-3.5">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Icon className="h-3.5 w-3.5" />{label}</div>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}
