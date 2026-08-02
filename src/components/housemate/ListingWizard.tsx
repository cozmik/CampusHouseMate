import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, School as SchoolIcon, MapPin, BedDouble, Camera, Wallet, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/lib/store";
import { PRICE_PERIODS, ROOM_TYPES, formatPrice, genderLabel, periodLabelLong, roomTypeLabel } from "@/lib/format";
import { lgasForState, stateNames } from "@/data/nigeria-states-lgas";
import { cn } from "@/lib/utils";
import type { GenderPreference, PricePeriod, RoomType, SeekerPreferences } from "@/lib/types";
import { SchoolCombobox } from "./SchoolCombobox";
import { PhotoUploader, type UploadingPhoto } from "./PhotoUploader";
import { SeekerPreferencesInput } from "./SeekerPreferencesInput";

const STEPS = [
  { key: "school", title: "School", icon: SchoolIcon },
  { key: "location", title: "Location", icon: MapPin },
  { key: "room", title: "Room details", icon: BedDouble },
  { key: "photos", title: "Photos", icon: Camera },
  { key: "price", title: "Price & dates", icon: Wallet },
  { key: "review", title: "Review", icon: CheckCircle2 },
];

interface WizardState {
  schoolId: string;
  state: string;
  lga: string;
  area: string;
  title: string;
  description: string;
  roomType: RoomType | "";
  genderPreference: GenderPreference;
  seekerPreferences: SeekerPreferences;
  photos: UploadingPhoto[];
  price: string;
  pricePeriod: PricePeriod;
  availableFrom: string;
  availableUntil: string;
}

const initialState: WizardState = {
  schoolId: "", state: "", lga: "", area: "", title: "", description: "",
  roomType: "", genderPreference: "any", seekerPreferences: { tags: [], note: undefined },
  photos: [], price: "", pricePeriod: "session", availableFrom: "", availableUntil: "",
};

export function ListingWizard() {
  const { createListing, getSchool } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<WizardState>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const set = <K extends keyof WizardState>(key: K, value: WizardState[K]) => setForm((prev) => ({ ...prev, [key]: value }));

  const validateStep = (s: number): boolean => {
    const e: Record<string, string> = {};
    if (s === 0 && !form.schoolId) e.schoolId = "Please select your school.";
    if (s === 1) { if (!form.state) e.state = "Select a state."; if (!form.lga) e.lga = "Select an LGA."; }
    if (s === 2) { if (!form.title.trim()) e.title = "Give your listing a title."; if (!form.roomType) e.roomType = "Pick a room type."; }
    if (s === 3 && form.photos.length === 0) e.photos = "Add at least one photo.";
    if (s === 4) { if (!form.price || Number(form.price) <= 0) e.price = "Enter a valid price."; if (!form.availableFrom) e.availableFrom = "Pick an availability date."; }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validateStep(step)) setStep((s) => Math.min(s + 1, STEPS.length - 1)); };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    if (!validateStep(4)) { setStep(4); return; }
    setSubmitting(true);
    try {
      const listing = await createListing({
        schoolId: form.schoolId,
        title: form.title,
        description: form.description,
        roomType: form.roomType as RoomType,
        genderPreference: form.genderPreference,
        price: Number(form.price),
        pricePeriod: form.pricePeriod,
        state: form.state,
        lga: form.lga,
        area: form.area,
        availableFrom: form.availableFrom,
        availableUntil: form.availableUntil || undefined,
        seekerPreferences: form.seekerPreferences.tags.length || form.seekerPreferences.note ? form.seekerPreferences : undefined,
        photos: form.photos,
      });
      toast.success("Listing posted!");
      navigate(`/listings/${listing.id}`);
    } catch (err) {
      setSubmitting(false);
      toast.error("Could not post listing", { description: err instanceof Error ? err.message : undefined });
    }
  };

  const current = STEPS[step];
  const school = getSchool(form.schoolId);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex flex-1 items-center last:flex-none">
              <button type="button" onClick={() => i < step && setStep(i)} disabled={i > step} className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 text-sm font-semibold transition-colors", i < step && "border-primary bg-primary text-primary-foreground", i === step && "border-primary bg-card text-primary", i > step && "border-border bg-card text-muted-foreground")}>
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </button>
              {i < STEPS.length - 1 && <div className={cn("mx-1 h-0.5 flex-1 rounded-full transition-colors", i < step ? "bg-primary" : "bg-border")} />}
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2 text-sm">
          <current.icon className="h-4 w-4 text-primary" />
          <span className="font-semibold">{current.title}</span>
          <span className="text-muted-foreground">· Step {step + 1} of {STEPS.length}</span>
        </div>
      </div>

      <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-card sm:p-7">
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold">Which school is this space for?</h2>
              <p className="text-sm text-muted-foreground">Seekers search by school first, so pick the institution this lodge is close to.</p>
            </div>
            <div className="space-y-1.5">
              <Label>School</Label>
              <SchoolCombobox value={form.schoolId} onChange={(id) => { set("schoolId", id); const sch = getSchool(id); if (sch && !form.state) set("state", sch.state); }} error={errors.schoolId} />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold">Where is the lodge?</h2>
              <p className="text-sm text-muted-foreground">For safety, we only ask for State, LGA and area — not your exact street.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>State</Label>
                <Select value={form.state} onValueChange={(v) => { set("state", v); set("lga", ""); }}>
                  <SelectTrigger className={errors.state ? "border-destructive" : ""}><SelectValue placeholder="Select state" /></SelectTrigger>
                  <SelectContent className="max-h-72">{stateNames.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent>
                </Select>
                {errors.state && <p className="text-xs text-destructive">{errors.state}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>LGA</Label>
                <Select value={form.lga} onValueChange={(v) => set("lga", v)} disabled={!form.state}>
                  <SelectTrigger className={errors.lga ? "border-destructive" : ""}><SelectValue placeholder={form.state ? "Select LGA" : "Pick state first"} /></SelectTrigger>
                  <SelectContent className="max-h-72">{lgasForState(form.state).map((l) => (<SelectItem key={l} value={l}>{l}</SelectItem>))}</SelectContent>
                </Select>
                {errors.lga && <p className="text-xs text-destructive">{errors.lga}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Area / landmark (optional)</Label>
              <Input value={form.area} onChange={(e) => set("area", e.target.value)} placeholder="e.g. Akoka, Mayfair, Bodija" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold">Tell us about the room</h2>
              <p className="text-sm text-muted-foreground">A clear title and details help seekers decide quickly.</p>
            </div>
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Bright self-con near the main gate" className={errors.title ? "border-destructive" : ""} />
              {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Mention water, light, distance to campus, neighbours, furnishings…" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Room type</Label>
                <Select value={form.roomType} onValueChange={(v) => set("roomType", v as RoomType)}>
                  <SelectTrigger className={errors.roomType ? "border-destructive" : ""}><SelectValue placeholder="Select room type" /></SelectTrigger>
                  <SelectContent>{ROOM_TYPES.map((r) => (<SelectItem key={r} value={r}>{roomTypeLabel(r)}</SelectItem>))}</SelectContent>
                </Select>
                {errors.roomType && <p className="text-xs text-destructive">{errors.roomType}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Gender preference</Label>
                <Select value={form.genderPreference} onValueChange={(v) => set("genderPreference", v as GenderPreference)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="any">Any gender</SelectItem><SelectItem value="male">Male only</SelectItem><SelectItem value="female">Female only</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <SeekerPreferencesInput value={form.seekerPreferences} onChange={(v) => set("seekerPreferences", v)} />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold">Add photos</h2>
              <p className="text-sm text-muted-foreground">Good photos get more interest. The first photo is the cover.</p>
            </div>
            <PhotoUploader photos={form.photos} onChange={(p) => set("photos", p)} />
            {errors.photos && <p className="text-xs text-destructive">{errors.photos}</p>}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold">Price & availability</h2>
              <p className="text-sm text-muted-foreground">Choose how rent is billed and when the space becomes free.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Price (₦)</Label>
                <Input type="number" inputMode="numeric" min={0} step={1000} value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="e.g. 150000" className={errors.price ? "border-destructive" : ""} />
                {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Billing period</Label>
                <Select value={form.pricePeriod} onValueChange={(v) => set("pricePeriod", v as PricePeriod)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PRICE_PERIODS.map((p) => (<SelectItem key={p} value={p}>{periodLabelLong(p)}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Available from</Label>
                <Input type="date" value={form.availableFrom} onChange={(e) => set("availableFrom", e.target.value)} className={errors.availableFrom ? "border-destructive" : ""} />
                {errors.availableFrom && <p className="text-xs text-destructive">{errors.availableFrom}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Available until (optional)</Label>
                <Input type="date" value={form.availableUntil} onChange={(e) => set("availableUntil", e.target.value)} />
              </div>
            </div>
            <div className="flex items-start gap-2 rounded-xl bg-secondary/50 p-3 text-xs text-muted-foreground">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p>Payments happen off-app, in person. HouseMate only connects you with interested seekers — never send money to anyone you haven't met.</p>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold">Review your listing</h2>
              <p className="text-sm text-muted-foreground">Make sure everything looks right before posting.</p>
            </div>
            <div className="overflow-hidden rounded-2xl border border-border">
              {form.photos[0] && (
                <div className="aspect-[16/9] bg-muted"><img src={form.photos[0].url} alt="" className="h-full w-full object-cover" /></div>
              )}
              <div className="space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">{form.price ? formatPrice(Number(form.price), form.pricePeriod) : "—"}</span>
                  <span className="text-xs text-muted-foreground">{roomTypeLabel(form.roomType as RoomType)} · {genderLabel(form.genderPreference)}</span>
                </div>
                <h3 className="font-semibold">{form.title || "Untitled listing"}</h3>
                <p className="text-sm text-muted-foreground">{school?.name} · {form.area ? `${form.area}, ` : ""}{form.lga}, {form.state}</p>
                {form.description && <p className="whitespace-pre-wrap text-sm">{form.description}</p>}
                {(form.seekerPreferences.tags.length > 0 || form.seekerPreferences.note) && (
                  <div className="rounded-xl bg-secondary/50 p-3">
                    <p className="mb-1.5 text-xs font-semibold uppercase text-muted-foreground">Seeker preferences</p>
                    {form.seekerPreferences.tags.length > 0 && (
                      <div className="mb-2 flex flex-wrap gap-1.5">
                        {form.seekerPreferences.tags.map((t) => (<span key={t} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{t}</span>))}
                      </div>
                    )}
                    {form.seekerPreferences.note && <p className="text-sm text-muted-foreground">{form.seekerPreferences.note}</p>}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={back} disabled={step === 0}><ArrowLeft className="h-4 w-4" />Back</Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={next} className="bg-gradient-primary">Continue<ArrowRight className="h-4 w-4" /></Button>
          ) : (
            <Button onClick={submit} disabled={submitting} className="bg-gradient-primary">
              <CheckCircle2 className="h-4 w-4" />{submitting ? "Posting…" : "Post listing"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
