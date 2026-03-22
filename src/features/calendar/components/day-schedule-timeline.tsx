import type { TimelineItem } from '@/features/home/planning';

import { useRouter } from 'expo-router';
import * as React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { hrefTask } from '@/lib/href-task';

const START_HOUR = 6;
const END_HOUR = 22;
const PX_PER_MINUTE = 1.05;
const MIN_BLOCK_PX = 48;

const dayStartMinutes = START_HOUR * 60;
const dayEndMinutes = END_HOUR * 60;
const timelineHeight = (dayEndMinutes - dayStartMinutes) * PX_PER_MINUTE;

function minutesSinceDayStart(iso: string): number {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatTimeRange(start: string, end: string) {
  return `${formatTime(start)} — ${formatTime(end)}`;
}

const TYPE_ACCENT: Record<string, string> = {
  deep: '#14B8A6',
  shallow: '#FBBF24',
  admin: '#A3A3A3',
};

function getNextTimedId(items: TimelineItem[], nowMs: number): string | null {
  const sorted = [...items].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
  );
  for (const it of sorted) {
    if (it.kind === 'calendar' && it.allDay)
      continue;
    const end = new Date(it.end).getTime();
    const start = new Date(it.start).getTime();
    if (end <= nowMs)
      continue;
    if (it.kind === 'task_block' && (it.status === 'completed' || it.status === 'skipped'))
      continue;
    if (start >= nowMs || (start < nowMs && end > nowMs))
      return it.id;
  }
  return null;
}

function getBadge(item: TimelineItem, nowMs: number, nextId: string | null): string | null {
  if (item.kind === 'calendar')
    return null;
  if (item.status === 'completed')
    return 'Done';
  if (item.status === 'skipped')
    return 'Missed';
  if (new Date(item.end).getTime() < nowMs)
    return 'Missed';
  if (nextId === item.id)
    return 'Next up';
  if (item.type === 'deep')
    return 'Focus session';
  return null;
}

function TimedBlock({
  item,
  nextId,
  nowMs,
  onDeleteBlock,
}: {
  item: TimelineItem;
  nextId: string | null;
  nowMs: number;
  onDeleteBlock: (id: string) => void;
}) {
  const router = useRouter();
  const badge = getBadge(item, nowMs, nextId);
  const startMin = minutesSinceDayStart(item.start);
  const endMin = minutesSinceDayStart(item.end);
  const clippedStart = Math.max(startMin, dayStartMinutes);
  const clippedEnd = Math.min(endMin, dayEndMinutes);
  if (clippedEnd <= clippedStart)
    return null;

  const top = (clippedStart - dayStartMinutes) * PX_PER_MINUTE;
  const height = Math.max(MIN_BLOCK_PX, (clippedEnd - clippedStart) * PX_PER_MINUTE);
  const isCalendar = item.kind === 'calendar';
  const accent = isCalendar ? '#737373' : (TYPE_ACCENT[item.type] ?? '#14B8A6');
  const missed = badge === 'Missed';

  return (
    <View
      style={[
        styles.blockWrap,
        {
          top,
          height,
          borderLeftColor: missed ? '#EF4444' : accent,
        },
      ]}
    >
      <Pressable
        onPress={() => {
          if (item.kind === 'task_block')
            router.push(hrefTask(item.task_id, 'Calendar'));
        }}
        disabled={item.kind === 'calendar'}
        className="flex-1 rounded-xl bg-white px-3 py-2 dark:bg-neutral-900"
        style={styles.blockInner}
      >
        {badge
          ? (
              <Text
                className={
                  missed
                    ? 'mb-0.5 text-[10px] font-bold tracking-wider text-danger-500 uppercase'
                    : 'mb-0.5 text-[10px] font-bold tracking-wider text-primary-600 uppercase dark:text-primary-400'
                }
              >
                {badge}
              </Text>
            )
          : null}
        <Text className="text-[15px] font-bold text-foreground" numberOfLines={2}>
          {item.title}
        </Text>
        <Text className="mt-0.5 text-xs text-muted-foreground">
          {isCalendar && item.allDay ? 'All day' : formatTimeRange(item.start, item.end)}
        </Text>
        {!isCalendar && item.kind === 'task_block' && item.status !== 'completed' && (
          <Pressable
            onPress={() => onDeleteBlock(item.id)}
            className="mt-2 self-start"
            hitSlop={8}
          >
            <Text className="text-xs font-semibold text-danger-500">Remove</Text>
          </Pressable>
        )}
      </Pressable>
    </View>
  );
}

const HOURS = Array.from(
  { length: END_HOUR - START_HOUR },
  (_, i) => START_HOUR + i,
);

function ScheduleAllDaySection({ items }: { items: TimelineItem[] }) {
  if (items.length === 0)
    return null;
  return (
    <View className="mb-4">
      <Text className="mb-2 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
        All day
      </Text>
      <View className="gap-2">
        {items.map(item => (
          <View
            key={`allday-${item.id}`}
            className="rounded-xl border-l-4 border-l-neutral-400 bg-white px-3 py-2.5 dark:bg-neutral-950"
          >
            <Text className="text-sm font-semibold text-foreground" numberOfLines={2}>
              {item.title}
            </Text>
            <Text className="mt-0.5 text-xs text-muted-foreground">All day</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function ScheduleTimedGrid({
  timedItems,
  nextId,
  nowMs,
  onDeleteBlock,
}: {
  timedItems: TimelineItem[];
  nextId: string | null;
  nowMs: number;
  onDeleteBlock: (id: string) => void;
}) {
  return (
    <View className="flex-row">
      <View style={styles.gutter}>
        {HOURS.map((h) => {
          const label = new Date(2000, 0, 1, h, 0).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          });
          return (
            <View
              key={h}
              style={[styles.hourLabelCell, { height: 60 * PX_PER_MINUTE }]}
            >
              <Text className="text-[10px] font-semibold text-muted-foreground">{label}</Text>
            </View>
          );
        })}
      </View>
      <View style={styles.gridColumn}>
        {HOURS.map(h => (
          <View
            key={`grid-${h}`}
            style={[styles.hourRow, { height: 60 * PX_PER_MINUTE }]}
          />
        ))}
        <View style={[styles.blocksLayer, { height: timelineHeight }]}>
          {timedItems.map(item => (
            <TimedBlock
              key={`${item.kind}-${item.id}`}
              item={item}
              nextId={nextId}
              nowMs={nowMs}
              onDeleteBlock={onDeleteBlock}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

type Props = {
  items: TimelineItem[];
  isLoading: boolean;
  isError: boolean;
  onDeleteBlock: (id: string) => void;
};

/** Stitch-style day timeline: hour rail + positioned blocks (calendar tab only). */
export function DayScheduleTimeline({
  items,
  isLoading,
  isError,
  onDeleteBlock,
}: Props) {
  const router = useRouter();
  const [scheduleNow] = React.useState(() => Date.now());
  const nextId = getNextTimedId(items, scheduleNow);

  const allDayItems = React.useMemo(
    () => items.filter(i => i.kind === 'calendar' && i.allDay),
    [items],
  );
  const timedItems = React.useMemo(
    () => items.filter(i => !(i.kind === 'calendar' && i.allDay)),
    [items],
  );

  return (
    <View className="relative mt-4 pb-24">
      <View className="mb-3 flex-row items-end justify-between">
        <Text className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          Day schedule
        </Text>
      </View>

      <View className="rounded-2xl bg-neutral-50 p-4 dark:bg-neutral-900">
        {isLoading && (
          <View className="flex-row items-center gap-3 py-10">
            <ActivityIndicator />
            <Text className="text-sm text-muted-foreground">Loading schedule…</Text>
          </View>
        )}

        {!isLoading && isError && (
          <Text className="py-4 text-sm text-danger-500">
            Could not load calendar events.
          </Text>
        )}

        {!isLoading && !isError && (
          <ScheduleAllDaySection items={allDayItems} />
        )}

        {!isLoading && !isError && timedItems.length === 0 && allDayItems.length === 0 && (
          <View className="rounded-xl bg-white px-4 py-6 dark:bg-neutral-950">
            <Text className="text-sm font-semibold text-foreground">Nothing planned yet</Text>
            <Text className="mt-1 text-sm text-muted-foreground">
              Add a task, then schedule it into your day.
            </Text>
          </View>
        )}

        {!isLoading && !isError && timedItems.length > 0 && (
          <ScheduleTimedGrid
            timedItems={timedItems}
            nextId={nextId}
            nowMs={scheduleNow}
            onDeleteBlock={onDeleteBlock}
          />
        )}
      </View>

      <Pressable
        onPress={() => router.push('/add-task')}
        className="absolute right-5 bottom-6 size-14 items-center justify-center rounded-full bg-primary-500 shadow-lg"
        style={styles.fab}
      >
        <Text className="text-2xl font-light text-white">+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  gutter: {
    width: 52,
    paddingRight: 4,
  },
  hourLabelCell: {
    justifyContent: 'flex-start',
    paddingTop: 0,
  },
  gridColumn: {
    flex: 1,
    position: 'relative',
  },
  hourRow: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(163, 163, 163, 0.35)',
  },
  blocksLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
  },
  blockWrap: {
    position: 'absolute',
    left: 4,
    right: 0,
    borderLeftWidth: 4,
    paddingLeft: 8,
  },
  blockInner: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  fab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
});
