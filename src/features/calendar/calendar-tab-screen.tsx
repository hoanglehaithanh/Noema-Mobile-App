import { useQueryClient } from '@tanstack/react-query';

import * as React from 'react';
import { Platform, RefreshControl } from 'react-native';
import {
  FocusAwareStatusBar,
  ScrollView,
  Text,
  View,
} from '@/components/ui';
import { usePrimaryCalendarEvents } from '@/features/calendar/api';
import { DayScheduleTimeline } from '@/features/calendar/components/day-schedule-timeline';
import { NoemaExpandableCalendar } from '@/features/calendar/components/noema-expandable-calendar';
import { buildTimelineItems, getLocalDateKey } from '@/features/home/planning';
import { useDeleteTaskBlock, useTaskBlocks } from '@/features/tasks/blocks-api';
import { shouldShowBlockingSpinnerAny } from '@/lib/query-loading';

function parseDayKeyToLocalDate(dayKey: string): Date {
  const [y, m, d] = dayKey.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

export function CalendarScreen() {
  const queryClient = useQueryClient();
  const [selectedDayKey, setSelectedDayKey] = React.useState(() => getLocalDateKey());
  const selectedDate = React.useMemo(
    () => parseDayKeyToLocalDate(selectedDayKey),
    [selectedDayKey],
  );

  const calendarQuery = usePrimaryCalendarEvents({ variables: { date: selectedDayKey } });
  const blocksQuery = useTaskBlocks({ variables: { date: selectedDayKey } });
  const { data: taskBlocks } = blocksQuery;
  const { mutate: deleteTaskBlock } = useDeleteTaskBlock();

  const visitedDaysRef = React.useRef(new Set<string>());
  React.useEffect(() => {
    if (calendarQuery.isFetched && blocksQuery.isFetched)
      visitedDaysRef.current.add(selectedDayKey);
  }, [blocksQuery.isFetched, calendarQuery.isFetched, selectedDayKey]);

  const [pullRefreshing, setPullRefreshing] = React.useState(false);
  const handleRefresh = React.useCallback(async () => {
    const seen = visitedDaysRef.current.has(selectedDayKey);
    if (!seen)
      setPullRefreshing(true);
    try {
      await Promise.all([calendarQuery.refetch(), blocksQuery.refetch()]);
    }
    finally {
      setPullRefreshing(false);
    }
  }, [blocksQuery, calendarQuery, selectedDayKey]);

  const timelineItems = React.useMemo(() => {
    const blocks = taskBlocks ?? [];
    return buildTimelineItems(calendarQuery.data ?? [], blocks);
  }, [calendarQuery.data, taskBlocks]);

  const invalidateToday = React.useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['task_blocks'] });
    queryClient.invalidateQueries({ queryKey: ['calendar_primary_events'] });
  }, [queryClient]);

  const handleDeleteBlock = React.useCallback((id: string) => {
    deleteTaskBlock({ id }, { onSuccess: invalidateToday });
  }, [deleteTaskBlock, invalidateToday]);

  const scheduleBlockingLoad = shouldShowBlockingSpinnerAny([calendarQuery, blocksQuery]);

  const todayKey = getLocalDateKey();
  const headerTitle = selectedDayKey === todayKey
    ? 'Today'
    : selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
  const headerSubtitle = selectedDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <>
      <FocusAwareStatusBar />
      <ScrollView
        className="flex-1 bg-background"
        showsVerticalScrollIndicator={false}
        refreshControl={(
          <RefreshControl
            refreshing={pullRefreshing}
            onRefresh={handleRefresh}
            progressViewOffset={Platform.OS === 'android' ? 220 : undefined}
          />
        )}
      >
        <View className="px-4 pt-16 pb-2">
          <Text className="ml-1 text-4xl font-extrabold tracking-tight text-foreground">
            {headerTitle}
          </Text>
          <Text className="mt-1 ml-1 text-sm text-muted-foreground">{headerSubtitle}</Text>
        </View>

        <View className="px-4">
          <NoemaExpandableCalendar
            selectedDayKey={selectedDayKey}
            onDayKeyChange={setSelectedDayKey}
          >
            <DayScheduleTimeline
              items={timelineItems}
              isLoading={scheduleBlockingLoad}
              isError={calendarQuery.isError || blocksQuery.isError}
              onDeleteBlock={handleDeleteBlock}
            />
          </NoemaExpandableCalendar>
        </View>

        <View className="h-8" />
      </ScrollView>
    </>
  );
}
