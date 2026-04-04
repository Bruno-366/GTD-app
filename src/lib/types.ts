export interface Task {
	id: string;
	title: string;
	notes: string;
	parentId?: string;
	/**
	 * IDs of direct child tasks. Computed at read-time from `parentId` relationships;
	 * never persisted to the database.
	 */
	children?: string[];
	context?: string;
	delegatedTo?: string;
	estimatedMinutes?: number;
	dueDate?: string;
	someday?: boolean;
	createdAt: number;
	updatedAt: number;
	completed: boolean;
}
