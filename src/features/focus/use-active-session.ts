import { create } from 'zustand';
import { createSelectors } from '@/lib/utils';

type ActiveSessionState = {
  sessionId: string | null;
  taskId: string | null;
  taskBlockId: string | null;
  goal: string | null;
  startedAt: number | null;
  plannedMinutes: number;
  interruptions: number;
  isRunning: boolean;
  start: (input: {
    sessionId: string;
    taskId?: string | null;
    taskBlockId?: string | null;
    goal?: string | null;
    plannedMinutes: number;
  }) => void;
  addInterruption: () => void;
  stop: () => void;
  reset: () => void;
};

const _useActiveSession = create<ActiveSessionState>(set => ({
  sessionId: null,
  taskId: null,
  taskBlockId: null,
  goal: null,
  startedAt: null,
  plannedMinutes: 25,
  interruptions: 0,
  isRunning: false,
  start: ({ sessionId, taskId, taskBlockId, goal, plannedMinutes }) =>
    set({
      sessionId,
      taskId: taskId ?? null,
      taskBlockId: taskBlockId ?? null,
      goal: goal ?? null,
      startedAt: Date.now(),
      plannedMinutes,
      interruptions: 0,
      isRunning: true,
    }),
  addInterruption: () =>
    set(state => ({ interruptions: state.interruptions + 1 })),
  stop: () =>
    set({ isRunning: false }),
  reset: () =>
    set({
      sessionId: null,
      taskId: null,
      taskBlockId: null,
      goal: null,
      startedAt: null,
      plannedMinutes: 25,
      interruptions: 0,
      isRunning: false,
    }),
}));

export const useActiveSession = createSelectors(_useActiveSession);
