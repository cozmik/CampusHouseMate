import { Phone, MessageCircle, ShieldCheck } from "lucide-react";
import { cn } from "@housemates/shared-utils";
import { formatTime } from "@housemates/shared-utils";
import type { Message } from "@housemates/shared-types";

function normalizePhone(raw: string): string {
  return raw.replace(/[^\d+]/g, "");
}
function toWhatsApp(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("234")) return digits;
  if (digits.startsWith("0")) digits = "234" + digits.slice(1);
  return digits;
}

export function ChatBubble({ message, isOwn, senderFirstName }: { message: Message; isOwn: boolean; senderFirstName?: string }) {
  if (message.type === "system") {
    return (
      <div className="my-2 flex justify-center">
        <span className="rounded-full bg-muted px-3 py-1 text-center text-xs text-muted-foreground">{message.content}</span>
      </div>
    );
  }

  if (message.type === "contact_share") {
    const parts = message.content.split("•").map((s) => s.trim()).filter(Boolean);
    const primary = parts[0] ?? "";
    return (
      <div className={cn("my-1 flex", isOwn ? "justify-end" : "justify-start")}>
        <div className={cn("max-w-[80%] rounded-2xl border p-3 shadow-card", isOwn ? "rounded-br-md border-primary/30 bg-primary/5" : "rounded-bl-md border-border bg-card")}>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-primary">
            <ShieldCheck className="h-4 w-4" />
            {isOwn ? "You shared your contact" : `${senderFirstName ?? "They"} shared their contact`}
          </div>
          <div className="space-y-1">
            {parts.map((p, i) => (<p key={i} className="text-sm font-medium">{p}</p>))}
          </div>
          {primary && (
            <div className="mt-3 flex gap-2">
              <a href={`tel:${normalizePhone(primary)}`} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-foreground/[0.06] px-3 py-2 text-xs font-semibold hover:bg-foreground/10">
                <Phone className="h-3.5 w-3.5" /> Call
              </a>
              <a href={`https://wa.me/${toWhatsApp(primary)}`} target="_blank" rel="noreferrer" className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-success/15 px-3 py-2 text-xs font-semibold text-success hover:bg-success/25">
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("my-1 flex", isOwn ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[78%] rounded-2xl px-3.5 py-2 text-sm shadow-sm", isOwn ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-card border border-border")}>
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <p className={cn("mt-1 text-[10px]", isOwn ? "text-primary-foreground/70" : "text-muted-foreground")}>{formatTime(message.createdAt)}</p>
      </div>
    </div>
  );
}
