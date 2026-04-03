<script lang="ts">
	import { onMount } from 'svelte';
	import TaskList from '$lib/TaskList.svelte';
	import { getTasksByList } from '$lib/db';
	import type { Task } from '$lib/types';

	let tasks = $state<Task[]>([]);

	async function loadTasks() {
		tasks = await getTasksByList('inbox');
	}

	onMount(loadTasks);
</script>

<svelte:head>
	<title>Inbox — GTD App</title>
</svelte:head>

<TaskList
	list="inbox"
	title="Inbox"
	icon="📥"
	{tasks}
	onTasksChange={loadTasks}
/>
