import type { Task } from './types';
import { isInbox, isNextAction, isSubtaskOf, isWaiting, isSomeday, isDoItNow, hasDueDate } from './filters';

const DB_NAME = 'gtd-app';
const DB_VERSION = 3;
const TASKS_STORE = 'tasks';
const PROJECTS_STORE = 'projects'; // kept only for migration deletion

function openDB(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onupgradeneeded = (event) => {
			const db = (event.target as IDBOpenDBRequest).result;
			const oldVersion = event.oldVersion;

			if (oldVersion === 0) {
				// Fresh install — create v3 schema directly
				const taskStore = db.createObjectStore(TASKS_STORE, { keyPath: 'id' });
				taskStore.createIndex('parentId', 'parentId', { unique: false });
				taskStore.createIndex('context', 'context', { unique: false });
				taskStore.createIndex('delegatedTo', 'delegatedTo', { unique: false });
				taskStore.createIndex('dueDate', 'dueDate', { unique: false });
				taskStore.createIndex('completed', 'completed', { unique: false });
				return;
			}

			const tx = (event.target as IDBOpenDBRequest).transaction!;

			// v1 → v2: add property indexes
			if (oldVersion < 2) {
				const taskStore = tx.objectStore(TASKS_STORE);
				if (!taskStore.indexNames.contains('parentId'))
					taskStore.createIndex('parentId', 'parentId', { unique: false });
				if (!taskStore.indexNames.contains('context'))
					taskStore.createIndex('context', 'context', { unique: false });
				if (!taskStore.indexNames.contains('delegatedTo'))
					taskStore.createIndex('delegatedTo', 'delegatedTo', { unique: false });
				if (!taskStore.indexNames.contains('dueDate'))
					taskStore.createIndex('dueDate', 'dueDate', { unique: false });
			}

			// v2 → v3: remove projects store, remove list/project indexes, migrate someday tasks
			if (oldVersion < 3) {
				if (db.objectStoreNames.contains(PROJECTS_STORE)) {
					db.deleteObjectStore(PROJECTS_STORE);
				}
				const taskStore = tx.objectStore(TASKS_STORE);
				if (taskStore.indexNames.contains('list')) taskStore.deleteIndex('list');
				if (taskStore.indexNames.contains('project')) taskStore.deleteIndex('project');

				// Migrate tasks that were in the 'someday' list → set someday: true
				// Also strip legacy `list` and `project` fields from all tasks
				const cursorReq = taskStore.openCursor();
				cursorReq.onsuccess = (e) => {
					const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
					if (cursor) {
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						const { list, project: _project, ...rest } = cursor.value as any;
						const updated = list === 'someday' ? { ...rest, someday: true } : rest;
						cursor.update(updated);
						cursor.continue();
					}
				};
			}
		};

		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}

function generateId(): string {
	return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ── Read helpers ──────────────────────────────────────────────────────────────

export async function getAllTasks(): Promise<Task[]> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(TASKS_STORE, 'readonly');
		const store = tx.objectStore(TASKS_STORE);
		const request = store.getAll();
		request.onsuccess = () => resolve(request.result as Task[]);
		request.onerror = () => reject(request.error);
		tx.oncomplete = () => db.close();
	});
}

/** Unprocessed tasks: no context, no delegation, no due date, not someday, not a subtask */
export async function getInboxTasks(): Promise<Task[]> {
	const all = await getAllTasks();
	return all.filter(isInbox);
}

/** Tasks with a context assigned (top-level only), plus all their subtasks */
export async function getNextActionTasks(): Promise<Task[]> {
	const all = await getAllTasks();
	const topLevel = all.filter(isNextAction);
	const parentIds = new Set(topLevel.map((t) => t.id));
	const subtasks = all.filter(isSubtaskOf(parentIds));
	return [...topLevel, ...subtasks];
}

/** Tasks delegated to someone */
export async function getWaitingTasks(): Promise<Task[]> {
	const all = await getAllTasks();
	return all.filter(isWaiting);
}

/** Tasks flagged as someday/maybe */
export async function getSomedayTasks(): Promise<Task[]> {
	const all = await getAllTasks();
	return all.filter(isSomeday);
}

/** Tasks that can be done in ≤ 2 minutes */
export async function getDoItNowTasks(): Promise<Task[]> {
	const all = await getAllTasks();
	return all.filter(isDoItNow);
}

/** Tasks with a due date */
export async function getTasksWithDueDate(): Promise<Task[]> {
	const all = await getAllTasks();
	return all.filter(hasDueDate);
}

export async function getSubtasks(parentId: string): Promise<Task[]> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(TASKS_STORE, 'readonly');
		const store = tx.objectStore(TASKS_STORE);
		const index = store.index('parentId');
		const request = index.getAll(parentId);
		request.onsuccess = () => resolve(request.result as Task[]);
		request.onerror = () => reject(request.error);
		tx.oncomplete = () => db.close();
	});
}

// ── Write helpers ─────────────────────────────────────────────────────────────

export async function addTask(
	title: string,
	notes = '',
	extra?: {
		parentId?: string;
		context?: string;
		delegatedTo?: string;
		estimatedMinutes?: number;
		dueDate?: string;
		someday?: boolean;
	}
): Promise<Task> {
	const db = await openDB();
	const task: Task = {
		id: generateId(),
		title,
		notes,
		parentId: extra?.parentId,
		context: extra?.context,
		delegatedTo: extra?.delegatedTo,
		estimatedMinutes: extra?.estimatedMinutes,
		dueDate: extra?.dueDate,
		someday: extra?.someday,
		createdAt: Date.now(),
		updatedAt: Date.now(),
		completed: false
	};
	return new Promise((resolve, reject) => {
		const tx = db.transaction(TASKS_STORE, 'readwrite');
		const store = tx.objectStore(TASKS_STORE);
		const request = store.add(task);
		request.onsuccess = () => resolve(task);
		request.onerror = () => reject(request.error);
		tx.oncomplete = () => db.close();
	});
}

export async function updateTask(task: Task): Promise<Task> {
	const db = await openDB();
	const updated: Task = { ...task, updatedAt: Date.now() };
	return new Promise((resolve, reject) => {
		const tx = db.transaction(TASKS_STORE, 'readwrite');
		const store = tx.objectStore(TASKS_STORE);
		const request = store.put(updated);
		request.onsuccess = () => resolve(updated);
		request.onerror = () => reject(request.error);
		tx.oncomplete = () => db.close();
	});
}

export async function deleteTask(id: string): Promise<void> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(TASKS_STORE, 'readwrite');
		const store = tx.objectStore(TASKS_STORE);
		const request = store.delete(id);
		request.onsuccess = () => resolve();
		request.onerror = () => reject(request.error);
		tx.oncomplete = () => db.close();
	});
}


