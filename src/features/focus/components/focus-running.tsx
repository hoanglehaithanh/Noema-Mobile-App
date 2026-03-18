import * as React from 'react';

import { Pressable, Text, View } from '@/components/ui';
import { formatTime } from '../use-timer';

type FocusRunningProps = {
  goal: string;
  remaining: number;
  elapsed: number;
  progress: number;
  interruptions: number;
  onCapture: () => void;
  onStop: () => void;
};

export function FocusRunning({
  goal,
  remaining,
  elapsed,
  progress,
  interruptions,
  onCapture,
  onStop,
}: FocusRunningProps) {
  return (
    <View className="flex-1 items-center justify-center px-4">
      {goal
        ? (
            <Text className="mb-4 text-center text-lg text-muted-foreground">
              {goal}
            </Text>
          )
        : null}

      <Text className="text-6xl font-bold tabular-nums">
        {formatTime(remaining)}
      </Text>
      <Text className="mt-2 text-muted-foreground">
        {`${formatTime(elapsed)} elapsed`}
      </Text>

      <View className="mt-2 h-1.5 w-48 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
        <View
          className="h-full rounded-full bg-primary-600"
          style={{ width: `${progress * 100}%` }}
        />
      </View>

      <View className="mt-8 flex-row items-center gap-6">
        <Pressable onPress={onCapture} className="items-center">
          <View className="size-14 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
            <Text className="text-lg">+</Text>
          </View>
          <Text className="mt-1 text-xs text-muted-foreground">Capture</Text>
        </Pressable>

        <Pressable onPress={onStop} className="items-center">
          <View className="size-16 items-center justify-center rounded-full bg-danger-100 dark:bg-danger-900">
            <Text className="text-lg font-bold text-danger-600">Stop</Text>
          </View>
          <Text className="mt-1 text-xs text-muted-foreground">End session</Text>
        </Pressable>
      </View>

      {interruptions > 0 && (
        <Text className="mt-6 text-sm text-muted-foreground">
          {`${interruptions} interruption${interruptions > 1 ? 's' : ''}`}
        </Text>
      )}
    </View>
  );
}
