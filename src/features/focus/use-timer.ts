import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';

function calcElapsed(startedAt: number | null): number {
  if (!startedAt)
    return 0;
  return Math.floor((Date.now() - startedAt) / 1000);
}

export function useTimer(startedAt: number | null, isRunning: boolean): number {
  const listeners = useRef(new Set<() => void>());
  const snapshot = useRef(calcElapsed(startedAt));

  const subscribe = useCallback((cb: () => void) => {
    listeners.current.add(cb);
    return () => {
      listeners.current.delete(cb);
    };
  }, []);

  const getSnapshot = useCallback(() => snapshot.current, []);

  useEffect(() => {
    snapshot.current = calcElapsed(startedAt);
    listeners.current.forEach(cb => cb());

    if (!startedAt || !isRunning)
      return;

    const interval = setInterval(() => {
      snapshot.current = calcElapsed(startedAt);
      listeners.current.forEach(cb => cb());
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt, isRunning]);

  return useSyncExternalStore(subscribe, getSnapshot);
}

export function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
