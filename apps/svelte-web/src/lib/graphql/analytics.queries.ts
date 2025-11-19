import { gql } from '@urql/svelte';

export const GET_USER_PRODUCTIVITY = gql`
	query GetUserProductivity($startDate: String!, $endDate: String!, $granularity: String) {
		getUserProductivity(startDate: $startDate, endDate: $endDate, granularity: $granularity) {
			data {
				date
				tasksCreated
				tasksCompleted
				tasksInProgress
				tasksOverdue
				averageCompletionTime
				productivityScore
			}
			summary {
				totalTasksCreated
				totalTasksCompleted
				averageProductivityScore
				completionRate
				averageCompletionTime
			}
		}
	}
`;

export const GET_TASK_METRICS = gql`
	query GetTaskMetrics($startDate: String!, $endDate: String!, $granularity: String) {
		getTaskMetrics(startDate: $startDate, endDate: $endDate, granularity: $granularity) {
			data {
				date
				tasksCreated
				completionRate
			}
		}
	}
`;

export const GET_PRIORITY_DISTRIBUTION = gql`
	query GetPriorityDistribution($startDate: String!, $endDate: String!) {
		getPriorityDistribution(startDate: $startDate, endDate: $endDate) {
			summary {
				totalLow
				totalMedium
				totalHigh
				totalUrgent
			}
		}
	}
`;

export const GET_STATUS_DISTRIBUTION = gql`
	query GetStatusDistribution($startDate: String!, $endDate: String!) {
		getStatusDistribution(startDate: $startDate, endDate: $endDate) {
			data {
				date
				todo
				inProgress
				review
				completed
				cancelled
			}
			summary {
				totalTodo
				totalInProgress
				totalReview
				totalCompleted
				totalCancelled
			}
		}
	}
`;

export const GET_USER_ACTIVITY_HEATMAP = gql`
	query GetUserActivityHeatmap($startDate: String!, $endDate: String!) {
		getUserActivityHeatmap(startDate: $startDate, endDate: $endDate) {
			data {
				date
				hour
				activityCount
			}
			totalActivities
			peakHour
		}
	}
`;
