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
    <View className="p-5">
      <Text className="mb-1 text-lg font-bold">Triage</Text>
      <Text className="mb-4 text-muted-foreground" numberOfLines={2}>
        {capture.content}
      </Text>

      <View>
        <Button
          label="Deep Task"
          variant="secondary"
          onPress={() => onAction(capture, { type: 'task', taskType: 'deep' })}
          loading={loading}
          className="mb-3"
        />
        <Button
          label="Shallow Task"
          variant="outline"
          onPress={() => onAction(capture, { type: 'task', taskType: 'shallow' })}
          loading={loading}
          className="mb-3"
        />
        <Button
          label="Keep as Note"
          variant="outline"
          onPress={() => onAction(capture, { type: 'note' })}
          loading={loading}
          className="mb-3"
        />
        <Button
          label="Archive"
          variant="ghost"
          onPress={() => onAction(capture, { type: 'archive' })}
          loading={loading}
          className="mb-1"
        />
      </View>

      <Button
        label="Cancel"
        variant="ghost"
        onPress={onCancel}
        className="mt-4"
      />
    </View>
  );
}

export type { TriageAction };
