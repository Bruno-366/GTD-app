<script lang="ts">
	import { base } from '$app/paths';
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href="{base}/icons/icon-192.svg" />
</svelte:head>

{@render children()}
