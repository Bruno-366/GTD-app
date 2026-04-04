<script lang="ts">
	import type { Task } from '$lib/types';
	import { updateTask, deleteTask } from '$lib/db';

	interface Props {
		tasks: Task[];
		onTasksChange: () => void;
	}

	let { tasks, onTasksChange }: Props = $props();

	function formatMinutes(mins: number): string {
		if (mins < 60) return `${mins}m`;
		const h = Math.floor(mins / 60);
		const m = mins % 60;
		return m > 0 ? `${h}h ${m}m` : `${h}h`;
	}

	async function handleComplete(task: Task) {
		await updateTask({ ...task, completed: true });
		onTasksChange();
	}

	async function handleDismiss(task: Task) {
		// Quick wins are leaf tasks (no children), so a plain deleteTask is sufficient
		await deleteTask(task.id);
		onTasksChange();
	}
</script>

{#if tasks.length > 0}
	<div class="mb-4 bg-emerald-50 border border-emerald-200 rounded-xl p-5 shadow-sm">
		<div class="flex items-center gap-2 mb-2">
			<span class="text-lg">⏱</span>
			<h3 class="text-base font-bold text-emerald-800">Do it Now</h3>
			<span class="bg-emerald-200 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full"
				>{tasks.length}</span
			>
		</div>
		<p class="text-xs text-emerald-600 mb-3">Quick wins — no context needed, under 2 minutes each.</p>
		<ul class="flex flex-col gap-1 list-none">
			{#each tasks as task (task.id)}
				<li class="flex items-center gap-3 px-3 py-2 bg-white rounded-lg border border-emerald-100">
					<button
						class="w-5 h-5 border-2 border-emerald-400 rounded-full bg-transparent cursor-pointer shrink-0 flex items-center justify-center transition-colors duration-150 p-0 hover:border-emerald-600 hover:bg-emerald-100"
						onclick={() => handleComplete(task)}
						aria-label="Mark as complete"
					></button>
					<span class="flex-1 text-sm text-slate-800 break-words">{task.title}</span>
					{#if task.estimatedMinutes != null}
						<span class="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full shrink-0"
							>⏱ {formatMinutes(task.estimatedMinutes)}</span
						>
					{/if}
					<button
						class="bg-transparent border-0 text-slate-300 cursor-pointer text-sm p-1 leading-none shrink-0 hover:text-red-500"
						onclick={() => handleDismiss(task)}
						aria-label="Delete task"
					>✕</button>
				</li>
			{/each}
		</ul>
	</div>
{/if}
