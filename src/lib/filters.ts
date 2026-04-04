import type { Task } from './types';

/** Unprocessed tasks: no context, no delegation, no due date, not someday, not a subtask */
export const isInbox = (t: Task): boolean =>
	!t.completed && !t.parentId && !t.context && !t.delegatedTo && !t.dueDate && !t.someday;

/** Top-level tasks with a context assigned */
export const isNextAction = (t: Task): boolean => !t.completed && !!t.context && !t.parentId;

/** Subtask of one of the provided parent IDs */
export const isSubtaskOf = (parentIds: Set<string>) => (t: Task): boolean =>
	!!t.parentId && parentIds.has(t.parentId);

/** Tasks delegated to someone */
export const isWaiting = (t: Task): boolean => !t.completed && !!t.delegatedTo;

/** Tasks flagged as someday/maybe */
export const isSomeday = (t: Task): boolean => !t.completed && !!t.someday;

/** Tasks that can be done in ≤ 2 minutes */
export const isDoItNow = (t: Task): boolean =>
	!t.completed && t.estimatedMinutes != null && t.estimatedMinutes <= 2;

/** Tasks with a due date */
export const hasDueDate = (t: Task): boolean => !!t.dueDate && !t.completed;
