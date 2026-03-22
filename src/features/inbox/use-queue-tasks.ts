import type { Task } from '@/types';

import * as React from 'react';

import { getLocalDateKey } from '@/features/home/planning';
import { useTasks } from '@/features/tasks/api';
import { useTaskBlocks } from '@/features/tasks/blocks-api';

const PRIORITY_ORDER: Record<Task['priority'], number> = {
  high: 0,
  medium: 1,
  low: 2,
};

function sortQueueTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const pa = PRIORITY_ORDER[a.priority] ?? 1;
    const pb = PRIORITY_ORDER[b.priority] ?? 1;
    if (pa !== pb)
      return pa - pb;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export type BuildQueueTasksInput = {
  strictInbox: Task[] | undefined;
  dayTasks: Task[] | undefined;
  todayBlocks: { task_id: string }[] | undefined;
  todayKey: string;
};

/**
 * Tasks that belong on the Queue tab: strict inbox, plus planned/active items for
 * today that are not yet placed on the calendar (no task block today).
 */
export function buildQueueTasks({
  strictInbox,
  dayTasks,
  todayBlocks,
  todayKey,
}: BuildQueueTasksInput): Task[] {
  const blocked = new Set((todayBlocks ?? []).map(b => b.task_id));
  const map = new Map<string, Task>();

  for (const t of strictInbox ?? []) {
    map.set(t.id, t);
  }

  for (const t of dayTasks ?? []) {
    if (t.status !== 'planned' && t.status !== 'active')
      continue;
    if (blocked.has(t.id))
      continue;
    if (t.planning_date != null && t.planning_date !== todayKey)
      continue;
    map.set(t.id, t);
  }

  return sortQueueTasks(Array.from(map.values()));
}

export function useQueueTasks() {
  const todayKey = getLocalDateKey();
  const {
    data: strictInbox,
    isLoading: loadingInbox,
    refetch: refetchInbox,
    isRefetching: refetchingInbox,
  } = useTasks({ variables: { status: 'inbox' } });
  const {
    data: dayTasks,
    isLoading: loadingDay,
    refetch: refetchDayTasks,
    isRefetching: refetchingDayTasks,
  } = useTasks({ variables: { date: todayKey } });
  const {
    data: todayBlocks,
    isLoading: loadingBlocks,
    refetch: refetchBlocks,
    isRefetching: refetchingBlocks,
  } = useTaskBlocks({ variables: { date: todayKey } });

  const tasks = React.useMemo(
    () =>
      buildQueueTasks({
        strictInbox,
        dayTasks,
        todayBlocks,
        todayKey,
      }),
    [strictInbox, dayTasks, todayBlocks, todayKey],
  );

  const isLoading = loadingInbox || loadingDay || loadingBlocks;
  const isRefetching = refetchingInbox || refetchingDayTasks || refetchingBlocks;

  const refetch = React.useCallback(() => {
    return Promise.all([refetchInbox(), refetchDayTasks(), refetchBlocks()]);
  }, [refetchBlocks, refetchDayTasks, refetchInbox]);

  return {
    tasks,
    todayKey,
    isLoading,
    isRefetching,
    refetch,
  };
}
