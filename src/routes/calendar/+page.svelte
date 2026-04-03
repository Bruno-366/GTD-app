<script lang="ts">
	import { onMount } from 'svelte';
	import { getTasksWithDueDate, updateTask, deleteTask } from '$lib/db';
	import type { Task } from '$lib/types';

	let tasks = $state<Task[]>([]);

	async function load() {
		const raw = await getTasksWithDueDate();
		// Sort ascending by dueDate
		tasks = raw.sort((a, b) => (a.dueDate! < b.dueDate! ? -1 : 1));
	}

	onMount(load);

	function formatDate(iso: string): string {
		// Use noon UTC to avoid date-shifting across timezone boundaries
		const d = new Date(iso + 'T12:00:00Z');
		return d.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
	}

	function isOverdue(iso: string): boolean {
		// Compare ISO date strings directly to avoid timezone issues
		return iso < new Date().toISOString().slice(0, 10);
	}

	function isToday(iso: string): boolean {
		return iso === new Date().toISOString().slice(0, 10);
	}

	async function handleToggle(task: Task) {
		await updateTask({ ...task, completed: !task.completed });
		await load();
	}

	async function handleDelete(id: string) {
		await deleteTask(id);
		await load();
	}

	function formatMinutes(mins: number): string {
		if (mins < 60) return `${mins}m`;
		const h = Math.floor(mins / 60);
		const m = mins % 60;
		return m > 0 ? `${h}h ${m}m` : `${h}h`;
	}

	// Group tasks by dueDate
	const grouped = $derived.by(() => {
		const map = new Map<string, Task[]>();
		for (const t of tasks) {
			const key = t.dueDate!;
			if (!map.has(key)) map.set(key, []);
			map.get(key)!.push(t);
		}
		return [...map.entries()].sort(([a], [b]) => (a < b ? -1 : 1));
	});
</script>

<svelte:head>
	<title>Calendar — GTD App</title>
</svelte:head>

<div class="bg-white rounded-xl p-6 shadow-sm">
	<div class="flex items-center justify-between mb-5">
		<h2 class="text-xl font-bold text-slate-900 flex items-center gap-2">
			<span>📅</span> Calendar
		</h2>
		<span class="bg-violet-100 text-indigo-600 text-sm font-semibold px-2 py-0.5 rounded-full">
			{tasks.length}
		</span>
	</div>

	{#if tasks.length === 0}
		<p class="text-slate-400 text-sm text-center py-10">No tasks with a due date yet.<br>Add a due date when creating or editing a task.</p>
	{:else}
		<div class="flex flex-col gap-5">
			{#each grouped as [date, group]}
				<section>
					<h3 class="text-xs font-semibold uppercase tracking-wide mb-2 px-1
						{isOverdue(date) ? 'text-red-500' : isToday(date) ? 'text-indigo-600' : 'text-slate-500'}">
						{isToday(date) ? '🔔 Today — ' : isOverdue(date) ? '⚠ Overdue — ' : ''}{formatDate(date)}
					</h3>
					<ul class="flex flex-col gap-1 list-none">
						{#each group as task (task.id)}
							<li class="group flex items-start gap-3 px-3 py-3 rounded-lg transition-colors hover:bg-slate-50 border border-slate-100">
								<button
									class="w-5 h-5 border-2 border-slate-300 rounded-full bg-transparent cursor-pointer shrink-0 flex items-center justify-center mt-0.5 transition-colors hover:border-indigo-500 p-0"
									onclick={() => handleToggle(task)}
									aria-label="Mark as complete"
								></button>
								<div class="flex-1 flex flex-col gap-1 min-w-0">
									<span class="text-[0.9375rem] text-slate-900 break-words">{task.title}</span>
									{#if task.notes}
										<span class="text-[0.8125rem] text-slate-500">{task.notes}</span>
									{/if}
									<div class="flex flex-wrap gap-1 mt-0.5">
										{#if task.context}
											<span class="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">#{task.context}</span>
										{/if}
										{#if task.delegatedTo}
											<span class="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">@{task.delegatedTo}</span>
										{/if}
										{#if task.estimatedMinutes != null}
											<span class="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">⏱ {formatMinutes(task.estimatedMinutes)}</span>
										{/if}
									</div>
								</div>
								<button
									class="bg-transparent border-0 text-slate-300 cursor-pointer text-sm p-1 leading-none shrink-0 opacity-0 group-hover:opacity-100 hover:!text-red-500"
									onclick={() => handleDelete(task.id)}
									aria-label="Delete task"
								>✕</button>
							</li>
						{/each}
					</ul>
				</section>
			{/each}
		</div>
	{/if}
</div>
