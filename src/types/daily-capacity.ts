export type DailyCapacity = {
  id: string;
  user_id: string;
  capacity_date: string;
  deep_minutes_budget: number;
  shallow_minutes_budget: number;
  admin_minutes_budget: number;
  deep_minutes_planned: number;
  shallow_minutes_planned: number;
  admin_minutes_planned: number;
  created_at: string;
  updated_at: string;
};

export type UpsertDailyCapacityInput = Pick<
  DailyCapacity,
  'capacity_date'
> & Partial<Pick<
  DailyCapacity,
  | 'deep_minutes_budget'
  | 'shallow_minutes_budget'
  | 'admin_minutes_budget'
  | 'deep_minutes_planned'
  | 'shallow_minutes_planned'
  | 'admin_minutes_planned'
>>;
