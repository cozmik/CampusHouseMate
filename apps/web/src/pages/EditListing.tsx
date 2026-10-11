import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@housemates/shared-ui/button";
import { useApp } from "@/lib/store";
import { ListingWizard } from "@/components/housemate/ListingWizard";

export default function EditListing() {
  const { id } = useParams<{ id: string }>();
  const { getListing, fetchListingById, currentUser } = useApp();
  const listing = id ? getListing(id) : undefined;
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!id || listing) return;
    let cancelled = false;
    void fetchListingById(id).then((found) => {
      if (!cancelled && !found) setMissing(true);
    });
    return () => {
      cancelled = true;
    };
  }, [id, listing, fetchListingById]);

  if (!listing && !missing) {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!listing || listing.archivedAt || listing.ownerId !== currentUser?.id) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Listing not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">You can only edit listings you posted.</p>
        <Button asChild className="mt-6"><Link to="/dashboard">Back to dashboard</Link></Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8 text-center sm:mb-10">
        <h1 className="text-2xl font-bold sm:text-3xl">Edit listing</h1>
        <p className="mt-1 text-sm text-muted-foreground">Update the details, photos or price. Changes go live as soon as you save.</p>
      </div>
      <ListingWizard key={listing.id} listing={listing} />
    </div>
  );
}
