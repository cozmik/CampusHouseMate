import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createAdminListing } from "@housemates/shared-supabase";
import type { CreateAdminListingInput, Profile } from "@housemates/shared-types";
import { AdminListingForm } from "@housemates/shared-ui/admin-listing-form";
import { useApp } from "@/lib/store";

export default function AdminPostListing() {
  const { currentUser, fetchAllUsers } = useApp();
  const navigate = useNavigate();
  const [owners, setOwners] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetchAllUsers().then((users) => {
      if (cancelled) return;
      setOwners(users);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [fetchAllUsers]);

  const list = useMemo(() => {
    if (!currentUser) return owners;
    if (owners.some((owner) => owner.id === currentUser.id)) return owners;
    return [currentUser, ...owners];
  }, [currentUser, owners]);

  const submit = async (input: CreateAdminListingInput) => {
    setSubmitting(true);
    try {
      const listing = await createAdminListing(input);
      toast.success("Listing posted");
      navigate(`/listings/${listing.id}`);
    } catch (err) {
      setSubmitting(false);
      toast.error("Could not post listing", {
        description: err instanceof Error ? err.message : undefined,
      });
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Post a listing</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a room for a student. It shows on the site immediately.
        </p>
      </div>
      {loading || !currentUser ? (
        <div className="grid min-h-40 place-items-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <AdminListingForm
          owners={list}
          defaultOwnerId={currentUser.id}
          submitting={submitting}
          onSubmit={submit}
        />
      )}
    </div>
  );
}
