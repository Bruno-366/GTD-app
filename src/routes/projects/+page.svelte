<script lang="ts">
	import { onMount } from 'svelte';
	import { getAllTasks, addTask, updateTask, deleteTask } from '$lib/db';
	import type { Task } from '$lib/types';

	let allTasks = $state<Task[]>([]);

	async function loadData() {
		allTasks = await getAllTasks();
	}

	onMount(loadData);

	// Top-level tasks: in the 'project' list or tasks that have subtasks (any list)
	const projectTasks = $derived(
		allTasks.filter((t) => t.list === 'project' && !t.parentId)
	);
	const activeProjects = $derived(projectTasks.filter((p) => !p.completed));
	const completedProjects = $derived(projectTasks.filter((p) => p.completed));
	let showCompleted = $state(false);

	function subtasksOf(parentId: string) {
		return allTasks.filter((t) => t.parentId === parentId);
	}

	// ── new project form ───────────────────────────────────────────────────────
	let showForm = $state(false);
	let newTitle = $state('');
	let newNotes = $state('');

	function focusOnMount(node: HTMLElement) {
		node.focus();
	}

	async function handleAddProject() {
		const trimmed = newTitle.trim();
		if (!trimmed) return;
		await addTask(trimmed, 'project', newNotes.trim());
		newTitle = '';
		newNotes = '';
		showForm = false;
		await loadData();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleAddProject();
		}
		if (e.key === 'Escape') showForm = false;
	}

	// ── edit project ───────────────────────────────────────────────────────────
	let editingId = $state<string | null>(null);
	let editTitle = $state('');
	let editNotes = $state('');

	function startEdit(task: Task) {
		editingId = task.id;
		editTitle = task.title;
		editNotes = task.notes;
	}

	async function handleEditSave(task: Task) {
		if (!editTitle.trim()) return;
		await updateTask({ ...task, title: editTitle.trim(), notes: editNotes.trim() });
		editingId = null;
		await loadData();
	}

	// ── subtask form ───────────────────────────────────────────────────────────
	let addingSubtaskFor = $state<string | null>(null);
	let subtaskTitle = $state('');

	async function handleAddSubtask(parent: Task) {
		const trimmed = subtaskTitle.trim();
		if (!trimmed) return;
		await addTask(trimmed, 'project', '', undefined, { parentId: parent.id });
		subtaskTitle = '';
		addingSubtaskFor = null;
		await loadData();
	}

	function handleSubtaskKeydown(e: KeyboardEvent, parent: Task) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleAddSubtask(parent);
		}
		if (e.key === 'Escape') {
			addingSubtaskFor = null;
			subtaskTitle = '';
		}
	}

	async function handleToggle(task: Task) {
		await updateTask({ ...task, completed: !task.completed });
		await loadData();
	}

	async function handleDelete(task: Task) {
		// Delete subtasks first
		for (const sub of subtasksOf(task.id)) {
			await deleteTask(sub.id);
		}
		await deleteTask(task.id);
		await loadData();
	}

	function activeSubtaskCount(parentId: string) {
		return allTasks.filter((t) => t.parentId === parentId && !t.completed).length;
	}

	const inputCls = 'w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-[inherit]';
	const btnPrimary = 'px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-[inherit] cursor-pointer border-0';
	const btnSecondary = 'px-4 py-2 rounded-md text-sm font-medium bg-transparent text-slate-500 border border-slate-300 transition-colors hover:bg-slate-100 font-[inherit] cursor-pointer';
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

	<p class="text-xs text-slate-400 mb-4">Projects are top-level tasks. Add subtasks to break them down into next actions.</p>

	<!-- Add project form -->
	{#if showForm}
		<div class="flex flex-col gap-2 mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
			<input
				type="text"
				placeholder="Project name…"
				bind:value={newTitle}
				onkeydown={handleKeydown}
				class={inputCls}
				use:focusOnMount
			/>
			<textarea
				placeholder="Notes (optional)"
				bind:value={newNotes}
				rows={2}
				class="{inputCls} resize-y min-h-[60px]"
			></textarea>
			<div class="flex gap-2">
				<button onclick={handleAddProject} disabled={!newTitle.trim()} class={btnPrimary}>Add project</button>
				<button onclick={() => (showForm = false)} class={btnSecondary}>Cancel</button>
			</div>
		</div>
	{:else}
		<button onclick={() => (showForm = true)} class="flex items-center gap-2 px-3 py-2 border-2 border-dashed border-slate-300 rounded-md bg-transparent text-slate-400 text-sm cursor-pointer w-full transition-all duration-150 font-[inherit] mb-4 hover:border-indigo-500 hover:text-indigo-600 hover:bg-violet-50">
			<span>+</span> Add project
		</button>
	{/if}

	<!-- Active projects with subtasks -->
	<ul class="flex flex-col gap-3 list-none">
		{#each activeProjects as project (project.id)}
			{@const subs = subtasksOf(project.id)}
			<li class="border border-slate-200 rounded-lg overflow-hidden">
				{#if editingId === project.id}
					<div class="flex flex-col gap-2 p-4 bg-slate-50">
						<input type="text" bind:value={editTitle} class={inputCls} />
						<textarea bind:value={editNotes} rows={2} class="{inputCls} resize-y min-h-[60px]"></textarea>
						<div class="flex gap-2">
							<button onclick={() => handleEditSave(project)} disabled={!editTitle.trim()} class={btnPrimary}>Save</button>
							<button onclick={() => (editingId = null)} class={btnSecondary}>Cancel</button>
						</div>
					</div>
				{:else}
					<!-- Project header -->
					<div class="group flex items-start gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors">
						<button
							class="w-5 h-5 border-2 border-slate-400 rounded bg-transparent cursor-pointer shrink-0 flex items-center justify-center mt-0.5 transition-colors duration-150 p-0 text-[0.7rem] hover:border-indigo-500"
							onclick={() => handleToggle(project)}
							aria-label="Mark as complete"
						></button>
						<div
							class="flex-1 flex flex-col gap-0.5 cursor-pointer min-w-0"
							role="button"
							tabindex="0"
							onclick={() => startEdit(project)}
							onkeydown={(e) => e.key === 'Enter' && startEdit(project)}
						>
							<span class="text-[0.9375rem] font-semibold text-slate-900">{project.title}</span>
							{#if project.notes}
								<span class="text-[0.8125rem] text-slate-500">{project.notes}</span>
							{/if}
							{#if activeSubtaskCount(project.id) > 0}
								<span class="text-xs text-indigo-600">⚡ {activeSubtaskCount(project.id)} subtask{activeSubtaskCount(project.id) !== 1 ? 's' : ''} remaining</span>
							{/if}
						</div>
						<button
							class="bg-transparent border-0 text-slate-300 cursor-pointer text-sm p-1 leading-none shrink-0 opacity-0 group-hover:opacity-100 hover:!text-red-500"
							onclick={() => handleDelete(project)}
							aria-label="Delete project"
						>✕</button>
					</div>

					<!-- Subtasks list -->
					{#if subs.length > 0}
						<ul class="list-none border-t border-slate-100">
							{#each subs as sub (sub.id)}
								<li class="group flex items-center gap-3 px-4 py-2.5 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
									<button
										class="w-4 h-4 border-2 {sub.completed ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'} rounded-full cursor-pointer shrink-0 flex items-center justify-center text-[0.6rem] transition-colors hover:border-indigo-500"
										onclick={() => handleToggle(sub)}
										aria-label={sub.completed ? 'Mark subtask incomplete' : 'Mark subtask complete'}
									>{sub.completed ? '✓' : ''}</button>
									<span class="flex-1 text-sm {sub.completed ? 'line-through text-slate-400' : 'text-slate-700'} break-words">{sub.title}</span>
									{#if sub.context}
										<span class="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full shrink-0">#{sub.context}</span>
									{/if}
									{#if sub.estimatedMinutes != null}
										<span class="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full shrink-0">⏱ {sub.estimatedMinutes}m</span>
									{/if}
									<button
										class="bg-transparent border-0 text-slate-300 cursor-pointer text-xs p-1 leading-none shrink-0 opacity-0 group-hover:opacity-100 hover:!text-red-500"
										onclick={() => deleteTask(sub.id).then(loadData)}
										aria-label="Delete subtask"
									>✕</button>
								</li>
							{/each}
						</ul>
					{/if}

					<!-- Add subtask row -->
					{#if addingSubtaskFor === project.id}
						<div class="flex gap-2 px-4 py-2.5 border-t border-slate-100 bg-slate-50">
							<input
								type="text"
								placeholder="Subtask…"
								bind:value={subtaskTitle}
								onkeydown={(e) => handleSubtaskKeydown(e, project)}
								class="flex-1 px-2 py-1.5 border border-slate-300 rounded-md text-sm bg-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-[inherit]"
								use:focusOnMount
							/>
							<button onclick={() => handleAddSubtask(project)} disabled={!subtaskTitle.trim()} class="px-3 py-1.5 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 border-0 cursor-pointer font-[inherit]">Add</button>
							<button onclick={() => { addingSubtaskFor = null; subtaskTitle = ''; }} class="px-3 py-1.5 rounded-md text-sm text-slate-500 border border-slate-300 hover:bg-slate-100 cursor-pointer font-[inherit]">✕</button>
						</div>
					{:else}
						<button
							class="w-full text-left text-xs text-slate-400 hover:text-indigo-600 hover:bg-violet-50 cursor-pointer bg-transparent border-0 font-[inherit] px-4 py-2 border-t border-slate-100 transition-colors"
							onclick={() => { addingSubtaskFor = project.id; subtaskTitle = ''; }}
						>+ Add subtask</button>
					{/if}
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
					<li class="group flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-slate-50 transition-colors">
						<button
							class="w-5 h-5 border-2 border-indigo-600 rounded bg-indigo-600 cursor-pointer shrink-0 flex items-center justify-center text-white text-[0.7rem] p-0"
							onclick={() => handleToggle(project)}
							aria-label="Mark as incomplete"
						>✓</button>
						<span class="flex-1 text-[0.9375rem] font-semibold text-slate-400 line-through">{project.title}</span>
						<button
							class="bg-transparent border-0 text-slate-300 cursor-pointer text-sm p-1 leading-none shrink-0 opacity-0 group-hover:opacity-100 hover:!text-red-500"
							onclick={() => handleDelete(project)}
							aria-label="Delete project"
						>✕</button>
					</li>
				{/each}
			</ul>
		{/if}
	{/if}
</div>
