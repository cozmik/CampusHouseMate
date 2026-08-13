import { useState } from "react";
import { ChevronLeft, ChevronRight, BedDouble, Expand } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ListingPhoto } from "@/lib/types";

export function PhotoGallery({
  photos,
  alt,
  className,
}: {
  photos: ListingPhoto[];
  alt?: string;
  className?: string;
}) {
  const [active, setActive] = useState(0);
  const sorted = [...photos].sort((a, b) => a.position - b.position);
  const count = sorted.length;
  const current = sorted[active];
  const go = (dir: number) => { if (count === 0) return; setActive((a) => (a + dir + count) % count); };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-muted">
        {current ? (
          <img
            src={current.url}
            alt={alt ? `${alt} — photo ${active + 1}` : `Listing photo ${active + 1}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-muted-foreground">
            <BedDouble className="h-12 w-12" />
          </div>
        )}
        {count > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} className="absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-background/85 backdrop-blur transition-colors hover:bg-background" aria-label="Previous photo">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => go(1)} className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-background/85 backdrop-blur transition-colors hover:bg-background" aria-label="Next photo">
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-foreground/70 px-2.5 py-1 text-xs font-medium text-background backdrop-blur">
              <Expand className="h-3 w-3" />{active + 1} / {count}
            </div>
          </>
        )}
      </div>
      {count > 1 && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {sorted.map((p, i) => (
            <button key={p.id} type="button" onClick={() => setActive(i)} className={cn("relative h-16 w-20 shrink-0 overflow-hidden rounded-lg ring-2 transition-all", i === active ? "ring-primary" : "ring-transparent opacity-70 hover:opacity-100")}>
              <img src={p.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
