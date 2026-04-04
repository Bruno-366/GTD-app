<script lang="ts">
	import { onMount } from 'svelte';
	import TaskList from '$lib/TaskList.svelte';
	import { getAllTasks } from '$lib/db';
	import { notifyTaskChange } from '$lib/stores';
	import type { Task } from '$lib/types';

	let tasks = $state<Task[]>([]);

	async function loadTasks() {
		tasks = await getAllTasks();
	}

	async function handleTasksChange() {
		await loadTasks();
		notifyTaskChange();
	}

	onMount(loadTasks);
</script>

<svelte:head>
	<title>Projects — GTD App</title>
</svelte:head>

<TaskList
	title="Projects"
	icon="📁"
	description="Projects are top-level tasks. Add subtasks to break them down into next actions."
	{tasks}
	onTasksChange={handleTasksChange}
/>
