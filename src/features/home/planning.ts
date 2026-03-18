import type { CalendarEvent } from '@/features/calendar/mappers';
import type { DailyCapacity, Task, TaskBlock, TaskType } from '@/types';

export type TimelineItem =
  | { id: string; kind: 'calendar'; title: string; start: string; end: string; allDay: boolean }
  | { id: string; kind: 'task_block'; title: string; start: string; end: string; status: TaskBlock['status']; type: TaskType };

export type CapacityBucket = {
  type: TaskType;
  budget: number;
  planned: number;
  remaining: number;
};

export function getLocalDateKey(input: Date | string = new Date()) {
  const date = typeof input === 'string' ? new Date(input) : input;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addMinutes(input: Date, minutes: number) {
  return new Date(input.getTime() + minutes * 60_000);
}

export function buildTimelineItems(
  events: CalendarEvent[],
  blocks: TaskBlock[],
): TimelineItem[] {
  return [
    ...events.map(event => ({
      id: event.id,
      kind: 'calendar' as const,
      title: event.summary,
      start: event.start,
      end: event.end,
      allDay: event.allDay,
    })),
    ...blocks.map(block => ({
      id: block.id,
      kind: 'task_block' as const,
      title: block.title_snapshot,
      start: block.starts_at,
      end: block.ends_at,
      status: block.status,
      type: block.type_snapshot,
    })),
  ].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}

export function buildCapacityBuckets(
  capacity: DailyCapacity | null | undefined,
  blocks: TaskBlock[],
): CapacityBucket[] {
  const planned = {
    deep: 0,
    shallow: 0,
    admin: 0,
  };

  for (const block of blocks) {
    planned[block.type_snapshot] += block.planned_minutes;
  }

  return [
    {
      type: 'deep',
      budget: capacity?.deep_minutes_budget ?? 240,
      planned: planned.deep,
      remaining: (capacity?.deep_minutes_budget ?? 240) - planned.deep,
    },
    {
      type: 'shallow',
      budget: capacity?.shallow_minutes_budget ?? 120,
      planned: planned.shallow,
      remaining: (capacity?.shallow_minutes_budget ?? 120) - planned.shallow,
    },
    {
      type: 'admin',
      budget: capacity?.admin_minutes_budget ?? 60,
      planned: planned.admin,
      remaining: (capacity?.admin_minutes_budget ?? 60) - planned.admin,
    },
  ];
}

export function getDoNextBlock(
  blocks: TaskBlock[],
  now = new Date(),
) {
  const sorted = [...blocks].sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());

  const current = sorted.find((block) => {
    const start = new Date(block.starts_at).getTime();
    const end = new Date(block.ends_at).getTime();
    const nowMs = now.getTime();
    return nowMs >= start && nowMs < end && block.status !== 'completed' && block.status !== 'skipped';
  });

  if (current)
    return current;

  return sorted.find(block => new Date(block.starts_at).getTime() >= now.getTime() && block.status !== 'completed' && block.status !== 'skipped') ?? null;
}

export function getUnscheduledTasks(
  tasks: Task[],
  blocks: TaskBlock[],
  planningDate: string,
) {
  const blockedTaskIds = new Set(blocks.map(block => block.task_id));
  return tasks
    .filter(task => task.status !== 'done' && task.status !== 'archived')
    .filter(task => !task.planning_date || task.planning_date === planningDate)
    .filter(task => !blockedTaskIds.has(task.id))
    .sort((a, b) => {
      const priorityWeight = { high: 0, medium: 1, low: 2 };
      return priorityWeight[a.priority] - priorityWeight[b.priority];
    });
}

function overlaps(start: Date, end: Date, busyStart: Date, busyEnd: Date) {
  return start < busyEnd && end > busyStart;
}

export function findNextOpenSlot({
  day,
  durationMinutes,
  events,
  blocks,
  now = new Date(),
}: {
  day: string;
  durationMinutes: number;
  events: CalendarEvent[];
  blocks: TaskBlock[];
  now?: Date;
}) {
  const dayStart = new Date(`${day}T06:00:00`);
  const dayEnd = new Date(`${day}T22:00:00`);
  const searchStart = now > dayStart ? now : dayStart;
  const roundedStart = new Date(searchStart);
  roundedStart.setMinutes(Math.ceil(roundedStart.getMinutes() / 15) * 15, 0, 0);

  const busySlots = [
    ...events
      .filter(event => !event.allDay)
      .map(event => ({
        start: new Date(event.start),
        end: new Date(event.end),
      })),
    ...blocks.map(block => ({
      start: new Date(block.starts_at),
      end: new Date(block.ends_at),
    })),
  ];

  for (let cursor = new Date(roundedStart); cursor < dayEnd; cursor = addMinutes(cursor, 15)) {
    const candidateEnd = addMinutes(cursor, durationMinutes);
    if (candidateEnd > dayEnd)
      return null;

    const blocked = busySlots.some(slot => overlaps(cursor, candidateEnd, slot.start, slot.end));
    if (!blocked)
      return cursor;
  }

  return null;
}
