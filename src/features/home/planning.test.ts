import type { DailyCapacity, TaskBlock } from '@/types';

import { buildCapacityBuckets, findNextOpenSlot, getDoNextBlock, getLocalDateKey } from './planning';

describe('planning helpers', () => {
  it('builds capacity buckets from blocks', () => {
    const capacity: DailyCapacity = {
      id: 'cap-1',
      user_id: 'user-1',
      capacity_date: '2026-03-18',
      deep_minutes_budget: 240,
      shallow_minutes_budget: 120,
      admin_minutes_budget: 60,
      deep_minutes_planned: 0,
      shallow_minutes_planned: 0,
      admin_minutes_planned: 0,
      created_at: '2026-03-18T00:00:00Z',
      updated_at: '2026-03-18T00:00:00Z',
    };

    const blocks = [
      {
        id: 'block-1',
        user_id: 'user-1',
        task_id: 'task-1',
        title_snapshot: 'Deep Work',
        type_snapshot: 'deep',
        starts_at: '2026-03-18T09:00:00Z',
        ends_at: '2026-03-18T10:00:00Z',
        planned_minutes: 60,
        actual_minutes: null,
        status: 'planned',
        calendar_event_id: null,
        calendar_sync_status: 'pending',
        sync_error: null,
        created_at: '2026-03-18T00:00:00Z',
        updated_at: '2026-03-18T00:00:00Z',
      },
      {
        id: 'block-2',
        user_id: 'user-1',
        task_id: 'task-2',
        title_snapshot: 'Admin',
        type_snapshot: 'admin',
        starts_at: '2026-03-18T11:00:00Z',
        ends_at: '2026-03-18T11:30:00Z',
        planned_minutes: 30,
        actual_minutes: null,
        status: 'planned',
        calendar_event_id: null,
        calendar_sync_status: 'pending',
        sync_error: null,
        created_at: '2026-03-18T00:00:00Z',
        updated_at: '2026-03-18T00:00:00Z',
      },
    ] satisfies TaskBlock[];

    expect(buildCapacityBuckets(capacity, blocks)).toEqual([
      { type: 'deep', budget: 240, planned: 60, remaining: 180 },
      { type: 'shallow', budget: 120, planned: 0, remaining: 120 },
      { type: 'admin', budget: 60, planned: 30, remaining: 30 },
    ]);
  });

  it('returns the current block before future blocks', () => {
    const blocks = [
      {
        id: 'current',
        user_id: 'user-1',
        task_id: 'task-1',
        title_snapshot: 'Current',
        type_snapshot: 'deep',
        starts_at: '2026-03-18T09:00:00Z',
        ends_at: '2026-03-18T10:00:00Z',
        planned_minutes: 60,
        actual_minutes: null,
        status: 'active',
        calendar_event_id: null,
        calendar_sync_status: 'pending',
        sync_error: null,
        created_at: '2026-03-18T00:00:00Z',
        updated_at: '2026-03-18T00:00:00Z',
      },
      {
        id: 'next',
        user_id: 'user-1',
        task_id: 'task-2',
        title_snapshot: 'Next',
        type_snapshot: 'shallow',
        starts_at: '2026-03-18T10:15:00Z',
        ends_at: '2026-03-18T10:45:00Z',
        planned_minutes: 30,
        actual_minutes: null,
        status: 'planned',
        calendar_event_id: null,
        calendar_sync_status: 'pending',
        sync_error: null,
        created_at: '2026-03-18T00:00:00Z',
        updated_at: '2026-03-18T00:00:00Z',
      },
    ] satisfies TaskBlock[];

    expect(getDoNextBlock(blocks, new Date('2026-03-18T09:30:00Z'))?.id).toBe('current');
  });

  it('finds the next open slot around busy time', () => {
    const slot = findNextOpenSlot({
      day: '2026-03-18',
      durationMinutes: 60,
      now: new Date('2026-03-18T08:50:00'),
      events: [
        {
          id: 'meeting',
          summary: 'Meeting',
          start: '2026-03-18T09:00:00',
          end: '2026-03-18T10:00:00',
          allDay: false,
        },
      ],
      blocks: [],
    });

    expect(slot && getLocalDateKey(slot)).toBe('2026-03-18');
    expect(slot?.getHours()).toBe(10);
    expect(slot?.getMinutes()).toBe(0);
  });
});
