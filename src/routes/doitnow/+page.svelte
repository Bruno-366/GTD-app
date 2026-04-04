<script lang="ts">
import { onMount } from 'svelte';
import { getDoItNowTasks, updateTask, deleteTask } from '$lib/db';
import type { Task } from '$lib/types';

let tasks = $state<Task[]>([]);

async function loadTasks() {
tasks = await getDoItNowTasks();
}

onMount(loadTasks);

function formatMinutes(mins: number): string {
if (mins < 60) return `${mins}m`;
const h = Math.floor(mins / 60);
const m = mins % 60;
return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

async function handleToggle(task: Task) {
await updateTask({ ...task, completed: !task.completed });
await loadTasks();
}

async function handleDelete(id: string) {
await deleteTask(id);
await loadTasks();
}

const activeTasks = $derived(tasks.filter((t) => !t.completed));
const completedTasks = $derived(tasks.filter((t) => t.completed));
let showCompleted = $state(false);
</script>

<svelte:head>
<title>Do it Now — GTD App</title>
</svelte:head>

<div class="bg-white rounded-xl p-6 shadow-sm">
<!-- Header -->
<div class="flex items-center justify-between mb-2">
<h2 class="text-xl font-bold text-slate-900 flex items-center gap-2">
<span>⏱</span> Do it Now
</h2>
<span class="bg-indigo-100 text-indigo-600 text-sm font-semibold px-2 py-0.5 rounded-full">
{activeTasks.length}
</span>
</div>
<p class="text-sm text-slate-400 mb-5">All tasks estimated at 2 minutes or less — across every view.</p>

{#if activeTasks.length === 0}
<p class="text-slate-400 text-sm text-center py-8">
No quick tasks right now.<br />
<span class="text-slate-300">Add a time estimate of ~1m or ~2m to any task to see it here.</span>
</p>
{:else}
<ul class="flex flex-col gap-1 list-none">
{#each activeTasks as task (task.id)}
<li class="group flex items-start gap-3 px-3 py-3 rounded-lg transition-colors duration-100 hover:bg-slate-50">
<button
class="w-5 h-5 border-2 border-slate-300 rounded-full bg-transparent cursor-pointer shrink-0 flex items-center justify-center mt-0.5 transition-colors duration-150 p-0 hover:border-indigo-500"
onclick={() => handleToggle(task)}
aria-label="Mark as complete"
></button>
<div class="flex-1 flex flex-col gap-1 min-w-0">
<span class="text-[0.9375rem] text-slate-900 break-words">{task.title}</span>
{#if task.notes}
<span class="text-[0.8125rem] text-slate-500 break-words">{task.notes}</span>
{/if}
<div class="flex flex-wrap gap-1 mt-0.5">
{#if task.estimatedMinutes != null}
<span class="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">⏱ {formatMinutes(task.estimatedMinutes)}</span>
{/if}
{#if task.context}
<span class="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">#{task.context}</span>
{/if}
{#if task.delegatedTo}
<span class="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">@{task.delegatedTo}</span>
{/if}
{#if task.dueDate}
<span class="text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">📅 {task.dueDate}</span>
{/if}
</div>
</div>
<button
class="bg-transparent border-0 text-slate-300 cursor-pointer text-sm p-1 leading-none shrink-0 opacity-0 transition-[color,opacity] duration-150 group-hover:opacity-100 hover:!text-red-500"
onclick={() => handleDelete(task.id)}
aria-label="Delete task"
>✕</button>
</li>
{/each}
</ul>
{/if}

<!-- Completed -->
{#if completedTasks.length > 0}
<button
class="mt-4 text-xs text-slate-400 hover:text-indigo-600 cursor-pointer bg-transparent border-0 font-[inherit] px-0 py-1"
onclick={() => (showCompleted = !showCompleted)}
>
{showCompleted ? '▾' : '▸'} {completedTasks.length} completed
</button>
{#if showCompleted}
<ul class="flex flex-col gap-1 list-none mt-1">
{#each completedTasks as task (task.id)}
<li class="group flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-slate-50">
<button
class="w-5 h-5 border-2 border-indigo-600 bg-indigo-600 rounded-full cursor-pointer shrink-0 flex items-center justify-center mt-0.5 p-0 text-white text-[0.65rem]"
onclick={() => handleToggle(task)}
aria-label="Mark as incomplete"
>✓</button>
<span class="flex-1 text-sm line-through text-slate-400 break-words">{task.title}</span>
<button
class="bg-transparent border-0 text-slate-300 cursor-pointer text-sm p-1 leading-none shrink-0 opacity-0 group-hover:opacity-100 hover:!text-red-500"
onclick={() => handleDelete(task.id)}
aria-label="Delete task"
>✕</button>
</li>
{/each}
</ul>
{/if}
{/if}
</div>
