<script lang="ts">
	import { onMount } from 'svelte';
	import TaskList from '$lib/TaskList.svelte';
	import { getAllTasks } from '$lib/db';
	import { isInbox } from '$lib/filters';
	import { notifyTaskChange } from '$lib/stores';
	import type { Task } from '$lib/types';

	let tasks = $state<Task[]>([]);
	let allTasks = $state<Task[]>([]);

	async function loadTasks() {
		const all = await getAllTasks();
		const inboxFiltered = all.filter(isInbox);
		// If any recent subtask is in the inbox, also include its parent so TaskList
		// can render it grouped under the correct parent task.
		const inboxFilteredIds = new Set(inboxFiltered.map((t) => t.id));
		const parentIdsNeeded = new Set(inboxFiltered.filter((t) => t.parentId).map((t) => t.parentId!));
		const extraParents = all.filter(
			(t) => parentIdsNeeded.has(t.id) && !inboxFilteredIds.has(t.id)
		);
		tasks = [...inboxFiltered, ...extraParents];
		allTasks = all;
		notifyTaskChange();
	}

	onMount(loadTasks);
</script>

<svelte:head>
	<title>Inbox — GTD App</title>
</svelte:head>

<TaskList
	title="Inbox"
	icon="📥"
	{tasks}
	{allTasks}
	onTasksChange={loadTasks}
/>
