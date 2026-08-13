import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send, ShieldCheck, Share2, Check, ExternalLink, Loader2, Flag } from "lucide-react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatBubble } from "@/components/housemate/ChatBubble";
import { ConversationListItem } from "@/components/housemate/ConversationListItem";
import { ReportDialog } from "@/components/housemate/ReportDialog";
import { initials } from "@/lib/format";

export default function Conversation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getConversation, getMessages, getOtherParticipant, getListing, fetchListingById, sendMessage, shareContact, fetchMessages, subscribeMessages, getMyConversations, currentUser } = useApp();

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const conversation = id ? getConversation(id) : undefined;
  const messages = id ? getMessages(id) : [];
  const other = id ? getOtherParticipant(id) : undefined;
  const listing = conversation ? getListing(conversation.listingId) : undefined;
  const conversations = getMyConversations();
  const isContactShared = conversation?.status === "contact_shared";
  const alreadyShared = messages.some((m) => m.type === "contact_share" && m.senderId === currentUser?.id);

  useEffect(() => {
    if (!id) return;
    void fetchMessages(id);
    const unsub = subscribeMessages(id);
    return unsub;
  }, [id, fetchMessages, subscribeMessages]);

  useEffect(() => {
    if (!conversation?.listingId || listing) return;
    void fetchListingById(conversation.listingId);
  }, [conversation?.listingId, listing, fetchListingById]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  if (!conversation || !currentUser) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Conversation not found</h1>
        <Button asChild className="mt-6"><Link to="/messages">Back to messages</Link></Button>
      </div>
    );
  }

  const onSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    const content = text;
    setText("");
    await sendMessage(conversation.id, content);
    setSending(false);
  };

  const onShare = async () => {
    await shareContact(conversation.id);
  };

  return (
    <div className="mx-auto max-w-6xl px-0 lg:px-4">
      <div className="lg:grid lg:grid-cols-[320px_1fr] lg:gap-4">
        <aside className="hidden lg:block">
          <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card">
            <div className="border-b border-border/60 px-4 py-3"><p className="font-semibold">Messages</p></div>
            <div className="max-h-[calc(100vh-12rem)] overflow-y-auto">
              {conversations.map((c) => (<div key={c.id} className="border-b border-border/60 last:border-0"><ConversationListItem conversation={c} isActive={c.id === conversation.id} /></div>))}
            </div>
          </div>
        </aside>

        <section className="flex h-[calc(100dvh-12rem)] flex-col overflow-hidden bg-card lg:h-[calc(100vh-6rem)] lg:rounded-2xl lg:border lg:border-border/70 lg:shadow-card">
          <header className="flex items-center gap-3 border-b border-border/70 bg-card px-3 py-2.5 lg:rounded-t-2xl">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => navigate("/messages")}><ArrowLeft className="h-5 w-5" /></Button>
            <Avatar className="h-9 w-9">
              <AvatarImage src={other?.avatarUrl} alt={other?.fullName} />
              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">{other ? initials(other.fullName) : "?"}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{other?.fullName ?? "Unknown"}</p>
              {listing && (
                <Link to={`/listings/${listing.id}`} className="flex items-center gap-1 truncate text-xs text-muted-foreground hover:text-primary">
                  <span className="truncate">{listing.title}</span><ExternalLink className="h-3 w-3 shrink-0" />
                </Link>
              )}
            </div>
            {isContactShared && (
              <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-1 text-xs font-semibold text-success"><Check className="h-3 w-3" />Contact shared</span>
            )}
            {other && (
              <ReportDialog
                targetType="user"
                targetId={other.id}
                contextLabel={other.fullName}
                trigger={
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive" aria-label="Report user">
                    <Flag className="h-4 w-4" />
                  </Button>
                }
              />
            )}
          </header>

          <div ref={scrollRef} className="flex-1 space-y-1 overflow-y-auto bg-secondary/20 px-3 py-4">
            <div className="mx-auto mb-3 max-w-md rounded-xl border border-border bg-card p-3 text-center text-xs text-muted-foreground">
              <ShieldCheck className="mx-auto mb-1 h-4 w-4 text-primary" />Be careful. Meet in person before paying. Share contact only when you're comfortable.
            </div>
            {messages.length === 0 ? (
              <div className="grid place-items-center py-10 text-sm text-muted-foreground">
                <Loader2 className="mb-2 h-5 w-5 animate-spin" />Loading messages…
              </div>
            ) : (
              messages.map((m) => (<ChatBubble key={m.id} message={m} isOwn={m.senderId === currentUser.id} senderFirstName={other?.fullName.split(" ")[0]} />))
            )}
          </div>

          <div className="border-t border-border/70 bg-card px-3 pt-2">
            {!isContactShared ? (
              <button type="button" onClick={onShare} disabled={alreadyShared} className="flex w-full items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2 text-left transition-colors hover:bg-primary/10 disabled:opacity-60">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Share2 className="h-4 w-4" /></span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-primary">{alreadyShared ? "Waiting for them to share" : "Share your contact"}</span>
                  <span className="block text-xs text-muted-foreground">{alreadyShared ? "You've shared yours — you'll see theirs once they tap share." : "Reveal your phone & WhatsApp so you both can move off-app."}</span>
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-2 rounded-xl bg-success/10 px-3 py-2 text-xs text-success"><Check className="h-4 w-4 shrink-0" />Contact details have been shared — check the chat above.</div>
            )}
          </div>

          <div className="flex items-center gap-2 border-t border-border/70 bg-card p-3 lg:rounded-b-2xl">
            <Input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void onSend(); } }} placeholder="Type a message…" className="h-10 rounded-full" />
            <Button size="icon" className="h-10 w-10 shrink-0 rounded-full" onClick={() => void onSend()} disabled={!text.trim() || sending}><Send className="h-4 w-4" /></Button>
          </div>
        </section>
      </div>
    </div>
  );
}
