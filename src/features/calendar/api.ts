import type { CalendarEvent, GoogleCalendarEvent } from './mappers';
import { createQuery } from 'react-query-kit';
import { supabase } from '@/lib/supabase';
import { mapGoogleEvent } from './mappers';

function getDateBounds(dateInput?: string) {
  const baseDate = dateInput ? new Date(`${dateInput}T00:00:00`) : new Date();
  const start = new Date(baseDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return {
    startIso: start.toISOString(),
    endIso: end.toISOString(),
  };
}

type CalendarEventPayload = {
  summary: string;
  description?: string;
  start: string;
  end: string;
};

async function getGoogleProviderToken() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error)
    throw error;

  if (!session)
    return null;

  if (session.provider_token)
    return session.provider_token;

  const { data, error: refreshError } = await supabase.auth.refreshSession();
  if (refreshError)
    throw refreshError;

  return data.session?.provider_token ?? null;
}

async function calendarRequest<T>(
  path: string,
  init?: RequestInit,
) {
  const providerToken = await getGoogleProviderToken();
  if (!providerToken)
    throw new Error('Google Calendar is not connected');

  const response = await fetch(`https://www.googleapis.com/calendar/v3${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${providerToken}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Calendar request failed: ${errorText}`);
  }

  if (response.status === 204)
    return null as T;

  return await response.json() as T;
}

export const usePrimaryCalendarEvents = createQuery<CalendarEvent[], { date?: string }>({
  queryKey: ['calendar_primary_events'],
  fetcher: async (variables) => {
    const isConnected = await getGoogleProviderToken();
    if (!isConnected)
      return [];

    const { startIso, endIso } = getDateBounds(variables.date);
    const params = new URLSearchParams({
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '20',
      timeMin: startIso,
      timeMax: endIso,
    });

    const payload = await calendarRequest<{ items?: GoogleCalendarEvent[] }>(
      `/calendars/primary/events?${params.toString()}`,
    );
    return (payload.items ?? [])
      .map(mapGoogleEvent)
      .filter((event): event is CalendarEvent => Boolean(event));
  },
});

export async function createCalendarTaskEvent(
  payload: CalendarEventPayload,
  blockId: string,
) {
  const response = await calendarRequest<GoogleCalendarEvent>(
    '/calendars/primary/events',
    {
      method: 'POST',
      body: JSON.stringify({
        summary: payload.summary,
        description: payload.description,
        start: { dateTime: payload.start },
        end: { dateTime: payload.end },
        extendedProperties: {
          private: {
            noema_task_block_id: blockId,
          },
        },
      }),
    },
  );

  return response.id;
}

export async function updateCalendarTaskEvent(
  eventId: string,
  payload: CalendarEventPayload,
) {
  await calendarRequest(
    `/calendars/primary/events/${eventId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        summary: payload.summary,
        description: payload.description,
        start: { dateTime: payload.start },
        end: { dateTime: payload.end },
      }),
    },
  );
}

export async function deleteCalendarTaskEvent(eventId: string) {
  await calendarRequest(
    `/calendars/primary/events/${eventId}`,
    { method: 'DELETE' },
  );
}
