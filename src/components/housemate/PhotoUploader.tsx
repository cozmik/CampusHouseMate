import { useRef, useState } from "react";
import { ImagePlus, Link as LinkIcon, X, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface UploadingPhoto {
  url: string;
  file?: File;
}

export function PhotoUploader({ photos, onChange, max = 8 }: { photos: UploadingPhoto[]; onChange: (photos: UploadingPhoto[]) => void; max?: number }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState("");

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const next = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, max - photos.length)
      .map((f) => ({ url: URL.createObjectURL(f), file: f }));
    onChange([...photos, ...next]);
  };
  const addUrl = () => {
    const url = urlInput.trim();
    if (!url || photos.length >= max) return;
    onChange([...photos, { url }]);
    setUrlInput("");
  };
  const remove = (index: number) => onChange(photos.filter((_, i) => i !== index));
  const move = (index: number, dir: number) => {
    const target = index + dir;
    if (target < 0 || target >= photos.length) return;
    const next = [...photos];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {photos.map((p, i) => (
            <div key={i} className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-muted">
              <img src={p.url} alt="" className="h-full w-full object-cover" />
              {i === 0 && <span className="absolute left-1.5 top-1.5 rounded-full bg-foreground/70 px-2 py-0.5 text-[10px] font-semibold text-background">Cover</span>}
              <button type="button" onClick={() => remove(i)} className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-background/85 text-foreground shadow-sm backdrop-blur hover:bg-background" aria-label="Remove photo"><X className="h-4 w-4" /></button>
              {photos.length > 1 && (
                <div className="absolute bottom-1.5 right-1.5 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="grid h-6 w-6 place-items-center rounded-md bg-background/85 text-xs backdrop-blur disabled:opacity-30">‹</button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === photos.length - 1} className="grid h-6 w-6 place-items-center rounded-md bg-background/85 text-xs backdrop-blur disabled:opacity-30">›</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <div className={cn("flex flex-col gap-2 rounded-2xl border-2 border-dashed border-border bg-secondary/30 p-4 sm:flex-row sm:items-center", photos.length >= max && "opacity-50")}>
        <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={photos.length >= max} className="border-dashed">
          <ImagePlus className="h-4 w-4" /> Upload photos
        </Button>
        <div className="flex flex-1 items-center gap-2">
          <LinkIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Input value={urlInput} onChange={(e) => setUrlInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addUrl(); } }} placeholder="or paste an image URL" className="h-9" disabled={photos.length >= max} />
          <Button type="button" size="sm" variant="secondary" onClick={addUrl} disabled={!urlInput.trim() || photos.length >= max}>Add</Button>
        </div>
      </div>
      {photos.length === 0 && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><ImageOff className="h-3.5 w-3.5" />Add at least one photo so seekers can see the space.</p>
      )}
      <p className="text-xs text-muted-foreground">{photos.length}/{max} photos</p>
    </div>
  );
}
