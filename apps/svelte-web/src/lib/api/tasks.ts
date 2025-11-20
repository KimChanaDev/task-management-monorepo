import type { Client } from '@urql/svelte';
import { TASK_QUERIES } from '$lib/graphql';

export interface ICreateTaskInput {
	title: string;
	description?: string;
	status?: string;
	priority?: string;
	dueDate?: string;
	assignedTo?: string;
}

export interface IMyTaskFilterInput {
	status?: string;
	priority?: string;
	search?: string;
	page: number;
	limit: number;
}

export interface IUpdateTaskInput {
	id: string;
	title?: string;
	description?: string;
	status?: string;
	priority?: string;
	dueDate?: string;
	assignedTo?: string;
}

export interface ITaskResponse {
	id: string;
	title: string;
	description: string;
	priority: string;
	status: string;
	dueDate: string;
	createdBy: string;
	assignedTo: string;
	createdAt: string;
	updatedAt: string;
}

export class TaskAPI {
	constructor(private client: Client) {}

	async getTask(id: string): Promise<ITaskResponse | undefined> {
		const result = await this.client.query(TASK_QUERIES.GET_TASK, { id });
		if (result.error) {
			throw new Error(result.error.graphQLErrors[0]?.message ?? result.error.message);
		}
		return result.data?.task as ITaskResponse | undefined;
	}

	async getMyTasks(filter: IMyTaskFilterInput) {
		const result = await this.client.query(TASK_QUERIES.GET_MY_TASKS, { filter });
		if (result.error) {
			throw new Error(result.error.graphQLErrors[0]?.message ?? result.error.message);
		}
		return result.data?.myTasks;
	}

	async createTask(input: ICreateTaskInput): Promise<ITaskResponse> {
		const result = await this.client.mutation(TASK_QUERIES.CREATE_TASK, { input });
		if (result.error) {
			throw new Error(result.error.graphQLErrors[0]?.message ?? result.error.message);
		}
		return result.data?.createTask as ITaskResponse;
	}

	async updateTask(updateTaskInput: IUpdateTaskInput): Promise<ITaskResponse> {
		const result = await this.client.mutation(TASK_QUERIES.UPDATE_TASK, { updateTaskInput });
		if (result.error) {
			throw new Error(result.error.graphQLErrors[0]?.message ?? result.error.message);
		}
		return result.data?.updateTask as ITaskResponse;
	}

	async deleteTask(id: string): Promise<boolean> {
		const result = await this.client.mutation(TASK_QUERIES.DELETE_TASK, { id });
		if (result.error) {
			throw new Error(result.error.graphQLErrors[0]?.message ?? result.error.message);
		}
		return result.data?.deleteTask as boolean;
	}

	async assignTask(id: string, assignedTo: string): Promise<ITaskResponse> {
		const result = await this.client.mutation(TASK_QUERIES.ASSIGN_TASK, { id, assignedTo });
		if (result.error) {
			throw new Error(result.error.graphQLErrors[0]?.message ?? result.error.message);
		}
		return result.data?.assignTask as ITaskResponse;
	}

	async getDashboard(limit: number) {
		const result = await this.client.query(TASK_QUERIES.DASHBOARD_QUERY, { limit });
		if (result.error) {
			throw new Error(result.error.graphQLErrors[0]?.message ?? result.error.message);
		}
		return result.data?.dashboard;
	}
}

export function createTaskAPI(client: Client): TaskAPI {
	return new TaskAPI(client);
}
