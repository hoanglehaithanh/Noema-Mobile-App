export type ShutdownReview = {
  id: string;
  user_id: string;
  review_date: string;
  completed_summary: string | null;
  open_loops: string | null;
  first_task_tomorrow: string | null;
  reflection: string | null;
  created_at: string;
};

export type CreateShutdownReviewInput = {
  review_date: string;
  completed_summary?: string | null;
  open_loops?: string | null;
  first_task_tomorrow?: string | null;
  reflection?: string | null;
};
