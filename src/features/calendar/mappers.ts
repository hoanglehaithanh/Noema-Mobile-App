export type GoogleCalendarEvent = {
  id: string;
  summary?: string;
  start?: { date?: string; dateTime?: string };
  end?: { date?: string; dateTime?: string };
};

export type CalendarEvent = {
  id: string;
  summary: string;
  start: string;
  end: string;
  allDay: boolean;
};

export function mapGoogleEvent(event: GoogleCalendarEvent): CalendarEvent | null {
  const start = event.start?.dateTime ?? event.start?.date;
  const end = event.end?.dateTime ?? event.end?.date;

  if (!start || !end)
    return null;

  return {
    id: event.id,
    summary: event.summary?.trim() || 'Busy',
    start,
    end,
    allDay: !event.start?.dateTime,
  };
}
