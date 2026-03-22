import type { TaskPriority, TaskStatus, TaskType } from '@/types';

import * as React from 'react';
import { View } from 'react-native';

import { Button, Text } from '@/components/ui';
import { Input } from '@/components/ui/input';

import {
  PlanningDateField,
  TaskFieldLabel,
  TaskPriorityPicker,
  TaskStatusPicker,
  TaskTypePicker,
} from './task-form-fields';

function FormCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <View
      className={`mb-4 rounded-2xl border border-neutral-100 bg-card p-4 dark:border-neutral-800 ${className}`}
    >
      {children}
    </View>
  );
}

type TaskFormProps = {
  title: string;
  description: string;
  notes: string;
  definitionOfDone: string;
  expectedMinutes: string;
  resultSummary: string;
  planningDate: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt?: string;
  onChangeTitle: (v: string) => void;
  onChangeDescription: (v: string) => void;
  onChangeNotes: (v: string) => void;
  onChangeDefinitionOfDone: (v: string) => void;
  onChangeExpectedMinutes: (v: string) => void;
  onChangeResultSummary: (v: string) => void;
  onChangePlanningDate: (v: string) => void;
  onChangeType: (v: TaskType) => void;
  onChangeStatus: (v: TaskStatus) => void;
  onChangePriority: (v: TaskPriority) => void;
  onSave: () => void;
  onMarkDone?: () => void;
  saveLabel?: string;
  loading?: boolean;
};

function TaskTitleCard(props: Pick<TaskFormProps, 'title' | 'onChangeTitle'>) {
  return (
    <FormCard>
      <TaskFieldLabel>What needs to be done?</TaskFieldLabel>
      <Input
        label=""
        value={props.title}
        onChangeText={props.onChangeTitle}
        placeholder="Task name"
        testID="task-title"
      />
    </FormCard>
  );
}

function TaskMetaCard(
  props: Pick<
    TaskFormProps,
    | 'expectedMinutes'
    | 'onChangeExpectedMinutes'
    | 'priority'
    | 'onChangePriority'
    | 'planningDate'
    | 'onChangePlanningDate'
    | 'type'
    | 'onChangeType'
    | 'status'
    | 'onChangeStatus'
  >,
) {
  return (
    <FormCard className="gap-4">
      <View className="flex-row gap-3">
        <View className="flex-1">
          <TaskFieldLabel>Duration (min)</TaskFieldLabel>
          <Input
            label=""
            value={props.expectedMinutes}
            onChangeText={props.onChangeExpectedMinutes}
            keyboardType="number-pad"
            placeholder="30"
            testID="task-expected-minutes"
          />
        </View>
        <View className="flex-1">
          <TaskPriorityPicker
            value={props.priority}
            onSelect={props.onChangePriority}
            testID="task-priority"
          />
        </View>
      </View>

      <PlanningDateField
        value={props.planningDate}
        onChange={props.onChangePlanningDate}
        testID="task-planning-date"
      />

      <View className="flex-row gap-3">
        <View className="flex-1">
          <TaskTypePicker
            value={props.type}
            onSelect={props.onChangeType}
            testID="task-type"
          />
        </View>
        <View className="flex-1">
          <TaskStatusPicker
            value={props.status}
            onSelect={props.onChangeStatus}
            testID="task-status"
          />
        </View>
      </View>
    </FormCard>
  );
}

function TaskLongTextCard(
  props: Pick<
    TaskFormProps,
    | 'notes'
    | 'onChangeNotes'
    | 'description'
    | 'onChangeDescription'
    | 'definitionOfDone'
    | 'onChangeDefinitionOfDone'
    | 'resultSummary'
    | 'onChangeResultSummary'
  >,
) {
  return (
    <FormCard className="gap-4">
      <View>
        <TaskFieldLabel>Detailed notes</TaskFieldLabel>
        <Input
          label=""
          value={props.notes}
          onChangeText={props.onChangeNotes}
          multiline
          numberOfLines={3}
          placeholder="Context or sub-tasks…"
          testID="task-notes"
        />
      </View>
      <View>
        <TaskFieldLabel>Description</TaskFieldLabel>
        <Input
          label=""
          value={props.description}
          onChangeText={props.onChangeDescription}
          multiline
          numberOfLines={4}
          placeholder="Optional longer description…"
          testID="task-description"
        />
      </View>
      <View>
        <TaskFieldLabel>Definition of done</TaskFieldLabel>
        <Input
          label=""
          value={props.definitionOfDone}
          onChangeText={props.onChangeDefinitionOfDone}
          multiline
          numberOfLines={3}
          placeholder="How you’ll know it’s finished…"
          testID="task-definition-of-done"
        />
      </View>
      <View>
        <TaskFieldLabel>Result / outcome</TaskFieldLabel>
        <Input
          label=""
          value={props.resultSummary}
          onChangeText={props.onChangeResultSummary}
          multiline
          numberOfLines={3}
          placeholder="Summarize what shipped…"
          testID="task-result-summary"
        />
      </View>
    </FormCard>
  );
}

export function TaskForm(props: TaskFormProps) {
  return (
    <View className="flex-1 px-4 pt-4 pb-8">
      {props.createdAt && (
        <Text className="mb-3 text-right text-xs text-muted-foreground">
          {'Created '}
          {new Date(props.createdAt).toLocaleDateString()}
        </Text>
      )}

      <TaskTitleCard title={props.title} onChangeTitle={props.onChangeTitle} />
      <TaskMetaCard
        expectedMinutes={props.expectedMinutes}
        onChangeExpectedMinutes={props.onChangeExpectedMinutes}
        priority={props.priority}
        onChangePriority={props.onChangePriority}
        planningDate={props.planningDate}
        onChangePlanningDate={props.onChangePlanningDate}
        type={props.type}
        onChangeType={props.onChangeType}
        status={props.status}
        onChangeStatus={props.onChangeStatus}
      />
      <TaskLongTextCard
        notes={props.notes}
        onChangeNotes={props.onChangeNotes}
        description={props.description}
        onChangeDescription={props.onChangeDescription}
        definitionOfDone={props.definitionOfDone}
        onChangeDefinitionOfDone={props.onChangeDefinitionOfDone}
        resultSummary={props.resultSummary}
        onChangeResultSummary={props.onChangeResultSummary}
      />

      <View className="mt-2">
        <Button
          label={props.saveLabel ?? 'Save'}
          onPress={props.onSave}
          loading={props.loading}
          disabled={!props.title.trim()}
          variant="outline"
          className="border-neutral-300 bg-transparent dark:border-neutral-600"
          textClassName="text-foreground"
          testID="task-save"
        />
      </View>

      {props.onMarkDone && (
        <Button
          label="Mark as Done"
          variant="default"
          onPress={props.onMarkDone}
          loading={props.loading}
          className="mt-2 bg-success-600 dark:bg-success-500"
          textClassName="text-white dark:text-white"
        />
      )}
    </View>
  );
}
