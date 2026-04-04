<script lang="ts">
	import { onMount } from 'svelte';
	import TaskList from '$lib/TaskList.svelte';
	import { getSomedayTasks } from '$lib/db';
	import type { Task } from '$lib/types';

	let tasks = $state<Task[]>([]);

	async function loadTasks() {
		tasks = await getSomedayTasks();
	}

	onMount(loadTasks);
</script>

<svelte:head>
	<title>Someday / Maybe — GTD App</title>
</svelte:head>

<TaskList
	title="Someday / Maybe"
	icon="🌟"
	{tasks}
	addAsSomeday={true}
	onTasksChange={loadTasks}
/>
