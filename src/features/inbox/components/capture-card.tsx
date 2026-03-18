import type { Capture } from '@/types';

import * as React from 'react';
import { Pressable, Text, View } from '@/components/ui';

const KIND_LABELS: Record<string, string> = {
  task: 'Task',
  idea: 'Idea',
  reminder: 'Reminder',
  note: 'Note',
  unknown: 'Unknown',
};

const KIND_COLORS: Record<string, string> = {
  task: 'bg-primary-100 dark:bg-primary-900',
  idea: 'bg-warning-100 dark:bg-warning-900',
  reminder: 'bg-danger-100 dark:bg-danger-900',
  note: 'bg-neutral-100 dark:bg-neutral-800',
  unknown: 'bg-neutral-100 dark:bg-neutral-800',
};

type CaptureCardProps = {
  capture: Capture;
  onPress: (capture: Capture) => void;
};

export function CaptureCard({ capture, onPress }: CaptureCardProps) {
  const timeAgo = getTimeAgo(capture.created_at);

  return (
    <Pressable
      onPress={() => onPress(capture)}
      className="mb-2 rounded-xl border border-neutral-200 bg-card p-4 dark:border-neutral-700"
    >
      <View className="flex-row items-center justify-between">
        <View
          className={`rounded-full px-3 py-1 ${KIND_COLORS[capture.kind] ?? KIND_COLORS.unknown}`}
        >
          <Text className="text-xs font-medium">
            {KIND_LABELS[capture.kind] ?? 'Unknown'}
          </Text>
        </View>
        <Text className="text-xs text-muted-foreground">{timeAgo}</Text>
      </View>
      <Text className="mt-2 text-base" numberOfLines={3}>
        {capture.content}
      </Text>
    </Pressable>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1)
    return 'just now';
  if (minutes < 60)
    return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24)
    return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
