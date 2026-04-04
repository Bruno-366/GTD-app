import { writable } from 'svelte/store';

/**
 * A centralised app-level FSM is not warranted here because:
 *  1. SvelteKit's file-based routing already acts as a state machine for
 *     navigation — each route is an isolated, self-contained state.
 *  2. Task data has no branching states: pages either load tasks
 *     (idle → loading → idle) or mutate them, both trivially serialised
 *     in async/await.
 *  3. There is no concurrency (single user, offline-first), so optimistic
 *     updates and conflict resolution — the main scenarios that benefit from
 *     an explicit FSM — simply do not apply.
 *
 * The FSM pattern IS applied in TaskList.svelte for form state, where it
 * prevents genuinely invalid combinations (e.g. add + edit form open at once).
 */

/** Increment to signal that tasks have changed; subscribers should reload their data. */
export const taskRefreshTick = writable(0);

export function notifyTaskChange() {
	taskRefreshTick.update((n) => n + 1);
}
