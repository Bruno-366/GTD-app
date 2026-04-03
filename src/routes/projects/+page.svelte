<script lang="ts">
	import { onMount } from 'svelte';
	import { getAllProjects, addProject, updateProject, deleteProject, getTasksByList } from '$lib/db';
	import type { Project, Task } from '$lib/types';

	let projects = $state<Project[]>([]);
	let tasks = $state<Task[]>([]);
	let newTitle = $state('');
	let newNotes = $state('');
	let showForm = $state(false);
	let editingProject = $state<Project | null>(null);
	let editTitle = $state('');

	function focusOnMount(node: HTMLElement) {
		node.focus();
	}
	let editNotes = $state('');

	async function loadData() {
		[projects, tasks] = await Promise.all([getAllProjects(), getTasksByList('next')]);
	}

	onMount(loadData);

	async function handleAdd() {
		const trimmed = newTitle.trim();
		if (!trimmed) return;
		await addProject(trimmed, newNotes.trim());
		newTitle = '';
		newNotes = '';
		showForm = false;
		await loadData();
	}

	async function handleToggle(project: Project) {
		await updateProject({ ...project, completed: !project.completed });
		await loadData();
	}

	async function handleDelete(id: string) {
		await deleteProject(id);
		await loadData();
	}

	function startEdit(project: Project) {
		editingProject = project;
		editTitle = project.title;
		editNotes = project.notes;
	}

	async function handleEditSave() {
		if (!editingProject || !editTitle.trim()) return;
		await updateProject({ ...editingProject, title: editTitle.trim(), notes: editNotes.trim() });
		editingProject = null;
		await loadData();
	}

	const activeProjects = $derived(projects.filter((p) => !p.completed));
	const completedProjects = $derived(projects.filter((p) => p.completed));
	let showCompleted = $state(false);

	function projectTaskCount(projectId: string) {
		return tasks.filter((t) => t.project === projectId && !t.completed).length;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleAdd();
		}
		if (e.key === 'Escape') showForm = false;
	}
</script>

<svelte:head>
	<title>Projects — GTD App</title>
</svelte:head>

<div class="bg-white rounded-xl p-6 shadow-sm">
	<!-- Header -->
	<div class="flex items-center justify-between mb-5">
		<h2 class="text-xl font-bold text-slate-900 flex items-center gap-2">
			<span>📁</span> Projects
		</h2>
		<span class="bg-violet-100 text-indigo-600 text-sm font-semibold px-2 py-0.5 rounded-full">
			{activeProjects.length}
		</span>
	</div>

	<!-- Add form -->
	{#if showForm}
		<div class="flex flex-col gap-2 mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
			<input
				type="text"
				placeholder="Project name..."
				bind:value={newTitle}
				onkeydown={handleKeydown}
				class="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-[inherit]"
				use:focusOnMount
			/>
			<textarea
				placeholder="Notes (optional)"
				bind:value={newNotes}
				rows={2}
				class="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-[inherit] resize-y min-h-[60px]"
			></textarea>
			<div class="flex gap-2">
				<button onclick={handleAdd} disabled={!newTitle.trim()} class="px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-[inherit] cursor-pointer border-0">
					Add project
				</button>
				<button onclick={() => (showForm = false)} class="px-4 py-2 rounded-md text-sm font-medium bg-transparent text-slate-500 border border-slate-300 transition-colors hover:bg-slate-100 font-[inherit] cursor-pointer">
					Cancel
				</button>
			</div>
		</div>
	{:else}
		<button onclick={() => (showForm = true)} class="flex items-center gap-2 px-3 py-2 border-2 border-dashed border-slate-300 rounded-md bg-transparent text-slate-400 text-sm cursor-pointer w-full transition-all duration-150 font-[inherit] mb-4 hover:border-indigo-500 hover:text-indigo-600 hover:bg-violet-50">
			<span>+</span> Add project
		</button>
	{/if}

	<!-- Active projects -->
	<ul class="flex flex-col gap-1 list-none">
		{#each activeProjects as project (project.id)}
			<li class="rounded-lg">
				{#if editingProject?.id === project.id}
					<div class="flex flex-col gap-2 mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
						<input type="text" bind:value={editTitle} class="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-[inherit]" />
						<textarea bind:value={editNotes} rows={2} class="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-[inherit] resize-y min-h-[60px]"></textarea>
						<div class="flex gap-2">
							<button onclick={handleEditSave} disabled={!editTitle.trim()} class="px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-[inherit] cursor-pointer border-0">
								Save
							</button>
							<button onclick={() => (editingProject = null)} class="px-4 py-2 rounded-md text-sm font-medium bg-transparent text-slate-500 border border-slate-300 transition-colors hover:bg-slate-100 font-[inherit] cursor-pointer">
								Cancel
							</button>
						</div>
					</div>
				{:else}
					<div class="group flex items-start gap-3 px-3 py-3 rounded-lg transition-colors duration-100 hover:bg-slate-50">
						<button
							class="w-5 h-5 border-2 border-slate-300 rounded bg-transparent cursor-pointer shrink-0 flex items-center justify-center mt-0.5 transition-colors duration-150 p-0 text-[0.7rem] hover:border-indigo-500"
							onclick={() => handleToggle(project)}
							aria-label="Mark as complete"
						></button>
						<div
							class="flex-1 flex flex-col gap-1 cursor-pointer min-w-0"
							role="button"
							tabindex="0"
							onclick={() => startEdit(project)}
							onkeydown={(e) => e.key === 'Enter' && startEdit(project)}
						>
							<span class="text-[0.9375rem] font-semibold text-slate-900">{project.title}</span>
							{#if project.notes}
								<span class="text-[0.8125rem] text-slate-500">{project.notes}</span>
							{/if}
							{#if projectTaskCount(project.id) > 0}
								<span class="text-xs text-indigo-600">⚡ {projectTaskCount(project.id)} next action{projectTaskCount(project.id) !== 1 ? 's' : ''}</span>
							{/if}
						</div>
						<button
							class="bg-transparent border-0 text-slate-300 cursor-pointer text-sm p-1 leading-none shrink-0 opacity-0 transition-[color,opacity] duration-150 group-hover:opacity-100 hover:!text-red-500"
							onclick={() => handleDelete(project.id)}
							aria-label="Delete project"
						>✕</button>
					</div>
				{/if}
			</li>
		{/each}
	</ul>

	<!-- Completed projects -->
	{#if completedProjects.length > 0}
		<button class="mt-4 bg-transparent border-0 text-slate-500 text-sm cursor-pointer py-1 px-0 font-[inherit] hover:text-slate-900" onclick={() => (showCompleted = !showCompleted)}>
			{showCompleted ? '▼' : '▶'} Completed ({completedProjects.length})
		</button>
		{#if showCompleted}
			<ul class="flex flex-col gap-1 list-none mt-2">
				{#each completedProjects as project (project.id)}
					<li class="rounded-lg">
						<div class="group flex items-start gap-3 px-3 py-3 rounded-lg transition-colors duration-100 hover:bg-slate-50">
							<button
								class="w-5 h-5 border-2 border-indigo-600 rounded bg-indigo-600 cursor-pointer shrink-0 flex items-center justify-center mt-0.5 transition-colors duration-150 p-0 text-white text-[0.7rem]"
								onclick={() => handleToggle(project)}
								aria-label="Mark as incomplete"
							>✓</button>
							<div class="flex-1 flex flex-col gap-1 min-w-0">
								<span class="text-[0.9375rem] font-semibold text-slate-400 line-through">{project.title}</span>
							</div>
							<button
								class="bg-transparent border-0 text-slate-300 cursor-pointer text-sm p-1 leading-none shrink-0 opacity-0 transition-[color,opacity] duration-150 group-hover:opacity-100 hover:!text-red-500"
								onclick={() => handleDelete(project.id)}
								aria-label="Delete project"
							>✕</button>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	{/if}
</div>
