import * as React from 'react';

import { Button, Text, View } from '@/components/ui';
import { Input } from '@/components/ui/input';

type SessionReflectionProps = {
  elapsedMinutes: number;
  interruptions: number;
  onSave: (reflection: string) => void;
  onSkip: () => void;
  loading?: boolean;
};

export function SessionReflection({
  elapsedMinutes,
  interruptions,
  onSave,
  onSkip,
  loading,
}: SessionReflectionProps) {
  const [reflection, setReflection] = React.useState('');

  return (
    <View className="flex-1 justify-center px-4">
      <Text className="mb-2 text-center text-2xl font-bold">
        Session Complete
      </Text>
      <Text className="mb-6 text-center text-muted-foreground">
        {elapsedMinutes}
        {' '}
        min focused
        {interruptions > 0 ? ` · ${interruptions} interruption${interruptions > 1 ? 's' : ''}` : ''}
      </Text>

      <Input
        label="Quick reflection (optional)"
        placeholder="How did it go?"
        value={reflection}
        onChangeText={setReflection}
        multiline
        numberOfLines={3}
        testID="reflection-input"
      />

      <View className="mt-4 gap-2">
        <Button
          label="Save & Close"
          onPress={() => onSave(reflection)}
          loading={loading}
          testID="reflection-save"
        />
        <Button
          label="Skip"
          variant="ghost"
          onPress={onSkip}
          testID="reflection-skip"
        />
      </View>
    </View>
  );
}
