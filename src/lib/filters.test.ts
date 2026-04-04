import { describe, it, expect } from 'vitest';
import type { Task } from './types';
import { isInbox, isNextAction, isSubtaskOf, isWaiting, isSomeday, isDoItNow, hasDueDate } from './filters';

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

describe('isInbox', () => {
	it('returns true for a bare, unprocessed task', () => {
		expect(isInbox(makeTask())).toBe(true);
	});

	it('returns false when task is completed', () => {
		expect(isInbox(makeTask({ completed: true }))).toBe(false);
	});

	it('returns false when task has a context', () => {
		expect(isInbox(makeTask({ context: 'work' }))).toBe(false);
	});

	it('returns false when task is delegated', () => {
		expect(isInbox(makeTask({ delegatedTo: 'alice' }))).toBe(false);
	});

	it('returns false when task has a due date', () => {
		expect(isInbox(makeTask({ dueDate: '2025-01-01' }))).toBe(false);
	});

	it('returns false when task is someday', () => {
		expect(isInbox(makeTask({ someday: true }))).toBe(false);
	});

	it('returns false when task is a subtask', () => {
		expect(isInbox(makeTask({ parentId: 'parent-1' }))).toBe(false);
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
