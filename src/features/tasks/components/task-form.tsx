import type { TaskPriority, TaskStatus, TaskType } from '@/types';

import * as React from 'react';
import { Button, Text, View } from '@/components/ui';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

const TYPE_OPTIONS = [
  { label: 'Deep', value: 'deep' },
  { label: 'Shallow', value: 'shallow' },
  { label: 'Admin', value: 'admin' },
];

const STATUS_OPTIONS = [
  { label: 'Inbox', value: 'inbox' },
  { label: 'Planned', value: 'planned' },
  { label: 'Active', value: 'active' },
  { label: 'Done', value: 'done' },
  { label: 'Archived', value: 'archived' },
];

const PRIORITY_OPTIONS = [
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
];

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

export function TaskForm(props: TaskFormProps) {
  return (
    <View className="flex-1 px-4 pt-4">
      <Input label="Title" value={props.title} onChangeText={props.onChangeTitle} testID="task-title" />
      <Input
        label="Description"
        value={props.description}
        onChangeText={props.onChangeDescription}
        multiline
        numberOfLines={4}
        testID="task-description"
      />
      <Input label="Notes" value={props.notes} onChangeText={props.onChangeNotes} multiline numberOfLines={3} testID="task-notes" />
      <Input
        label="Definition of done"
        value={props.definitionOfDone}
        onChangeText={props.onChangeDefinitionOfDone}
        multiline
        numberOfLines={3}
        testID="task-definition-of-done"
      />
      <Input
        label="Expected minutes"
        value={props.expectedMinutes}
        onChangeText={props.onChangeExpectedMinutes}
        keyboardType="number-pad"
        placeholder="60"
        testID="task-expected-minutes"
      />
      <Input
        label="Planning date"
        value={props.planningDate}
        onChangeText={props.onChangePlanningDate}
        placeholder="YYYY-MM-DD"
        testID="task-planning-date"
      />
      <Select label="Type" value={props.type} options={TYPE_OPTIONS} onSelect={v => props.onChangeType(v as TaskType)} testID="task-type" />
      <Select label="Status" value={props.status} options={STATUS_OPTIONS} onSelect={v => props.onChangeStatus(v as TaskStatus)} testID="task-status" />
      <Select label="Priority" value={props.priority} options={PRIORITY_OPTIONS} onSelect={v => props.onChangePriority(v as TaskPriority)} testID="task-priority" />
      <Input
        label="Result / outcome"
        value={props.resultSummary}
        onChangeText={props.onChangeResultSummary}
        multiline
        numberOfLines={3}
        testID="task-result-summary"
      />

      <View className="mt-4">
        <Button
          label={props.saveLabel ?? 'Save'}
          onPress={props.onSave}
          loading={props.loading}
          disabled={!props.title.trim()}
          testID="task-save"
        />
      </View>

      {props.onMarkDone && (
        <Button label="Mark as Done" variant="secondary" onPress={props.onMarkDone} loading={props.loading} className="mt-2" />
      )}

      {props.createdAt && (
        <Text className="mt-6 text-center text-xs text-muted-foreground">
          {'Created '}
          {new Date(props.createdAt).toLocaleDateString()}
        </Text>
      )}
    </View>
  );
}
