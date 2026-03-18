import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';

import { getLocalDateKey } from '@/features/home/planning';
import { useTaskBlocks, useUpdateTaskBlock } from '@/features/tasks/blocks-api';
import { useTasks } from '@/features/tasks/api';
import { useUpdateTask } from '@/features/tasks/api';
import { useCreateShutdownReview, useShutdownReview } from './api';
import { ReviewComplete } from './components/review-complete';
import { ReviewForm } from './components/review-form';

function getTodayDate(): string {
  return getLocalDateKey();
}

export function ReviewScreen() {
  const queryClient = useQueryClient();
  const today = getTodayDate();
  const tomorrow = getLocalDateKey(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const { data: existingReview } = useShutdownReview({ variables: { date: today } });
  const { data: tasks } = useTasks({ variables: { date: today } });
  const { data: taskBlocks } = useTaskBlocks({ variables: { date: today } });
  const { mutate: createReview, isPending } = useCreateShutdownReview();
  const { mutate: updateTask } = useUpdateTask();
  const { mutate: updateTaskBlock } = useUpdateTaskBlock();

  const completedTasks = React.useMemo(
    () => (tasks ?? []).filter(t => t.status === 'done'),
    [tasks],
  );
  const openTasks = React.useMemo(
    () => (tasks ?? []).filter(t => t.status === 'planned' || t.status === 'active'),
    [tasks],
  );
  const completedBlocks = React.useMemo(
    () => (taskBlocks ?? []).filter(block => block.status === 'completed'),
    [taskBlocks],
  );
  const unfinishedBlocks = React.useMemo(
    () => (taskBlocks ?? []).filter(block => block.status !== 'completed' && block.status !== 'skipped'),
    [taskBlocks],
  );

  const [completedSummary, setCompletedSummary] = React.useState('');
  const [openLoops, setOpenLoops] = React.useState('');
  const [firstTaskTomorrow, setFirstTaskTomorrow] = React.useState('');
  const [reflection, setReflection] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);

  React.useEffect(() => {
    if (existingReview) {
      setSubmitted(true);
      setCompletedSummary(existingReview.completed_summary ?? '');
      setOpenLoops(existingReview.open_loops ?? '');
      setFirstTaskTomorrow(existingReview.first_task_tomorrow ?? '');
      setReflection(existingReview.reflection ?? '');
    }
  }, [existingReview]);

  React.useEffect(() => {
    if (!completedSummary && (completedTasks.length > 0 || completedBlocks.length > 0)) {
      const completedItems = [
        ...completedBlocks.map(block => `${block.title_snapshot} (${block.planned_minutes}m block)`),
        ...completedTasks.map(task => task.title),
      ];
      setCompletedSummary([...new Set(completedItems)].join('\n'));
    }

    if (!openLoops && (openTasks.length > 0 || unfinishedBlocks.length > 0)) {
      const openItems = [
        ...unfinishedBlocks.map(block => `${block.title_snapshot} (${block.status})`),
        ...openTasks.map(task => task.title),
      ];
      setOpenLoops([...new Set(openItems)].join('\n'));
    }

    if (!firstTaskTomorrow && openTasks[0]) {
      setFirstTaskTomorrow(openTasks[0].title);
    }
  }, [completedBlocks, completedSummary, completedTasks, firstTaskTomorrow, openLoops, openTasks, unfinishedBlocks]);

  const handleSubmit = () => {
    createReview(
      {
        review_date: today,
        completed_summary: completedSummary.trim() || null,
        open_loops: openLoops.trim() || null,
        first_task_tomorrow: firstTaskTomorrow.trim() || null,
        reflection: reflection.trim() || null,
      },
      {
        onSuccess: () => {
          for (const task of openTasks) {
            updateTask({
              id: task.id,
              planning_date: tomorrow,
              status: 'planned',
            });
          }

          for (const block of unfinishedBlocks) {
            updateTaskBlock({
              id: block.id,
              status: block.status === 'active' ? 'interrupted' : 'skipped',
            });
          }

          queryClient.invalidateQueries({ queryKey: ['shutdown_reviews'] });
          queryClient.invalidateQueries({ queryKey: ['task_blocks'] });
          queryClient.invalidateQueries({ queryKey: ['tasks'] });
          setSubmitted(true);
        },
      },
    );
  };

  if (submitted && existingReview)
    return <ReviewComplete review={existingReview} />;

  return (
    <ReviewForm
      completedSummary={completedSummary}
      openLoops={openLoops}
      firstTaskTomorrow={firstTaskTomorrow}
      reflection={reflection}
      onChangeCompleted={setCompletedSummary}
      onChangeOpen={setOpenLoops}
      onChangeTomorrow={setFirstTaskTomorrow}
      onChangeReflection={setReflection}
      onSubmit={handleSubmit}
      loading={isPending}
    />
  );
}
