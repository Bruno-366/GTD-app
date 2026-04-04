<script lang="ts">
	import { onMount } from 'svelte';
	import TaskList from '$lib/TaskList.svelte';
	import QuickWinBanner from '$lib/QuickWinBanner.svelte';
	import { getAllTasks } from '$lib/db';
	import { isInbox, isQuickWin } from '$lib/filters';
	import type { Task } from '$lib/types';

	let tasks = $state<Task[]>([]);
	let quickWinTasks = $state<Task[]>([]);
	let allTasks = $state<Task[]>([]);

	async function loadTasks() {
		const all = await getAllTasks();
		const inboxFiltered = all.filter(isInbox);
		// If any recent subtask is in the inbox, also include its parent so TaskList
		// can render it grouped under the correct parent task.
		const parentIdsNeeded = new Set(inboxFiltered.filter((t) => t.parentId).map((t) => t.parentId!));
		const extraParents = all.filter(
			(t) => parentIdsNeeded.has(t.id) && !inboxFiltered.some((it) => it.id === t.id)
		);
		tasks = [...inboxFiltered, ...extraParents];
		quickWinTasks = all.filter(isQuickWin);
		allTasks = all;
	}

	onMount(loadTasks);
</script>

<svelte:head>
	<title>Inbox — GTD App</title>
</svelte:head>

<QuickWinBanner tasks={quickWinTasks} onTasksChange={loadTasks} />

<TaskList
	title="Inbox"
	icon="📥"
	{tasks}
	{allTasks}
	onTasksChange={loadTasks}
/>
