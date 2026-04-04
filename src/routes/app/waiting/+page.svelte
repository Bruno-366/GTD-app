<script lang="ts">
	import { onMount } from 'svelte';
	import TaskList from '$lib/TaskList.svelte';
	import { getWaitingTasks } from '$lib/db';
	import { notifyTaskChange } from '$lib/stores';
	import type { Task } from '$lib/types';

	let tasks = $state<Task[]>([]);

	async function loadTasks() {
		tasks = await getWaitingTasks();
	}

	async function handleTasksChange() {
		await loadTasks();
		notifyTaskChange();
	}

	onMount(loadTasks);
</script>

<svelte:head>
	<title>Waiting For — GTD App</title>
</svelte:head>

<TaskList
	title="Waiting For"
	icon="⏳"
	{tasks}
	onTasksChange={handleTasksChange}
/>
