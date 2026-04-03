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

<div class="bg-white rounded-xl p-6 shadow-sm">
	<!-- Header -->
	<div class="flex items-center justify-between mb-5">
		<h2 class="text-xl font-bold text-slate-900 flex items-center gap-2">
			<span>{icon}</span> {title}
		</h2>
		<span class="bg-violet-100 text-indigo-600 text-sm font-semibold px-2 py-0.5 rounded-full">
			{activeTasks.length}
		</span>
	</div>

	<!-- Add / Edit form -->
	{#if showForm}
		<div class="flex flex-col gap-2 mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
			<input
				type="text"
				placeholder="Task title..."
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
			{#if list !== 'inbox' && projects.length > 0}
				<select bind:value={newProject} class="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-[inherit] cursor-pointer">
					<option value="">No project</option>
					{#each projects.filter((p) => !p.completed) as project}
						<option value={project.id}>{project.title}</option>
					{/each}
				</select>
			{/if}
			<div class="flex gap-2">
				<button onclick={handleAdd} disabled={!newTitle.trim()} class="px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-[inherit] cursor-pointer border-0">
					Add task
				</button>
				<button onclick={() => (showForm = false)} class="px-4 py-2 rounded-md text-sm font-medium bg-transparent text-slate-500 border border-slate-300 transition-colors hover:bg-slate-100 font-[inherit] cursor-pointer">
					Cancel
				</button>
			</div>
		</div>
	{:else}
		<button onclick={() => (showForm = true)} class="flex items-center gap-2 px-3 py-2 border-2 border-dashed border-slate-300 rounded-md bg-transparent text-slate-400 text-sm cursor-pointer w-full transition-all duration-150 font-[inherit] mb-4 hover:border-indigo-500 hover:text-indigo-600 hover:bg-violet-50">
			<span>+</span> Add task
		</button>
	{/if}

	<!-- Active tasks -->
	<ul class="flex flex-col gap-1 list-none">
		{#each activeTasks as task (task.id)}
			<li class="rounded-lg">
				{#if editingTask?.id === task.id}
					<div class="flex flex-col gap-2 mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
						<input
							type="text"
							bind:value={editTitle}
							onkeydown={handleEditKeydown}
							class="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-[inherit]"
						/>
						<textarea bind:value={editNotes} rows={2} class="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-[inherit] resize-y min-h-[60px]"></textarea>
						{#if projects.length > 0}
							<select bind:value={editProject} class="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-[inherit] cursor-pointer">
								<option value="">No project</option>
								{#each projects.filter((p) => !p.completed) as project}
									<option value={project.id}>{project.title}</option>
								{/each}
							</select>
						{/if}
						<div class="flex gap-2">
							<button onclick={handleEditSave} disabled={!editTitle.trim()} class="px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-[inherit] cursor-pointer border-0">
								Save
							</button>
							<button onclick={cancelEdit} class="px-4 py-2 rounded-md text-sm font-medium bg-transparent text-slate-500 border border-slate-300 transition-colors hover:bg-slate-100 font-[inherit] cursor-pointer">
								Cancel
							</button>
						</div>
					</div>
				{:else}
					<div class="group flex items-start gap-3 px-3 py-3 rounded-lg transition-colors duration-100 hover:bg-slate-50">
						<button
							class="w-5 h-5 border-2 border-slate-300 rounded-full bg-transparent cursor-pointer shrink-0 flex items-center justify-center mt-0.5 transition-colors duration-150 p-0 hover:border-indigo-500"
							onclick={() => handleToggle(task)}
							aria-label="Mark as complete"
						>
							<span class="block"></span>
						</button>
						<div class="flex-1 flex flex-col gap-1 cursor-pointer min-w-0" role="button" tabindex="0" onclick={() => startEdit(task)} onkeydown={(e) => e.key === 'Enter' && startEdit(task)}>
							<span class="text-[0.9375rem] text-slate-900 break-words">{task.title}</span>
							{#if task.notes}
								<span class="text-[0.8125rem] text-slate-500 break-words">{task.notes}</span>
							{/if}
							{#if task.project}
								{@const proj = projects.find((p) => p.id === task.project)}
								{#if proj}
									<span class="text-xs text-indigo-600">📁 {proj.title}</span>
								{/if}
							{/if}
						</div>
						<button
							class="bg-transparent border-0 text-slate-300 cursor-pointer text-sm p-1 leading-none shrink-0 opacity-0 transition-[color,opacity] duration-150 group-hover:opacity-100 hover:!text-red-500"
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

	<!-- Completed tasks -->
	{#if completedTasks.length > 0}
		<button
			class="mt-4 bg-transparent border-0 text-slate-500 text-sm cursor-pointer py-1 px-0 font-[inherit] hover:text-slate-900"
			onclick={() => (showCompleted = !showCompleted)}
		>
			{showCompleted ? '▼' : '▶'} Completed ({completedTasks.length})
		</button>
		{#if showCompleted}
			<ul class="flex flex-col gap-1 list-none mt-2">
				{#each completedTasks as task (task.id)}
					<li class="rounded-lg">
						<div class="group flex items-start gap-3 px-3 py-3 rounded-lg transition-colors duration-100 hover:bg-slate-50">
							<button
								class="w-5 h-5 border-2 border-indigo-600 rounded-full bg-indigo-600 cursor-pointer shrink-0 flex items-center justify-center mt-0.5 transition-colors duration-150 p-0 text-white text-[0.7rem]"
								onclick={() => handleToggle(task)}
								aria-label="Mark as incomplete"
							>
								<span class="block">✓</span>
							</button>
							<div class="flex-1 flex flex-col gap-1 min-w-0">
								<span class="text-[0.9375rem] text-slate-400 break-words line-through">{task.title}</span>
							</div>
							<button
								class="bg-transparent border-0 text-slate-300 cursor-pointer text-sm p-1 leading-none shrink-0 opacity-0 transition-[color,opacity] duration-150 group-hover:opacity-100 hover:!text-red-500"
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
