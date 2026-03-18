import type { Capture, TaskType } from '@/types';

import * as React from 'react';
import { Button, Text, View } from '@/components/ui';

type TriageAction
  = | { type: 'task'; taskType: TaskType }
    | { type: 'note' }
    | { type: 'archive' };

type TriageSheetProps = {
  capture: Capture;
  onAction: (capture: Capture, action: TriageAction) => void;
  onCancel: () => void;
  loading?: boolean;
};

export function TriageSheet({ capture, onAction, onCancel, loading }: TriageSheetProps) {
  return (
    <View className="px-4 pb-8">
      <Text className="mb-1 text-lg font-bold">Triage</Text>
      <Text className="mb-4 text-muted-foreground" numberOfLines={2}>
        {capture.content}
      </Text>

      <View className="gap-2">
        <Button
          label="Deep Task"
          variant="secondary"
          onPress={() => onAction(capture, { type: 'task', taskType: 'deep' })}
          loading={loading}
        />
        <Button
          label="Shallow Task"
          variant="outline"
          onPress={() => onAction(capture, { type: 'task', taskType: 'shallow' })}
          loading={loading}
        />
        <Button
          label="Keep as Note"
          variant="outline"
          onPress={() => onAction(capture, { type: 'note' })}
          loading={loading}
        />
        <Button
          label="Archive"
          variant="ghost"
          onPress={() => onAction(capture, { type: 'archive' })}
          loading={loading}
        />
      </View>

      <Button
        label="Cancel"
        variant="ghost"
        onPress={onCancel}
        className="mt-2"
      />
    </View>
  );
}

export type { TriageAction };
