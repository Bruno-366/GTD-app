<script lang="ts">
	import { onMount } from 'svelte';
	import TaskList from '$lib/TaskList.svelte';
	import { getInboxTasks, getQuickWinTasks, getAllTasks } from '$lib/db';
	import type { Task } from '$lib/types';

	let tasks = $state<Task[]>([]);
	let quickWinTasks = $state<Task[]>([]);
	let allTasks = $state<Task[]>([]);

	async function loadTasks() {
		[tasks, quickWinTasks, allTasks] = await Promise.all([
			getInboxTasks(),
			getQuickWinTasks(),
			getAllTasks()
		]);
	}

	onMount(loadTasks);

	function formatMinutes(mins: number): string {
		if (mins < 60) return `${mins}m`;
		const h = Math.floor(mins / 60);
		const m = mins % 60;
		return m > 0 ? `${h}h ${m}m` : `${h}h`;
	}

	async function handleComplete(task: Task) {
		const { updateTask } = await import('$lib/db');
		await updateTask({ ...task, completed: true });
		loadTasks();
	}

	async function handleDismiss(task: Task) {
		const { deleteTask } = await import('$lib/db');
		await deleteTask(task.id);
		loadTasks();
	}
</script>

<svelte:head>
	<title>Inbox — GTD App</title>
</svelte:head>

{#if quickWinTasks.length > 0}
	<div class="mb-4 bg-emerald-50 border border-emerald-200 rounded-xl p-5 shadow-sm">
		<div class="flex items-center gap-2 mb-2">
			<span class="text-lg">⏱</span>
			<h3 class="text-base font-bold text-emerald-800">Do it Now</h3>
			<span class="bg-emerald-200 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full">{quickWinTasks.length}</span>
		</div>
		<p class="text-xs text-emerald-600 mb-3">Quick wins — no context needed, under 2 minutes each.</p>
		<ul class="flex flex-col gap-1 list-none">
			{#each quickWinTasks as task (task.id)}
				<li class="flex items-center gap-3 px-3 py-2 bg-white rounded-lg border border-emerald-100">
					<button
						class="w-5 h-5 border-2 border-emerald-400 rounded-full bg-transparent cursor-pointer shrink-0 flex items-center justify-center transition-colors duration-150 p-0 hover:border-emerald-600 hover:bg-emerald-100"
						onclick={() => handleComplete(task)}
						aria-label="Mark as complete"
					></button>
					<span class="flex-1 text-sm text-slate-800 break-words">{task.title}</span>
					{#if task.estimatedMinutes != null}
						<span class="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full shrink-0">⏱ {formatMinutes(task.estimatedMinutes)}</span>
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

<TaskList
	title="Inbox"
	icon="📥"
	{tasks}
	{allTasks}
	onTasksChange={loadTasks}
/>
