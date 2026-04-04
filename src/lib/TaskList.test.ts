import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import TaskList from './TaskList.svelte';
import type { Task } from './types';

// Mock the db module so the component never touches IndexedDB in tests
vi.mock('$lib/db', () => ({
	addTask: vi.fn().mockResolvedValue({}),
	updateTask: vi.fn().mockResolvedValue({}),
	deleteTaskAndPromoteChildren: vi.fn().mockResolvedValue(undefined)
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
		const { container } = render(TaskList, {
			props: { title: 'Inbox', icon: '📥', tasks: [], onTasksChange: vi.fn() }
		});

		expect(container.querySelector('p')).not.toBeInTheDocument();
	});

	it('renders context badge for a task with a context', () => {
		const tasks = [makeTask({ context: 'work' })];
		render(TaskList, { props: { title: 'Next', icon: '⚡', tasks, onTasksChange: vi.fn() } });

		// The context appears both as a filter chip and as a task badge; assert at least one is present
		expect(screen.getAllByText('#work').length).toBeGreaterThanOrEqual(1);
	});

	it('renders delegatedTo badge for a waiting task', () => {
		const tasks = [makeTask({ delegatedTo: 'alice' })];
		render(TaskList, { props: { title: 'Waiting', icon: '⏳', tasks, onTasksChange: vi.fn() } });

		// The assignee appears both as a filter chip and as a task badge; assert at least one is present
		expect(screen.getAllByText('@alice').length).toBeGreaterThanOrEqual(1);
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

	it('shows context filter chips when tasks have different contexts', () => {
		const tasks = [
			makeTask({ id: 'a', title: 'Task A', context: 'work' }),
			makeTask({ id: 'b', title: 'Task B', context: 'home' })
		];
		render(TaskList, { props: { title: 'Next', icon: '⚡', tasks, onTasksChange: vi.fn() } });

		expect(screen.getByRole('button', { name: /^#work$/ })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /^#home$/ })).toBeInTheDocument();
	});

	it('filter chip for context has aria-pressed=false when not active', () => {
		const tasks = [
			makeTask({ id: 'a', title: 'Task A', context: 'work' }),
			makeTask({ id: 'b', title: 'Task B', context: 'home' })
		];
		render(TaskList, { props: { title: 'Next', icon: '⚡', tasks, onTasksChange: vi.fn() } });

		const workChip = screen.getByRole('button', { name: /^#work$/ });
		expect(workChip).toHaveAttribute('aria-pressed', 'false');
	});

	it('clicking a context chip narrows the visible tasks', async () => {
		const user = userEvent.setup();
		const tasks = [
			makeTask({ id: 'a', title: 'Work task', context: 'work' }),
			makeTask({ id: 'b', title: 'Home task', context: 'home' })
		];
		render(TaskList, { props: { title: 'Next', icon: '⚡', tasks, onTasksChange: vi.fn() } });

		await user.click(screen.getByRole('button', { name: /^#work$/ }));

		expect(screen.getByText('Work task')).toBeInTheDocument();
		expect(screen.queryByText('Home task')).not.toBeInTheDocument();
	});

	it('clicking the All chip after filtering shows all tasks again', async () => {
		const user = userEvent.setup();
		const tasks = [
			makeTask({ id: 'a', title: 'Work task', context: 'work' }),
			makeTask({ id: 'b', title: 'Home task', context: 'home' })
		];
		render(TaskList, { props: { title: 'Next', icon: '⚡', tasks, onTasksChange: vi.fn() } });

		// Select #work
		await user.click(screen.getByRole('button', { name: /^#work$/ }));
		expect(screen.queryByText('Home task')).not.toBeInTheDocument();

		// Click "All" to clear the filter — there are two "All" buttons (context + assignee), pick the first
		const allButtons = screen.getAllByRole('button', { name: /^All$/ });
		await user.click(allButtons[0]);

		expect(screen.getByText('Work task')).toBeInTheDocument();
		expect(screen.getByText('Home task')).toBeInTheDocument();
	});

	it('shows assignee filter chips when tasks have different assignees', () => {
		const tasks = [
			makeTask({ id: 'a', title: 'Task A', delegatedTo: 'alice' }),
			makeTask({ id: 'b', title: 'Task B', delegatedTo: 'bob' })
		];
		render(TaskList, { props: { title: 'Waiting', icon: '⏳', tasks, onTasksChange: vi.fn() } });

		expect(screen.getByRole('button', { name: /^@alice$/ })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /^@bob$/ })).toBeInTheDocument();
	});

	it('clicking an assignee chip narrows the visible tasks', async () => {
		const user = userEvent.setup();
		const tasks = [
			makeTask({ id: 'a', title: 'Alice task', delegatedTo: 'alice' }),
			makeTask({ id: 'b', title: 'Bob task', delegatedTo: 'bob' })
		];
		render(TaskList, { props: { title: 'Waiting', icon: '⏳', tasks, onTasksChange: vi.fn() } });

		await user.click(screen.getByRole('button', { name: /^@alice$/ }));

		expect(screen.getByText('Alice task')).toBeInTheDocument();
		expect(screen.queryByText('Bob task')).not.toBeInTheDocument();
	});
});
