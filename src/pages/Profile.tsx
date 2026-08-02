import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Check, Link as LinkIcon, User as UserIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SchoolCombobox } from "@/components/housemate/SchoolCombobox";
import { initials } from "@/lib/format";

export default function Profile() {
  const { currentUser, updateProfile, uploadAvatar } = useApp();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(currentUser?.fullName ?? "");
  const [phone, setPhone] = useState(currentUser?.phone ?? "");
  const [whatsapp, setWhatsapp] = useState(currentUser?.whatsapp ?? "");
  const [bio, setBio] = useState(currentUser?.bio ?? "");
  const [schoolId, setSchoolId] = useState(currentUser?.schoolId ?? "");
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl ?? "");
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

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
        fullName: fullName.trim() || currentUser.fullName,
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

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit profile</h1>
        <p className="text-sm text-muted-foreground">This information is shared when you post a space or chat with others.</p>
      </div>
      <div className="space-y-6 rounded-3xl border border-border/70 bg-card p-6 shadow-card">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={avatarUrl} alt={fullName} />
            <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">{initials(fullName || "U")}</AvatarFallback>
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
        <div className="space-y-1.5">
          <Label htmlFor="fullName">Full name</Label>
          <div className="relative">
            <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-9" />
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
    </div>
  );
}
