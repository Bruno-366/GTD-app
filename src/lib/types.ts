export interface Task {
	id: string;
	title: string;
	notes: string;
	parentId?: string;
	context?: string;
	delegatedTo?: string;
	estimatedMinutes?: number;
	dueDate?: string;
	someday?: boolean;
	createdAt: number;
	updatedAt: number;
	completed: boolean;
}
