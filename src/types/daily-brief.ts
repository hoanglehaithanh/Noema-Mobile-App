export type DailyBrief = {
  id: string;
  user_id: string;
  brief_date: string;
  primary_task_id: string | null;
  secondary_task_id: string | null;
  admin_notes: string | null;
  next_focus_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateDailyBriefInput = {
  brief_date: string;
  primary_task_id?: string | null;
  secondary_task_id?: string | null;
  admin_notes?: string | null;
  next_focus_at?: string | null;
};

export type UpdateDailyBriefInput = Partial<
  Pick<DailyBrief, 'primary_task_id' | 'secondary_task_id' | 'admin_notes' | 'next_focus_at'>
>;
