import type { TriageAction } from './components/triage-sheet';
import type { Capture, Task } from '@/types';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { SectionList } from 'react-native';
import {
  ActivityIndicator,
  FocusAwareStatusBar,
  Pressable,
  Text,
  View,
} from '@/components/ui';
import { useCaptures, useUpdateCapture } from '@/features/capture/api';
import { getLocalDateKey } from '@/features/home/planning';
import { useCreateTask, useTasks, useUpdateTask } from '@/features/tasks/api';
import { TriageSheet } from './components/triage-sheet';

// ─────────────────────────────────────────────────────────
// Capture Queue Card
// ─────────────────────────────────────────────────────────

const KIND_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  task: { bg: 'bg-primary-100 dark:bg-primary-900', text: 'text-primary-700 dark:text-primary-300', label: 'Capture' },
  idea: { bg: 'bg-warning-100 dark:bg-warning-900', text: 'text-warning-700 dark:text-warning-300', label: 'Idea' },
  reminder: { bg: 'bg-danger-100 dark:bg-danger-900', text: 'text-danger-700 dark:text-danger-300', label: 'Reminder' },
  note: { bg: 'bg-neutral-100 dark:bg-neutral-800', text: 'text-neutral-600 dark:text-neutral-400', label: 'Note' },
  unknown: { bg: 'bg-neutral-100 dark:bg-neutral-800', text: 'text-neutral-600 dark:text-neutral-400', label: 'Unknown' },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)
    return 'just now';
  if (mins < 60)
    return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)
    return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function CaptureQueueCard({
  capture,
  onTriage,
}: {
  capture: Capture;
  onTriage: (capture: Capture) => void;
}) {
  const badge = KIND_BADGE[capture.kind] ?? KIND_BADGE.unknown;
  return (
    <Pressable
      onPress={() => onTriage(capture)}
      className="overflow-hidden rounded-2xl bg-card border border-neutral-100 dark:border-neutral-800"
    >
      <View className="flex-row items-start justify-between px-4 pt-3 pb-2">
        <View className={`rounded-full px-2.5 py-0.5 ${badge.bg}`}>
          <Text className={`text-xs font-semibold ${badge.text}`}>{badge.label}</Text>
        </View>
        <Text className="text-xs text-muted-foreground">{timeAgo(capture.created_at)}</Text>
      </View>
      <Text className="px-4 pb-2 text-sm text-foreground" numberOfLines={2}>
        {capture.content}
      </Text>
      <View className="border-t border-neutral-100 dark:border-neutral-800 flex-row">
        <View className="flex-1 items-center border-r border-neutral-100 dark:border-neutral-800 py-2.5">
          <Text className="text-xs font-semibold text-primary-600 dark:text-primary-400">Triage →</Text>
        </View>
        <View className="flex-1 items-center py-2.5">
          <Text className="text-xs text-muted-foreground">Skip</Text>
        </View>
      </View>
    </Pressable>
  );
}

// ─────────────────────────────────────────────────────────
// Inbox Task Card
// ─────────────────────────────────────────────────────────

const PRIORITY_DOT: Record<string, string> = {
  high: 'bg-danger-500',
  medium: 'bg-warning-400',
  low: 'bg-neutral-300',
};

const TYPE_BG: Record<string, string> = {
  deep: 'bg-primary-50 dark:bg-primary-950',
  shallow: 'bg-warning-50 dark:bg-warning-950',
  admin: 'bg-neutral-100 dark:bg-neutral-800',
};

const TYPE_TEXT: Record<string, string> = {
  deep: 'text-primary-700 dark:text-primary-300',
  shallow: 'text-warning-700 dark:text-warning-300',
  admin: 'text-neutral-600 dark:text-neutral-400',
};

function InboxTaskCard({
  task,
  onPlanToday,
}: {
  task: Task;
  onPlanToday: (task: Task) => void;
}) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push(`/task/${task.id}`)}
      className="overflow-hidden rounded-2xl bg-card border border-neutral-100 dark:border-neutral-800"
    >
      <View className="flex-row items-start gap-3 px-4 py-3">
        {/* Priority dot */}
        <View className={`mt-1.5 size-2 rounded-full ${PRIORITY_DOT[task.priority] ?? 'bg-neutral-300'}`} />
        <View className="flex-1">
          <Text className="text-sm font-semibold text-foreground" numberOfLines={2}>
            {task.title}
          </Text>
          <View className="mt-1.5 flex-row items-center gap-2">
            <View className={`rounded-full px-2 py-0.5 ${TYPE_BG[task.type]}`}>
              <Text className={`text-xs font-medium capitalize ${TYPE_TEXT[task.type]}`}>
                {task.type}
              </Text>
            </View>
            {task.expected_minutes ? (
              <Text className="text-xs text-muted-foreground">
                {task.expected_minutes}
                {' min'}
              </Text>
            ) : null}
          </View>
        </View>
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onPlanToday(task);
          }}
          className="rounded-xl bg-primary-50 px-3 py-1.5 dark:bg-primary-950"
        >
          <Text className="text-xs font-semibold text-primary-600 dark:text-primary-400">
            Plan Today
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

// ─────────────────────────────────────────────────────────
// Queue Screen
// ─────────────────────────────────────────────────────────

type Section =
  | { title: string; data: Capture[]; kind: 'capture' }
  | { title: string; data: Task[]; kind: 'task' };

export function InboxScreen() {
  const queryClient = useQueryClient();
  const { data: captures, isLoading: loadingCaptures } = useCaptures({ variables: { processed: false } });
  const { data: inboxTasks, isLoading: loadingTasks } = useTasks({ variables: { status: 'inbox' } });
  const { mutate: updateCapture, isPending: isUpdating } = useUpdateCapture();
  const { mutate: createTask } = useCreateTask();
  const { mutate: updateTask } = useUpdateTask();
  const [selected, setSelected] = React.useState<Capture | null>(null);

  const isLoading = loadingCaptures || loadingTasks;

  const handleTriage = React.useCallback((capture: Capture, action: TriageAction) => {
    if (action.type === 'task') {
      createTask(
        {
          title: capture.content,
          type: action.taskType,
          priority: 'medium',
          source: 'capture',
          status: 'planned',
          planning_date: getLocalDateKey(),
        },
        {
          onSuccess: () => {
            updateCapture(
              { id: capture.id, processed: true },
              {
                onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ['captures'] });
                  queryClient.invalidateQueries({ queryKey: ['tasks'] });
                  setSelected(null);
                },
              },
            );
          },
        },
      );
    }
    else if (action.type === 'note') {
      updateCapture(
        { id: capture.id, kind: 'note', processed: true },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['captures'] });
            setSelected(null);
          },
        },
      );
    }
    else {
      updateCapture(
        { id: capture.id, processed: true },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['captures'] });
            setSelected(null);
          },
        },
      );
    }
  }, [createTask, queryClient, updateCapture]);

  const handlePlanToday = React.useCallback((task: Task) => {
    updateTask(
      { id: task.id, status: 'planned', planning_date: getLocalDateKey() },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
      },
    );
  }, [queryClient, updateTask]);

  const sections = React.useMemo<Section[]>(() => {
    const result: Section[] = [];
    if (captures && captures.length > 0) {
      result.push({ title: 'Captures', data: captures, kind: 'capture' });
    }
    if (inboxTasks && inboxTasks.length > 0) {
      result.push({ title: 'Inbox Tasks', data: inboxTasks, kind: 'task' });
    }
    return result;
  }, [captures, inboxTasks]);

  const totalCount = (captures?.length ?? 0) + (inboxTasks?.length ?? 0);

  const renderItem = React.useCallback(
    ({ item, section }: { item: Capture | Task; section: Section }) => {
      if (section.kind === 'capture') {
        return (
          <View className="mb-2">
            <CaptureQueueCard
              capture={item as Capture}
              onTriage={setSelected}
            />
          </View>
        );
      }
      return (
        <View className="mb-2">
          <InboxTaskCard
            task={item as Task}
            onPlanToday={handlePlanToday}
          />
        </View>
      );
    },
    [handlePlanToday],
  );

  const renderSectionHeader = React.useCallback(
    ({ section }: { section: Section }) => (
      <Text className="mb-2 mt-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {section.title}
      </Text>
    ),
    [],
  );

  return (
    <>
      <FocusAwareStatusBar />
      <View className="flex-1 bg-background">
        {/* ── Header ── */}
        <View className="flex-row items-center justify-between px-4 pt-16 pb-4">
          <View>
            <Text className="text-2xl font-bold text-foreground">Queue</Text>
            <Text className="mt-0.5 text-sm text-muted-foreground">
              {totalCount === 0
                ? 'All clear'
                : `${totalCount} item${totalCount === 1 ? '' : 's'} to process`}
            </Text>
          </View>
          {totalCount > 0 && (
            <View className="min-w-8 items-center justify-center rounded-full bg-danger-500 px-2 py-1">
              <Text className="text-sm font-bold text-white">{totalCount}</Text>
            </View>
          )}
        </View>

        {isLoading
          ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator />
              </View>
            )
          : sections.length === 0
            ? (
                <View className="flex-1 items-center justify-center px-8">
                  <Text className="text-5xl">✓</Text>
                  <Text className="mt-4 text-xl font-bold text-foreground">Queue clear</Text>
                  <Text className="mt-2 text-center text-sm text-muted-foreground">
                    You're all caught up. Captures and inbox tasks will appear here.
                  </Text>
                </View>
              )
            : (
                <SectionList
                  sections={sections as any}
                  keyExtractor={item => (item as Capture | Task).id}
                  renderItem={renderItem as any}
                  renderSectionHeader={renderSectionHeader as any}
                  contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
                  showsVerticalScrollIndicator={false}
                  stickySectionHeadersEnabled={false}
                />
              )}
      </View>

      {/* ── Triage Sheet ── */}
      {selected && (
        <View className="absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-neutral-200 bg-card pt-4 dark:border-neutral-700">
          <TriageSheet
            capture={selected}
            onAction={handleTriage}
            onCancel={() => setSelected(null)}
            loading={isUpdating}
          />
        </View>
      )}
    </>
  );
}
