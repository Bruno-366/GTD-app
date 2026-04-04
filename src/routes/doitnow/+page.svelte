<script lang="ts">
	import { onMount } from 'svelte';
	import TaskList from '$lib/TaskList.svelte';
	import { getDoItNowTasks } from '$lib/db';
	import type { Task } from '$lib/types';

	let tasks = $state<Task[]>([]);

	async function loadTasks() {
		tasks = await getDoItNowTasks();
	}

	onMount(loadTasks);
</script>

<svelte:head>
	<title>Do it Now — GTD App</title>
</svelte:head>

<TaskList
	title="Do it Now"
	icon="⏱"
	description="All tasks estimated at 2 minutes or less — across every view."
	{tasks}
	onTasksChange={loadTasks}
/>
