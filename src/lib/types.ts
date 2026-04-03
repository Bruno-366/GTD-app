export type ListType = 'inbox' | 'next' | 'waiting' | 'someday' | 'project';

export interface Task {
	id: string;
	title: string;
	notes: string;
	list: ListType;
	project?: string;
	parentId?: string;
	context?: string;
	delegatedTo?: string;
	estimatedMinutes?: number;
	dueDate?: string;
	createdAt: number;
	updatedAt: number;
	completed: boolean;
}

export interface Project {
	id: string;
	title: string;
	notes: string;
	createdAt: number;
	updatedAt: number;
	completed: boolean;
}
