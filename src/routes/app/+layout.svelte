<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { base } from '$app/paths';
	import QuickWinBanner from '$lib/QuickWinBanner.svelte';
	import { getAllTasks } from '$lib/db';
	import { isQuickWin } from '$lib/filters';
	import { taskRefreshTick, notifyTaskChange } from '$lib/stores';
	import type { Task } from '$lib/types';

	let { children } = $props();
	let quickWinTasks = $state<Task[]>([]);

	// Sequence counter to guard against out-of-order async responses
	let bannerLoadSeq = 0;

	async function loadBanner() {
		const seq = ++bannerLoadSeq;
		const all = await getAllTasks();
		// Discard if a newer load has already started
		if (seq !== bannerLoadSeq) return;
		quickWinTasks = all.filter(isQuickWin);
	}

	// Reload banner whenever tasks change anywhere in the app (including banner interactions)
	$effect(() => {
		$taskRefreshTick;
		loadBanner();
	});

	const navItems = [
		{ href: '/app', label: 'Inbox', icon: '📥' },
		{ href: '/app/next', label: 'Next Actions', icon: '⚡' },
		{ href: '/app/projects', label: 'Projects', icon: '📁' },
		{ href: '/app/waiting', label: 'Waiting For', icon: '⏳' },
		{ href: '/app/someday', label: 'Someday', icon: '🌟' },
		{ href: '/app/calendar', label: 'Calendar', icon: '📅' }
	];

	onMount(() => {
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.register(`${base}/service-worker.js`);
		}
	});
</script>

<div class="flex flex-col min-h-screen">
	<header class="bg-indigo-600 text-white px-6 py-4 shadow-md">
		<div class="max-w-screen-xl mx-auto">
			<h1 class="text-2xl font-bold tracking-tight">✓ GTD App</h1>
		</div>
	</header>

	<div class="flex flex-1 max-w-screen-xl w-full mx-auto p-6 gap-6 max-sm:flex-col max-sm:p-4 max-sm:gap-4">
		<nav class="flex flex-col gap-1 w-48 shrink-0 max-sm:w-full max-sm:flex-row max-sm:flex-wrap">
			{#each navItems as item}
				{@const target = `${base}${item.href}`.replace(/\/$/, '')}
				<a
					href="{base}{item.href}"
					class="flex items-center gap-3 px-4 py-3 rounded-lg no-underline text-slate-600 font-medium transition-colors duration-150 hover:bg-slate-200 hover:text-slate-900 max-sm:flex-1 max-sm:min-w-[100px] max-sm:justify-center max-sm:px-3 max-sm:py-2 {$page.url.pathname.replace(/\/$/, '') === target ? 'bg-violet-100 !text-indigo-600' : ''}"
				>
					<span class="text-[1.1rem]">{item.icon}</span>
					<span class="max-sm:hidden">{item.label}</span>
				</a>
			{/each}
		</nav>

		<main class="flex-1 min-w-0">
			<QuickWinBanner tasks={quickWinTasks} onTasksChange={notifyTaskChange} />
			{@render children()}
		</main>
	</div>
</div>
