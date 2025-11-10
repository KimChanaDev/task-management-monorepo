<script lang="ts">
	import { getContextClient } from '@urql/svelte';
	import { onMount } from 'svelte';
	import { TASK_QUERIES } from '$lib/graphql';
	import { StatLabel, RecentTaskBlock } from '$components';
	import { TASK_RECENT_LIMIT } from '$consts';
	const client = getContextClient();

	let stats = $state({
		totalTasks: 0,
		todoTasks: 0,
		reviewTasks: 0,
		completedTasks: 0,
		inProgressTasks: 0,
		cancelledTasks: 0
	});

	let recentTasks = $state<any[]>([]);
	let loading = $state(true);

	onMount(async () => {
		try {
			const result = await client.query(TASK_QUERIES.DASHBOARD_QUERY, { limit: TASK_RECENT_LIMIT });

			if (result.data?.dashboard) {
				const dashboard = result.data.dashboard;
				recentTasks = dashboard.recentTasks ?? [];

				stats.totalTasks = dashboard.totalCount;
				stats.todoTasks = dashboard.todoCount;
				stats.inProgressTasks = dashboard.inProgressCount;
				stats.reviewTasks = dashboard.reviewCount;
				stats.completedTasks = dashboard.completedCount;
				stats.cancelledTasks = dashboard.cancelledCount;
			} else {
				throw new Error('No dashboard data found');
			}
		} catch (error) {
			console.error('Failed to fetch dashboard data:', error);
		} finally {
			loading = false;
		}
	});
</script>

<div class="space-y-4 sm:space-y-6">
	<!-- Stats Grid -->
	<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
		<StatLabel
			d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
			head="Total Tasks"
			value={stats.totalTasks}
			color="indigo"
		></StatLabel>
		<StatLabel
			d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
			head="To do"
			value={stats.todoTasks}
			color="gray"
		></StatLabel>
		<StatLabel
			d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
			head="In Progress"
			value={stats.inProgressTasks}
			color="blue"
		></StatLabel>
		<StatLabel
			d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
			head="Completed"
			value={stats.completedTasks}
			color="green"
		></StatLabel>
		<StatLabel
			d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 0 1 9 9v.375M10.125 2.25A3.375 3.375 0 0 1 13.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 0 1 3.375 3.375M9 15l2.25 2.25L15 12"
			head="Review"
			value={stats.reviewTasks}
			color="yellow"
		></StatLabel>
		<StatLabel
			d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
			head="Cancelled"
			value={stats.cancelledTasks}
			color="red"
		></StatLabel>
	</div>

	<!-- Recent Tasks -->
	<div class="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100">
		<div class="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
			<h3 class="text-base sm:text-lg font-semibold text-gray-900">Recent Tasks</h3>
		</div>

		<div class="p-4 sm:p-6">
			{#if loading}
				<div class="flex justify-center py-8">
					<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
				</div>
			{:else if recentTasks.length === 0}
				<div class="text-center py-12">
					<svg
						class="mx-auto h-12 w-12 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
						/>
					</svg>
					<h3 class="mt-2 text-sm font-medium text-gray-900">No tasks yet</h3>
					<p class="mt-1 text-sm text-gray-500">Get started by creating a new task.</p>
					<div class="mt-6">
						<a
							href="/dashboard/create"
							class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
						>
							<svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 4v16m8-8H4"
								/>
							</svg>
							Create Task
						</a>
					</div>
				</div>
			{:else}
				<div class="space-y-4">
					{#each recentTasks as task}
						<RecentTaskBlock
							taskId={task.id}
							taskTitle={task.title}
							taskStatus={task.status}
							taskPriority={task.priority}
							taskDueDate={task.dueDate}
						></RecentTaskBlock>
					{/each}
				</div>

				<div class="mt-6 text-center">
					<a
						href="/dashboard/tasks"
						class="text-indigo-600 hover:text-indigo-500 font-medium text-sm"
					>
						View all tasks →
					</a>
				</div>
			{/if}
		</div>
	</div>
</div>
