import type { Capture, CreateCaptureInput } from '@/types';

import { createMutation, createQuery } from 'react-query-kit';
import { queryDiskCacheMiddleware } from '@/lib/query-disk-cache-middleware';
import { supabase } from '@/lib/supabase';

export const useCaptures = createQuery<Capture[], { processed?: boolean } | void>({
  queryKey: ['captures'],
  use: [queryDiskCacheMiddleware],
  fetcher: async (variables) => {
    let query = supabase
      .from('captures')
      .select('*')
      .order('created_at', { ascending: false });

    if (variables && variables.processed !== undefined) {
      query = query.eq('processed', variables.processed);
    }

    const { data, error } = await query;
    if (error)
      throw error;
    return data as Capture[];
  },
});

export const useCreateCapture = createMutation<Capture, CreateCaptureInput>({
  mutationFn: async (variables) => {
    const { data: { session } } = await supabase.auth.getSession();
    const { data, error } = await supabase
      .from('captures')
      .insert({
        ...variables,
        user_id: session!.user.id,
        kind: variables.kind ?? 'unknown',
      })
      .select()
      .single();
    if (error)
      throw error;
    return data as Capture;
  },
});

export const useUpdateCapture = createMutation<
  Capture,
  { id: string } & Partial<Pick<Capture, 'kind' | 'processed' | 'content'>>
>({
  mutationFn: async ({ id, ...updates }) => {
    const { data, error } = await supabase
      .from('captures')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error)
      throw error;
    return data as Capture;
  },
});
