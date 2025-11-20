// GraphQL queries and mutations
export const REFRESH_ACCESS_TOKEN_OPERATION = 'refreshAccessToken';
export const LOGIN_OPERATION = 'login';
export const REGISTER_OPERATION = 'register';

export const AUTH_QUERIES = {
	LOGIN: `
		mutation Login($input: LoginInput!) {
			${LOGIN_OPERATION}(input: $input) {
				id
				email
				username
			}
		}
	`,
	REGISTER: `
		mutation Register($input: RegisterInput!) {
			${REGISTER_OPERATION}(input: $input) {
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
			${REFRESH_ACCESS_TOKEN_OPERATION} {
				message
			}
		}
	`
};

export const TASK_QUERIES = {
	GET_TASK: `
		query GetTask ($id: ID!) {
			task(id: $id) {
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
	`,
	DASHBOARD_QUERY: `
		query GetDashboardData($limit: Int!) {
			dashboard(limit: $limit) {
				recentTasks {
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
				totalCount
				todoCount
				inProgressCount
				reviewCount
				completedCount
				cancelledCount
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
