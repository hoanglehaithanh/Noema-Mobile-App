import { Redirect } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import * as React from 'react';

import { useAuthStore as useAuth } from '@/features/auth/use-auth-store';
import { useCaptures } from '@/features/capture/api';
import { useQueueTasks } from '@/features/inbox/use-queue-tasks';

function QueueBadge() {
  const { data: captures } = useCaptures({ variables: { processed: false } });
  const { tasks: queueTasks } = useQueueTasks();

  const total = (captures?.length ?? 0) + queueTasks.length;
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

      <NativeTabs.Trigger name="calendar">
        <NativeTabs.Trigger.Icon
          sf={{ default: 'calendar', selected: 'calendar' }}
          md="calendar_today"
        />
        <NativeTabs.Trigger.Label>Calendar</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="add-task">
        <NativeTabs.Trigger.Icon
          sf={{ default: 'plus.circle', selected: 'plus.circle.fill' }}
          md="add_circle"
        />
        <NativeTabs.Trigger.Label>Add task</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="inbox">
        <NativeTabs.Trigger.Icon sf={{ default: 'tray', selected: 'tray.fill' }} md="inbox" />
        <NativeTabs.Trigger.Label>Queue</NativeTabs.Trigger.Label>
        <QueueBadge />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Icon
          sf={{ default: 'gearshape', selected: 'gearshape.fill' }}
          md="settings"
        />
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      {/* Hidden screens — not shown in tab bar */}
      <NativeTabs.Trigger name="focus" hidden />
      <NativeTabs.Trigger name="chat" hidden />
      <NativeTabs.Trigger name="review" hidden />
    </NativeTabs>
  );
}
