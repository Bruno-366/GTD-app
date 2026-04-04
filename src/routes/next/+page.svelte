<script lang="ts">
	import { onMount } from 'svelte';
	import TaskList from '$lib/TaskList.svelte';
	import { getNextActionTasks } from '$lib/db';
	import type { Task } from '$lib/types';

	let tasks = $state<Task[]>([]);

	async function loadTasks() {
		tasks = await getNextActionTasks();
	}

	onMount(loadTasks);
</script>

<svelte:head>
	<title>Next Actions — GTD App</title>
</svelte:head>

<TaskList
	title="Next Actions"
	icon="⚡"
	{tasks}
	onTasksChange={loadTasks}
/>
