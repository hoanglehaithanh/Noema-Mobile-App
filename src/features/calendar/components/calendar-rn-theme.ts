import type { Theme } from 'react-native-calendars/src/types';

/** react-native-calendars theme aligned with app / Stitch neutrals + primary teal. */
export function buildCalendarTheme(isDark: boolean): Theme {
  const bg = isDark ? '#171717' : '#FAFAFA';
  const surface = isDark ? '#262626' : '#FFFFFF';
  const text = isDark ? '#FAFAFA' : '#171717';
  const muted = isDark ? '#A3A3A3' : '#737373';
  const disabled = isDark ? '#404040' : '#D4D4D4';
  const primary = '#14B8A6';

  return {
    backgroundColor: bg,
    calendarBackground: surface,
    textSectionTitleColor: muted,
    selectedDayBackgroundColor: primary,
    selectedDayTextColor: '#FFFFFF',
    todayTextColor: primary,
    todayBackgroundColor: isDark ? '#262626' : '#F5F5F5',
    dayTextColor: text,
    textDisabledColor: disabled,
    dotColor: primary,
    selectedDotColor: '#FFFFFF',
    arrowColor: text,
    monthTextColor: text,
    indicatorColor: primary,
    textDayFontWeight: '600' as Theme['textDayFontWeight'],
    textMonthFontWeight: '700' as Theme['textMonthFontWeight'],
    textDayHeaderFontWeight: '600' as Theme['textDayHeaderFontWeight'],
    stylesheet: {
      calendar: {
        header: {
          week: {
            marginTop: 4,
            marginBottom: 0,
            flexDirection: 'row',
            justifyContent: 'space-around',
          },
        },
      },
    },
  };
}
