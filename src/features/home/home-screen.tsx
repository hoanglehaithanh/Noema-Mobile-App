import type { CapacityBucket, TimelineItem } from './planning';
import type { Task, TaskBlock } from '@/types';

import { useQueryClient } from '@tanstack/react-query';
import { Link, useRouter } from 'expo-router';
import * as React from 'react';
import {
  Pressable as RNPressable,
  ScrollView as RNScrollView,
} from 'react-native';
import {
  colors,
  FocusAwareStatusBar,
  Pressable,
  ScrollView,
  Text,
  View,
} from '@/components/ui';
import { Review as CalendarIcon } from '@/components/ui/icons';
import { usePrimaryCalendarEvents } from '@/features/calendar/api';
import { useCaptures } from '@/features/capture/api';
import { useTasks } from '@/features/tasks/api';
import { useCreateTaskBlock, useDeleteTaskBlock, useTaskBlocks } from '@/features/tasks/blocks-api';
import { hrefTask } from '@/lib/href-task';
import { shouldShowBlockingQuerySpinner } from '@/lib/query-loading';
import { useDailyCapacity } from './api';
import { buildCapacityBuckets, buildTimelineItems, findNextOpenSlot, getDoNextBlock, getLocalDateKey, getUnscheduledTasks } from './planning';

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatTime24(value: string) {
  return new Date(value).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function formatTimeRange(start: string, end: string) {
  return `${formatTime(start)} – ${formatTime(end)}`;
}

const TYPE_COLOR: Record<string, string> = {
  deep: 'bg-primary-500',
  shallow: 'bg-warning-400',
  admin: 'bg-neutral-400',
};

const TYPE_TEXT_COLOR: Record<string, string> = {
  deep: 'text-primary-700 dark:text-primary-300',
  shallow: 'text-warning-700 dark:text-warning-300',
  admin: 'text-neutral-600 dark:text-neutral-400',
};

const TYPE_BG: Record<string, string> = {
  deep: 'bg-primary-50 dark:bg-primary-950',
  shallow: 'bg-warning-50 dark:bg-warning-950',
  admin: 'bg-neutral-100 dark:bg-neutral-800',
};

// ─────────────────────────────────────────────────────────
// Week Strip
// ─────────────────────────────────────────────────────────

export function WeekStrip({
  selectedDate,
  onSelectDate,
}: {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}) {
  const today = new Date();
  const dayOfWeek = selectedDate.getDay(); // 0 = Sun

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(selectedDate);
    date.setDate(selectedDate.getDate() - dayOfWeek + i);
    return date;
  });

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <RNScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 2 }}
    >
      {days.map((date, i) => {
        const isToday = date.toDateString() === today.toDateString();
        const isSelected = date.toDateString() === selectedDate.toDateString();
        return (
          <Pressable
            key={`${date.toISOString()}-${i}`}
            onPress={() => onSelectDate(date)}
            className="mr-3 w-10 items-center"
          >
            <Text className="mb-1 text-[11px] font-medium text-muted-foreground">
              {dayLabels[date.getDay()]}
            </Text>
            <View
              className={`size-9 items-center justify-center rounded-full ${
                isSelected
                  ? 'bg-primary-500'
                  : isToday
                    ? 'border border-neutral-300 dark:border-neutral-700'
                    : 'bg-transparent'
              }`}
            >
              <Text
                className={`text-[15px] font-semibold ${
                  isSelected ? 'text-white' : 'text-foreground'
                }`}
              >
                {date.getDate()}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </RNScrollView>
  );
}

// ─────────────────────────────────────────────────────────
// Schedule Header (month + chips)
// ─────────────────────────────────────────────────────────

export type ScheduleChip = 'all' | 'personal' | 'work' | 'meetings';

export function ScheduleHeader({
  baseDate,
  selected,
  onSelect,
}: {
  baseDate: Date;
  selected: ScheduleChip;
  onSelect: (value: ScheduleChip) => void;
}) {
  const monthLabel = baseDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const chips: Array<{ key: ScheduleChip; label: string }> = [
    { key: 'all', label: 'All events' },
    { key: 'personal', label: 'Personal' },
    { key: 'work', label: 'Work' },
    { key: 'meetings', label: 'Meetings' },
  ];

  return (
    <View className="px-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-semibold text-foreground">{monthLabel}</Text>
        <View className="size-9 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
          <CalendarIcon color={colors.neutral[400]} />
        </View>
      </View>

      <RNScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 6 }}
      >
        {chips.map((chip) => {
          const isActive = chip.key === selected;
          return (
            <Pressable
              key={chip.key}
              onPress={() => onSelect(chip.key)}
              className={`mr-2 rounded-full px-3 py-2 border ${
                isActive
                  ? 'bg-primary-50 border-primary-200 dark:bg-primary-950 dark:border-primary-800'
                  : 'bg-neutral-50 border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800'
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  isActive ? 'text-primary-700 dark:text-primary-300' : 'text-muted-foreground'
                }`}
              >
                {chip.label}
              </Text>
            </Pressable>
          );
        })}
      </RNScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────
// Do Next Hero Card
// ─────────────────────────────────────────────────────────

function DoNextCard({ block, tasks }: { block: TaskBlock | null; tasks: Task[] }) {
  const router = useRouter();

  const task = block ? tasks.find(t => t.id === block.task_id) : null;
  const typeKey = block?.type_snapshot ?? 'deep';

  if (!block) {
    return (
      <View className="mx-4 mt-4 overflow-hidden rounded-2xl bg-card border border-neutral-100 dark:border-neutral-800 shadow-sm dark:shadow-none">
        <View className="h-1 w-full bg-primary-500" />
        <View className="p-5">
          <Text className="text-xs font-semibold uppercase tracking-widest text-primary-500">
            Up next
          </Text>
          <Text className="mt-2 text-xl font-bold text-foreground">
            Your schedule is open.
          </Text>
          <Text className="mt-1 text-sm text-muted-foreground">
            Add tasks to your timeline to get started.
          </Text>
          <Pressable
            onPress={() => router.push(hrefTask('new', 'Today'))}
            className="mt-4 items-center rounded-xl bg-primary-500 px-5 py-3"
          >
            <Text className="font-semibold text-white">New Task</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className={`mx-4 mt-4 overflow-hidden rounded-2xl ${TYPE_BG[typeKey]}`}>
      <View className={`h-1 w-full ${TYPE_COLOR[typeKey]}`} />
      <View className="p-5">
        <View className="flex-row items-center justify-between">
          <Text className="text-xs font-semibold uppercase tracking-widest text-primary-500">
            Up next
          </Text>
          <View className={`rounded-full px-2 py-0.5 ${TYPE_BG[typeKey]}`}>
            <Text className={`text-xs font-semibold capitalize ${TYPE_TEXT_COLOR[typeKey]}`}>
              {typeKey}
            </Text>
          </View>
        </View>
        <Text className="mt-2 text-xl font-bold text-foreground" numberOfLines={2}>
          {block.title_snapshot}
        </Text>
        <Text className="mt-1 text-sm text-muted-foreground">
          {formatTimeRange(block.starts_at, block.ends_at)}
          {' · '}
          {block.planned_minutes}
          {' min'}
        </Text>
        {task?.notes ? (
          <Text className="mt-1 text-sm text-muted-foreground" numberOfLines={1}>
            {task.notes}
          </Text>
        ) : null}

        <View className="mt-4 flex-row gap-3">
          <Pressable
            onPress={() => router.push('/focus')}
            className="flex-1 items-center rounded-xl bg-primary-500 py-3"
          >
            <Text className="font-semibold text-white">Start Focus</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push(hrefTask(block.task_id, 'Today'))}
            className="items-center rounded-xl border border-primary-200 px-4 py-3 dark:border-primary-800"
          >
            <Text className="font-semibold text-primary-600 dark:text-primary-400">Details</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────
// Quick Actions with badge
// ─────────────────────────────────────────────────────────

function QuickActions({ unprocessedCount }: { unprocessedCount: number }) {
  const router = useRouter();
  return (
    <View className="mx-4 mt-4 flex-row gap-3">
      <Link href="/capture" asChild>
        <RNPressable className="flex-1 flex-row items-center justify-between rounded-2xl bg-card px-5 py-4 shadow-sm dark:shadow-none border border-neutral-100 dark:border-neutral-800">
          <View>
            <Text className="text-xs font-medium text-muted-foreground">Capture</Text>
            <Text className="text-sm font-semibold text-foreground">Quick Note</Text>
          </View>
          {unprocessedCount > 0 && (
            <View className="min-w-6 items-center justify-center rounded-full bg-danger-500 px-1.5 py-0.5">
              <Text className="text-xs font-bold text-white">{unprocessedCount}</Text>
            </View>
          )}
        </RNPressable>
      </Link>
      <Pressable
        onPress={() => router.push(hrefTask('new', 'Today'))}
        className="flex-1 flex-row items-center justify-between rounded-2xl bg-card px-5 py-4 border border-neutral-100 dark:border-neutral-800 shadow-sm dark:shadow-none"
      >
        <View>
          <Text className="text-xs font-medium text-muted-foreground">Tasks</Text>
          <Text className="text-sm font-semibold text-foreground">New Task</Text>
        </View>
        <View className="size-9 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
          <Text className="text-xl font-light text-muted-foreground">+</Text>
        </View>
      </Pressable>
    </View>
  );
}

// ─────────────────────────────────────────────────────────
// Capacity Pills
// ─────────────────────────────────────────────────────────

function CapacityPills({ buckets }: { buckets: CapacityBucket[] }) {
  if (buckets.length === 0)
    return null;
  return (
    <View className="mx-4 mt-4 flex-row gap-2">
      {buckets.map(bucket => {
        const pct = bucket.budget > 0 ? Math.min((bucket.planned / bucket.budget) * 100, 100) : 0;
        return (
          <View key={bucket.type} className="flex-1 rounded-xl bg-card px-3 py-2.5 border border-neutral-100 dark:border-neutral-800">
            <Text className="text-xs capitalize text-muted-foreground">{bucket.type}</Text>
            <Text className="mt-0.5 text-xs font-semibold text-foreground">
              {bucket.planned}
              <Text className="font-normal text-muted-foreground">
                {'/'}
                {bucket.budget}
                {'m'}
              </Text>
            </Text>
            <View className="mt-1.5 h-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
              <View
                className={`h-1 rounded-full ${TYPE_COLOR[bucket.type] ?? 'bg-primary-500'}`}
                style={{ width: `${pct}%` }}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ─────────────────────────────────────────────────────────
// Timeline
// ─────────────────────────────────────────────────────────

const CALENDAR_LEFT_COLOR = 'bg-neutral-300 dark:bg-neutral-600';

function TimelineCard({
  item,
  onDeleteBlock,
}: {
  item: TimelineItem;
  onDeleteBlock: (id: string) => void;
}) {
  const isCalendar = item.kind === 'calendar';
  const leftColor = isCalendar ? CALENDAR_LEFT_COLOR : (TYPE_COLOR[item.type] ?? 'bg-primary-500');
  const rightTime = isCalendar
    ? (item.allDay ? 'All day' : formatTime24(item.start))
    : formatTime24(item.start);

  return (
    <Pressable
      onPress={() => {
        if (!isCalendar && item.kind === 'task_block') {
          // no task_block detail screen, navigate to task
        }
      }}
      className="flex-row overflow-hidden rounded-2xl bg-card border border-neutral-100 dark:border-neutral-800 shadow-sm dark:shadow-none"
    >
      <View className={`w-1 ${leftColor}`} />
      <View className="flex-1 flex-row items-center justify-between px-4 py-3.5">
        <View className="flex-1 pr-3">
          <Text className="text-[15px] font-semibold text-foreground" numberOfLines={1}>
            {item.title}
          </Text>
          <Text className="mt-0.5 text-xs text-muted-foreground" numberOfLines={1}>
            {isCalendar
              ? (item.allDay ? 'Calendar event' : formatTimeRange(item.start, item.end))
              : `${formatTimeRange(item.start, item.end)} · ${item.type}`}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-xs font-semibold text-muted-foreground">{rightTime}</Text>
        </View>
      </View>
      {!isCalendar && item.kind === 'task_block' && item.status !== 'completed' && (
        <Pressable
          onPress={() => onDeleteBlock(item.id)}
          className="items-center justify-center px-3"
        >
          <Text className="text-xs text-danger-500">Remove</Text>
        </Pressable>
      )}
    </Pressable>
  );
}

export function TimelineSection({
  items,
  isLoading,
  isError,
  onDeleteBlock,
}: {
  items: TimelineItem[];
  isLoading: boolean;
  isError: boolean;
  onDeleteBlock: (id: string) => void;
}) {
  return (
    <View className="mx-4 mt-4">
      <Text className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Day Schedule
      </Text>
      {isLoading && (
        <Text className="text-sm text-muted-foreground">Loading schedule…</Text>
      )}
      {isError && (
        <Text className="text-sm text-danger-500">
          Couldn't load calendar events.
        </Text>
      )}
      {!isLoading && !isError && items.length === 0 && (
        <View className="rounded-2xl bg-card border border-neutral-100 p-5 dark:border-neutral-800">
          <Text className="text-sm font-semibold text-foreground">Nothing planned yet</Text>
          <Text className="mt-1 text-sm text-muted-foreground">
            Add a task, then schedule it into your day.
          </Text>
        </View>
      )}
      {!isLoading && !isError && (
        <View className="gap-2">
          {items.map(item => (
            <TimelineCard
              key={`${item.kind}-${item.id}`}
              item={item}
              onDeleteBlock={onDeleteBlock}
            />
          ))}
        </View>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────
// Unscheduled Tasks
// ─────────────────────────────────────────────────────────

function UnscheduledSection({
  tasks,
  onSchedule,
}: {
  tasks: Task[];
  onSchedule: (task: Task) => void;
}) {
  const router = useRouter();
  if (tasks.length === 0)
    return null;

  return (
    <View className="mx-4 mt-4">
      <Text className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Ready to Plan
      </Text>
      <View className="gap-2">
        {tasks.map(task => (
          <View
            key={task.id}
            className="overflow-hidden rounded-2xl bg-card border border-neutral-100 dark:border-neutral-800"
          >
            <View className="flex-row items-center px-4 py-3">
              <Pressable onPress={() => router.push(hrefTask(task.id, 'Today'))} className="flex-1">
                <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
                  {task.title}
                </Text>
                <View className="mt-1 flex-row items-center gap-2">
                  <View className={`rounded-full px-2 py-0.5 ${TYPE_BG[task.type]}`}>
                    <Text className={`text-xs font-medium capitalize ${TYPE_TEXT_COLOR[task.type]}`}>
                      {task.type}
                    </Text>
                  </View>
                  {task.expected_minutes ? (
                    <Text className="text-xs text-muted-foreground">
                      {task.expected_minutes}
                      {' min'}
                    </Text>
                  ) : null}
                </View>
              </Pressable>
              <Pressable
                onPress={() => onSchedule(task)}
                className="ml-3 rounded-xl bg-primary-50 px-3 py-1.5 dark:bg-primary-950"
              >
                <Text className="text-xs font-semibold text-primary-600 dark:text-primary-400">
                  Schedule
                </Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────────────────

type HomeScrollProps = {
  greeting: string;
  dateLabel: string;
  selectedDate: Date;
  setSelectedDate: (d: Date) => void;
  scheduleChip: ScheduleChip;
  setScheduleChip: (c: ScheduleChip) => void;
  currentBlock: TaskBlock | null;
  tasks: Task[] | undefined;
  capturesCount: number;
  capacityBuckets: CapacityBucket[];
  timelineItems: TimelineItem[];
  calendarLoading: boolean;
  calendarError: boolean;
  onDeleteBlock: (id: string) => void;
  unscheduledTasks: Task[];
  onQuickSchedule: (task: Task) => void;
};

function HomeScroll(props: HomeScrollProps) {
  return (
    <>
      <FocusAwareStatusBar />
      <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
        <View className="px-4 pb-2 pt-16">
          <Text className="text-2xl font-extrabold tracking-tight text-foreground">Noema</Text>
          <Text className="mt-3 text-4xl font-extrabold tracking-tight text-foreground">{props.greeting}</Text>
          <Text className="mt-1 text-sm text-muted-foreground">{props.dateLabel}</Text>
        </View>

        <View className="mx-4 mt-3 rounded-2xl bg-card border border-neutral-100 py-3 dark:border-neutral-800 shadow-sm dark:shadow-none">
          <ScheduleHeader
            baseDate={props.selectedDate}
            selected={props.scheduleChip}
            onSelect={props.setScheduleChip}
          />
          <WeekStrip selectedDate={props.selectedDate} onSelectDate={props.setSelectedDate} />
        </View>

        <DoNextCard block={props.currentBlock} tasks={props.tasks ?? []} />

        <QuickActions unprocessedCount={props.capturesCount} />

        <CapacityPills buckets={props.capacityBuckets} />

        <TimelineSection
          items={props.timelineItems}
          isLoading={props.calendarLoading}
          isError={props.calendarError}
          onDeleteBlock={props.onDeleteBlock}
        />

        <UnscheduledSection tasks={props.unscheduledTasks} onSchedule={props.onQuickSchedule} />

        <View className="h-8" />
      </ScrollView>
    </>
  );
}

export function HomeScreen() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = React.useState(() => new Date());
  const selectedDayKey = React.useMemo(() => getLocalDateKey(selectedDate), [selectedDate]);

  const calendarQuery = usePrimaryCalendarEvents({ variables: { date: selectedDayKey } });
  const { data: tasks } = useTasks({ variables: { date: selectedDayKey } });
  const { data: taskBlocks } = useTaskBlocks({ variables: { date: selectedDayKey } });
  const { data: capacity } = useDailyCapacity({ variables: { date: selectedDayKey } });
  const { data: captures } = useCaptures({ variables: { processed: false } });
  const { mutate: createTaskBlock } = useCreateTaskBlock();
  const { mutate: deleteTaskBlock } = useDeleteTaskBlock();

  const blocks = taskBlocks ?? [];

  const plannedTasks = React.useMemo(
    () => (tasks ?? []).filter(t => t.status === 'planned' || t.status === 'active'),
    [tasks],
  );

  const currentBlock = React.useMemo(() => getDoNextBlock(blocks), [blocks]);

  const unscheduledTasks = React.useMemo(
    () => getUnscheduledTasks(plannedTasks, blocks, selectedDayKey),
    [plannedTasks, blocks, selectedDayKey],
  );

  const timelineItems = React.useMemo(
    () => buildTimelineItems(calendarQuery.data ?? [], blocks),
    [calendarQuery.data, blocks],
  );

  const capacityBuckets = React.useMemo(
    () => buildCapacityBuckets(capacity, blocks),
    [capacity, blocks],
  );

  const invalidateToday = React.useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['task_blocks'] });
    queryClient.invalidateQueries({ queryKey: ['daily_capacity'] });
    queryClient.invalidateQueries({ queryKey: ['calendar_primary_events'] });
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  }, [queryClient]);

  const handleQuickSchedule = React.useCallback((task: Task) => {
    const slot = findNextOpenSlot({
      day: selectedDayKey,
      durationMinutes: task.expected_minutes ?? 60,
      events: calendarQuery.data ?? [],
      blocks,
    });
    if (!slot)
      return;
    createTaskBlock(
      {
        task_id: task.id,
        title_snapshot: task.title,
        type_snapshot: task.type,
        starts_at: slot.toISOString(),
        planned_minutes: task.expected_minutes ?? 60,
      },
      { onSuccess: invalidateToday },
    );
  }, [blocks, calendarQuery.data, createTaskBlock, invalidateToday, selectedDayKey]);

  const handleDeleteBlock = React.useCallback((id: string) => {
    deleteTaskBlock({ id }, { onSuccess: invalidateToday });
  }, [deleteTaskBlock, invalidateToday]);

  const greeting = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12)
      return 'Good morning';
    if (hour < 17)
      return 'Good afternoon';
    return 'Good evening';
  }, []);

  const dateLabel = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const [scheduleChip, setScheduleChip] = React.useState<ScheduleChip>('all');

  return (
    <HomeScroll
      greeting={greeting}
      dateLabel={dateLabel}
      selectedDate={selectedDate}
      setSelectedDate={setSelectedDate}
      scheduleChip={scheduleChip}
      setScheduleChip={setScheduleChip}
      currentBlock={currentBlock}
      tasks={tasks}
      capturesCount={captures?.length ?? 0}
      capacityBuckets={capacityBuckets}
      timelineItems={timelineItems}
      calendarLoading={shouldShowBlockingQuerySpinner(calendarQuery)}
      calendarError={calendarQuery.isError}
      onDeleteBlock={handleDeleteBlock}
      unscheduledTasks={unscheduledTasks}
      onQuickSchedule={handleQuickSchedule}
    />
  );
}
