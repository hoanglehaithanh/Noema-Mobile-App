import type { CreateTaskBlockInput, TaskBlock, TaskType, UpdateTaskBlockInput } from '@/types';

import { createMutation, createQuery } from 'react-query-kit';
import { createCalendarTaskEvent, deleteCalendarTaskEvent, updateCalendarTaskEvent } from '@/features/calendar/api';
import { getLocalDateKey } from '@/features/home/planning';
import { queryDiskCacheMiddleware } from '@/lib/query-disk-cache-middleware';
import { supabase } from '@/lib/supabase';

function addMinutes(value: string, minutes: number) {
  return new Date(new Date(value).getTime() + minutes * 60_000).toISOString();
}

async function getSessionUserId() {
  const { data: { session } } = await supabase.auth.getSession();
  return session!.user.id;
}

async function recalculateDailyCapacity(userId: string, date: string) {
  const start = `${date}T00:00:00`;
  const end = `${date}T23:59:59.999`;
  const { data: blocks, error } = await supabase
    .from('task_blocks')
    .select('planned_minutes, type_snapshot')
    .gte('starts_at', start)
    .lte('starts_at', end);

  if (error)
    throw error;

  const planned = {
    deep: 0,
    shallow: 0,
    admin: 0,
  } as Record<TaskType, number>;

  for (const block of blocks ?? []) {
    planned[block.type_snapshot as TaskType] += Number(block.planned_minutes ?? 0);
  }

  const { error: upsertError } = await supabase
    .from('daily_capacity')
    .upsert({
      user_id: userId,
      capacity_date: date,
      deep_minutes_planned: planned.deep,
      shallow_minutes_planned: planned.shallow,
      admin_minutes_planned: planned.admin,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,capacity_date' });

  if (upsertError)
    throw upsertError;
}

export const useTaskBlocks = createQuery<TaskBlock[], { date: string }>({
  queryKey: ['task_blocks'],
  use: [queryDiskCacheMiddleware],
  fetcher: async (variables) => {
    const start = `${variables.date}T00:00:00`;
    const end = `${variables.date}T23:59:59.999`;
    const { data, error } = await supabase
      .from('task_blocks')
      .select('*')
      .gte('starts_at', start)
      .lte('starts_at', end)
      .order('starts_at', { ascending: true });
    if (error)
      throw error;
    return data as TaskBlock[];
  },
});

export const useCreateTaskBlock = createMutation<TaskBlock, CreateTaskBlockInput>({
  mutationFn: async (variables) => {
    const userId = await getSessionUserId();
    const endsAt = addMinutes(variables.starts_at, variables.planned_minutes);

    const { data, error } = await supabase
      .from('task_blocks')
      .insert({
        ...variables,
        user_id: userId,
        ends_at: endsAt,
        status: variables.status ?? 'planned',
      })
      .select()
      .single();

    if (error)
      throw error;

    let block = data as TaskBlock;
    try {
      const calendarEventId = await createCalendarTaskEvent(
        {
          summary: block.title_snapshot,
          description: `${block.type_snapshot} work block`,
          start: block.starts_at,
          end: block.ends_at,
        },
        block.id,
      );

      const { data: syncedBlock, error: syncError } = await supabase
        .from('task_blocks')
        .update({
          calendar_event_id: calendarEventId,
          calendar_sync_status: 'synced',
          sync_error: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', block.id)
        .select()
        .single();

      if (syncError)
        throw syncError;

      block = syncedBlock as TaskBlock;
    }
    catch (error) {
      const message = error instanceof Error ? error.message : 'Calendar sync failed';
      const { data: failedBlock } = await supabase
        .from('task_blocks')
        .update({
          calendar_sync_status: 'failed',
          sync_error: message,
          updated_at: new Date().toISOString(),
        })
        .eq('id', block.id)
        .select()
        .single();

      block = (failedBlock ?? block) as TaskBlock;
    }

    await recalculateDailyCapacity(userId, getLocalDateKey(block.starts_at));
    return block;
  },
});

export const useUpdateTaskBlock = createMutation<TaskBlock, { id: string } & UpdateTaskBlockInput>({
  mutationFn: async ({ id, ...updates }) => {
    const userId = await getSessionUserId();
    const { data: existing, error: existingError } = await supabase
      .from('task_blocks')
      .select('*')
      .eq('id', id)
      .single();

    if (existingError)
      throw existingError;

    const current = existing as TaskBlock;
    const nextStartsAt = updates.starts_at ?? current.starts_at;
    const nextPlannedMinutes = updates.planned_minutes ?? current.planned_minutes;
    const nextEndsAt = updates.ends_at ?? addMinutes(nextStartsAt, nextPlannedMinutes);

    const payload = {
      ...updates,
      starts_at: nextStartsAt,
      ends_at: nextEndsAt,
      calendar_sync_status: current.calendar_event_id ? current.calendar_sync_status : 'pending',
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('task_blocks')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error)
      throw error;

    let block = data as TaskBlock;
    try {
      if (block.calendar_event_id) {
        await updateCalendarTaskEvent(block.calendar_event_id, {
          summary: block.title_snapshot,
          description: `${block.type_snapshot} work block`,
          start: block.starts_at,
          end: block.ends_at,
        });
      }
      else {
        const calendarEventId = await createCalendarTaskEvent(
          {
            summary: block.title_snapshot,
            description: `${block.type_snapshot} work block`,
            start: block.starts_at,
            end: block.ends_at,
          },
          block.id,
        );

        block.calendar_event_id = calendarEventId;
      }

      const { data: syncedBlock } = await supabase
        .from('task_blocks')
        .update({
          calendar_event_id: block.calendar_event_id,
          calendar_sync_status: 'synced',
          sync_error: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', block.id)
        .select()
        .single();

      block = (syncedBlock ?? block) as TaskBlock;
    }
    catch (error) {
      const message = error instanceof Error ? error.message : 'Calendar sync failed';
      const { data: failedBlock } = await supabase
        .from('task_blocks')
        .update({
          calendar_sync_status: 'failed',
          sync_error: message,
          updated_at: new Date().toISOString(),
        })
        .eq('id', block.id)
        .select()
        .single();

      block = (failedBlock ?? block) as TaskBlock;
    }

    await recalculateDailyCapacity(userId, getLocalDateKey(current.starts_at));
    if (getLocalDateKey(current.starts_at) !== getLocalDateKey(block.starts_at))
      await recalculateDailyCapacity(userId, getLocalDateKey(block.starts_at));

    return block;
  },
});

export const useDeleteTaskBlock = createMutation<void, { id: string }>({
  mutationFn: async ({ id }) => {
    const userId = await getSessionUserId();
    const { data: existing, error } = await supabase
      .from('task_blocks')
      .select('*')
      .eq('id', id)
      .single();

    if (error)
      throw error;

    const block = existing as TaskBlock;
    if (block.calendar_event_id) {
      try {
        await deleteCalendarTaskEvent(block.calendar_event_id);
      }
      catch {
        // Delete the local block even if the remote event was already removed.
      }
    }

    const { error: deleteError } = await supabase
      .from('task_blocks')
      .delete()
      .eq('id', id);

    if (deleteError)
      throw deleteError;

    await recalculateDailyCapacity(userId, getLocalDateKey(block.starts_at));
  },
});
