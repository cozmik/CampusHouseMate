import { useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@housemates/shared-ui/alert-dialog";
import { Button } from "@housemates/shared-ui/button";
import { useApp } from "@/lib/store";
import type { Listing } from "@housemates/shared-types";

export function DeleteListingButton({
  listing,
  trigger,
  onDeleted,
}: {
  listing: Listing;
  trigger: ReactNode;
  onDeleted?: () => void;
}) {
  const { archiveListing } = useApp();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const onConfirm = async () => {
    setDeleting(true);
    try {
      await archiveListing(listing.id);
      toast.success("Listing deleted");
      setOpen(false);
      onDeleted?.();
    } catch (err) {
      toast.error("Could not delete listing", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(next) => !deleting && setOpen(next)}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this listing?</AlertDialogTitle>
          <AlertDialogDescription>
            "{listing.title}" will be removed from browse and search. Your existing chats about it stay open.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <Button variant="destructive" onClick={() => void onConfirm()} disabled={deleting}>
            {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
            Delete listing
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
