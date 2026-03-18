import type { TaskType } from './task';

export type TaskBlockStatus =
  | 'planned'
  | 'active'
  | 'completed'
  | 'skipped'
  | 'interrupted'
  | 'overrun';

export type CalendarSyncStatus = 'pending' | 'synced' | 'failed';

export type TaskBlock = {
  id: string;
  user_id: string;
  task_id: string;
  title_snapshot: string;
  type_snapshot: TaskType;
  starts_at: string;
  ends_at: string;
  planned_minutes: number;
  actual_minutes: number | null;
  status: TaskBlockStatus;
  calendar_event_id: string | null;
  calendar_sync_status: CalendarSyncStatus;
  sync_error: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateTaskBlockInput = Pick<
  TaskBlock,
  'task_id' | 'title_snapshot' | 'type_snapshot' | 'starts_at' | 'planned_minutes'
> & Partial<Pick<TaskBlock, 'status'>>;

export type UpdateTaskBlockInput = Partial<Pick<
  TaskBlock,
  | 'task_id'
  | 'title_snapshot'
  | 'type_snapshot'
  | 'starts_at'
  | 'ends_at'
  | 'planned_minutes'
  | 'actual_minutes'
  | 'status'
  | 'calendar_event_id'
  | 'calendar_sync_status'
  | 'sync_error'
>>;
