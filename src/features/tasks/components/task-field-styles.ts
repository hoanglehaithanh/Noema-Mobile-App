import type { TaskPriority, TaskStatus, TaskType } from '@/types';

export const TASK_TYPE_STYLES: Record<
  TaskType,
  { pillBg: string; pillText: string }
> = {
  deep: {
    pillBg: 'bg-primary-100 dark:bg-primary-900',
    pillText: 'text-primary-800 dark:text-primary-200',
  },
  shallow: {
    pillBg: 'bg-warning-100 dark:bg-warning-900',
    pillText: 'text-warning-800 dark:text-warning-200',
  },
  admin: {
    pillBg: 'bg-neutral-200 dark:bg-neutral-700',
    pillText: 'text-neutral-800 dark:text-neutral-100',
  },
};

export const TASK_STATUS_STYLES: Record<
  TaskStatus,
  { pillBg: string; pillText: string }
> = {
  inbox: {
    pillBg: 'bg-neutral-200 dark:bg-neutral-700',
    pillText: 'text-neutral-900 dark:text-neutral-100',
  },
  planned: {
    pillBg: 'bg-primary-100 dark:bg-primary-900',
    pillText: 'text-primary-800 dark:text-primary-200',
  },
  active: {
    pillBg: 'bg-success-100 dark:bg-success-900',
    pillText: 'text-success-800 dark:text-success-200',
  },
  done: {
    pillBg: 'bg-neutral-100 dark:bg-neutral-800',
    pillText: 'text-neutral-500 dark:text-neutral-400',
  },
  archived: {
    pillBg: 'bg-charcoal-200 dark:bg-charcoal-700',
    pillText: 'text-charcoal-700 dark:text-charcoal-100',
  },
};

export const TASK_PRIORITY_STYLES: Record<
  TaskPriority,
  { dot: string; pillBg: string; pillText: string }
> = {
  high: {
    dot: 'bg-danger-500',
    pillBg: 'bg-danger-100 dark:bg-danger-900',
    pillText: 'text-danger-800 dark:text-danger-200',
  },
  medium: {
    dot: 'bg-warning-400',
    pillBg: 'bg-warning-100 dark:bg-warning-900',
    pillText: 'text-warning-800 dark:text-warning-200',
  },
  low: {
    dot: 'bg-neutral-400',
    pillBg: 'bg-neutral-200 dark:bg-neutral-700',
    pillText: 'text-neutral-700 dark:text-neutral-200',
  },
};
