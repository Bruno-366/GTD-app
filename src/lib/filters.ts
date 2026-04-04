import type { Task } from './types';

const INBOX_RECENCY_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Inbox tasks: completed tasks are never included.
 * - Subtasks: only if created within the last 10 minutes.
 * - Top-level tasks: included if recent (< 10 min), or if fully unprocessed.
 */
export const isInbox = (t: Task): boolean => {
	if (t.completed) return false;
	const isRecent = Date.now() - t.createdAt < INBOX_RECENCY_MS;
	if (t.parentId) return isRecent; // subtasks only while recently captured
	if (isRecent) return true;
	return !t.context && !t.delegatedTo && !t.dueDate && !t.someday;
};

/** Leaf tasks (no children) with a context assigned */
export const isNextAction = (t: Task): boolean => !t.completed && !!t.context && !(t.children?.length);

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
 * Inbox "Do it Now" quick-wins: active, leaf task (no children/subtasks),
 * unprocessed (no context, no delegation), and estimated at ≤ 2 minutes.
 * Both top-level tasks and subtasks qualify, as long as they have no children.
 */
export const isQuickWin = (t: Task): boolean =>
	!t.completed &&
	!(t.children?.length) &&
	!t.context &&
	!t.delegatedTo &&
	t.estimatedMinutes != null &&
	t.estimatedMinutes <= 2;

/** Tasks with a due date */
export const hasDueDate = (t: Task): boolean => !!t.dueDate && !t.completed;

/**
 * Collect the IDs of all descendants (any depth) for a given task.
 * Uses the computed `children` arrays on task objects (available after `getAllTasks()`).
 * The visited set prevents infinite loops if the data ever contains a cycle.
 */
export function getDescendantIds(task: Task, taskById: Map<string, Task>): Set<string> {
	const ids = new Set<string>();
	const queue = [...(task.children ?? [])];
	while (queue.length > 0) {
		const childId = queue.shift()!;
		if (!ids.has(childId)) {
			ids.add(childId);
			const child = taskById.get(childId);
			if (child?.children) queue.push(...child.children);
		}
	}
	return ids;
}
