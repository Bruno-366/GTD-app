<script lang="ts">
	import { onMount } from 'svelte';
	import TaskList from '$lib/TaskList.svelte';
	import { getTasksByList, getAllProjects } from '$lib/db';
	import type { Task, Project } from '$lib/types';

	let tasks = $state<Task[]>([]);
	let projects = $state<Project[]>([]);

	async function loadTasks() {
		[tasks, projects] = await Promise.all([getTasksByList('next'), getAllProjects()]);
	}

	onMount(loadTasks);
</script>

<svelte:head>
	<title>Next Actions — GTD App</title>
</svelte:head>

<TaskList
	list="next"
	title="Next Actions"
	icon="⚡"
	{tasks}
	{projects}
	onTasksChange={loadTasks}
/>
