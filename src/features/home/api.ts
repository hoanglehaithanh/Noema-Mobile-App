import type {
  CreateDailyBriefInput,
  DailyCapacity,
  DailyBrief,
  UpsertDailyCapacityInput,
  UpdateDailyBriefInput,
} from '@/types';

import { createMutation, createQuery } from 'react-query-kit';
import { supabase } from '@/lib/supabase';

export const useDailyBrief = createQuery<DailyBrief | null, { date: string }>({
  queryKey: ['daily_briefs'],
  fetcher: async (variables) => {
    const { data, error } = await supabase
      .from('daily_briefs')
      .select('*')
      .eq('brief_date', variables.date)
      .maybeSingle();
    if (error)
      throw error;
    return data as DailyBrief | null;
  },
});

export const useCreateDailyBrief = createMutation<DailyBrief, CreateDailyBriefInput>({
  mutationFn: async (variables) => {
    const { data: { session } } = await supabase.auth.getSession();
    const { data, error } = await supabase
      .from('daily_briefs')
      .insert({ ...variables, user_id: session!.user.id })
      .select()
      .single();
    if (error)
      throw error;
    return data as DailyBrief;
  },
});

export const useUpdateDailyBrief = createMutation<
  DailyBrief,
  { id: string } & UpdateDailyBriefInput
>({
  mutationFn: async ({ id, ...updates }) => {
    const { data, error } = await supabase
      .from('daily_briefs')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error)
      throw error;
    return data as DailyBrief;
  },
});

export const useDailyCapacity = createQuery<DailyCapacity | null, { date: string }>({
  queryKey: ['daily_capacity'],
  fetcher: async (variables) => {
    const { data, error } = await supabase
      .from('daily_capacity')
      .select('*')
      .eq('capacity_date', variables.date)
      .maybeSingle();
    if (error)
      throw error;
    return data as DailyCapacity | null;
  },
});

export const useUpsertDailyCapacity = createMutation<DailyCapacity, UpsertDailyCapacityInput>({
  mutationFn: async (variables) => {
    const { data: { session } } = await supabase.auth.getSession();
    const payload = {
      user_id: session!.user.id,
      capacity_date: variables.capacity_date,
      deep_minutes_budget: variables.deep_minutes_budget ?? 240,
      shallow_minutes_budget: variables.shallow_minutes_budget ?? 120,
      admin_minutes_budget: variables.admin_minutes_budget ?? 60,
      deep_minutes_planned: variables.deep_minutes_planned ?? 0,
      shallow_minutes_planned: variables.shallow_minutes_planned ?? 0,
      admin_minutes_planned: variables.admin_minutes_planned ?? 0,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('daily_capacity')
      .upsert(payload, { onConflict: 'user_id,capacity_date' })
      .select()
      .single();
    if (error)
      throw error;
    return data as DailyCapacity;
  },
});
