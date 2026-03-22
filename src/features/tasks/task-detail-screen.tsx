import type { TaskPriority, TaskStatus, TaskType } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';

import {
  ActivityIndicator,
  FocusAwareStatusBar,
  ScrollView,
  Text,
  View,
} from '@/components/ui';
import { getLocalDateKey } from '@/features/home/planning';
import { hrefTask } from '@/lib/href-task';
import { useCreateTask, useTask, useUpdateTask } from './api';
import { TaskForm } from './components/task-form';

export function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string; from?: string }>();
  if (id === 'new')
    return <CreateTaskScreen />;

  return <EditTaskScreen id={id!} />;
}

export function CreateTaskScreen() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const queryClient = useQueryClient();
  const { mutate: createTask, isPending } = useCreateTask();
  const form = useTaskEditorState({ status: 'inbox', planningDate: '' });

  const invalidateTasks = React.useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  }, [queryClient]);

  const handleSave = React.useCallback(() => {
    if (!form.title.trim())
      return;

    createTask(
      {
        title: form.title.trim(),
        notes: form.notes.trim() || null,
        description: form.description.trim() || null,
        definition_of_done: form.definitionOfDone.trim() || null,
        expected_minutes: form.expectedMinutes ? Number(form.expectedMinutes) : null,
        result_summary: form.resultSummary.trim() || null,
        planning_date: form.planningDate.trim() || null,
        type: form.type,
        status: form.status,
        priority: form.priority,
      },
      {
        onSuccess: (task) => {
          invalidateTasks();
          router.replace(hrefTask(task.id, typeof from === 'string' ? from : undefined));
        },
      },
    );
  }, [createTask, form, from, invalidateTasks, router]);

  return (
    <>
      <FocusAwareStatusBar />
      <ScrollView className="flex-1 bg-background">
        <View className="px-4 pt-16">
          <Text className="text-[11px] font-semibold uppercase tracking-[2px] text-muted-foreground">
            Add Task
          </Text>
          <Text className="mt-2 text-3xl font-extrabold text-foreground">New Task</Text>
        </View>
        <TaskForm
          title={form.title}
          description={form.description}
          notes={form.notes}
          definitionOfDone={form.definitionOfDone}
          expectedMinutes={form.expectedMinutes}
          resultSummary={form.resultSummary}
          planningDate={form.planningDate}
          type={form.type}
          status={form.status}
          priority={form.priority}
          onChangeTitle={form.setTitle}
          onChangeDescription={form.setDescription}
          onChangeNotes={form.setNotes}
          onChangeDefinitionOfDone={form.setDefinitionOfDone}
          onChangeExpectedMinutes={form.setExpectedMinutes}
          onChangeResultSummary={form.setResultSummary}
          onChangePlanningDate={form.setPlanningDate}
          onChangeType={form.setType}
          onChangeStatus={form.setStatus}
          onChangePriority={form.setPriority}
          onSave={handleSave}
          saveLabel="Create Task"
          loading={isPending}
        />
      </ScrollView>
    </>
  );
}

function EditTaskScreen({ id }: { id: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: task, isLoading } = useTask({ variables: { id } });
  const { mutate: updateTask, isPending } = useUpdateTask();
  const form = useTaskEditorState();
  const {
    setTitle,
    setDescription,
    setNotes,
    setDefinitionOfDone,
    setExpectedMinutes,
    setResultSummary,
    setPlanningDate,
    setType,
    setStatus,
    setPriority,
  } = form;

  React.useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? '');
      setNotes(task.notes ?? '');
      setDefinitionOfDone(task.definition_of_done ?? '');
      setExpectedMinutes(task.expected_minutes ? String(task.expected_minutes) : '');
      setResultSummary(task.result_summary ?? '');
      setPlanningDate(task.planning_date ?? '');
      setType(task.type);
      setStatus(task.status);
      setPriority(task.priority);
    }
  }, [
    setDefinitionOfDone,
    setDescription,
    setExpectedMinutes,
    setNotes,
    setPlanningDate,
    setPriority,
    setResultSummary,
    setStatus,
    setTitle,
    setType,
    task,
  ]);

  const invalidateAndBack = () => {
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['task_blocks'] });
    router.back();
  };

  const handleSave = () => {
    if (!id || !form.title.trim())
      return;
    updateTask(
      {
        id,
        title: form.title.trim(),
        description: form.description.trim() || null,
        notes: form.notes.trim() || null,
        definition_of_done: form.definitionOfDone.trim() || null,
        expected_minutes: form.expectedMinutes ? Number(form.expectedMinutes) : null,
        result_summary: form.resultSummary.trim() || null,
        planning_date: form.planningDate.trim() || null,
        type: form.type,
        status: form.status,
        priority: form.priority,
        completed_at: form.status === 'done' ? new Date().toISOString() : null,
      },
      { onSuccess: invalidateAndBack },
    );
  };

  const handleMarkDone = () => {
    if (!id)
      return;
    updateTask(
      {
        id,
        status: 'done',
        completed_at: new Date().toISOString(),
        result_summary: form.resultSummary.trim() || null,
      },
      { onSuccess: invalidateAndBack },
    );
  };

  if (isLoading || !task) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <>
      <FocusAwareStatusBar />
      <ScrollView className="flex-1 bg-background">
        <View className="px-4 pt-16">
          <Text className="text-[11px] font-semibold uppercase tracking-[2px] text-muted-foreground">
            Task Detail
          </Text>
          <Text className="mt-2 text-3xl font-extrabold text-foreground">{task.title}</Text>
        </View>
        <TaskForm
          title={form.title}
          description={form.description}
          notes={form.notes}
          definitionOfDone={form.definitionOfDone}
          expectedMinutes={form.expectedMinutes}
          resultSummary={form.resultSummary}
          planningDate={form.planningDate}
          type={form.type}
          status={form.status}
          priority={form.priority}
          createdAt={task.created_at}
          onChangeTitle={form.setTitle}
          onChangeDescription={form.setDescription}
          onChangeNotes={form.setNotes}
          onChangeDefinitionOfDone={form.setDefinitionOfDone}
          onChangeExpectedMinutes={form.setExpectedMinutes}
          onChangeResultSummary={form.setResultSummary}
          onChangePlanningDate={form.setPlanningDate}
          onChangeType={form.setType}
          onChangeStatus={form.setStatus}
          onChangePriority={form.setPriority}
          onSave={handleSave}
          onMarkDone={task.status !== 'done' ? handleMarkDone : undefined}
          loading={isPending}
        />
      </ScrollView>
    </>
  );
}

type TaskEditorInitial = Partial<{
  status: TaskStatus;
  planningDate: string;
}>;

function useTaskEditorState(initial?: TaskEditorInitial) {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [definitionOfDone, setDefinitionOfDone] = React.useState('');
  const [expectedMinutes, setExpectedMinutes] = React.useState('');
  const [resultSummary, setResultSummary] = React.useState('');
  const [planningDate, setPlanningDate] = React.useState(() =>
    initial?.planningDate !== undefined ? initial.planningDate : getLocalDateKey(),
  );
  const [type, setType] = React.useState<TaskType>('deep');
  const [status, setStatus] = React.useState<TaskStatus>(() => initial?.status ?? 'planned');
  const [priority, setPriority] = React.useState<TaskPriority>('medium');

  return {
    title,
    description,
    notes,
    definitionOfDone,
    expectedMinutes,
    resultSummary,
    planningDate,
    type,
    status,
    priority,
    setTitle,
    setDescription,
    setNotes,
    setDefinitionOfDone,
    setExpectedMinutes,
    setResultSummary,
    setPlanningDate,
    setType,
    setStatus,
    setPriority,
  };
}
