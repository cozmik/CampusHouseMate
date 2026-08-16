import { Link } from "react-router-dom";
import { MessageSquare, Search } from "lucide-react";
import { useApp } from "@/lib/store";
import { Button } from "@housemates/shared-ui/button";
import { ConversationListItem } from "@/components/housemate/ConversationListItem";

export default function Messages() {
  const { getMyConversations } = useApp();
  const conversations = getMyConversations();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold sm:text-3xl">Messages</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your private chats about spaces.</p>
      </div>
      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border py-20 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-muted text-muted-foreground"><MessageSquare className="h-6 w-6" /></div>
          <h3 className="mt-4 text-lg font-semibold">No conversations yet</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">When you express interest in a space, your chats will show up here.</p>
          <Button asChild className="mt-5"><Link to="/browse"><Search className="h-4 w-4" />Browse spaces</Link></Button>
        </div>
      ) : (
        <div className="divide-y divide-border/60 overflow-hidden rounded-2xl bg-card shadow-card">
          {conversations.map((c) => (<ConversationListItem key={c.id} conversation={c} />))}
        </div>
      )}
    </div>
  );
}
