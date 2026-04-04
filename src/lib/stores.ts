import { writable } from 'svelte/store';

/** Increment to signal that tasks have changed; subscribers should reload their data. */
export const taskRefreshTick = writable(0);

export function notifyTaskChange() {
	taskRefreshTick.update((n) => n + 1);
}
