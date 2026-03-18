import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';

import { Button, FocusAwareStatusBar, Text, View } from '@/components/ui';
import { CaptureScreen } from '@/features/capture/capture-screen';
import { getLocalDateKey } from '@/features/home/planning';
import { useUpdateTaskBlock, useTaskBlocks } from '@/features/tasks/blocks-api';
import { useTasks, useUpdateTask } from '@/features/tasks/api';
import { useCreateFocusSession, useUpdateFocusSession } from './api';
import { FocusRunning } from './components/focus-running';
import { FocusSetup } from './components/focus-setup';
import { SessionReflection } from './components/session-reflection';
import { useActiveSession } from './use-active-session';
import { useTimer } from './use-timer';

type Phase = 'setup' | 'running' | 'capture' | 'reflection';

export function FocusScreen() {
  const queryClient = useQueryClient();
  const sessionId = useActiveSession.use.sessionId();
  const activeTaskId = useActiveSession.use.taskId();
  const activeTaskBlockId = useActiveSession.use.taskBlockId();
  const activeGoal = useActiveSession.use.goal();
  const startedAt = useActiveSession.use.startedAt();
  const interruptions = useActiveSession.use.interruptions();
  const isRunning = useActiveSession.use.isRunning();
  const startSession = useActiveSession.use.start();
  const addInterruption = useActiveSession.use.addInterruption();
  const stopSession = useActiveSession.use.stop();
  const resetSession = useActiveSession.use.reset();

  const { mutate: createSession } = useCreateFocusSession();
  const { mutate: updateSession, isPending: isSaving } = useUpdateFocusSession();
  const { mutate: updateTaskBlock } = useUpdateTaskBlock();
  const { mutate: updateTask } = useUpdateTask();
  const today = getLocalDateKey();
  const { data: taskBlocks } = useTaskBlocks({ variables: { date: today } });
  const { data: tasks } = useTasks({ variables: { date: today } });

  const [selectedBlockId, setSelectedBlockId] = React.useState<string | undefined>(activeTaskBlockId ?? undefined);
  const [goal, setGoal] = React.useState(activeGoal ?? '');
  const [duration, setDuration] = React.useState('25');
  const [phase, setPhase] = React.useState<Phase>(isRunning ? 'running' : 'setup');

  const elapsed = useTimer(startedAt, isRunning);
  const elapsedMinutes = Math.floor(elapsed / 60);

  const blockOptions = React.useMemo(
    () =>
      (taskBlocks ?? [])
        .filter(block => block.status === 'planned' || block.status === 'active' || block.id === selectedBlockId)
        .map(block => ({
          value: block.id,
          label: `${new Date(block.starts_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} · ${block.title_snapshot}`,
        })),
    [selectedBlockId, taskBlocks],
  );

  const selectedBlock = React.useMemo(
    () => (taskBlocks ?? []).find(block => block.id === selectedBlockId) ?? null,
    [selectedBlockId, taskBlocks],
  );

  const selectedTask = React.useMemo(
    () => (tasks ?? []).find(task => task.id === selectedBlock?.task_id) ?? null,
    [selectedBlock, tasks],
  );
  const plannedMinutes = selectedBlock?.planned_minutes ?? (Number(duration) || 25);
  const totalSeconds = plannedMinutes * 60;
  const remaining = Math.max(0, totalSeconds - elapsed);
  const progress = totalSeconds > 0 ? Math.min(1, elapsed / totalSeconds) : 0;

  React.useEffect(() => {
    if (isRunning && remaining === 0) {
      stopSession();
      setPhase('reflection');
    }
  }, [isRunning, remaining, stopSession]);

  React.useEffect(() => {
    if (!selectedBlock)
      return;

    setGoal(previous => previous || selectedBlock.title_snapshot);
    setDuration(String(selectedBlock.planned_minutes));
  }, [selectedBlock]);

  const resetToSetup = React.useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['focus_sessions'] });
    queryClient.invalidateQueries({ queryKey: ['task_blocks'] });
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    resetSession();
    setSelectedBlockId(undefined);
    setGoal('');
    setDuration('25');
    setPhase('setup');
  }, [queryClient, resetSession]);

  const finishSession = React.useCallback(
    (status: 'completed' | 'abandoned', reflection?: string) => {
      if (!sessionId)
        return;
      updateSession(
        {
          id: sessionId,
          status,
          ended_at: new Date().toISOString(),
          actual_minutes: elapsedMinutes,
          overrun_minutes: Math.max(0, elapsedMinutes - plannedMinutes),
          reflection: reflection?.trim() || null,
          interruptions_count: interruptions,
        },
        {
          onSuccess: () => {
            const actual = elapsedMinutes;
            const blockStatus = status === 'abandoned'
              ? 'interrupted'
              : actual > plannedMinutes
                  ? 'overrun'
                  : 'completed';

            if (activeTaskBlockId) {
              updateTaskBlock({
                id: activeTaskBlockId,
                status: blockStatus,
                actual_minutes: actual,
              });
            }

            if (activeTaskId) {
              const currentTask = (tasks ?? []).find(task => task.id === activeTaskId);
              updateTask({
                id: activeTaskId,
                status: status === 'abandoned' ? 'planned' : 'active',
                actual_minutes_total: (currentTask?.actual_minutes_total ?? 0) + actual,
                result_summary: reflection?.trim() || currentTask?.result_summary || null,
              });
            }

            resetToSetup();
          },
        },
      );
    },
    [
      sessionId,
      updateSession,
      elapsedMinutes,
      plannedMinutes,
      interruptions,
      activeTaskBlockId,
      activeTaskId,
      tasks,
      updateTask,
      updateTaskBlock,
      resetToSetup,
    ],
  );

  const handleStart = React.useCallback(() => {
    const mins = plannedMinutes;
    createSession(
      {
        goal: goal.trim() || selectedBlock?.title_snapshot || null,
        planned_minutes: mins,
        task_id: selectedBlock?.task_id ?? null,
        task_block_id: selectedBlock?.id ?? null,
      },
      {
        onSuccess: (s) => {
          startSession({
            sessionId: s.id,
            taskId: selectedBlock?.task_id ?? null,
            taskBlockId: selectedBlock?.id ?? null,
            goal: goal.trim() || selectedBlock?.title_snapshot || null,
            plannedMinutes: mins,
          });
          if (selectedBlock) {
            updateTaskBlock({ id: selectedBlock.id, status: 'active' });
          }
          if (selectedTask) {
            updateTask({
              id: selectedTask.id,
              status: 'active',
              started_at: selectedTask.started_at ?? new Date().toISOString(),
            });
          }
          setPhase('running');
        },
      },
    );
  }, [goal, createSession, selectedBlock, selectedTask, startSession, updateTask, updateTaskBlock, plannedMinutes]);

  const handleCapture = React.useCallback(() => {
    addInterruption();
    setPhase('capture');
  }, [addInterruption]);

  const handleStop = React.useCallback(() => {
    stopSession();
    setPhase('reflection');
  }, [stopSession]);

  return (
    <>
      <FocusAwareStatusBar />
      <View className="flex-1 pt-16">
        {phase === 'setup' && (
          <FocusSetup
            selectedBlockId={selectedBlockId}
            blockOptions={blockOptions}
            goal={goal}
            duration={duration}
            onChangeBlock={setSelectedBlockId}
            onChangeGoal={setGoal}
            onChangeDuration={setDuration}
            onStart={handleStart}
          />
        )}
        {phase === 'running' && <RunningPhase goal={goal} remaining={remaining} elapsed={elapsed} progress={progress} interruptions={interruptions} onCapture={handleCapture} onStop={handleStop} onAbandon={() => finishSession('abandoned')} />}
        {phase === 'capture' && <CapturePhase onCaptured={() => setPhase('running')} />}
        {phase === 'reflection' && <SessionReflection elapsedMinutes={elapsedMinutes} interruptions={interruptions} onSave={r => finishSession('completed', r)} onSkip={() => finishSession('completed')} loading={isSaving} />}
      </View>
    </>
  );
}

function RunningPhase({ goal, remaining, elapsed, progress, interruptions, onCapture, onStop, onAbandon }: { goal: string; remaining: number; elapsed: number; progress: number; interruptions: number; onCapture: () => void; onStop: () => void; onAbandon: () => void }) {
  return (
    <>
      <FocusRunning goal={goal} remaining={remaining} elapsed={elapsed} progress={progress} interruptions={interruptions} onCapture={onCapture} onStop={onStop} />
      <View className="px-4 pb-8">
        <Button label="Abandon Session" variant="ghost" onPress={onAbandon} textClassName="text-danger-500" />
      </View>
    </>
  );
}

function CapturePhase({ onCaptured }: { onCaptured: () => void }) {
  return (
    <View className="flex-1 px-4">
      <Text className="mb-2 text-lg font-bold">Quick Capture</Text>
      <Text className="mb-4 text-sm text-muted-foreground">Jot it down and get back to focus.</Text>
      <CaptureScreen embedded onCaptured={onCaptured} />
    </View>
  );
}
