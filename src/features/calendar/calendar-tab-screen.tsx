import type { ScheduleChip } from '@/features/home/home-screen';
import { useQueryClient } from '@tanstack/react-query';

import * as React from 'react';
import { RefreshControl } from 'react-native';
import {
  FocusAwareStatusBar,
  ScrollView,
  Text,
  View,
} from '@/components/ui';
import { usePrimaryCalendarEvents } from '@/features/calendar/api';
import {
  ScheduleHeader,
  TimelineSection,
  WeekStrip,
} from '@/features/home/home-screen';
import { buildTimelineItems, getLocalDateKey } from '@/features/home/planning';
import { useDeleteTaskBlock, useTaskBlocks } from '@/features/tasks/blocks-api';

export function CalendarScreen() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = React.useState(() => new Date());
  const selectedDayKey = React.useMemo(() => getLocalDateKey(selectedDate), [selectedDate]);

  const calendarQuery = usePrimaryCalendarEvents({ variables: { date: selectedDayKey } });
  const blocksQuery = useTaskBlocks({ variables: { date: selectedDayKey } });
  const { data: taskBlocks } = blocksQuery;
  const { mutate: deleteTaskBlock } = useDeleteTaskBlock();

  const timelineItems = React.useMemo(() => {
    const blocks = taskBlocks ?? [];
    return buildTimelineItems(calendarQuery.data ?? [], blocks);
  }, [calendarQuery.data, taskBlocks]);

  const invalidateToday = React.useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['task_blocks'] });
    queryClient.invalidateQueries({ queryKey: ['calendar_primary_events'] });
  }, [queryClient]);

  const calendarRefreshing = calendarQuery.isRefetching || blocksQuery.isRefetching;

  const onCalendarRefresh = React.useCallback(() => {
    void Promise.all([calendarQuery.refetch(), blocksQuery.refetch()]);
  }, [blocksQuery.refetch, calendarQuery.refetch]);

  const handleDeleteBlock = React.useCallback((id: string) => {
    deleteTaskBlock({ id }, { onSuccess: invalidateToday });
  }, [deleteTaskBlock, invalidateToday]);

  const [scheduleChip, setScheduleChip] = React.useState<ScheduleChip>('all');

  const dateLabel = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      <FocusAwareStatusBar />
      <ScrollView
        className="flex-1 bg-background"
        showsVerticalScrollIndicator={false}
        refreshControl={(
          <RefreshControl
            refreshing={calendarRefreshing}
            onRefresh={onCalendarRefresh}
          />
        )}
      >
        <View className="px-4 pt-16 pb-2">
          <Text className="ml-1 text-4xl font-extrabold tracking-tight text-foreground">Today</Text>
          <Text className="mt-1 ml-1 text-sm text-muted-foreground">{dateLabel}</Text>
        </View>

        <View className="mx-4 mt-3 rounded-2xl border border-neutral-100 bg-card py-3 shadow-sm dark:border-neutral-800 dark:shadow-none">
          <ScheduleHeader baseDate={selectedDate} selected={scheduleChip} onSelect={setScheduleChip} />
          <WeekStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        </View>

        <TimelineSection
          items={timelineItems}
          isLoading={calendarQuery.isLoading}
          isError={calendarQuery.isError}
          onDeleteBlock={handleDeleteBlock}
        />

        <View className="h-8" />
      </ScrollView>
    </>
  );
}
