import { Bell, CalendarDays, Inbox, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge, Card, ObjectList, PageHeader, SectionTitle, StatCard } from "@/components/design-system";
import { getCalendarEvents, getMessages } from "@/lib/data/services";

export default function NotificationsPage() {
  const messages = getMessages();
  const events = getCalendarEvents();
  const unreadMessages = messages.reduce((sum, message) => sum + message.unreadCount, 0);

  const items = [
    ...messages.slice(0, 3).map((message) => ({
      title: message.participantName,
      detail: message.latestMessage,
      badge: message.unreadCount ? `${message.unreadCount} unread` : "Inbox",
      icon: Inbox,
      tone: message.unreadCount ? "yellow" as const : "blue" as const
    })),
    ...events.slice(0, 3).map((event) => ({
      title: event.title,
      detail: `${event.month} ${event.day} - ${event.detail}`,
      badge: "Calendar",
      icon: CalendarDays,
      tone: "green" as const
    }))
  ];

  return (
    <AppShell>
      <PageHeader
        eyebrow="Account"
        title="Notifications"
        description="Role alerts, inbox updates, review notices, calendar reminders, and platform signals in one place."
        action={<Badge tone="blue">Unified alerts</Badge>}
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <Card>
          <SectionTitle title="Latest Alerts" action={<Badge tone="silver">{items.length} visible</Badge>} />
          {items.length ? (
            <ObjectList items={items} />
          ) : (
            <p className="rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] p-4 text-sm font-semibold text-[#66718F]">No notifications yet.</p>
          )}
        </Card>
        <div className="grid h-fit gap-4">
          <StatCard label="Unread" value={`${unreadMessages}`} detail="Unread inbox notifications." icon={Inbox} />
          <StatCard label="Calendar" value={`${events.length}`} detail="Upcoming event signals." icon={CalendarDays} tone="green" />
          <StatCard label="Reviews" value="0" detail="Verification and moderation alerts." icon={ShieldCheck} tone="yellow" />
          <StatCard label="System" value="OK" detail="No platform health alerts shown." icon={Bell} tone="silver" />
        </div>
      </div>
    </AppShell>
  );
}
