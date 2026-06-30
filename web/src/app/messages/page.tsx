import { Inbox, MessageCircle, ShieldCheck, UserRound } from "lucide-react";
import { recordUnavailableAction } from "@/app/actions/public-profile-actions";
import { AppShell } from "@/components/app-shell";
import { ActivityItem, Badge, Button, Card, PageHeader, SectionTitle, StatCard } from "@/components/design-system";
import { getMessages } from "@/lib/data/services";

const statusCopy: Record<string, string> = {
  "new-message-unavailable": "New outbound messages are intentionally unavailable until the D1 inbox backend is connected."
};

export default async function MessagesPage({ searchParams }: { searchParams?: Promise<{ status?: string }> }) {
  const params = searchParams ? await searchParams : {};
  const messages = getMessages();
  const unread = messages.reduce((sum, message) => sum + message.unreadCount, 0);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Unified inbox"
        title="Messages"
        description="Coach, recruiter, athlete, parent, and D1 ops conversations in one polished, auditable inbox."
        action={
          <form action={recordUnavailableAction}>
            <input type="hidden" name="returnTo" value="/messages" />
            <input type="hidden" name="action" value="new-message" />
            <Button variant="primary"><MessageCircle size={17} /> New Message</Button>
          </form>
        }
      />
      {params.status && statusCopy[params.status] ? (
        <div className="mb-6 rounded-2xl border border-[#F7DC67] bg-[#FFF5C7] px-4 py-3 text-sm font-black text-[#745E00]" role="status">
          {statusCopy[params.status]}
        </div>
      ) : null}
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <Card>
          <SectionTitle title="Priority Threads" action={<Badge tone="blue">{unread} unread</Badge>} />
          {messages.map((message) => (
            <ActivityItem
              key={message.id}
              icon={message.participantRole === "coach" ? UserRound : message.participantRole === "ops" ? ShieldCheck : Inbox}
              title={message.participantName}
              detail={message.latestMessage}
              meta={message.lastMessageAt}
              tone={message.participantRole === "coach" ? "green" : message.participantRole === "ops" ? "yellow" : "blue"}
            />
          ))}
          {!messages.length ? (
            <p className="rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] p-4 text-sm font-semibold text-[#66718F]">No messages yet.</p>
          ) : null}
        </Card>
        <div className="grid gap-4">
          <StatCard label="Unread" value={`${unread}`} detail="Unread messages from real D1 inbox threads." icon={Inbox} />
          <StatCard label="Response SLA" value="N/A" detail="Response timing appears after real conversations exist." icon={MessageCircle} tone="silver" />
        </div>
      </div>
    </AppShell>
  );
}
