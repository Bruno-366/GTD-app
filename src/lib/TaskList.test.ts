import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import TaskList from './TaskList.svelte';
import type { Task } from './types';

// Mock the db module so the component never touches IndexedDB in tests
vi.mock('$lib/db', () => ({
	addTask: vi.fn().mockResolvedValue({}),
	updateTask: vi.fn().mockResolvedValue({}),
	deleteTask: vi.fn().mockResolvedValue(undefined)
}));

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

describe('TaskList', () => {
	it('renders the list title and icon', () => {
		render(TaskList, {
			props: {
				title: 'Inbox',
				icon: '📥',
				tasks: [],
				onTasksChange: vi.fn()
			}
		});

		expect(screen.getByText('Inbox')).toBeInTheDocument();
		expect(screen.getByText('📥')).toBeInTheDocument();
	});

	it('shows the active task count badge', () => {
		const tasks = [makeTask({ id: 'a', title: 'Alpha' }), makeTask({ id: 'b', title: 'Beta' })];
		render(TaskList, { props: { title: 'Inbox', icon: '📥', tasks, onTasksChange: vi.fn() } });

		// The count badge shows the number of top-level active tasks
		expect(screen.getByText('2')).toBeInTheDocument();
	});

	it('renders each active task title', () => {
		const tasks = [makeTask({ id: 'a', title: 'Buy milk' }), makeTask({ id: 'b', title: 'Call dentist' })];
		render(TaskList, { props: { title: 'Inbox', icon: '📥', tasks, onTasksChange: vi.fn() } });

		expect(screen.getByText('Buy milk')).toBeInTheDocument();
		expect(screen.getByText('Call dentist')).toBeInTheDocument();
	});

	it('shows the optional description when provided', () => {
		render(TaskList, {
			props: {
				title: 'Do it Now',
				icon: '⏱',
				description: 'Tasks under 2 minutes',
				tasks: [],
				onTasksChange: vi.fn()
			}
		});

		expect(screen.getByText('Tasks under 2 minutes')).toBeInTheDocument();
	});

	it('does not show the description when omitted', () => {
		render(TaskList, { props: { title: 'Inbox', icon: '📥', tasks: [], onTasksChange: vi.fn() } });

		expect(screen.queryByRole('paragraph')).not.toBeInTheDocument();
	});

	it('renders context badge for a task with a context', () => {
		const tasks = [makeTask({ context: 'work' })];
		render(TaskList, { props: { title: 'Next', icon: '⚡', tasks, onTasksChange: vi.fn() } });

		expect(screen.getByText('#work')).toBeInTheDocument();
	});

	it('renders delegatedTo badge for a waiting task', () => {
		const tasks = [makeTask({ delegatedTo: 'alice' })];
		render(TaskList, { props: { title: 'Waiting', icon: '⏳', tasks, onTasksChange: vi.fn() } });

		expect(screen.getByText('@alice')).toBeInTheDocument();
	});

	it('shows the "Add task" button when no form is open', () => {
		render(TaskList, { props: { title: 'Inbox', icon: '📥', tasks: [], onTasksChange: vi.fn() } });

		// The button contains a "+" span and "Add task" text, so match via accessible role
		expect(screen.getByRole('button', { name: /Add task/i })).toBeInTheDocument();
	});

	it('opens the add task form when "Add task" is clicked', async () => {
		const user = userEvent.setup();
		render(TaskList, { props: { title: 'Inbox', icon: '📥', tasks: [], onTasksChange: vi.fn() } });

		await user.click(screen.getByRole('button', { name: /Add task/i }));

		expect(screen.getByPlaceholderText(/Task title/i)).toBeInTheDocument();
	});

	it('shows completed section toggle when there are completed tasks', () => {
		const tasks = [makeTask({ id: 'c', title: 'Done task', completed: true })];
		render(TaskList, { props: { title: 'Inbox', icon: '📥', tasks, onTasksChange: vi.fn() } });

		expect(screen.getByText(/Completed \(1\)/)).toBeInTheDocument();
	});
});
