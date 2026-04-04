<script lang="ts">
	import { onMount } from 'svelte';
	import TaskList from '$lib/TaskList.svelte';
	import { getNextActionTasks, getAllTasks } from '$lib/db';
	import type { Task } from '$lib/types';

	let tasks = $state<Task[]>([]);
	let allTasks = $state<Task[]>([]);

	async function loadTasks() {
		[tasks, allTasks] = await Promise.all([getNextActionTasks(), getAllTasks()]);
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
	{allTasks}
	onTasksChange={loadTasks}
/>
