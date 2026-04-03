<script lang="ts">
	import { onMount } from 'svelte';
	import TaskList from '$lib/TaskList.svelte';
	import { getTasksByList, getAllProjects } from '$lib/db';
	import type { Task, Project } from '$lib/types';

	let tasks = $state<Task[]>([]);
	let projects = $state<Project[]>([]);

	async function loadTasks() {
		[tasks, projects] = await Promise.all([getTasksByList('waiting'), getAllProjects()]);
	}

	onMount(loadTasks);
</script>

<svelte:head>
	<title>Waiting For — GTD App</title>
</svelte:head>

<TaskList
	list="waiting"
	title="Waiting For"
	icon="⏳"
	{tasks}
	{projects}
	onTasksChange={loadTasks}
/>
