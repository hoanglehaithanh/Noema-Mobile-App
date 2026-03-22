import { useLocalSearchParams } from 'expo-router';
import * as React from 'react';

import {
  ActivityIndicator,
  FocusAwareStatusBar,
  ScrollView,
  Text,
  View,
} from '@/components/ui';
import { useFocusSession } from './api';

const STATUS_LABELS: Record<string, string> = {
  active: 'In Progress',
  completed: 'Completed',
  abandoned: 'Abandoned',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'text-primary-600',
  completed: 'text-success-600',
  abandoned: 'text-danger-600',
};

export function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: session, isLoading } = useFocusSession({ variables: { id: id! } });

  if (isLoading || !session) {
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
        <View className="flex-1 px-4 pt-4">
          <View className="mb-6 items-center">
            <Text className={`text-lg font-bold ${STATUS_COLORS[session.status]}`}>
              {STATUS_LABELS[session.status]}
            </Text>
            {session.goal && (
              <Text className="mt-2 text-center text-base text-muted-foreground">
                {session.goal}
              </Text>
            )}
          </View>

          <View className="gap-4">
            <InfoRow
              label="Duration"
              value={`${session.actual_minutes ?? '—'} min (planned ${session.planned_minutes} min)`}
            />
            {session.task_block_id && (
              <InfoRow
                label="Planned block"
                value={session.task_block_id}
              />
            )}
            <InfoRow
              label="Started"
              value={new Date(session.started_at).toLocaleString()}
            />
            {session.ended_at && (
              <InfoRow
                label="Ended"
                value={new Date(session.ended_at).toLocaleString()}
              />
            )}
            <InfoRow
              label="Interruptions"
              value={String(session.interruptions_count)}
            />
            <InfoRow
              label="Overrun"
              value={`${session.overrun_minutes} min`}
            />
          </View>

          {session.reflection && (
            <View className="mt-6 rounded-xl bg-neutral-50 p-4 dark:bg-neutral-800">
              <Text className="mb-1 text-sm font-semibold text-muted-foreground">
                Reflection
              </Text>
              <Text className="text-base">{session.reflection}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <Text className="text-sm font-medium">{value}</Text>
    </View>
  );
}
