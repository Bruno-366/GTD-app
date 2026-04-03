<script lang="ts">
	import type { Task, Project } from '$lib/types';
	import { addTask, updateTask, deleteTask } from '$lib/db';

	interface Props {
		list: Task['list'];
		title: string;
		icon: string;
		tasks: Task[];
		projects?: Project[];
		onTasksChange: () => void;
	}

	let { list, title, icon, tasks = $bindable([]), projects = [], onTasksChange }: Props = $props();

	function focusOnMount(node: HTMLElement) {
		node.focus();
	}

	let newTitle = $state('');
	let newNotes = $state('');
	let newProject = $state('');
	let showForm = $state(false);
	let editingTask = $state<Task | null>(null);
	let editTitle = $state('');
	let editNotes = $state('');
	let editProject = $state('');
	let showCompleted = $state(false);

	const activeTasks = $derived(tasks.filter((t) => !t.completed));
	const completedTasks = $derived(tasks.filter((t) => t.completed));

	async function handleAdd() {
		const trimmed = newTitle.trim();
		if (!trimmed) return;

		await addTask(trimmed, list, newNotes.trim(), newProject || undefined);
		newTitle = '';
		newNotes = '';
		newProject = '';
		showForm = false;
		onTasksChange();
	}

	async function handleToggle(task: Task) {
		await updateTask({ ...task, completed: !task.completed });
		onTasksChange();
	}

	async function handleDelete(id: string) {
		await deleteTask(id);
		onTasksChange();
	}

	function startEdit(task: Task) {
		editingTask = task;
		editTitle = task.title;
		editNotes = task.notes;
		editProject = task.project ?? '';
	}

	async function handleEditSave() {
		if (!editingTask || !editTitle.trim()) return;
		await updateTask({
			...editingTask,
			title: editTitle.trim(),
			notes: editNotes.trim(),
			project: editProject || undefined
		});
		editingTask = null;
		onTasksChange();
	}

	function cancelEdit() {
		editingTask = null;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleAdd();
		}
		if (e.key === 'Escape') {
			showForm = false;
		}
	}

	function handleEditKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') cancelEdit();
	}
</script>

<div class="task-list">
	<div class="list-header">
		<h2 class="list-title"><span>{icon}</span> {title}</h2>
		<span class="task-count">{activeTasks.length}</span>
	</div>

	{#if showForm}
		<div class="add-form">
			<input
				type="text"
				placeholder="Task title..."
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
			{#if list !== 'inbox' && projects.length > 0}
				<select bind:value={newProject} class="input select">
					<option value="">No project</option>
					{#each projects.filter((p) => !p.completed) as project}
						<option value={project.id}>{project.title}</option>
					{/each}
				</select>
			{/if}
			<div class="form-actions">
				<button onclick={handleAdd} class="btn btn-primary" disabled={!newTitle.trim()}>
					Add task
				</button>
				<button onclick={() => (showForm = false)} class="btn btn-ghost"> Cancel </button>
			</div>
		</div>
	{:else}
		<button onclick={() => (showForm = true)} class="add-btn">
			<span>+</span> Add task
		</button>
	{/if}

	<ul class="tasks">
		{#each activeTasks as task (task.id)}
			<li class="task-item">
				{#if editingTask?.id === task.id}
					<div class="edit-form">
						<input
							type="text"
							bind:value={editTitle}
							onkeydown={handleEditKeydown}
							class="input"
						/>
						<textarea bind:value={editNotes} rows={2} class="input textarea"></textarea>
						{#if projects.length > 0}
							<select bind:value={editProject} class="input select">
								<option value="">No project</option>
								{#each projects.filter((p) => !p.completed) as project}
									<option value={project.id}>{project.title}</option>
								{/each}
							</select>
						{/if}
						<div class="form-actions">
							<button onclick={handleEditSave} class="btn btn-primary" disabled={!editTitle.trim()}>
								Save
							</button>
							<button onclick={cancelEdit} class="btn btn-ghost">Cancel</button>
						</div>
					</div>
				{:else}
					<div class="task-row">
						<button
							class="checkbox"
							onclick={() => handleToggle(task)}
							aria-label="Mark as complete"
						>
							<span class="checkbox-inner"></span>
						</button>
						<div class="task-content" role="button" tabindex="0" onclick={() => startEdit(task)} onkeydown={(e) => e.key === 'Enter' && startEdit(task)}>
							<span class="task-title">{task.title}</span>
							{#if task.notes}
								<span class="task-notes">{task.notes}</span>
							{/if}
							{#if task.project}
								{@const proj = projects.find((p) => p.id === task.project)}
								{#if proj}
									<span class="task-project">📁 {proj.title}</span>
								{/if}
							{/if}
						</div>
						<button
							class="delete-btn"
							onclick={() => handleDelete(task.id)}
							aria-label="Delete task"
						>
							✕
						</button>
					</div>
				{/if}
			</li>
		{/each}
	</ul>

	{#if completedTasks.length > 0}
		<button
			class="completed-toggle"
			onclick={() => (showCompleted = !showCompleted)}
		>
			{showCompleted ? '▼' : '▶'} Completed ({completedTasks.length})
		</button>
		{#if showCompleted}
			<ul class="tasks completed-tasks">
				{#each completedTasks as task (task.id)}
					<li class="task-item completed">
						<div class="task-row">
							<button
								class="checkbox checked"
								onclick={() => handleToggle(task)}
								aria-label="Mark as incomplete"
							>
								<span class="checkbox-inner">✓</span>
							</button>
							<div class="task-content">
								<span class="task-title">{task.title}</span>
							</div>
							<button
								class="delete-btn"
								onclick={() => handleDelete(task.id)}
								aria-label="Delete task"
							>
								✕
							</button>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	{/if}
</div>

<style>
	.task-list {
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

	.select {
		cursor: pointer;
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

	.tasks {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.task-item {
		border-radius: 0.5rem;
	}

	.task-row {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		padding: 0.75rem;
		border-radius: 0.5rem;
		transition: background 0.1s;
	}

	.task-row:hover {
		background: #f8fafc;
	}

	.task-item.completed .task-title {
		text-decoration: line-through;
		color: #94a3b8;
	}

	.checkbox {
		width: 1.25rem;
		height: 1.25rem;
		border: 2px solid #cbd5e1;
		border-radius: 50%;
		background: transparent;
		cursor: pointer;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: 0.125rem;
		transition: border-color 0.15s, background 0.15s;
		padding: 0;
	}

	.checkbox:hover {
		border-color: #4f46e5;
	}

	.checkbox.checked {
		background: #4f46e5;
		border-color: #4f46e5;
		color: white;
		font-size: 0.7rem;
	}

	.checkbox-inner {
		display: block;
	}

	.task-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		cursor: pointer;
		min-width: 0;
	}

	.task-title {
		font-size: 0.9375rem;
		color: #1e293b;
		word-break: break-word;
	}

	.task-notes {
		font-size: 0.8125rem;
		color: #64748b;
		word-break: break-word;
	}

	.task-project {
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

	.task-row:hover .delete-btn {
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

	.completed-tasks {
		margin-top: 0.5rem;
	}
</style>
