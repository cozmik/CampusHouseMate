import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createAdminListing, fetchAllUsers, type AdminUser } from "@housemates/shared-supabase";
import type { CreateAdminListingInput } from "@housemates/shared-types";
import { AdminListingForm } from "@housemates/shared-ui/admin-listing-form";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/lib/auth";

export default function PostListing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [owners, setOwners] = useState<AdminUser[]>([]);
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
  }, []);

  const list = useMemo(() => {
    if (!user) return owners;
    if (owners.some((owner) => owner.id === user.id)) return owners;
    return [user as AdminUser, ...owners];
  }, [owners, user]);

  const submit = async (input: CreateAdminListingInput) => {
    setSubmitting(true);
    try {
      await createAdminListing(input);
      toast.success("Listing posted");
      navigate("/listings");
    } catch (err) {
      setSubmitting(false);
      toast.error("Could not post listing", {
        description: err instanceof Error ? err.message : undefined,
      });
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Post a listing"
        description="Add a room for a student. It shows on the site immediately."
      />
      {loading || !user ? (
        <div className="glass flex min-h-40 items-center justify-center rounded-2xl">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <AdminListingForm
          owners={list}
          defaultOwnerId={user.id}
          submitting={submitting}
          onSubmit={submit}
        />
      )}
    </div>
  );
}
