import { createClient } from '@supabase/supabase-js';

import Env from 'env';
import { storage } from '@/lib/storage';

import 'react-native-url-polyfill/auto';

const mmkvStorageAdapter = {
  getItem: (key: string) => {
    const value = storage.getString(key);
    return value ?? null;
  },
  setItem: (key: string, value: string) => {
    storage.set(key, value);
  },
  removeItem: (key: string) => {
    storage.remove(key);
  },
};

export const supabase = createClient(
  Env.EXPO_PUBLIC_SUPABASE_URL,
  Env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: mmkvStorageAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);
