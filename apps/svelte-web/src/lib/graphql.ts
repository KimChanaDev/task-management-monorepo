// GraphQL queries and mutations

export const AUTH_QUERIES = {
	LOGIN: `
		mutation Login($input: LoginInput!) {
			login(input: $input) {
				id
				email
				username
			}
		}
	`,
	REGISTER: `
		mutation Register($input: RegisterInput!) {
			register(input: $input) {
				id
				email
				username
			}
		}
	`,
	LOGOUT: `
		mutation Logout {
			logout {
				message
			}
		}
	`,
	REFRESH_TOKEN: `
		mutation RefreshAccessToken {
			refreshAccessToken {
				message
			}
		}
	`
};

export const TASK_QUERIES = {
	GET_MY_TASKS: `
		query MyTasks($filter: MyTaskFilterInput!) {
			myTasks(filter: $filter) {
				tasks {
					id
					title
					description
					status
					priority
					dueDate
					assignedTo
					createdBy
					createdAt
					updatedAt
				}
				total
			}
		}
	`,
	GET_ALL_TASK: `
		query AllTasks($filter: TaskFilterInput!) {
		tasks(filter: $filter) {
			id
			title
			description
			status
			priority
			dueDate
			assignedTo
			createdBy
			createdAt
			updatedAt
		}
		}
	`,
	CREATE_TASK: `
		mutation CreateTask($input: CreateTaskInput!) {
			createTask(input: $input) {
				id
				title
				description
				status
				priority
				dueDate
				assignedTo
				createdBy
				createdAt
				updatedAt
			}
		}
	`,
	UPDATE_TASK: `
		mutation UpdateTask($updateTaskInput: UpdateTaskInput!) {
			updateTask(input: $updateTaskInput) {
				id
				title
				description
				status
				priority
				dueDate
				assignedTo
				createdBy
				createdAt
				updatedAt
			}
		}
	`,
	DELETE_TASK: `
		mutation DeleteTask($id: ID!) {
			deleteTask(id: $id)
		}
	`,
	ASSIGN_TASK: `
		mutation AssignTask($id: ID!, $assignedTo: string!) {
			assignTask(id: $id, assignedTo: $assignedTo) {
				id
				title
				description
				status
				priority
				dueDate
				assignedTo
				createdBy
				createdAt
				updatedAt
			}
		}
	`
};

export const USER_QUERIES = {
	GET_ME: `
		query GetMe {
			me {
				id
				email
				username
			}
		}
	`
};

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

export interface IAllTaskFilterInput {
	status?: string;
	priority?: string;
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
