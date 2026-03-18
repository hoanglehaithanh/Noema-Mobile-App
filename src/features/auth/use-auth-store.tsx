import type { Session } from '@supabase/supabase-js';

import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { createSelectors } from '@/lib/utils';

type AuthState = {
  session: Session | null;
  status: 'idle' | 'signOut' | 'signIn';
  setSession: (session: Session | null) => void;
  signOut: () => void;
  hydrate: () => void;
};

const _useAuthStore = create<AuthState>(set => ({
  status: 'idle',
  session: null,
  setSession: (session) => {
    if (session) {
      set({ status: 'signIn', session });
    }
    else {
      set({ status: 'signOut', session: null });
    }
  },
  signOut: async () => {
    await supabase.auth.signOut();
    set({ status: 'signOut', session: null });
  },
  hydrate: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        set({ status: 'signIn', session });
      }
      else {
        set({ status: 'signOut', session: null });
      }

      supabase.auth.onAuthStateChange((_event, newSession) => {
        _useAuthStore.getState().setSession(newSession);
      });
    }
    catch (e) {
      console.error(e);
      set({ status: 'signOut', session: null });
    }
  },
}));

export const useAuthStore = createSelectors(_useAuthStore);

export const signOut = () => _useAuthStore.getState().signOut();
export const hydrateAuth = () => _useAuthStore.getState().hydrate();
