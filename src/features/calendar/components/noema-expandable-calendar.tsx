import * as React from 'react';
import { useWindowDimensions, View } from 'react-native';
import { CalendarProvider, ExpandableCalendar } from 'react-native-calendars';
import {
  CalendarNavigationTypes,
  UpdateSources,
} from 'react-native-calendars/src/expandableCalendar/commons';
import { useUniwind } from 'uniwind';

import { buildCalendarTheme } from '@/features/calendar/components/calendar-rn-theme';

type Props = {
  selectedDayKey: string;
  onDayKeyChange: (dayKey: string) => void;
  children: React.ReactNode;
};

/** Expandable week ↔ month calendar; must wrap schedule content as siblings inside provider. */
export function NoemaExpandableCalendar({
  selectedDayKey,
  onDayKeyChange,
  children,
}: Props) {
  const { theme } = useUniwind();
  const { width: windowWidth } = useWindowDimensions();
  const isDark = theme === 'dark';
  const calendarTheme = React.useMemo(() => buildCalendarTheme(isDark), [isDark]);
  const calendarWidth = windowWidth - 32; // 32 = px-4 (16 * 2)

  const handleDateChanged = React.useCallback(
    (date: string, updateSource: UpdateSources) => {
      if (
        updateSource === UpdateSources.WEEK_SCROLL
        || updateSource === UpdateSources.PAGE_SCROLL
      ) {
        return;
      }
      onDayKeyChange(date);
    },
    [onDayKeyChange],
  );

  return (
    <CalendarProvider
      date={selectedDayKey}
      theme={calendarTheme}
      disableAutoDaySelection={[
        CalendarNavigationTypes.WEEK_SCROLL,
        CalendarNavigationTypes.WEEK_ARROWS,
        CalendarNavigationTypes.MONTH_SCROLL,
        CalendarNavigationTypes.MONTH_ARROWS,
      ]}
      onDateChanged={handleDateChanged}
      showTodayButton={false}
    >
      <View className="overflow-hidden rounded-2xl border border-neutral-100 bg-card dark:border-neutral-800">
        <View className="min-h-[120px]">
          <ExpandableCalendar
            calendarWidth={calendarWidth}
            theme={calendarTheme}
            firstDay={1}
            initialPosition={ExpandableCalendar.positions.CLOSED}
            allowShadow={true}
            closeOnDayPress
            hideKnob={false}
            pastScrollRange={12}
            futureScrollRange={12}
            windowSize={5}
            maxToRenderPerBatch={3}
            initialNumToRender={3}
          />
        </View>
      </View>
      {children}
    </CalendarProvider>
  );
}
