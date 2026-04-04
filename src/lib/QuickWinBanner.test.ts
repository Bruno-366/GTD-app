import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import QuickWinBanner from './QuickWinBanner.svelte';
import type { Task } from './types';

vi.mock('$lib/db', () => ({
	updateTask: vi.fn().mockResolvedValue({}),
	deleteTask: vi.fn().mockResolvedValue(undefined)
}));

function makeTask(overrides: Partial<Task> = {}): Task {
	return {
		id: 'task-1',
		title: 'Quick win',
		notes: '',
		createdAt: Date.now(),
		updatedAt: Date.now(),
		completed: false,
		estimatedMinutes: 1,
		...overrides
	};
}

describe('QuickWinBanner', () => {
	it('renders nothing when the tasks list is empty', () => {
		render(QuickWinBanner, {
			props: { tasks: [], onTasksChange: vi.fn() }
		});
		expect(screen.queryByText('Do it Now')).not.toBeInTheDocument();
	});

	it('renders the "Do it Now" heading when there are tasks', () => {
		const tasks = [makeTask({ id: 'a', title: 'Reply to email' })];
		render(QuickWinBanner, { props: { tasks, onTasksChange: vi.fn() } });

		expect(screen.getByText('Do it Now')).toBeInTheDocument();
	});

	it('shows the task count badge', () => {
		const tasks = [
			makeTask({ id: 'a', title: 'First' }),
			makeTask({ id: 'b', title: 'Second' })
		];
		render(QuickWinBanner, { props: { tasks, onTasksChange: vi.fn() } });

		expect(screen.getByText('2')).toBeInTheDocument();
	});

	it('renders each task title', () => {
		const tasks = [
			makeTask({ id: 'a', title: 'Task A' }),
			makeTask({ id: 'b', title: 'Task B' })
		];
		render(QuickWinBanner, { props: { tasks, onTasksChange: vi.fn() } });

		expect(screen.getByText('Task A')).toBeInTheDocument();
		expect(screen.getByText('Task B')).toBeInTheDocument();
	});

	it('shows the time estimate badge when estimatedMinutes is set', () => {
		const tasks = [makeTask({ id: 'a', estimatedMinutes: 2 })];
		render(QuickWinBanner, { props: { tasks, onTasksChange: vi.fn() } });

		expect(screen.getByText('⏱ 2m')).toBeInTheDocument();
	});

	it('calls updateTask and onTasksChange when the complete button is clicked', async () => {
		const { updateTask } = await import('$lib/db');
		const onTasksChange = vi.fn();
		const task = makeTask({ id: 'a', title: 'Do it' });
		const user = userEvent.setup();
		render(QuickWinBanner, { props: { tasks: [task], onTasksChange } });

		await user.click(screen.getByRole('button', { name: /mark as complete/i }));

		expect(updateTask).toHaveBeenCalledWith(expect.objectContaining({ id: 'a', completed: true }));
		expect(onTasksChange).toHaveBeenCalled();
	});

	it('calls deleteTask and onTasksChange when the dismiss button is clicked', async () => {
		const { deleteTask } = await import('$lib/db');
		const onTasksChange = vi.fn();
		const task = makeTask({ id: 'a', title: 'Do it' });
		const user = userEvent.setup();
		render(QuickWinBanner, { props: { tasks: [task], onTasksChange } });

		await user.click(screen.getByRole('button', { name: /delete task/i }));

		expect(deleteTask).toHaveBeenCalledWith('a');
		expect(onTasksChange).toHaveBeenCalled();
	});

	// ── Accessibility (WAI-ARIA) tests ──────────────────────────────────────────

	it('banner container has role="region" with an accessible label', () => {
		const tasks = [makeTask({ id: 'a', title: 'Quick task' })];
		render(QuickWinBanner, { props: { tasks, onTasksChange: vi.fn() } });

		expect(screen.getByRole('region', { name: /do it now/i })).toBeInTheDocument();
	});

	it('complete button has a descriptive aria-label', () => {
		const tasks = [makeTask({ id: 'a', title: 'Quick task' })];
		render(QuickWinBanner, { props: { tasks, onTasksChange: vi.fn() } });

		expect(screen.getByRole('button', { name: /mark as complete/i })).toBeInTheDocument();
	});

	it('delete button has a descriptive aria-label', () => {
		const tasks = [makeTask({ id: 'a', title: 'Quick task' })];
		render(QuickWinBanner, { props: { tasks, onTasksChange: vi.fn() } });

		expect(screen.getByRole('button', { name: /delete task/i })).toBeInTheDocument();
	});
});
