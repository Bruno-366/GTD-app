<script lang="ts">
	import type { Task } from '$lib/types';
	import { addTask, updateTask, deleteTask } from '$lib/db';
	import { parseTaskTitle } from '$lib/parseTask';

	interface Props {
		title: string;
		icon: string;
		/** Optional subtitle shown below the header */
		description?: string;
		tasks: Task[];
		/** Extra tasks passed in so subtasks can be found (e.g. all tasks for this list) */
		allTasks?: Task[];
		/** When true, new tasks created here are marked as someday/maybe */
		addAsSomeday?: boolean;
		onTasksChange: () => void;
	}

	let { title, icon, description, tasks = $bindable([]), allTasks, addAsSomeday = false, onTasksChange }: Props = $props();

	function focusOnMount(node: HTMLElement) {
		node.focus();
	}

	// ── new task form ─────────────────────────────────────────────────────────
	let newTitle = $state('');
	let newNotes = $state('');
	let newDueDate = $state('');
	let newEstimated = $state('');
	// newSomeday mirrors addAsSomeday at form-open time; $effect syncs when prop changes
	let newSomeday = $state(false);
	$effect(() => { newSomeday = addAsSomeday; });
	let showForm = $state(false);

	// ── edit form ─────────────────────────────────────────────────────────────
	let editingTask = $state<Task | null>(null);
	let editTitle = $state('');
	let editNotes = $state('');
	let editDueDate = $state('');
	let editEstimated = $state('');
	let editContext = $state('');
	let editDelegatedTo = $state('');
	let editSomeday = $state(false);
	let editParentId = $state('');

	// ── subtask form ──────────────────────────────────────────────────────────
	let addingSubtaskFor = $state<string | null>(null);
	let subtaskTitle = $state('');

	let showCompleted = $state(false);

	// Derive top-level (no parentId) tasks only
	const topLevelActive = $derived(tasks.filter((t) => !t.completed && !t.parentId));
	const topLevelCompleted = $derived(tasks.filter((t) => t.completed && !t.parentId));

	/** Candidate parent tasks for the edit form: top-level tasks that are not the task being edited */
	const potentialParents = $derived(
		editingTask ? (allTasks ?? tasks).filter((t) => !t.parentId && t.id !== editingTask!.id) : []
	);

	/** Get all subtasks (active + completed) for a given parent from allTasks or tasks */
	function subtasksOf(parentId: string): Task[] {
		const pool = allTasks ?? tasks;
		return pool.filter((t) => t.parentId === parentId);
	}

	// Live parse preview while typing in the title field
	const parsed = $derived(parseTaskTitle(newTitle));

	async function handleAdd() {
		const trimmed = newTitle.trim();
		if (!trimmed) return;

		const { cleanTitle, context, delegatedTo, estimatedMinutes } = parseTaskTitle(trimmed);
		const estMins = newEstimated ? parseInt(newEstimated, 10) : estimatedMinutes;

		await addTask(cleanTitle, newNotes.trim(), {
			context,
			delegatedTo,
			estimatedMinutes: estMins || undefined,
			dueDate: newDueDate || undefined,
			someday: newSomeday || undefined
		});

		newTitle = '';
		newNotes = '';
		newDueDate = '';
		newEstimated = '';
		newSomeday = addAsSomeday;
		showForm = false;
		onTasksChange();
	}

	async function handleAddSubtask(parentTask: Task) {
		const trimmed = subtaskTitle.trim();
		if (!trimmed) return;
		const { cleanTitle, context, delegatedTo, estimatedMinutes } = parseTaskTitle(trimmed);
		await addTask(cleanTitle, '', { parentId: parentTask.id, context, delegatedTo, estimatedMinutes });
		subtaskTitle = '';
		addingSubtaskFor = null;
		onTasksChange();
	}

	async function handleToggle(task: Task) {
		await updateTask({ ...task, completed: !task.completed });
		onTasksChange();
	}

	async function handleDelete(id: string) {
		// Promote subtasks to top-level instead of cascade-deleting them
		const subs = subtasksOf(id);
		for (const sub of subs) {
			await updateTask({ ...sub, parentId: undefined });
		}
		await deleteTask(id);
		onTasksChange();
	}

	function startEdit(task: Task) {
		editingTask = task;
		editTitle = task.title;
		editNotes = task.notes;
		editDueDate = task.dueDate ?? '';
		editEstimated = task.estimatedMinutes != null ? String(task.estimatedMinutes) : '';
		editContext = task.context ?? '';
		editDelegatedTo = task.delegatedTo ?? '';
		editSomeday = task.someday ?? false;
		editParentId = task.parentId ?? '';
	}

	async function handleEditSave() {
		if (!editingTask || !editTitle.trim()) return;
		await updateTask({
			...editingTask,
			title: editTitle.trim(),
			notes: editNotes.trim(),
			dueDate: editDueDate || undefined,
			estimatedMinutes: editEstimated ? parseInt(editEstimated, 10) : undefined,
			context: editContext.trim() || undefined,
			delegatedTo: editDelegatedTo.trim() || undefined,
			someday: editSomeday || undefined,
			parentId: editParentId || undefined
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
		if (e.key === 'Escape') showForm = false;
	}

	function handleEditKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') cancelEdit();
	}

	function handleSubtaskKeydown(e: KeyboardEvent, parentTask: Task) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleAddSubtask(parentTask);
		}
		if (e.key === 'Escape') {
			addingSubtaskFor = null;
			subtaskTitle = '';
		}
	}

	function formatMinutes(mins: number): string {
		if (mins < 60) return `${mins}m`;
		const h = Math.floor(mins / 60);
		const m = mins % 60;
		return m > 0 ? `${h}h ${m}m` : `${h}h`;
	}

	function formatDate(iso: string): string {
		// Append noon UTC to avoid date-shifting across timezone boundaries
		const d = new Date(iso + 'T12:00:00Z');
		return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
	}

	const inputCls = 'w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-[inherit]';
	const btnPrimary = 'px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-[inherit] cursor-pointer border-0';
	const btnSecondary = 'px-4 py-2 rounded-md text-sm font-medium bg-transparent text-slate-500 border border-slate-300 transition-colors hover:bg-slate-100 font-[inherit] cursor-pointer';
</script>

<div class="bg-white rounded-xl p-6 shadow-sm">
	<!-- Header -->
	<div class="flex items-center justify-between mb-5">
		<h2 class="text-xl font-bold text-slate-900 flex items-center gap-2">
			<span>{icon}</span> {title}
		</h2>
		<span class="bg-violet-100 text-indigo-600 text-sm font-semibold px-2 py-0.5 rounded-full">
			{topLevelActive.length}
		</span>
	</div>

	{#if description}
		<p class="text-xs text-slate-400 mb-4">{description}</p>
	{/if}

	<!-- Add task form -->
	{#if showForm}
		<div class="flex flex-col gap-2 mb-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
			<input
				type="text"
				placeholder="Task title… use #context, @person, ~5m"
				bind:value={newTitle}
				onkeydown={handleKeydown}
				class={inputCls}
				use:focusOnMount
			/>

			<!-- Live keyword preview -->
			{#if parsed.context || parsed.delegatedTo || parsed.estimatedMinutes != null}
				<div class="flex flex-wrap gap-1 text-xs">
					{#if parsed.context}
						<span class="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">#{parsed.context}</span>
					{/if}
					{#if parsed.delegatedTo}
						<span class="bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">@{parsed.delegatedTo}</span>
					{/if}
					{#if parsed.estimatedMinutes != null}
						<span class="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">⏱ {formatMinutes(parsed.estimatedMinutes)}</span>
					{/if}
					{#if parsed.context || parsed.delegatedTo}
						<span class="text-slate-400 italic">→ will appear in {parsed.context ? 'Next Actions' : 'Waiting For'}</span>
					{/if}
				</div>
			{/if}

			<textarea
				placeholder="Notes (optional)"
				bind:value={newNotes}
				rows={2}
				class="{inputCls} resize-y min-h-[60px]"
			></textarea>

			<div class="flex gap-2">
				<div class="flex-1">
					<label for="new-due-date" class="text-xs text-slate-500 mb-0.5 block">Due date</label>
					<input id="new-due-date" type="date" bind:value={newDueDate} class={inputCls} />
				</div>
				<div class="flex-1">
					<label for="new-estimated" class="text-xs text-slate-500 mb-0.5 block">Estimate (minutes)</label>
					<input id="new-estimated" type="number" min="1" placeholder="e.g. 5" bind:value={newEstimated} class={inputCls} />
				</div>
			</div>

			<label class="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
				<input type="checkbox" bind:checked={newSomeday} class="w-4 h-4 accent-indigo-600 cursor-pointer" />
				Someday / Maybe
			</label>

			<div class="flex gap-2">
				<button onclick={handleAdd} disabled={!newTitle.trim()} class={btnPrimary}>Add task</button>
				<button onclick={() => (showForm = false)} class={btnSecondary}>Cancel</button>
			</div>
		</div>
	{:else}
		<button onclick={() => (showForm = true)} class="flex items-center gap-2 px-3 py-2 border-2 border-dashed border-slate-300 rounded-md bg-transparent text-slate-400 text-sm cursor-pointer w-full transition-all duration-150 font-[inherit] mb-4 hover:border-indigo-500 hover:text-indigo-600 hover:bg-violet-50">
			<span>+</span> Add task
		</button>
	{/if}

	<!-- Active tasks -->
	<ul class="flex flex-col gap-1 list-none">
		{#each topLevelActive as task (task.id)}
			{@const subs = subtasksOf(task.id)}
			<li class="rounded-lg">
				{#if editingTask?.id === task.id}
					<!-- Edit form -->
					<div class="flex flex-col gap-2 mb-2 p-4 bg-slate-50 rounded-lg border border-slate-200">
						<input type="text" bind:value={editTitle} onkeydown={handleEditKeydown} class={inputCls} />
						<textarea bind:value={editNotes} rows={2} class="{inputCls} resize-y min-h-[60px]"></textarea>
						<div class="flex gap-2">
							<div class="flex-1">
								<label for="edit-context" class="text-xs text-slate-500 mb-0.5 block">Context</label>
								<input id="edit-context" type="text" placeholder="e.g. work" bind:value={editContext} class={inputCls} />
							</div>
							<div class="flex-1">
								<label for="edit-delegated" class="text-xs text-slate-500 mb-0.5 block">Delegated to</label>
								<input id="edit-delegated" type="text" placeholder="e.g. alice" bind:value={editDelegatedTo} class={inputCls} />
							</div>
						</div>
						<div class="flex gap-2">
							<div class="flex-1">
								<label for="edit-due-date" class="text-xs text-slate-500 mb-0.5 block">Due date</label>
								<input id="edit-due-date" type="date" bind:value={editDueDate} class={inputCls} />
							</div>
							<div class="flex-1">
								<label for="edit-estimated" class="text-xs text-slate-500 mb-0.5 block">Estimate (minutes)</label>
								<input id="edit-estimated" type="number" min="1" bind:value={editEstimated} class={inputCls} />
							</div>
						</div>
						{#if potentialParents.length > 0}
							<div>
								<label for="edit-parent" class="text-xs text-slate-500 mb-0.5 block">Parent task</label>
								<select id="edit-parent" bind:value={editParentId} class={inputCls}>
									<option value="">— none (top-level) —</option>
									{#each potentialParents as p (p.id)}
										<option value={p.id}>{p.title}</option>
									{/each}
								</select>
							</div>
						{/if}
						<label class="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
							<input type="checkbox" bind:checked={editSomeday} class="w-4 h-4 accent-indigo-600 cursor-pointer" />
							Someday / Maybe
						</label>
						<div class="flex gap-2">
							<button onclick={handleEditSave} disabled={!editTitle.trim()} class={btnPrimary}>Save</button>
							<button onclick={cancelEdit} class={btnSecondary}>Cancel</button>
						</div>
					</div>
				{:else}
					<!-- Task row -->
					<div class="group flex items-start gap-3 px-3 py-3 rounded-lg transition-colors duration-100 hover:bg-slate-50">
						<button
							class="w-5 h-5 border-2 border-slate-300 rounded-full bg-transparent cursor-pointer shrink-0 flex items-center justify-center mt-0.5 transition-colors duration-150 p-0 hover:border-indigo-500"
							onclick={() => handleToggle(task)}
							aria-label="Mark as complete"
						></button>
						<div class="flex-1 flex flex-col gap-1 cursor-pointer min-w-0" role="button" tabindex="0" onclick={() => startEdit(task)} onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && startEdit(task)}>
							<span class="text-[0.9375rem] text-slate-900 break-words">{task.title}</span>
							{#if task.notes}
								<span class="text-[0.8125rem] text-slate-500 break-words">{task.notes}</span>
							{/if}
							<!-- Badges -->
							<div class="flex flex-wrap gap-1 mt-0.5">
								{#if task.context}
									<span class="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">#{task.context}</span>
								{/if}
								{#if task.delegatedTo}
									<span class="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">@{task.delegatedTo}</span>
								{/if}
								{#if task.estimatedMinutes != null}
									<span class="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">⏱ {formatMinutes(task.estimatedMinutes)}</span>
								{/if}
								{#if task.dueDate}
									<span class="text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">📅 {formatDate(task.dueDate)}</span>
								{/if}
								{#if task.someday}
									<span class="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">🌟 Someday</span>
								{/if}
							</div>
						</div>
						<button
							class="bg-transparent border-0 text-slate-300 cursor-pointer text-sm p-1 leading-none shrink-0 opacity-0 transition-[color,opacity] duration-150 group-hover:opacity-100 hover:!text-red-500"
							onclick={() => handleDelete(task.id)}
							aria-label="Delete task"
						>✕</button>
					</div>

					<!-- Subtasks -->
					{#if subs.length > 0}
						<ul class="ml-8 flex flex-col gap-0.5 list-none mb-1">
							{#each subs as sub (sub.id)}
								<li>
									{#if editingTask?.id === sub.id}
										<!-- Subtask edit form -->
										<div class="flex flex-col gap-2 my-1 p-3 bg-slate-50 rounded-lg border border-slate-200">
											<input type="text" bind:value={editTitle} onkeydown={handleEditKeydown} class={inputCls} />
											<textarea bind:value={editNotes} rows={2} class="{inputCls} resize-y min-h-[60px]"></textarea>
											<div class="flex gap-2">
												<div class="flex-1">
													<label for="edit-sub-context" class="text-xs text-slate-500 mb-0.5 block">Context</label>
													<input id="edit-sub-context" type="text" placeholder="e.g. work" bind:value={editContext} class={inputCls} />
												</div>
												<div class="flex-1">
													<label for="edit-sub-delegated" class="text-xs text-slate-500 mb-0.5 block">Delegated to</label>
													<input id="edit-sub-delegated" type="text" placeholder="e.g. alice" bind:value={editDelegatedTo} class={inputCls} />
												</div>
											</div>
											<div class="flex gap-2">
												<div class="flex-1">
													<label for="edit-sub-due" class="text-xs text-slate-500 mb-0.5 block">Due date</label>
													<input id="edit-sub-due" type="date" bind:value={editDueDate} class={inputCls} />
												</div>
												<div class="flex-1">
													<label for="edit-sub-estimated" class="text-xs text-slate-500 mb-0.5 block">Estimate (minutes)</label>
													<input id="edit-sub-estimated" type="number" min="1" bind:value={editEstimated} class={inputCls} />
												</div>
											</div>
											<div class="flex gap-2">
												<button onclick={handleEditSave} disabled={!editTitle.trim()} class={btnPrimary}>Save</button>
												<button onclick={cancelEdit} class={btnSecondary}>Cancel</button>
											</div>
										</div>
									{:else}
										<div class="group flex items-start gap-2 px-3 py-2 rounded-md transition-colors duration-100 hover:bg-slate-50">
											<button
												class="w-4 h-4 border-2 {sub.completed ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'} rounded-full bg-transparent cursor-pointer shrink-0 flex items-center justify-center transition-colors duration-150 p-0 text-[0.6rem] mt-0.5 hover:border-indigo-500"
												onclick={() => handleToggle(sub)}
												aria-label={sub.completed ? 'Mark as incomplete' : 'Mark as complete'}
											>{sub.completed ? '✓' : ''}</button>
											<div class="flex-1 flex flex-col gap-0.5 cursor-pointer min-w-0" role="button" tabindex="0" onclick={() => startEdit(sub)} onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && startEdit(sub)}>
												<span class="text-sm {sub.completed ? 'line-through text-slate-400' : 'text-slate-700'} break-words">{sub.title}</span>
												<!-- Subtask badges -->
												{#if sub.context || sub.delegatedTo || sub.estimatedMinutes != null || sub.dueDate}
													<div class="flex flex-wrap gap-1 mt-0.5">
														{#if sub.context}
															<span class="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">#{sub.context}</span>
														{/if}
														{#if sub.delegatedTo}
															<span class="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">@{sub.delegatedTo}</span>
														{/if}
														{#if sub.estimatedMinutes != null}
															<span class="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">⏱ {formatMinutes(sub.estimatedMinutes)}</span>
														{/if}
														{#if sub.dueDate}
															<span class="text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">📅 {formatDate(sub.dueDate)}</span>
														{/if}
													</div>
												{/if}
											</div>
											<button
												class="bg-transparent border-0 text-slate-300 cursor-pointer text-xs p-1 leading-none shrink-0 opacity-0 group-hover:opacity-100 hover:!text-red-500"
												onclick={() => deleteTask(sub.id).then(onTasksChange)}
												aria-label="Delete subtask"
											>✕</button>
										</div>
									{/if}
								</li>
							{/each}
						</ul>
					{/if}

					<!-- Add subtask inline -->
					{#if addingSubtaskFor === task.id}
						<div class="ml-8 flex gap-2 mb-2 items-center">
							<input
								type="text"
								placeholder="Subtask… use #context, @person, ~5m"
								bind:value={subtaskTitle}
								onkeydown={(e) => handleSubtaskKeydown(e, task)}
								class="flex-1 px-2 py-1.5 border border-slate-300 rounded-md text-sm bg-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-[inherit]"
								use:focusOnMount
							/>
							<button onclick={() => handleAddSubtask(task)} disabled={!subtaskTitle.trim()} class="px-3 py-1.5 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 border-0 cursor-pointer font-[inherit]">Add</button>
							<button onclick={() => { addingSubtaskFor = null; subtaskTitle = ''; }} class="px-3 py-1.5 rounded-md text-sm text-slate-500 border border-slate-300 hover:bg-slate-100 cursor-pointer font-[inherit]">✕</button>
						</div>
					{:else}
						<button
							class="ml-8 mb-1 text-xs text-slate-400 hover:text-indigo-600 cursor-pointer bg-transparent border-0 font-[inherit] px-3 py-1"
							onclick={() => { addingSubtaskFor = task.id; subtaskTitle = ''; }}
						>+ Add subtask</button>
					{/if}
				{/if}
			</li>
		{/each}
	</ul>

	<!-- Completed tasks -->
	{#if topLevelCompleted.length > 0}
		<button
			class="mt-4 bg-transparent border-0 text-slate-500 text-sm cursor-pointer py-1 px-0 font-[inherit] hover:text-slate-900"
			onclick={() => (showCompleted = !showCompleted)}
		>
			{showCompleted ? '▼' : '▶'} Completed ({topLevelCompleted.length})
		</button>
		{#if showCompleted}
			<ul class="flex flex-col gap-1 list-none mt-2">
				{#each topLevelCompleted as task (task.id)}
					<li class="rounded-lg">
						<div class="group flex items-start gap-3 px-3 py-3 rounded-lg transition-colors duration-100 hover:bg-slate-50">
							<button
								class="w-5 h-5 border-2 border-indigo-600 rounded-full bg-indigo-600 cursor-pointer shrink-0 flex items-center justify-center mt-0.5 transition-colors duration-150 p-0 text-white text-[0.7rem]"
								onclick={() => handleToggle(task)}
								aria-label="Mark as incomplete"
							><span class="block">✓</span></button>
							<span class="flex-1 text-[0.9375rem] text-slate-400 break-words line-through">{task.title}</span>
							<button
								class="bg-transparent border-0 text-slate-300 cursor-pointer text-sm p-1 leading-none shrink-0 opacity-0 transition-[color,opacity] duration-150 group-hover:opacity-100 hover:!text-red-500"
								onclick={() => handleDelete(task.id)}
								aria-label="Delete task"
							>✕</button>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	{/if}
</div>
