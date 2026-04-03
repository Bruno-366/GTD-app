<script lang="ts">
	import { onMount } from 'svelte';
	import TaskList from '$lib/TaskList.svelte';
	import { getTasksByList, getAllProjects } from '$lib/db';
	import type { Task, Project } from '$lib/types';

	let tasks = $state<Task[]>([]);
	let projects = $state<Project[]>([]);

	async function loadTasks() {
		[tasks, projects] = await Promise.all([getTasksByList('next'), getAllProjects()]);
	}

	onMount(loadTasks);

	const doItNow = $derived(tasks.filter((t) => !t.completed && !t.parentId && t.estimatedMinutes != null && t.estimatedMinutes <= 2));
</script>

<svelte:head>
	<title>Next Actions — GTD App</title>
</svelte:head>

{#if doItNow.length > 0}
	<div class="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4 shadow-sm">
		<h3 class="text-sm font-semibold text-emerald-700 mb-2 flex items-center gap-1.5">
			<span>⚡</span> Do it Now — under 2 minutes ({doItNow.length})
		</h3>
		<ul class="flex flex-col gap-1 list-none">
			{#each doItNow as task (task.id)}
				<li class="flex items-center gap-2 text-sm text-emerald-900">
					<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
					<span class="break-words">{task.title}</span>
					{#if task.estimatedMinutes != null}
						<span class="ml-auto shrink-0 text-xs bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">⏱ {task.estimatedMinutes}m</span>
					{/if}
				</li>
			{/each}
		</ul>
	</div>
{/if}

<TaskList
	list="next"
	title="Next Actions"
	icon="⚡"
	{tasks}
	{projects}
	onTasksChange={loadTasks}
/>
