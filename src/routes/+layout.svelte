<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { base } from '$app/paths';

	let { children } = $props();

	const navItems = [
		{ href: '/', label: 'Inbox', icon: '📥' },
		{ href: '/next', label: 'Next Actions', icon: '⚡' },
		{ href: '/projects', label: 'Projects', icon: '📁' },
		{ href: '/waiting', label: 'Waiting For', icon: '⏳' },
		{ href: '/someday', label: 'Someday', icon: '🌟' }
	];

	onMount(() => {
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.register(`${base}/service-worker.js`);
		}
	});
</script>

<svelte:head>
	<link rel="icon" href="{base}/icons/icon-192.svg" />
</svelte:head>

<div class="app">
	<header class="header">
		<div class="header-content">
			<h1 class="app-title">✓ GTD App</h1>
		</div>
	</header>

	<div class="layout">
		<nav class="sidebar">
			{#each navItems as item}
				{@const target = `${base}${item.href}`.replace(/\/$/, '')}
				<a
					href="{base}{item.href}"
					class="nav-link"
					class:active={$page.url.pathname.replace(/\/$/, '') === target}
				>
					<span class="nav-icon">{item.icon}</span>
					<span class="nav-label">{item.label}</span>
				</a>
			{/each}
		</nav>

		<main class="main">
			{@render children()}
		</main>
	</div>
</div>

<style>
	:global(*) {
		box-sizing: border-box;
		margin: 0;
		padding: 0;
	}

	:global(body) {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		background: #f8fafc;
		color: #1e293b;
		min-height: 100vh;
	}

	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	.header {
		background: #4f46e5;
		color: white;
		padding: 1rem 1.5rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.header-content {
		max-width: 1200px;
		margin: 0 auto;
	}

	.app-title {
		font-size: 1.5rem;
		font-weight: 700;
		letter-spacing: -0.025em;
	}

	.layout {
		display: flex;
		flex: 1;
		max-width: 1200px;
		width: 100%;
		margin: 0 auto;
		padding: 1.5rem;
		gap: 1.5rem;
	}

	.sidebar {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		width: 200px;
		flex-shrink: 0;
	}

	.nav-link {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		border-radius: 0.5rem;
		text-decoration: none;
		color: #475569;
		font-weight: 500;
		transition: background 0.15s, color 0.15s;
	}

	.nav-link:hover {
		background: #e2e8f0;
		color: #1e293b;
	}

	.nav-link.active {
		background: #ede9fe;
		color: #4f46e5;
	}

	.nav-icon {
		font-size: 1.1rem;
	}

	.main {
		flex: 1;
		min-width: 0;
	}

	@media (max-width: 640px) {
		.layout {
			flex-direction: column;
			padding: 1rem;
			gap: 1rem;
		}

		.sidebar {
			width: 100%;
			flex-direction: row;
			flex-wrap: wrap;
		}

		.nav-link {
			flex: 1;
			min-width: 100px;
			justify-content: center;
			padding: 0.5rem 0.75rem;
		}

		.nav-label {
			display: none;
		}
	}
</style>
