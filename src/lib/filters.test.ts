import { describe, it, expect } from 'vitest';
import type { Task } from './types';
import { isInbox, isNextAction, isSubtaskOf, isWaiting, isSomeday, isDoItNow, isQuickWin, hasDueDate, getDescendantIds } from './filters';

function makeTask(overrides: Partial<Task> = {}): Task {
	return {
		id: 'task-1',
		title: 'Test task',
		notes: '',
		createdAt: Date.now(),
		updatedAt: Date.now(),
		completed: false,
		...overrides
	};
}

/** A timestamp 15 minutes in the past, so it falls outside the 10-minute inbox recency window */
const OLD_TS = Date.now() - 15 * 60 * 1000;

describe('isInbox', () => {
	it('returns true for a bare, unprocessed task', () => {
		expect(isInbox(makeTask())).toBe(true);
	});

	it('returns true for a recently created task even when it has a context', () => {
		expect(isInbox(makeTask({ context: 'work' }))).toBe(true);
	});

	it('returns true for a recently created task even when it is delegated', () => {
		expect(isInbox(makeTask({ delegatedTo: 'alice' }))).toBe(true);
	});

	it('returns false when task is completed (even if recent)', () => {
		expect(isInbox(makeTask({ completed: true }))).toBe(false);
	});

	it('returns true when task is a recent subtask', () => {
		expect(isInbox(makeTask({ parentId: 'parent-1' }))).toBe(true);
	});

	it('returns false when an old task has a context', () => {
		expect(isInbox(makeTask({ context: 'work', createdAt: OLD_TS }))).toBe(false);
	});

	it('returns false when an old task is delegated', () => {
		expect(isInbox(makeTask({ delegatedTo: 'alice', createdAt: OLD_TS }))).toBe(false);
	});

	it('returns false when an old task has a due date', () => {
		expect(isInbox(makeTask({ dueDate: '2025-01-01', createdAt: OLD_TS }))).toBe(false);
	});

	it('returns false when an old task is someday', () => {
		expect(isInbox(makeTask({ someday: true, createdAt: OLD_TS }))).toBe(false);
	});

	it('returns false when an old task is a subtask', () => {
		expect(isInbox(makeTask({ parentId: 'parent-1', createdAt: OLD_TS }))).toBe(false);
	});

	it('returns true for an old bare unprocessed task', () => {
		expect(isInbox(makeTask({ createdAt: OLD_TS }))).toBe(true);
	});
});

describe('isNextAction', () => {
	it('returns true for an active top-level task with a context', () => {
		expect(isNextAction(makeTask({ context: 'work' }))).toBe(true);
	});

	it('returns false when completed', () => {
		expect(isNextAction(makeTask({ context: 'work', completed: true }))).toBe(false);
	});

	it('returns false when context is missing', () => {
		expect(isNextAction(makeTask())).toBe(false);
	});

	it('returns false when task is a subtask', () => {
		expect(isNextAction(makeTask({ context: 'work', parentId: 'parent-1' }))).toBe(false);
	});
});

describe('isSubtaskOf', () => {
	it('returns true when task parentId is in the set', () => {
		const parentIds = new Set(['parent-1', 'parent-2']);
		const predicate = isSubtaskOf(parentIds);
		expect(predicate(makeTask({ parentId: 'parent-1' }))).toBe(true);
	});

	it('returns false when task has no parentId', () => {
		const predicate = isSubtaskOf(new Set(['parent-1']));
		expect(predicate(makeTask())).toBe(false);
	});

	it('returns false when parentId is not in the set', () => {
		const predicate = isSubtaskOf(new Set(['parent-1']));
		expect(predicate(makeTask({ parentId: 'other' }))).toBe(false);
	});
});

describe('isWaiting', () => {
	it('returns true for an active task with delegatedTo set', () => {
		expect(isWaiting(makeTask({ delegatedTo: 'alice' }))).toBe(true);
	});

	it('returns false when completed', () => {
		expect(isWaiting(makeTask({ delegatedTo: 'alice', completed: true }))).toBe(false);
	});

	it('returns false when not delegated', () => {
		expect(isWaiting(makeTask())).toBe(false);
	});
});

describe('isSomeday', () => {
	it('returns true for an active someday task', () => {
		expect(isSomeday(makeTask({ someday: true }))).toBe(true);
	});

	it('returns false when completed', () => {
		expect(isSomeday(makeTask({ someday: true, completed: true }))).toBe(false);
	});

	it('returns false when someday is not set', () => {
		expect(isSomeday(makeTask())).toBe(false);
	});
});

describe('isDoItNow', () => {
	it('returns true for an active task with estimatedMinutes ≤ 2', () => {
		expect(isDoItNow(makeTask({ estimatedMinutes: 1 }))).toBe(true);
		expect(isDoItNow(makeTask({ estimatedMinutes: 2 }))).toBe(true);
	});

	it('returns false when estimatedMinutes > 2', () => {
		expect(isDoItNow(makeTask({ estimatedMinutes: 3 }))).toBe(false);
		expect(isDoItNow(makeTask({ estimatedMinutes: 60 }))).toBe(false);
	});

	it('returns false when estimatedMinutes is not set', () => {
		expect(isDoItNow(makeTask())).toBe(false);
	});

	it('returns false when completed', () => {
		expect(isDoItNow(makeTask({ estimatedMinutes: 1, completed: true }))).toBe(false);
	});
});

describe('hasDueDate', () => {
	it('returns true for an active task with a due date', () => {
		expect(hasDueDate(makeTask({ dueDate: '2025-12-31' }))).toBe(true);
	});

	it('returns false when task is completed', () => {
		expect(hasDueDate(makeTask({ dueDate: '2025-12-31', completed: true }))).toBe(false);
	});

	it('returns false when dueDate is not set', () => {
		expect(hasDueDate(makeTask())).toBe(false);
	});
});

describe('isQuickWin', () => {
	it('returns true for an active leaf task with ≤ 2 min estimate and no context/delegation', () => {
		expect(isQuickWin(makeTask({ estimatedMinutes: 1 }))).toBe(true);
		expect(isQuickWin(makeTask({ estimatedMinutes: 2 }))).toBe(true);
	});

	it('returns true for a leaf subtask with ≤ 2 min estimate (subtasks qualify as leaf)', () => {
		expect(isQuickWin(makeTask({ estimatedMinutes: 1, parentId: 'parent-1' }))).toBe(true);
	});

	it('returns false when estimatedMinutes > 2', () => {
		expect(isQuickWin(makeTask({ estimatedMinutes: 3 }))).toBe(false);
	});

	it('returns false when estimatedMinutes is not set', () => {
		expect(isQuickWin(makeTask())).toBe(false);
	});

	it('returns false when completed', () => {
		expect(isQuickWin(makeTask({ estimatedMinutes: 1, completed: true }))).toBe(false);
	});

	it('returns false when task has a context', () => {
		expect(isQuickWin(makeTask({ estimatedMinutes: 1, context: 'work' }))).toBe(false);
	});

	it('returns false when task is delegated', () => {
		expect(isQuickWin(makeTask({ estimatedMinutes: 1, delegatedTo: 'alice' }))).toBe(false);
	});

	it('returns false when task is a project (has children)', () => {
		expect(isQuickWin(makeTask({ estimatedMinutes: 1, children: ['child-1'] }))).toBe(false);
	});
});

describe('getDescendantIds', () => {
	function makeTaskMap(taskList: Task[]): Map<string, Task> {
		return new Map(taskList.map((t) => [t.id, t]));
	}

	it('returns an empty set for a leaf task (no children)', () => {
		const task = makeTask({ id: 'a' });
		expect(getDescendantIds(task, makeTaskMap([task])).size).toBe(0);
	});

	it('returns the direct children of a task', () => {
		const parent = makeTask({ id: 'parent', children: ['c1', 'c2'] });
		const c1 = makeTask({ id: 'c1', parentId: 'parent' });
		const c2 = makeTask({ id: 'c2', parentId: 'parent' });
		const result = getDescendantIds(parent, makeTaskMap([parent, c1, c2]));
		expect(result).toEqual(new Set(['c1', 'c2']));
	});

	it('returns all descendants at any depth', () => {
		const root = makeTask({ id: 'root', children: ['a'] });
		const a = makeTask({ id: 'a', parentId: 'root', children: ['b'] });
		const b = makeTask({ id: 'b', parentId: 'a', children: ['c'] });
		const c = makeTask({ id: 'c', parentId: 'b' });
		const result = getDescendantIds(root, makeTaskMap([root, a, b, c]));
		expect(result).toEqual(new Set(['a', 'b', 'c']));
	});

	it('handles a missing child id gracefully (child not in map)', () => {
		const task = makeTask({ id: 'a', children: ['ghost'] });
		// 'ghost' is not in the map — should not throw
		const result = getDescendantIds(task, makeTaskMap([task]));
		expect(result).toEqual(new Set(['ghost']));
	});

	it('does not loop infinitely when the task graph contains a cycle', () => {
		// Artificially create a cycle: a → b → a
		const a = makeTask({ id: 'a', children: ['b'] });
		const b = makeTask({ id: 'b', parentId: 'a', children: ['a'] });
		const result = getDescendantIds(a, makeTaskMap([a, b]));
		// Both ids discovered; visited guard prevents infinite loop
		expect(result).toEqual(new Set(['b', 'a']));
	});

	it('a leaf task is not a descendant of itself', () => {
		const task = makeTask({ id: 'solo' });
		expect(getDescendantIds(task, makeTaskMap([task])).has('solo')).toBe(false);
	});
});
