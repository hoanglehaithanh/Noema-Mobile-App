import type {
  CreateFocusSessionInput,
  FocusSession,
  UpdateFocusSessionInput,
} from '@/types';

import { createMutation, createQuery } from 'react-query-kit';
import { queryDiskCacheMiddleware } from '@/lib/query-disk-cache-middleware';
import { supabase } from '@/lib/supabase';

export const useFocusSessions = createQuery<FocusSession[], void>({
  queryKey: ['focus_sessions'],
  use: [queryDiskCacheMiddleware],
  fetcher: async () => {
    const { data, error } = await supabase
      .from('focus_sessions')
      .select('*')
      .order('created_at', { ascending: false });
    if (error)
      throw error;
    return data as FocusSession[];
  },
});

export const useFocusSession = createQuery<FocusSession, { id: string }>({
  queryKey: ['focus_sessions', 'detail'],
  use: [queryDiskCacheMiddleware],
  fetcher: async (variables) => {
    const { data, error } = await supabase
      .from('focus_sessions')
      .select('*')
      .eq('id', variables.id)
      .single();
    if (error)
      throw error;
    return data as FocusSession;
  },
});

export const useCreateFocusSession = createMutation<FocusSession, CreateFocusSessionInput>({
  mutationFn: async (variables) => {
    const { data: { session } } = await supabase.auth.getSession();
    const { data, error } = await supabase
      .from('focus_sessions')
      .insert({
        ...variables,
        user_id: session!.user.id,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error)
      throw error;
    return data as FocusSession;
  },
});

export const useUpdateFocusSession = createMutation<
  FocusSession,
  { id: string } & UpdateFocusSessionInput
>({
  mutationFn: async ({ id, ...updates }) => {
    const { data, error } = await supabase
      .from('focus_sessions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error)
      throw error;
    return data as FocusSession;
  },
});
