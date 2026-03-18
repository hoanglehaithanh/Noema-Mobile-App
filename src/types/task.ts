export type TaskType = 'deep' | 'shallow' | 'admin';
export type TaskStatus = 'inbox' | 'planned' | 'active' | 'done' | 'archived';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskSource = 'manual' | 'capture' | 'ai';

export type Task = {
  id: string;
  user_id: string;
  title: string;
  notes: string | null;
  description: string | null;
  definition_of_done: string | null;
  expected_minutes: number | null;
  actual_minutes_total: number;
  result_summary: string | null;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  planning_date: string | null;
  decision_rank: number;
  scheduled_for: string | null;
  due_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  source: TaskSource;
  created_at: string;
  updated_at: string;
};

export type CreateTaskInput = Pick<Task, 'title' | 'type' | 'priority'>
  & Partial<Pick<
    Task,
    | 'notes'
    | 'description'
    | 'definition_of_done'
    | 'expected_minutes'
    | 'result_summary'
    | 'planning_date'
    | 'decision_rank'
    | 'scheduled_for'
    | 'due_at'
    | 'source'
    | 'status'
  >>;

export type UpdateTaskInput = Partial<
  Pick<
    Task,
    | 'title'
    | 'notes'
    | 'description'
    | 'definition_of_done'
    | 'expected_minutes'
    | 'actual_minutes_total'
    | 'result_summary'
    | 'type'
    | 'status'
    | 'priority'
    | 'planning_date'
    | 'decision_rank'
    | 'scheduled_for'
    | 'due_at'
    | 'started_at'
    | 'completed_at'
  >
>;
