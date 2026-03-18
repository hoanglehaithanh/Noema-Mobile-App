import { Redirect } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import * as React from 'react';

import { useCaptures } from '@/features/capture/api';
import { useTasks } from '@/features/tasks/api';
import { useAuthStore as useAuth } from '@/features/auth/use-auth-store';

function QueueBadge() {
  const { data: captures } = useCaptures({ variables: { processed: false } });
  const { data: inboxTasks } = useTasks({ variables: { status: 'inbox' } });

  const total = (captures?.length ?? 0) + (inboxTasks?.length ?? 0);
  if (total === 0)
    return null;

  return (
    <NativeTabs.Trigger.Badge>
      {String(total)}
    </NativeTabs.Trigger.Badge>
  );
}

export default function TabLayout() {
  const status = useAuth.use.status();

  if (status === 'signOut') {
    return <Redirect href="/login" />;
  }

  return (
    <NativeTabs minimizeBehavior="onScrollDown">
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} md="home" />
        <NativeTabs.Trigger.Label>Today</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="inbox">
        <NativeTabs.Trigger.Icon sf={{ default: 'tray', selected: 'tray.fill' }} md="inbox" />
        <NativeTabs.Trigger.Label>Queue</NativeTabs.Trigger.Label>
        <QueueBadge />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="focus">
        <NativeTabs.Trigger.Icon sf={{ default: 'timer', selected: 'timer' }} md="timer" />
        <NativeTabs.Trigger.Label>Focus</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="chat">
        <NativeTabs.Trigger.Icon sf={{ default: 'bubble.left', selected: 'bubble.left.fill' }} md="chat" />
        <NativeTabs.Trigger.Label>Chat</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      {/* Hidden screens — not shown in tab bar */}
      <NativeTabs.Trigger name="review" hidden />
    </NativeTabs>
  );
}
