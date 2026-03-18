import type { CreateShutdownReviewInput, ShutdownReview } from '@/types';

import { createMutation, createQuery } from 'react-query-kit';
import { supabase } from '@/lib/supabase';

export const useShutdownReview = createQuery<ShutdownReview | null, { date: string }>({
  queryKey: ['shutdown_reviews'],
  fetcher: async (variables) => {
    const { data, error } = await supabase
      .from('shutdown_reviews')
      .select('*')
      .eq('review_date', variables.date)
      .maybeSingle();
    if (error)
      throw error;
    return data as ShutdownReview | null;
  },
});

export const useCreateShutdownReview = createMutation<
  ShutdownReview,
  CreateShutdownReviewInput
>({
  mutationFn: async (variables) => {
    const { data: { session } } = await supabase.auth.getSession();
    const { data, error } = await supabase
      .from('shutdown_reviews')
      .insert({ ...variables, user_id: session!.user.id })
      .select()
      .single();
    if (error)
      throw error;
    return data as ShutdownReview;
  },
});
