import { cn } from "@housemates/shared-utils";

export function UnreadBadge({ count, className }: { count: number; className?: string }) {
  if (count <= 0) return null;
  return (
    <span
      className={cn(
        "grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-none text-destructive-foreground ring-2 ring-background",
        className,
      )}
    >
      {count > 9 ? "9+" : count}
      <span className="sr-only"> unread {count === 1 ? "conversation" : "conversations"}</span>
    </span>
  );
}
