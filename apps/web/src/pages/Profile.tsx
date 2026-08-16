import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Check, KeyRound, Link as LinkIcon, Loader2, Mail, User as UserIcon, Flag } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/lib/store";
import { Button } from "@housemates/shared-ui/button";
import { Input } from "@housemates/shared-ui/input";
import { Label } from "@housemates/shared-ui/label";
import { Textarea } from "@housemates/shared-ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@housemates/shared-ui/avatar";
import { SchoolCombobox } from "@/components/housemate/SchoolCombobox";
import { ReportDialog } from "@/components/housemate/ReportDialog";
import { initials, joinName, splitFullName } from "@housemates/shared-utils";

export default function Profile() {
  const { currentUser, hasPassword, updatePassword, updateProfile, uploadAvatar } = useApp();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState(currentUser?.firstName ?? splitFullName(currentUser?.fullName).firstName);
  const [lastName, setLastName] = useState(currentUser?.lastName ?? splitFullName(currentUser?.fullName).lastName);
  const [phone, setPhone] = useState(currentUser?.phone ?? "");
  const [whatsapp, setWhatsapp] = useState(currentUser?.whatsapp ?? "");
  const [bio, setBio] = useState(currentUser?.bio ?? "");
  const [schoolId, setSchoolId] = useState(currentUser?.schoolId ?? "");
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl ?? "");
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);

  if (!currentUser) return null;

  const onFile = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadAvatar(file);
      setAvatarUrl(url);
    } catch (e) {
      toast.error("Upload failed", { description: e instanceof Error ? e.message : undefined });
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        fullName: joinName(firstName.trim(), lastName.trim()) || currentUser.fullName,
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || phone.trim(),
        bio: bio.trim() || undefined,
        schoolId,
        avatarUrl: avatarUrl || undefined,
      });
      toast.success("Profile updated");
      navigate("/dashboard");
    } catch (e) {
      toast.error("Could not save", { description: e instanceof Error ? e.message : undefined });
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async () => {
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setPasswordBusy(true);
    try {
      const res = await updatePassword(newPassword, hasPassword ? currentPassword : undefined);
      if (!res.ok) {
        toast.error(res.error ?? "Could not update your password.");
        return;
      }
      setNewPassword("");
      setConfirmPassword("");
      setCurrentPassword("");
    } finally {
      setPasswordBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit profile</h1>
        <p className="text-sm text-muted-foreground">This information is shared when you post a space or chat with others.</p>
      </div>
      <div className="space-y-6 rounded-3xl border border-border/70 bg-card p-6 shadow-card">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={avatarUrl} alt={joinName(firstName, lastName) || currentUser.fullName} />
            <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">{initials(joinName(firstName, lastName) || "U")}</AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => void onFile(e.target.files?.[0])} />
            <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}Upload photo
            </Button>
            <div className="flex items-center gap-2">
              <LinkIcon className="h-3.5 w-3.5 text-muted-foreground" />
              <Input value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="or paste image URL" className="h-8 text-xs" />
              <Button type="button" size="sm" variant="secondary" disabled={!urlInput.trim()} onClick={() => { setAvatarUrl(urlInput.trim()); setUrlInput(""); }}>Use</Button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2.5 text-sm">
          <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="truncate text-muted-foreground">{currentUser.email ?? "No email on file"}</span>
          <span className="ml-auto shrink-0 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
            Sign-in email
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="firstName">First name</Label>
            <div className="relative">
              <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="firstName" autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="pl-9" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>School</Label>
          <SchoolCombobox value={schoolId} onChange={setSchoolId} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0803 000 0000" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input id="whatsapp" inputMode="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="same as phone" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bio">Short bio (optional)</Label>
          <Textarea id="bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="A line or two about you — e.g. final-year student, neat and quiet." />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>Cancel</Button>
          <Button onClick={() => void save()} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}Save changes
          </Button>
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">Your phone & WhatsApp stay hidden until you tap "Share contact" in a chat.</p>

      <div className="mt-6 space-y-6 rounded-3xl border border-border/70 bg-card p-6 shadow-card">
        <div>
          <h2 className="text-base font-semibold">Security</h2>
          <p className="text-sm text-muted-foreground">
            {hasPassword
              ? "Update the password you use to sign in."
              : "You currently sign in with a social provider. Set a password to also sign in with email + password."}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {hasPassword && (
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input id="currentPassword" type="password" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="newPassword">New password</Label>
            <Input id="newPassword" type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input id="confirmPassword" type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            onClick={() => void savePassword()}
            disabled={passwordBusy || !newPassword || !confirmPassword || (hasPassword && !currentPassword)}
          >
            {passwordBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            {hasPassword ? "Update password" : "Set password"}
          </Button>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between rounded-2xl bg-secondary/40 p-4">
        <div>
          <p className="text-sm font-semibold">Need help?</p>
          <p className="text-xs text-muted-foreground">Report a bug, a safety concern, or anything else.</p>
        </div>
        <ReportDialog
          targetType="general"
          trigger={
            <Button variant="outline" size="sm">
              <Flag className="h-4 w-4" />
              Report an issue
            </Button>
          }
        />
      </div>
    </div>
  );
}
