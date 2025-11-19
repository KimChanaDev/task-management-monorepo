<script lang="ts">
	import { queryStore, getContextClient } from '@urql/svelte';
	import { subDays, format } from 'date-fns';
	import MetricCard from '$lib/components/analytics/MetricCard.svelte';
	import LineChart from '$lib/components/analytics/LineChart.svelte';
	import BarChart from '$lib/components/analytics/BarChart.svelte';
	import DoughnutChart from '$lib/components/analytics/DoughnutChart.svelte';
	import ActivityHeatmap from '$lib/components/analytics/ActivityHeatmap.svelte';
	import {
		GET_USER_PRODUCTIVITY,
		GET_TASK_METRICS,
		GET_PRIORITY_DISTRIBUTION,
		GET_STATUS_DISTRIBUTION,
		GET_USER_ACTIVITY_HEATMAP
	} from '$lib/graphql/analytics.queries';

	const client = getContextClient();

	// Date range - last 30 days
	const endDate = format(new Date(), 'yyyy-MM-dd');
	const startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd');

	// Query stores
	const userProductivityStore = queryStore({
		client,
		query: GET_USER_PRODUCTIVITY,
		variables: { startDate, endDate, granularity: 'DAY' }
	});

	const taskMetricsStore = queryStore({
		client,
		query: GET_TASK_METRICS,
		variables: { startDate, endDate, granularity: 'DAY' }
	});

	const priorityDistStore = queryStore({
		client,
		query: GET_PRIORITY_DISTRIBUTION,
		variables: { startDate, endDate }
	});

	const statusDistStore = queryStore({
		client,
		query: GET_STATUS_DISTRIBUTION,
		variables: { startDate, endDate }
	});

	const heatmapStore = queryStore({
		client,
		query: GET_USER_ACTIVITY_HEATMAP,
		variables: { startDate, endDate }
	});

	// Derived states
	const isLoading = $derived(
		$userProductivityStore.fetching ||
			$taskMetricsStore.fetching ||
			$priorityDistStore.fetching ||
			$statusDistStore.fetching ||
			$heatmapStore.fetching
	);

	const hasError = $derived(
		$userProductivityStore.error ||
			$taskMetricsStore.error ||
			$priorityDistStore.error ||
			$statusDistStore.error ||
			$heatmapStore.error
	);
</script>

<div class="min-h-screen bg-gray-50 py-8">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<!-- Header -->
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
			<p class="mt-2 text-sm text-gray-600">
				Performance insights and productivity metrics for the last 30 days (Update hourly).
			</p>
		</div>

		{#if isLoading}
			<div class="flex items-center justify-center h-64">
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
			</div>
		{:else if hasError}
			<div class="bg-red-50 border border-red-200 rounded-lg p-4">
				<p class="text-red-800">Failed to load analytics data. Please try again later.</p>
			</div>
		{:else}
			<!-- Summary Cards -->
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
				{#if $userProductivityStore.data?.getUserProductivity}
					{@const summary = $userProductivityStore.data.getUserProductivity.summary}
					<MetricCard
						title="Productivity Score"
						value={summary.averageProductivityScore.toFixed(1)}
						subtitle="Average score"
						icon="📊"
						trend="up"
						trendValue="+{summary.completionRate.toFixed(1)}% completion"
					/>
					<MetricCard
						title="Tasks Completed"
						value={summary.totalTasksCompleted}
						subtitle="Total completed"
						icon="✅"
					/>
					<MetricCard
						title="Tasks Created"
						value={summary.totalTasksCreated}
						subtitle="Total created"
						icon="📝"
					/>
					<MetricCard
						title="Avg Completion Time"
						value=""
						subtitle="Feature in the future"
						icon="⏱️"
					/>
				{/if}
			</div>

			<!-- Productivity Chart -->
			{#if $userProductivityStore.data?.getUserProductivity}
				{@const data = $userProductivityStore.data.getUserProductivity.data}
				<div class="mb-8">
					<LineChart
						title="Productivity Trends"
						labels={data.map((d: any) => format(new Date(d.date), 'MMM dd'))}
						datasets={[
							{
								label: 'Productivity Score',
								data: data.map((d: any) => d.productivityScore),
								borderColor: 'rgba(59, 130, 246, 1)',
								backgroundColor: 'rgba(59, 130, 246, 0.1)',
								fill: true
							},
							{
								label: 'Tasks Completed',
								data: data.map((d: any) => d.tasksCompleted),
								borderColor: 'rgba(16, 185, 129, 1)',
								backgroundColor: 'rgba(16, 185, 129, 0.1)',
								fill: true
							}
						]}
						height={350}
					/>
				</div>
			{/if}

			<!-- Activity Heatmap -->
			{#if $heatmapStore.data?.getUserActivityHeatmap}
				{@const heatmapData = $heatmapStore.data.getUserActivityHeatmap}
				<div class="mb-8">
					<ActivityHeatmap
						title="Activity Heatmap"
						data={heatmapData.data}
						peakHour={heatmapData.peakHour}
					/>
				</div>
			{/if}

			<!-- Task Metrics Chart -->
			{#if $taskMetricsStore.data?.getTaskMetrics}
				{@const data = $taskMetricsStore.data.getTaskMetrics.data}
				<div class="mb-8">
					<LineChart
						title="Task Completion Metrics (All in the system)"
						labels={data.map((d: any) => format(new Date(d.date), 'MMM dd'))}
						datasets={[
							{
								label: 'Completion Rate (%)',
								data: data.map((d: any) => d.completionRate),
								borderColor: 'rgba(16, 185, 129, 1)',
								backgroundColor: 'rgba(16, 185, 129, 0.1)',
								fill: true
							},
							{
								label: 'Tasks Created',
								data: data.map((d: any) => d.tasksCreated),
								borderColor: 'rgba(59, 130, 246, 1)',
								backgroundColor: 'rgba(59, 130, 246, 0.1)',
								fill: true
							}
						]}
						height={350}
					/>
				</div>
			{/if}

			<!-- Distribution Charts -->
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
				{#if $priorityDistStore.data?.getPriorityDistribution}
					{@const summary = $priorityDistStore.data.getPriorityDistribution.summary}
					<DoughnutChart
						title="Priority Distribution (All in the system)"
						labels={['Low', 'Medium', 'High', 'Urgent']}
						data={[summary.totalLow, summary.totalMedium, summary.totalHigh, summary.totalUrgent]}
						backgroundColors={[
							'rgba(59, 130, 246, 0.8)',
							'rgba(251, 191, 36, 0.8)',
							'rgba(245, 158, 11, 0.8)',
							'rgba(239, 68, 68, 0.8)'
						]}
						height={300}
					/>
				{/if}

				{#if $statusDistStore.data?.getStatusDistribution}
					{@const summary = $statusDistStore.data.getStatusDistribution.summary}
					<DoughnutChart
						title="Status Distribution (All in the system)"
						labels={['Todo', 'In Progress', 'Review', 'Completed', 'Cancelled']}
						data={[
							summary.totalTodo,
							summary.totalInProgress,
							summary.totalReview,
							summary.totalCompleted,
							summary.totalCancelled
						]}
						backgroundColors={[
							'rgba(156, 163, 175, 0.8)',
							'rgba(59, 130, 246, 0.8)',
							'rgba(251, 191, 36, 0.8)',
							'rgba(16, 185, 129, 0.8)',
							'rgba(239, 68, 68, 0.8)'
						]}
						height={300}
					/>
				{/if}
			</div>

			<!-- Status Distribution Bar Chart -->
			{#if $statusDistStore.data?.getStatusDistribution}
				{@const data = $statusDistStore.data.getStatusDistribution.data}
				<div class="mb-8">
					<BarChart
						title="Status Distribution Bar Chart (All in the system)"
						labels={data.map((d: any) => format(new Date(d.date), 'MMM dd'))}
						datasets={[
							{
								label: 'Todo',
								data: data.map((d: any) => d.todo),
								backgroundColor: 'rgba(156, 163, 175, 0.8)',
								borderColor: 'rgba(156, 163, 175, 1)'
							},
							{
								label: 'In Progress',
								data: data.map((d: any) => d.inProgress),
								backgroundColor: 'rgba(59, 130, 246, 0.8)',
								borderColor: 'rgba(59, 130, 246, 1)'
							},
							{
								label: 'Review',
								data: data.map((d: any) => d.review),
								backgroundColor: 'rgba(251, 191, 36, 0.8)',
								borderColor: 'rgba(251, 191, 36, 1)'
							},
							{
								label: 'Completed',
								data: data.map((d: any) => d.completed),
								backgroundColor: 'rgba(16, 185, 129, 0.8)',
								borderColor: 'rgba(16, 185, 129, 1)'
							},
							{
								label: 'Cancelled',
								data: data.map((d: any) => d.cancelled),
								backgroundColor: 'rgba(239, 68, 68, 0.8)',
								borderColor: 'rgba(239, 68, 68, 1)'
							}
						]}
						height={350}
					/>
				</div>
			{/if}
		{/if}
	</div>
</div>
