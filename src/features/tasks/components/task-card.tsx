import type { Task } from '@/types';
import { useRouter } from 'expo-router';

import * as React from 'react';
import { Pressable, Text, View } from '@/components/ui';

const TYPE_LABELS: Record<string, string> = {
  deep: 'Deep',
  shallow: 'Shallow',
  admin: 'Admin',
};

const TYPE_COLORS: Record<string, string> = {
  deep: 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200',
  shallow: 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200',
  admin: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300',
};

const PRIORITY_INDICATOR: Record<string, string> = {
  high: 'bg-danger-500',
  medium: 'bg-warning-500',
  low: 'bg-neutral-300 dark:bg-neutral-600',
};

type TaskCardProps = {
  task: Task;
  compact?: boolean;
};

export function TaskCard({ task, compact }: TaskCardProps) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/task/${task.id}`)}
      className="mb-2 rounded-xl border border-neutral-200 bg-card p-4 dark:border-neutral-700"
    >
      <View className="flex-row items-center gap-2">
        <View className={`size-2 rounded-full ${PRIORITY_INDICATOR[task.priority]}`} />
        <Text className="flex-1 text-base font-semibold" numberOfLines={compact ? 1 : 2}>
          {task.title}
        </Text>
        <View className={`rounded-full px-2 py-0.5 ${TYPE_COLORS[task.type]}`}>
          <Text className="text-xs font-medium">
            {TYPE_LABELS[task.type]}
          </Text>
        </View>
      </View>
      {!compact && task.notes && (
        <Text className="mt-1 text-sm text-muted-foreground" numberOfLines={2}>
          {task.notes}
        </Text>
      )}
      {!compact && (
        <View className="mt-2 flex-row flex-wrap gap-3">
          {task.expected_minutes
            ? (
                <Text className="text-xs text-muted-foreground">
                  {`${task.expected_minutes} min expected`}
                </Text>
              )
            : null}
          {task.planning_date
            ? (
                <Text className="text-xs text-muted-foreground">
                  {`For ${task.planning_date}`}
                </Text>
              )
            : null}
        </View>
      )}
    </Pressable>
  );
}
