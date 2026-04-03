import type { Task, Project } from './types';

const DB_NAME = 'gtd-app';
const DB_VERSION = 1;
const TASKS_STORE = 'tasks';
const PROJECTS_STORE = 'projects';

function openDB(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onupgradeneeded = (event) => {
			const db = (event.target as IDBOpenDBRequest).result;

			if (!db.objectStoreNames.contains(TASKS_STORE)) {
				const taskStore = db.createObjectStore(TASKS_STORE, { keyPath: 'id' });
				taskStore.createIndex('list', 'list', { unique: false });
				taskStore.createIndex('project', 'project', { unique: false });
				taskStore.createIndex('completed', 'completed', { unique: false });
			}

			if (!db.objectStoreNames.contains(PROJECTS_STORE)) {
				const projectStore = db.createObjectStore(PROJECTS_STORE, { keyPath: 'id' });
				projectStore.createIndex('completed', 'completed', { unique: false });
			}
		};

		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}

function generateId(): string {
	return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// Tasks

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

export async function getTasksByList(list: Task['list']): Promise<Task[]> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(TASKS_STORE, 'readonly');
		const store = tx.objectStore(TASKS_STORE);
		const index = store.index('list');
		const request = index.getAll(list);
		request.onsuccess = () => resolve(request.result as Task[]);
		request.onerror = () => reject(request.error);
		tx.oncomplete = () => db.close();
	});
}

export async function addTask(
	title: string,
	list: Task['list'],
	notes = '',
	project?: string
): Promise<Task> {
	const db = await openDB();
	const task: Task = {
		id: generateId(),
		title,
		notes,
		list,
		project,
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

// Projects

export async function getAllProjects(): Promise<Project[]> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(PROJECTS_STORE, 'readonly');
		const store = tx.objectStore(PROJECTS_STORE);
		const request = store.getAll();
		request.onsuccess = () => resolve(request.result as Project[]);
		request.onerror = () => reject(request.error);
		tx.oncomplete = () => db.close();
	});
}

export async function addProject(title: string, notes = ''): Promise<Project> {
	const db = await openDB();
	const project: Project = {
		id: generateId(),
		title,
		notes,
		createdAt: Date.now(),
		updatedAt: Date.now(),
		completed: false
	};
	return new Promise((resolve, reject) => {
		const tx = db.transaction(PROJECTS_STORE, 'readwrite');
		const store = tx.objectStore(PROJECTS_STORE);
		const request = store.add(project);
		request.onsuccess = () => resolve(project);
		request.onerror = () => reject(request.error);
		tx.oncomplete = () => db.close();
	});
}

export async function updateProject(project: Project): Promise<Project> {
	const db = await openDB();
	const updated: Project = { ...project, updatedAt: Date.now() };
	return new Promise((resolve, reject) => {
		const tx = db.transaction(PROJECTS_STORE, 'readwrite');
		const store = tx.objectStore(PROJECTS_STORE);
		const request = store.put(updated);
		request.onsuccess = () => resolve(updated);
		request.onerror = () => reject(request.error);
		tx.oncomplete = () => db.close();
	});
}

export async function deleteProject(id: string): Promise<void> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(PROJECTS_STORE, 'readwrite');
		const store = tx.objectStore(PROJECTS_STORE);
		const request = store.delete(id);
		request.onsuccess = () => resolve();
		request.onerror = () => reject(request.error);
		tx.oncomplete = () => db.close();
	});
}
