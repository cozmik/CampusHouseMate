import { Link, useNavigate } from "react-router-dom";
import { Heart, MapPin, BedDouble, Users } from "lucide-react";
import { useApp } from "@/lib/store";
import { formatPrice, genderLabel, roomTypeLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Listing } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

export function ListingCard({ listing, showStatus = false }: { listing: Listing; showStatus?: boolean }) {
  const { getSchool, isSaved, toggleSave, currentUser } = useApp();
  const navigate = useNavigate();
  const school = getSchool(listing.schoolId);
  const saved = isSaved(listing.id);
  const photo = listing.photos[0];

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) { navigate("/login"); return; }
    void toggleSave(listing.id);
  };

  return (
    <Link to={`/listings/${listing.id}`} className="group block overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elevated">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {photo ? (
          <img src={photo.url} alt={listing.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="grid h-full w-full place-items-center text-muted-foreground"><BedDouble className="h-10 w-10" /></div>
        )}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          {showStatus ? <StatusBadge status={listing.status} /> : listing.status !== "available" && <StatusBadge status={listing.status} />}
          <button type="button" onClick={handleSave} aria-label={saved ? "Remove from saved" : "Save listing"} className={cn("grid h-9 w-9 place-items-center rounded-full bg-background/85 backdrop-blur transition-colors hover:bg-background", saved ? "text-primary" : "text-foreground/70")}>
            <Heart className={cn("h-4 w-4", saved && "fill-current")} />
          </button>
        </div>
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-lg font-bold text-foreground">{formatPrice(listing.price, listing.pricePeriod)}</span>
        </div>
        <h3 className="line-clamp-1 font-semibold leading-snug">{listing.title}</h3>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" />{roomTypeLabel(listing.roomType)}</span>
          <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />{genderLabel(listing.genderPreference)}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-1">{school?.name} · {listing.area ? `${listing.area}, ` : ""}{listing.lga}, {listing.state}</span>
        </div>
      </div>
    </Link>
  );
}
