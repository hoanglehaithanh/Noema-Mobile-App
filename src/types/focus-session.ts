export type SessionStatus = 'active' | 'completed' | 'abandoned';

export type FocusSession = {
  id: string;
  user_id: string;
  task_id: string | null;
  task_block_id: string | null;
  goal: string | null;
  started_at: string;
  ended_at: string | null;
  planned_minutes: number;
  actual_minutes: number | null;
  overrun_minutes: number;
  status: SessionStatus;
  reflection: string | null;
  interruptions_count: number;
  created_at: string;
};

export type CreateFocusSessionInput = {
  task_id?: string | null;
  task_block_id?: string | null;
  goal?: string | null;
  planned_minutes: number;
};

export type UpdateFocusSessionInput = Partial<
  Pick<
    FocusSession,
    'ended_at' | 'actual_minutes' | 'overrun_minutes' | 'status' | 'reflection' | 'interruptions_count'
  >
>;
