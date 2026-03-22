import type { TaskPriority, TaskStatus, TaskType } from '@/types';

import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FlashList } from '@shopify/flash-list';
import * as React from 'react';
import { Platform, Pressable, View } from 'react-native';
import { useUniwind } from 'uniwind';

import { Button, Text } from '@/components/ui';
import colors from '@/components/ui/colors';
import { CaretDown } from '@/components/ui/icons';
import { Input } from '@/components/ui/input';
import { Modal, useModal } from '@/components/ui/modal';
import { getLocalDateKey } from '@/features/home/planning';

import {
  TASK_PRIORITY_STYLES,
  TASK_STATUS_STYLES,
  TASK_TYPE_STYLES,
} from './task-field-styles';

const List = Platform.OS === 'web' ? FlashList : BottomSheetFlatList;

export function TaskFieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text className="mb-2 text-[11px] font-semibold tracking-[2px] text-muted-foreground uppercase">
      {children}
    </Text>
  );
}

export function TaskBadgePill({
  label,
  pillBg,
  pillText,
  leftAccessory,
}: {
  label: string;
  pillBg: string;
  pillText: string;
  leftAccessory?: React.ReactNode;
}) {
  return (
    <View className="flex-row items-center gap-2">
      {leftAccessory}
      <View className={`self-start rounded-full px-3 py-1 ${pillBg}`}>
        <Text className={`text-sm font-semibold capitalize ${pillText}`}>{label}</Text>
      </View>
    </View>
  );
}

const triggerClasses
  = 'flex-row items-center justify-between rounded-xl border border-neutral-100 bg-card px-4 py-3.5 dark:border-neutral-800';

type EnumOption<T extends string> = { value: T; label: string };

function parsePlanningDateString(value: string): Date {
  const trimmed = value.trim();
  if (!trimmed) {
    return new Date();
  }
  const d = new Date(`${trimmed}T12:00:00`);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

function formatPlanningDateDisplay(value: string): string {
  if (!value.trim()) {
    return 'No date';
  }
  const d = parsePlanningDateString(value);
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function IosPlanningDateModal({
  modal,
  iosDraft,
  setIosDraft,
  applyDate,
  onClear,
  theme,
  testID,
}: {
  modal: ReturnType<typeof useModal>;
  iosDraft: Date;
  setIosDraft: React.Dispatch<React.SetStateAction<Date>>;
  applyDate: (d: Date) => void;
  onClear: () => void;
  theme: 'light' | 'dark';
  testID?: string;
}) {
  return (
    <Modal ref={modal.ref} snapPoints={['52%']} title="Planning date">
      <View className="px-4 pb-6">
        <DateTimePicker
          value={iosDraft}
          mode="date"
          display="inline"
          themeVariant={theme === 'dark' ? 'dark' : 'light'}
          onChange={(_, date) => {
            if (date) {
              setIosDraft(date);
            }
          }}
        />
        <View className="mt-4 flex-row gap-3">
          <View className="flex-1">
            <Button
              label="Clear"
              variant="outline"
              onPress={() => {
                onClear();
                modal.dismiss();
              }}
              testID={testID ? `${testID}-clear` : undefined}
            />
          </View>
          <View className="flex-1">
            <Button
              label="Done"
              onPress={() => {
                applyDate(iosDraft);
                modal.dismiss();
              }}
              testID={testID ? `${testID}-done` : undefined}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function PlanningDateField({
  value,
  onChange,
  testID,
}: {
  value: string;
  onChange: (v: string) => void;
  testID?: string;
}) {
  const { theme } = useUniwind();
  const modal = useModal();
  const [androidOpen, setAndroidOpen] = React.useState(false);
  const [iosDraft, setIosDraft] = React.useState(() => parsePlanningDateString(value));

  const openPicker = React.useCallback(() => {
    setIosDraft(parsePlanningDateString(value));
    if (Platform.OS === 'android') {
      setAndroidOpen(true);
    }
    else if (Platform.OS === 'ios') {
      modal.present();
    }
  }, [modal, value]);

  const applyDate = React.useCallback(
    (d: Date) => {
      onChange(getLocalDateKey(d));
    },
    [onChange],
  );

  if (Platform.OS === 'web') {
    return (
      <View>
        <TaskFieldLabel>Planning date</TaskFieldLabel>
        <Input
          label=""
          value={value}
          onChangeText={onChange}
          placeholder="YYYY-MM-DD"
          testID={testID}
        />
      </View>
    );
  }

  return (
    <View>
      <TaskFieldLabel>Planning date</TaskFieldLabel>
      <Pressable
        className={triggerClasses}
        onPress={openPicker}
        testID={testID ? `${testID}-trigger` : undefined}
      >
        <Text className="text-base font-medium text-foreground">
          {formatPlanningDateDisplay(value)}
        </Text>
        <CaretDown />
      </Pressable>

      {Platform.OS === 'android' && androidOpen && (
        <DateTimePicker
          value={parsePlanningDateString(value)}
          mode="date"
          display="default"
          themeVariant={theme === 'dark' ? 'dark' : 'light'}
          onChange={(event, date) => {
            setAndroidOpen(false);
            if (event.type === 'dismissed' || !date) {
              return;
            }
            applyDate(date);
          }}
        />
      )}

      {Platform.OS === 'ios' && (
        <IosPlanningDateModal
          modal={modal}
          iosDraft={iosDraft}
          setIosDraft={setIosDraft}
          applyDate={applyDate}
          onClear={() => onChange('')}
          theme={theme === 'dark' ? 'dark' : 'light'}
          testID={testID}
        />
      )}
    </View>
  );
}

type SheetOption<T extends string> = EnumOption<T> & {
  pillBg: string;
  pillText: string;
  dot?: string;
};

function keyExtractor<T extends string>(item: SheetOption<T>) {
  return item.value;
}

function TaskEnumSheetPicker<T extends string>({
  label,
  value,
  options,
  onSelect,
  testID,
  snapHeight,
}: {
  label: string;
  value: T;
  options: SheetOption<T>[];
  onSelect: (v: T) => void;
  testID?: string;
  snapHeight: number;
}) {
  const modal = useModal();
  const { theme } = useUniwind();
  const isDark = theme === 'dark';

  const onPick = React.useCallback(
    (item: SheetOption<T>) => {
      onSelect(item.value);
      modal.dismiss();
    },
    [modal, onSelect],
  );

  const renderItem = React.useCallback(
    ({ item }: { item: SheetOption<T> }) => (
      <Pressable
        className="flex-row items-center border-b border-neutral-200 px-4 py-3.5 dark:border-neutral-700"
        onPress={() => onPick(item)}
        testID={testID ? `${testID}-item-${item.value}` : undefined}
      >
        <View className="flex-1 flex-row items-center gap-3">
          {item.dot
            ? (
                <View className={`size-2.5 rounded-full ${item.dot}`} />
              )
            : null}
          <TaskBadgePill label={item.label} pillBg={item.pillBg} pillText={item.pillText} />
        </View>
        {value === item.value
          ? (
              <Text className="text-sm font-semibold text-primary-600 dark:text-primary-400">✓</Text>
            )
          : null}
      </Pressable>
    ),
    [onPick, testID, value],
  );

  const selected = options.find(o => o.value === value);

  return (
    <>
      <View>
        <TaskFieldLabel>{label}</TaskFieldLabel>
        <Pressable
          className={triggerClasses}
          onPress={modal.present}
          testID={testID ? `${testID}-trigger` : undefined}
        >
          {selected
            ? (
                <TaskBadgePill
                  label={selected.label}
                  pillBg={selected.pillBg}
                  pillText={selected.pillText}
                  leftAccessory={
                    selected.dot
                      ? (
                          <View className={`size-2.5 rounded-full ${selected.dot}`} />
                        )
                      : undefined
                  }
                />
              )
            : (
                <Text className="text-base text-muted-foreground">Select…</Text>
              )}
          <CaretDown />
        </Pressable>
      </View>
      <Modal
        ref={modal.ref}
        snapPoints={[snapHeight]}
        title={label}
        backgroundStyle={{
          backgroundColor: isDark ? colors.neutral[800] : colors.white,
        }}
      >
        <List
          data={options}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          testID={testID ? `${testID}-sheet` : undefined}
          estimatedItemSize={56}
        />
      </Modal>
    </>
  );
}

const TYPE_OPTIONS_CONFIG: EnumOption<TaskType>[] = [
  { label: 'Deep', value: 'deep' },
  { label: 'Shallow', value: 'shallow' },
  { label: 'Admin', value: 'admin' },
];

const STATUS_OPTIONS_CONFIG: EnumOption<TaskStatus>[] = [
  { label: 'Inbox', value: 'inbox' },
  { label: 'Planned', value: 'planned' },
  { label: 'Active', value: 'active' },
  { label: 'Done', value: 'done' },
  { label: 'Archived', value: 'archived' },
];

const PRIORITY_OPTIONS_CONFIG: EnumOption<TaskPriority>[] = [
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
];

export function TaskTypePicker(props: {
  value: TaskType;
  onSelect: (v: TaskType) => void;
  testID?: string;
}) {
  const options = React.useMemo(
    () =>
      TYPE_OPTIONS_CONFIG.map((o) => {
        const s = TASK_TYPE_STYLES[o.value];
        return { ...o, pillBg: s.pillBg, pillText: s.pillText };
      }),
    [],
  );
  return (
    <TaskEnumSheetPicker
      label="Type"
      value={props.value}
      options={options}
      onSelect={props.onSelect}
      testID={props.testID}
      snapHeight={options.length * 64 + 120}
    />
  );
}

export function TaskStatusPicker(props: {
  value: TaskStatus;
  onSelect: (v: TaskStatus) => void;
  testID?: string;
}) {
  const options = React.useMemo(
    () =>
      STATUS_OPTIONS_CONFIG.map((o) => {
        const s = TASK_STATUS_STYLES[o.value];
        return { ...o, pillBg: s.pillBg, pillText: s.pillText };
      }),
    [],
  );
  return (
    <TaskEnumSheetPicker
      label="Status"
      value={props.value}
      options={options}
      onSelect={props.onSelect}
      testID={props.testID}
      snapHeight={options.length * 64 + 120}
    />
  );
}

export function TaskPriorityPicker(props: {
  value: TaskPriority;
  onSelect: (v: TaskPriority) => void;
  testID?: string;
}) {
  const options = React.useMemo(
    () =>
      PRIORITY_OPTIONS_CONFIG.map((o) => {
        const s = TASK_PRIORITY_STYLES[o.value];
        return { ...o, pillBg: s.pillBg, pillText: s.pillText, dot: s.dot };
      }),
    [],
  );
  return (
    <TaskEnumSheetPicker
      label="Priority"
      value={props.value}
      options={options}
      onSelect={props.onSelect}
      testID={props.testID}
      snapHeight={options.length * 64 + 120}
    />
  );
}
