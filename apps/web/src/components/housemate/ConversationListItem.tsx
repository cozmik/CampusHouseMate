import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@housemates/shared-ui/avatar";
import { Badge } from "@housemates/shared-ui/badge";
import { useApp } from "@/lib/store";
import { cn } from "@housemates/shared-utils";
import { formatDate, timeAgo } from "@housemates/shared-utils";
import type { Conversation } from "@housemates/shared-types";

export function ConversationListItem({ conversation, isActive }: { conversation: Conversation; isActive?: boolean }) {
  const { getOtherParticipant, getListing, getMessages, currentUser } = useApp();
  const other = getOtherParticipant(conversation.id);
  const listing = getListing(conversation.listingId);
  const msgs = getMessages(conversation.id);
  const last = msgs[msgs.length - 1];
  const isContactShared = conversation.status === "contact_shared";

  const lastPreview = last
    ? last.type === "contact_share"
      ? "Contact details shared"
      : last.type === "system"
        ? last.content
        : `${last.senderId === currentUser?.id ? "You: " : ""}${last.content}`
    : "No messages yet";

  return (
    <Link to={`/messages/${conversation.id}`} className={cn("flex items-center gap-3 rounded-xl px-3 py-3 transition-colors", isActive ? "bg-accent" : "hover:bg-accent/60")}>
      <div className="relative">
        <Avatar className="h-12 w-12">
          <AvatarImage src={other?.avatarUrl} alt={other?.fullName} />
          <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">{other?.fullName?.[0] ?? "?"}</AvatarFallback>
        </Avatar>
        {isContactShared && (
          <span className="absolute -bottom-0.5 -right-0.5 grid h-5 w-5 place-items-center rounded-full bg-success text-[10px] font-bold text-success-foreground ring-2 ring-background">✓</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate font-semibold">{other?.fullName ?? "Unknown"}</span>
          <span className="shrink-0 text-[11px] text-muted-foreground">{last ? timeAgo(last.createdAt) : formatDate(conversation.createdAt)}</span>
        </div>
        <p className="truncate text-sm text-muted-foreground">{lastPreview}</p>
        {listing && (
          <Badge variant="secondary" className="mt-1 truncate text-[10px] font-normal">{listing.title}</Badge>
        )}
      </div>
    </Link>
  );
}
