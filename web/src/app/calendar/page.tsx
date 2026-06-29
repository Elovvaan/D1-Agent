import { CalendarDays, MapPin, Radio, Trophy } from "lucide-react";
import { recordUnavailableAction } from "@/app/actions/public-profile-actions";
import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card, ObjectList, PageHeader, SectionTitle, StatCard } from "@/components/design-system";
import { getCalendarEvents, toTitle } from "@/lib/data/services";

const statusCopy: Record<string, string> = {
  "add-event-unavailable": "Adding calendar events is intentionally unavailable until saved user calendar state is connected."
};

export default async function CalendarPage({ searchParams }: { searchParams?: Promise<{ status?: string }> }) {
  const params = searchParams ? await searchParams : {};
  const events = getCalendarEvents();

  return (
    <AppShell>
      <PageHeader
        eyebrow="Events"
        title="Calendar"
        description="Games, camps, showcases, visits, stream schedules, and Agent-recommended deadlines in one recruiting calendar."
        action={
          <form action={recordUnavailableAction}>
            <input type="hidden" name="returnTo" value="/calendar" />
            <input type="hidden" name="action" value="add-event" />
            <Button variant="cta"><CalendarDays size={17} /> Add Event</Button>
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
          <SectionTitle title="Upcoming Schedule" action={<Badge tone="blue">{events.length} priority events</Badge>} />
          <ObjectList
            items={events.map((event) => ({
              title: event.title,
              detail: `${event.month} ${event.day} - ${event.detail}`,
              badge: toTitle(event.kind),
              icon: event.kind === "live_stream" ? Radio : event.kind === "camp" ? Trophy : event.kind === "visit" ? MapPin : CalendarDays,
              tone: event.kind === "camp" ? "yellow" : event.kind === "event" ? "green" : "blue"
            }))}
          />
        </Card>
        <div className="grid gap-4">
          <StatCard label="Games" value={`${events.filter((event) => event.kind === "live_stream").length}`} detail="Tied to stream or upload workflows." icon={Radio} />
          <StatCard label="Showcases" value={`${events.filter((event) => event.kind === "camp" || event.kind === "event").length}`} detail="Agent ranked by recruiting impact." icon={Trophy} tone="yellow" />
          <StatCard label="Visits" value={`${events.filter((event) => event.kind === "visit").length}`} detail="State University official visit." icon={MapPin} tone="green" />
        </div>
      </div>
    </AppShell>
  );
}
