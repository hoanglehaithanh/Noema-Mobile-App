import * as React from 'react';

import { Button, Pressable, Select, Text, View } from '@/components/ui';
import { Input } from '@/components/ui/input';

type FocusSetupProps = {
  selectedBlockId?: string;
  blockOptions: { label: string; value: string }[];
  goal: string;
  duration: string;
  onChangeBlock: (v: string) => void;
  onChangeGoal: (v: string) => void;
  onChangeDuration: (v: string) => void;
  onStart: () => void;
};

const PRESETS = [15, 25, 45, 60];

export function FocusSetup({
  selectedBlockId,
  blockOptions,
  goal,
  duration,
  onChangeBlock,
  onChangeGoal,
  onChangeDuration,
  onStart,
}: FocusSetupProps) {
  return (
    <View className="flex-1 px-4">
      <Text className="mb-6 text-2xl font-bold">Start a Focus Session</Text>

      <Select
        label="Planned block (optional)"
        value={selectedBlockId}
        options={blockOptions}
        placeholder="Use a planned block"
        onSelect={v => onChangeBlock(String(v))}
      />

      <Input
        label="Goal (optional)"
        placeholder="What will you focus on?"
        value={goal}
        onChangeText={onChangeGoal}
        testID="focus-goal"
      />

      <Input
        label="Duration (minutes)"
        placeholder="25"
        value={duration}
        onChangeText={onChangeDuration}
        keyboardType="number-pad"
        testID="focus-duration"
      />

      <View className="mt-2 flex-row gap-2">
        {PRESETS.map(mins => (
          <Pressable
            key={mins}
            onPress={() => onChangeDuration(String(mins))}
            className={`flex-1 items-center rounded-lg py-2 ${
              duration === String(mins)
                ? 'bg-primary-600'
                : 'bg-neutral-100 dark:bg-neutral-800'
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                duration === String(mins)
                  ? 'text-white'
                  : 'text-neutral-600 dark:text-neutral-300'
              }`}
            >
              {`${mins}m`}
            </Text>
          </Pressable>
        ))}
      </View>

      <View className="mt-8">
        <Button label="Start Focus" onPress={onStart} testID="focus-start" size="lg" />
      </View>
    </View>
  );
}
