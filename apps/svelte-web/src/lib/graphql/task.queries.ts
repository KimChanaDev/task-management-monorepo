import { gql } from '@urql/svelte';

export const TASK_QUERIES = {
	GET_TASK: gql`
		query GetTask($id: ID!) {
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
				attachments {
					id
					filename
					originalName
					mimeType
					size
					url
					thumbnailUrl
				}
			}
		}
	`,
	GET_MY_TASKS: gql`
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
	GET_ALL_TASK: gql`
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
	CREATE_TASK: gql`
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
	UPDATE_TASK: gql`
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
	DELETE_TASK: gql`
		mutation DeleteTask($id: ID!) {
			deleteTask(id: $id)
		}
	`,
	ASSIGN_TASK: gql`
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
	DASHBOARD_QUERY: gql`
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
