<script lang="ts">
	import { onMount } from 'svelte';
	import TaskList from '$lib/TaskList.svelte';
	import { getInboxTasks } from '$lib/db';
	import type { Task } from '$lib/types';

	let tasks = $state<Task[]>([]);

	async function loadTasks() {
		tasks = await getInboxTasks();
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
	onTasksChange={loadTasks}
/>
