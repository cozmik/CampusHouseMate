import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flag, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useApp } from "@/lib/store";
import type { ReportTargetType } from "@/lib/types";

const CATEGORIES: Record<ReportTargetType, string[]> = {
  listing: [
    "Fake or scam listing",
    "Inaccurate details",
    "Inappropriate photos or content",
    "Already taken / unavailable",
    "Other",
  ],
  user: [
    "Harassment or abuse",
    "Scam attempt",
    "Spam",
    "Inappropriate behavior",
    "Other",
  ],
  conversation: [
    "Harassment or abuse",
    "Scam attempt",
    "Spam",
    "Inappropriate behavior",
    "Other",
  ],
  general: [
    "Bug or technical issue",
    "Account issue",
    "Safety concern",
    "Feedback or suggestion",
    "Other",
  ],
};

const TITLES: Record<ReportTargetType, string> = {
  listing: "Report this listing",
  user: "Report this user",
  conversation: "Report this conversation",
  general: "Report an issue",
};

export function ReportDialog({
  targetType,
  targetId,
  contextLabel,
  trigger,
}: {
  targetType: ReportTargetType;
  targetId?: string;
  contextLabel?: string;
  trigger: React.ReactNode;
}) {
  const { currentUser, submitReport } = useApp();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setCategory("");
    setMessage("");
    setError("");
  };

  const openDialog = () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    setOpen(true);
  };

  const onSubmit = async () => {
    setError("");
    if (!category) {
      setError("Please choose a category.");
      return;
    }
    if (!message.trim()) {
      setError("Please add a few details.");
      return;
    }
    setSubmitting(true);
    const res = await submitReport({ targetType, targetId, category, message });
    setSubmitting(false);
    if (res.ok) {
      toast.success("Report submitted", {
        description: "Thanks for flagging this — our team will review it.",
      });
      setOpen(false);
      reset();
    } else {
      setError(res.error ?? "Could not submit report.");
    }
  };

  return (
    <>
      <span onClick={openDialog} className="contents">
        {trigger}
      </span>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) reset();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="h-4 w-4 text-destructive" />
              {TITLES[targetType]}
            </DialogTitle>
            <DialogDescription>
              {contextLabel && (
                <>
                  Reporting <span className="font-medium text-foreground">{contextLabel}</span>.{" "}
                </>
              )}
              Tell us what's wrong — we review every report.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES[targetType].map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Details</Label>
              <Textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what happened…"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => void onSubmit()} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Flag className="h-4 w-4" />}
              Submit report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
