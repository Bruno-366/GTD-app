<script lang="ts">
	import { base } from '$app/paths';

	const features = [
		{
			icon: '📥',
			title: 'Inbox',
			description: 'Capture everything that has your attention into a single trusted inbox. Process it later with a clear mind.'
		},
		{
			icon: '⚡',
			title: 'Next Actions',
			description: 'See every task tagged with a context — tasks you can actually do right now, filtered by where you are.'
		},
		{
			icon: '⏱',
			title: 'Do it Now',
			description: 'Instantly surface all tasks estimated at 2 minutes or less. Clear the quick wins across every list.'
		},
		{
			icon: '📁',
			title: 'Projects',
			description: 'Group related tasks under projects. Break big goals down into actionable subtasks and track progress.'
		},
		{
			icon: '⏳',
			title: 'Waiting For',
			description: 'Track everything you\'ve delegated or are waiting on. Never let a ball get dropped again.'
		},
		{
			icon: '🌟',
			title: 'Someday / Maybe',
			description: 'Park ideas and aspirations you\'re not ready to commit to yet. Review them when the time is right.'
		},
		{
			icon: '📅',
			title: 'Calendar',
			description: 'See all your time-sensitive tasks in a date-sorted view. Spot overdue items and upcoming deadlines at a glance.'
		},
		{
			icon: '📴',
			title: 'Works Offline',
			description: 'Built as a Progressive Web App with a local IndexedDB store. Your tasks are yours — no account required.'
		},
		{
			icon: '♿',
			title: 'Accessible',
			description: 'Built to WAI-ARIA standards — labelled landmarks, keyboard navigation, and screen-reader-friendly controls throughout.'
		}
	];
</script>

<svelte:head>
	<title>GTD App — Get Things Done</title>
	<meta name="description" content="A free, offline-first Getting Things Done app. Capture, organise, and act on everything in your life." />
</svelte:head>

<!-- Navbar -->
<header class="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200 shadow-sm">
	<div class="max-w-screen-xl mx-auto px-6 py-3 flex items-center justify-between">
		<a href="{base}/" class="text-xl font-bold text-indigo-600 no-underline flex items-center gap-2">
			<span>✓</span> GTD App
		</a>
		<nav class="flex items-center gap-4">
			<a
				href="https://github.com/Bruno-366/GTD-app"
				target="_blank"
				rel="noopener noreferrer"
				class="text-slate-500 hover:text-slate-900 text-sm font-medium no-underline transition-colors flex items-center gap-1.5"
			>
				<svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
					<path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.021C22 6.484 17.522 2 12 2z"/>
				</svg>
				GitHub
			</a>
			<a
				href="{base}/app"
				class="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold no-underline transition-colors hover:bg-indigo-700"
			>
				Open App
			</a>
		</nav>
	</div>
</header>

<!-- Hero -->
<section class="bg-gradient-to-br from-indigo-50 via-white to-violet-50 py-24 px-6 text-center">
	<div class="max-w-3xl mx-auto flex flex-col items-center gap-6">
		<span class="text-6xl">✓</span>
		<h1 class="text-5xl font-extrabold text-slate-900 leading-tight tracking-tight">
			Get your life<br />
			<span class="text-indigo-600">under control.</span>
		</h1>
		<p class="text-xl text-slate-600 max-w-xl leading-relaxed">
			A free, offline-first <strong>Getting Things Done</strong> app. Capture every thought, organise by context, and focus on what matters — no account required.
		</p>
		<div class="flex flex-wrap gap-4 justify-center">
			<a
				href="{base}/app"
				class="px-8 py-3.5 rounded-xl bg-indigo-600 text-white text-lg font-bold no-underline shadow-lg transition-all hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-0.5"
			>
				Start for free →
			</a>
			<a
				href="https://github.com/Bruno-366/GTD-app"
				target="_blank"
				rel="noopener noreferrer"
				class="px-8 py-3.5 rounded-xl border-2 border-slate-300 text-slate-700 text-lg font-bold no-underline transition-all hover:border-indigo-400 hover:text-indigo-600"
			>
				View on GitHub
			</a>
		</div>
		<p class="text-sm text-slate-400">No sign-up. Runs entirely in your browser. Your data stays on your device.</p>
	</div>
</section>

<!-- Features -->
<section class="py-20 px-6 bg-white">
	<div class="max-w-screen-xl mx-auto">
		<div class="text-center mb-14">
			<h2 class="text-3xl font-extrabold text-slate-900 mb-3">Everything the GTD method needs</h2>
			<p class="text-slate-500 text-lg max-w-xl mx-auto">All the views and workflows from David Allen's <em>Getting Things Done</em> — in a fast, focused app.</p>
		</div>
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each features as feature}
				<div class="flex flex-col gap-3 p-6 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200 bg-slate-50/50">
					<span class="text-3xl">{feature.icon}</span>
					<h3 class="text-lg font-bold text-slate-900">{feature.title}</h3>
					<p class="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- How it works -->
<section class="py-20 px-6 bg-gradient-to-b from-white to-indigo-50">
	<div class="max-w-screen-lg mx-auto">
		<div class="text-center mb-14">
			<h2 class="text-3xl font-extrabold text-slate-900 mb-3">How it works</h2>
			<p class="text-slate-500 text-lg">Three simple steps to a clearer mind</p>
		</div>
		<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
			<div class="flex flex-col items-center text-center gap-4 p-6">
				<div class="w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl font-extrabold">1</div>
				<h3 class="text-xl font-bold text-slate-900">Capture</h3>
				<p class="text-slate-500 leading-relaxed">Add anything and everything to your Inbox the moment it enters your head. Use smart shortcuts like <code class="bg-slate-100 px-1 rounded text-sm">#context</code>, <code class="bg-slate-100 px-1 rounded text-sm">@person</code>, and <code class="bg-slate-100 px-1 rounded text-sm">~5m</code> to tag tasks as you type.</p>
			</div>
			<div class="flex flex-col items-center text-center gap-4 p-6">
				<div class="w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl font-extrabold">2</div>
				<h3 class="text-xl font-bold text-slate-900">Clarify</h3>
				<p class="text-slate-500 leading-relaxed">Process your inbox by adding due dates, time estimates, and contexts. Tasks automatically flow into the right views — Next Actions, Waiting For, Calendar, and more.</p>
			</div>
			<div class="flex flex-col items-center text-center gap-4 p-6">
				<div class="w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl font-extrabold">3</div>
				<h3 class="text-xl font-bold text-slate-900">Engage</h3>
				<p class="text-slate-500 leading-relaxed">Use the <strong>Do it Now</strong> view to knock out 2-minute tasks, or filter by context to stay focused on what you can actually do right now.</p>
			</div>
		</div>
	</div>
</section>

<!-- CTA -->
<section class="py-20 px-6 bg-indigo-600 text-center text-white">
	<div class="max-w-2xl mx-auto flex flex-col items-center gap-6">
		<h2 class="text-3xl font-extrabold">Ready to clear your head?</h2>
		<p class="text-indigo-200 text-lg">Start using GTD App right now — free, private, and offline-ready.</p>
		<a
			href="{base}/app"
			class="px-8 py-3.5 rounded-xl bg-white text-indigo-600 text-lg font-bold no-underline shadow-lg transition-all hover:bg-indigo-50 hover:shadow-xl hover:-translate-y-0.5"
		>
			Open the App →
		</a>
	</div>
</section>

<!-- Footer -->
<footer class="bg-slate-900 text-slate-400 py-8 px-6 text-center text-sm">
	<div class="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
		<span class="font-semibold text-white">✓ GTD App</span>
		<span>Free &amp; open source — your data never leaves your device</span>
		<a
			href="https://github.com/Bruno-366/GTD-app"
			target="_blank"
			rel="noopener noreferrer"
			class="text-slate-400 hover:text-white no-underline transition-colors"
		>
			GitHub ↗
		</a>
	</div>
</footer>

