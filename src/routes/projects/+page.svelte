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

<div class="projects-view">
	<div class="list-header">
		<h2 class="list-title"><span>📁</span> Projects</h2>
		<span class="task-count">{activeProjects.length}</span>
	</div>

	{#if showForm}
		<div class="add-form">
			<input
				type="text"
				placeholder="Project name..."
				bind:value={newTitle}
				onkeydown={handleKeydown}
				class="input"
				use:focusOnMount
			/>
			<textarea
				placeholder="Notes (optional)"
				bind:value={newNotes}
				rows={2}
				class="input textarea"
			></textarea>
			<div class="form-actions">
				<button onclick={handleAdd} class="btn btn-primary" disabled={!newTitle.trim()}>
					Add project
				</button>
				<button onclick={() => (showForm = false)} class="btn btn-ghost">Cancel</button>
			</div>
		</div>
	{:else}
		<button onclick={() => (showForm = true)} class="add-btn">
			<span>+</span> Add project
		</button>
	{/if}

	<ul class="project-list">
		{#each activeProjects as project (project.id)}
			<li class="project-item">
				{#if editingProject?.id === project.id}
					<div class="edit-form">
						<input type="text" bind:value={editTitle} class="input" />
						<textarea bind:value={editNotes} rows={2} class="input textarea"></textarea>
						<div class="form-actions">
							<button onclick={handleEditSave} class="btn btn-primary" disabled={!editTitle.trim()}>
								Save
							</button>
							<button onclick={() => (editingProject = null)} class="btn btn-ghost">Cancel</button>
						</div>
					</div>
				{:else}
					<div class="project-row">
						<button
							class="checkbox"
							onclick={() => handleToggle(project)}
							aria-label="Mark as complete"
						></button>
						<div
							class="project-content"
							role="button"
							tabindex="0"
							onclick={() => startEdit(project)}
							onkeydown={(e) => e.key === 'Enter' && startEdit(project)}
						>
							<span class="project-title">{project.title}</span>
							{#if project.notes}
								<span class="project-notes">{project.notes}</span>
							{/if}
							{#if projectTaskCount(project.id) > 0}
								<span class="project-tasks">⚡ {projectTaskCount(project.id)} next action{projectTaskCount(project.id) !== 1 ? 's' : ''}</span>
							{/if}
						</div>
						<button
							class="delete-btn"
							onclick={() => handleDelete(project.id)}
							aria-label="Delete project"
						>✕</button>
					</div>
				{/if}
			</li>
		{/each}
	</ul>

	{#if completedProjects.length > 0}
		<button class="completed-toggle" onclick={() => (showCompleted = !showCompleted)}>
			{showCompleted ? '▼' : '▶'} Completed ({completedProjects.length})
		</button>
		{#if showCompleted}
			<ul class="project-list completed-list">
				{#each completedProjects as project (project.id)}
					<li class="project-item completed">
						<div class="project-row">
							<button
								class="checkbox checked"
								onclick={() => handleToggle(project)}
								aria-label="Mark as incomplete"
							>✓</button>
							<div class="project-content">
								<span class="project-title">{project.title}</span>
							</div>
							<button
								class="delete-btn"
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

<style>
	.projects-view {
		background: white;
		border-radius: 0.75rem;
		padding: 1.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
	}

	.list-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1.25rem;
	}

	.list-title {
		font-size: 1.25rem;
		font-weight: 700;
		color: #1e293b;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.task-count {
		background: #ede9fe;
		color: #4f46e5;
		font-size: 0.875rem;
		font-weight: 600;
		padding: 0.125rem 0.5rem;
		border-radius: 9999px;
	}

	.add-form,
	.edit-form {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 1rem;
		padding: 1rem;
		background: #f8fafc;
		border-radius: 0.5rem;
		border: 1px solid #e2e8f0;
	}

	.input {
		width: 100%;
		padding: 0.5rem 0.75rem;
		border: 1px solid #cbd5e1;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		outline: none;
		font-family: inherit;
		background: white;
	}

	.input:focus {
		border-color: #4f46e5;
		box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.15);
	}

	.textarea {
		resize: vertical;
		min-height: 60px;
	}

	.form-actions {
		display: flex;
		gap: 0.5rem;
	}

	.btn {
		padding: 0.5rem 1rem;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		border: none;
		transition: background 0.15s;
		font-family: inherit;
	}

	.btn-primary {
		background: #4f46e5;
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		background: #4338ca;
	}

	.btn-primary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-ghost {
		background: transparent;
		color: #64748b;
		border: 1px solid #cbd5e1;
	}

	.btn-ghost:hover {
		background: #f1f5f9;
	}

	.add-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		border: 1.5px dashed #cbd5e1;
		border-radius: 0.375rem;
		background: transparent;
		color: #94a3b8;
		font-size: 0.875rem;
		cursor: pointer;
		width: 100%;
		transition: all 0.15s;
		font-family: inherit;
		margin-bottom: 1rem;
	}

	.add-btn:hover {
		border-color: #4f46e5;
		color: #4f46e5;
		background: #f5f3ff;
	}

	.project-list {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.project-item {
		border-radius: 0.5rem;
	}

	.project-row {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		padding: 0.75rem;
		border-radius: 0.5rem;
		transition: background 0.1s;
	}

	.project-row:hover {
		background: #f8fafc;
	}

	.project-item.completed .project-title {
		text-decoration: line-through;
		color: #94a3b8;
	}

	.checkbox {
		width: 1.25rem;
		height: 1.25rem;
		border: 2px solid #cbd5e1;
		border-radius: 0.25rem;
		background: transparent;
		cursor: pointer;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: 0.125rem;
		transition: border-color 0.15s, background 0.15s;
		padding: 0;
		font-size: 0.7rem;
	}

	.checkbox:hover {
		border-color: #4f46e5;
	}

	.checkbox.checked {
		background: #4f46e5;
		border-color: #4f46e5;
		color: white;
	}

	.project-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		cursor: pointer;
		min-width: 0;
	}

	.project-title {
		font-size: 0.9375rem;
		font-weight: 600;
		color: #1e293b;
	}

	.project-notes {
		font-size: 0.8125rem;
		color: #64748b;
	}

	.project-tasks {
		font-size: 0.75rem;
		color: #4f46e5;
	}

	.delete-btn {
		background: transparent;
		border: none;
		color: #cbd5e1;
		cursor: pointer;
		font-size: 0.875rem;
		padding: 0.25rem;
		line-height: 1;
		opacity: 0;
		transition: color 0.15s, opacity 0.15s;
		flex-shrink: 0;
	}

	.project-row:hover .delete-btn {
		opacity: 1;
	}

	.delete-btn:hover {
		color: #ef4444;
	}

	.completed-toggle {
		margin-top: 1rem;
		background: transparent;
		border: none;
		color: #64748b;
		font-size: 0.875rem;
		cursor: pointer;
		padding: 0.25rem 0;
		font-family: inherit;
	}

	.completed-toggle:hover {
		color: #1e293b;
	}

	.completed-list {
		margin-top: 0.5rem;
	}
</style>
