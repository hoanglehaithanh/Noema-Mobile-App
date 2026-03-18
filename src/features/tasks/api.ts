import type { CreateTaskInput, Task, UpdateTaskInput } from '@/types';

import { createMutation, createQuery } from 'react-query-kit';
import { supabase } from '@/lib/supabase';

export const useTasks = createQuery<Task[], { status?: string; date?: string } | void>({
  queryKey: ['tasks'],
  fetcher: async (variables) => {
    let query = supabase
      .from('tasks')
      .select('*')
      .order('decision_rank', { ascending: true })
      .order('priority', { ascending: true })
      .order('created_at', { ascending: false });

    if (variables && variables.status) {
      query = query.eq('status', variables.status);
    }

    if (variables && variables.date) {
      query = query.or(`planning_date.eq.${variables.date},planning_date.is.null`);
    }

    const { data, error } = await query;
    if (error)
      throw error;
    return data as Task[];
  },
});

export const useTask = createQuery<Task, { id: string }>({
  queryKey: ['tasks', 'detail'],
  fetcher: async (variables) => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', variables.id)
      .single();
    if (error)
      throw error;
    return data as Task;
  },
});

export const useCreateTask = createMutation<Task, CreateTaskInput>({
  mutationFn: async (variables) => {
    const { data: { session } } = await supabase.auth.getSession();
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        ...variables,
        user_id: session!.user.id,
        decision_rank: variables.decision_rank ?? 0,
      })
      .select()
      .single();
    if (error)
      throw error;
    return data as Task;
  },
});

export const useUpdateTask = createMutation<Task, { id: string } & UpdateTaskInput>({
  mutationFn: async ({ id, ...updates }) => {
    const { data, error } = await supabase
      .from('tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error)
      throw error;
    return data as Task;
  },
});
