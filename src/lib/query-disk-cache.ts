import type { QueryKey } from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth/use-auth-store';
import { storage } from '@/lib/storage';

const CACHE_PREFIX = 'rq_disk_v1';

function cacheUserSegment(): string {
  const id = useAuthStore.getState().session?.user?.id;
  return id ?? 'anon';
}

export function queryKeyToStorageKey(queryKey: QueryKey): string {
  return `${CACHE_PREFIX}:${cacheUserSegment()}:${JSON.stringify(queryKey)}`;
}

export function readDiskCachedQueryData(queryKey: QueryKey): unknown | undefined {
  const key = queryKeyToStorageKey(queryKey);
  if (!storage.contains(key))
    return undefined;
  const raw = storage.getString(key);
  if (raw === undefined)
    return undefined;
  try {
    return JSON.parse(raw) as unknown;
  }
  catch {
    return undefined;
  }
}

export function writeDiskCachedQueryData(queryKey: QueryKey, data: unknown): void {
  storage.set(queryKeyToStorageKey(queryKey), JSON.stringify(data));
}
