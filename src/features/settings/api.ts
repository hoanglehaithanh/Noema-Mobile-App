import type { Profile } from '@/types';

import { createMutation, createQuery } from 'react-query-kit';
import { supabase } from '@/lib/supabase';

export const useProfile = createQuery<Profile | null, void>({
  queryKey: ['profile'],
  fetcher: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session)
      return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    if (error)
      throw error;
    return data as Profile;
  },
});

export const useUpdateProfile = createMutation<
  Profile,
  Partial<Pick<Profile, 'display_name' | 'timezone'>>
>({
  mutationFn: async (updates) => {
    const { data: { session } } = await supabase.auth.getSession();
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', session!.user.id)
      .select()
      .single();
    if (error)
      throw error;
    return data as Profile;
  },
});
