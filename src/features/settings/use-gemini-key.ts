import { useCallback, useMemo } from 'react';

import { storage } from '@/lib/storage';

const GEMINI_KEY = 'GEMINI_API_KEY';

export function getGeminiKey(): string | null {
  return storage.getString(GEMINI_KEY) ?? null;
}

export function setGeminiKey(key: string) {
  storage.set(GEMINI_KEY, key);
}

export function removeGeminiKey() {
  storage.remove(GEMINI_KEY);
}

export function useGeminiKey() {
  const key = useMemo(() => getGeminiKey(), []);
  const save = useCallback((value: string) => setGeminiKey(value), []);
  const remove = useCallback(() => removeGeminiKey(), []);
  return { key, save, remove };
}
