import type { Task } from './types';

const INBOX_RECENCY_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Inbox tasks: either fully unprocessed (no context, no delegation, no due date, not someday),
 * OR created within the last 10 minutes (so newly captured tasks stay visible for clarification).
 * Subtasks and completed tasks are never in the inbox.
 */
export const isInbox = (t: Task): boolean => {
	if (t.completed || t.parentId) return false;
	if (Date.now() - t.createdAt < INBOX_RECENCY_MS) return true;
	return !t.context && !t.delegatedTo && !t.dueDate && !t.someday;
};

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

/**
 * Inbox "Do it Now" quick-wins: top-level, active, unprocessed (no context, no delegation),
 * and estimated at ≤ 2 minutes. Shown as a banner in the Inbox view.
 */
export const isQuickWin = (t: Task): boolean =>
	!t.completed &&
	!t.parentId &&
	!t.context &&
	!t.delegatedTo &&
	t.estimatedMinutes != null &&
	t.estimatedMinutes <= 2;

/** Tasks with a due date */
export const hasDueDate = (t: Task): boolean => !!t.dueDate && !t.completed;
