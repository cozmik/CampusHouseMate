import { useMemo, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import type { CreateAdminListingInput, GenderPreference, PricePeriod, Profile, RoomType } from "@housemates/shared-types";
import { lgasForState, schools, schoolsForState, searchSchools, stateNames } from "@housemates/shared-data";
import { PRICE_PERIODS, ROOM_TYPES, periodLabelLong, roomTypeLabel } from "@housemates/shared-utils";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Textarea } from "./textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

export function AdminListingForm({
  owners,
  defaultOwnerId,
  submitting,
  onSubmit,
}: {
  owners: Profile[];
  defaultOwnerId: string;
  submitting: boolean;
  onSubmit: (input: CreateAdminListingInput) => Promise<void>;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [ownerId, setOwnerId] = useState(defaultOwnerId);
  const [contactName, setContactName] = useState("");
  const [contactWhatsapp, setContactWhatsapp] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [postMode, setPostMode] = useState<"school" | "state">("school");
  const [schoolQuery, setSchoolQuery] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [state, setState] = useState("");
  const [lga, setLga] = useState("");
  const [area, setArea] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [roomType, setRoomType] = useState<RoomType | "">("");
  const [genderPreference, setGenderPreference] = useState<GenderPreference>("any");
  const [price, setPrice] = useState("");
  const [pricePeriod, setPricePeriod] = useState<PricePeriod>("session");
  const [availableFrom, setAvailableFrom] = useState("");
  const [availableUntil, setAvailableUntil] = useState("");
  const [photos, setPhotos] = useState<{ url: string; file?: File }[]>([]);
  const [error, setError] = useState("");

  const schoolMatches = useMemo(() => {
    const pool = postMode === "state" && state ? schoolsForState(state) : schools;
    const q = schoolQuery.trim();
    if (!q) return postMode === "state" ? pool.slice(0, 8) : [];
    return searchSchools(q, 8, pool);
  }, [postMode, schoolQuery, state]);

  const selectedSchool = schools.find((school) => school.id === schoolId);
  const showSchoolList = !schoolId && (postMode === "school" ? Boolean(schoolQuery.trim()) : Boolean(state));
  const addressState = postMode === "school" ? selectedSchool?.state ?? "" : state;
  const lgas = addressState ? lgasForState(addressState) : [];

  const switchMode = (mode: "school" | "state") => {
    setPostMode(mode);
    setSchoolId("");
    setSchoolQuery("");
    setState("");
    setLga("");
  };

  const pickSchool = (id: string) => {
    const school = schools.find((item) => item.id === id);
    if (!school) return;
    if (postMode === "state" && school.state !== state) return;
    setSchoolId(school.id);
    setSchoolQuery(school.name);
    if (postMode === "school") setLga("");
  };

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const next = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, 8 - photos.length)
      .map((file) => ({ url: URL.createObjectURL(file), file }));
    setPhotos((prev) => [...prev, ...next]);
  };

  const submit = async () => {
    if (!ownerId) return setError("Choose which account receives the chats.");
    if (!contactName.trim()) return setError("Enter the student's name.");
    if (!contactWhatsapp.trim()) return setError("Enter the student's WhatsApp number.");
    if (postMode === "state" && !state) return setError("Select a state.");
    if (!selectedSchool) return setError("Select a school.");
    if (postMode === "state" && selectedSchool.state !== state) return setError("Pick a school in the selected state.");
    if (!lga || !lgasForState(selectedSchool.state).includes(lga)) return setError("Select an LGA in the school's state.");
    if (!title.trim()) return setError("Give the listing a title.");
    if (!roomType) return setError("Pick a room type.");
    if (!price || Number(price) <= 0) return setError("Enter a valid price.");
    if (!availableFrom) return setError("Pick the date the room is free.");
    if (photos.length === 0) return setError("Add at least one photo.");
    setError("");
    await onSubmit({
      ownerId,
      schoolId,
      title,
      description,
      roomType,
      genderPreference,
      price: Number(price),
      pricePeriod,
      state: selectedSchool.state,
      lga,
      area,
      availableFrom,
      availableUntil: availableUntil || undefined,
      contactName,
      contactPhone,
      contactWhatsapp,
      photos,
    });
  };

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <div>
          <h2 className="text-base font-semibold">Student</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Seekers see this name. Interest chats go to the account you pick, so you can reply and share this WhatsApp when you are ready.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="listing-owner">Chats go to</Label>
            <Select value={ownerId} onValueChange={setOwnerId}>
              <SelectTrigger id="listing-owner">
                <SelectValue placeholder="Choose an account" />
              </SelectTrigger>
              <SelectContent>
                {owners.map((owner) => (
                  <SelectItem key={owner.id} value={owner.id}>
                    {owner.fullName || owner.email || "Account"}
                    {owner.id === defaultOwnerId ? " (you)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-name">Name on the listing</Label>
            <Input id="contact-name" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Student's name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-whatsapp">WhatsApp</Label>
            <Input id="contact-whatsapp" inputMode="tel" value={contactWhatsapp} onChange={(e) => setContactWhatsapp(e.target.value)} placeholder="Phone number" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="contact-phone">Phone, if different</Label>
            <Input id="contact-phone" inputMode="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="Optional" />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold">Location</h2>
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
          {([
            { id: "school", label: "By School" },
            { id: "state", label: "By State" },
          ] as const).map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => switchMode(mode.id)}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${postMode === mode.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {postMode === "state" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>State</Label>
              <Select
                value={state || undefined}
                onValueChange={(value) => {
                  setState(value);
                  setLga("");
                  setSchoolId("");
                  setSchoolQuery("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="State" />
                </SelectTrigger>
                <SelectContent>
                  {stateNames.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>LGA</Label>
              <Select value={lga || undefined} onValueChange={setLga} disabled={!state}>
                <SelectTrigger>
                  <SelectValue placeholder={state ? "LGA" : "Pick a state first"} />
                </SelectTrigger>
                <SelectContent>
                  {lgas.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="school-search">School</Label>
          <Input
            id="school-search"
            value={schoolQuery}
            onChange={(e) => {
              setSchoolQuery(e.target.value);
              setSchoolId("");
            }}
            placeholder={postMode === "state" && !state ? "Pick a state first" : "Type a school name"}
            disabled={postMode === "state" && !state}
          />
          {schoolId ? (
            <div className="flex items-center justify-between text-sm">
              <span>{selectedSchool?.name}</span>
              <button
                type="button"
                className="text-xs text-muted-foreground underline"
                onClick={() => {
                  setSchoolId("");
                  setSchoolQuery("");
                }}
              >
                Change
              </button>
            </div>
          ) : showSchoolList ? (
            <div className="max-h-40 overflow-y-auto rounded-xl border border-border">
              {schoolMatches.length === 0 ? (
                <p className="px-3 py-2 text-sm text-muted-foreground">No school matches.</p>
              ) : (
                schoolMatches.map((school) => (
                  <button
                    key={school.id}
                    type="button"
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-accent"
                    onClick={() => pickSchool(school.id)}
                  >
                    {school.name}
                    <span className="ml-2 text-xs text-muted-foreground">{school.acronym}</span>
                  </button>
                ))
              )}
            </div>
          ) : null}
        </div>

        {postMode === "school" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>State</Label>
              <p className="flex h-10 items-center rounded-md border border-input bg-muted/50 px-3 text-sm">
                {selectedSchool ? selectedSchool.state : "Comes from the school"}
              </p>
            </div>
            <div className="space-y-2">
              <Label>LGA</Label>
              <Select value={lga || undefined} onValueChange={setLga} disabled={!selectedSchool}>
                <SelectTrigger>
                  <SelectValue placeholder={selectedSchool ? "LGA" : "Pick a school first"} />
                </SelectTrigger>
                <SelectContent>
                  {lgas.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="area">Area</Label>
          <Input id="area" value={area} onChange={(e) => setArea(e.target.value)} placeholder="Neighbourhood or landmark" />
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold">Room</h2>
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Short title for the room" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's included, how far from campus, when they leave." />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Room type</Label>
            <Select value={roomType || undefined} onValueChange={(value) => setRoomType(value as RoomType)}>
              <SelectTrigger>
                <SelectValue placeholder="Room type" />
              </SelectTrigger>
              <SelectContent>
                {ROOM_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {roomTypeLabel(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Gender</Label>
            <Select value={genderPreference} onValueChange={(value) => setGenderPreference(value as GenderPreference)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any gender</SelectItem>
                <SelectItem value="male">Male only</SelectItem>
                <SelectItem value="female">Female only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold">Price and dates</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="price">Price (₦)</Label>
            <Input id="price" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Amount in naira" />
          </div>
          <div className="space-y-2">
            <Label>Billed</Label>
            <Select value={pricePeriod} onValueChange={(value) => setPricePeriod(value as PricePeriod)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRICE_PERIODS.map((period) => (
                  <SelectItem key={period} value={period}>
                    {periodLabelLong(period)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="available-from">Available from</Label>
            <Input id="available-from" type="date" value={availableFrom} onChange={(e) => setAvailableFrom(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="available-until">Available until</Label>
            <Input id="available-until" type="date" value={availableUntil} onChange={(e) => setAvailableUntil(e.target.value)} />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold">Photos</h2>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        {photos.length > 0 && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {photos.map((photo, index) => (
              <div key={photo.url} className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border">
                <img src={photo.url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-background/90"
                  aria-label="Remove photo"
                  onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== index))}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={photos.length >= 8}>
          <ImagePlus className="mr-2 h-4 w-4" />
          Upload photos
        </Button>
      </section>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="submit" disabled={submitting}>
        {submitting ? "Posting…" : "Post listing"}
      </Button>
    </form>
  );
}
