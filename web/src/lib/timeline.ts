import type { TimelineEventInput } from "@d1/shared";

export function emitTimelineEvent(event: TimelineEventInput) {
  return {
    ...event,
    occurredAt: new Date().toISOString()
  };
}

