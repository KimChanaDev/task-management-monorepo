<script lang="ts">
	import { getContextClient } from '@urql/svelte';
	import { onMount } from 'svelte';
	import { TASK_QUERIES, type IMyTaskFilterInput, type ITaskResponse } from '$lib/graphql';
	import { TASK_PRIORITY, TASK_STATUS } from '$consts';
	import { toTitleCaseFromEnum } from '$utils';
	import { TaskBlock } from '$components';
	import { taskStore } from '$stores';

	const client = getContextClient();

	let tasks = $state<ITaskResponse[]>([]);
	let isLoading = $state(true);
	let filterStatus = $state('');
	let filterPriority = $state('');
	let searchQuery = $state('');

	// Pagination state
	let currentPage = $state(1);
	let pageSize = $state(10);
	let totalTasks = $state(0);
	let totalPages = $derived(Math.ceil(totalTasks / pageSize));

	onMount(async () => {
		await fetchTasks();
	});

	async function fetchTasks() {
		isLoading = true;
		try {
			const filter: IMyTaskFilterInput = {
				status: filterStatus || undefined,
				priority: filterPriority || undefined,
				search: searchQuery.trim() || undefined,
				page: currentPage,
				limit: pageSize
			};
			const result = await client.query(TASK_QUERIES.GET_MY_TASKS, { filter });

			if (result.data?.myTasks) {
				tasks = result.data.myTasks.tasks;
				totalTasks = result.data.myTasks.total || tasks.length;
				taskStore.setTasks(tasks);
			}
		} catch (error) {
			console.error('Failed to fetch tasks:', error);
		} finally {
			isLoading = false;
		}
	}

	// Debounced search to avoid too many API calls
	let searchTimeout: ReturnType<typeof setTimeout>;
	function handleSearchChange() {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			currentPage = 1;
			fetchTasks();
		}, 500); // Wait 500ms after user stops typing
	}

	function handleFilterChange() {
		currentPage = 1;
		fetchTasks();
	}

	function changePage(newPage: number) {
		if (newPage < 1 || newPage > totalPages) return;
		currentPage = newPage;
		fetchTasks();
	}

	function changePageSize() {
		currentPage = 1; // Reset to first page
		fetchTasks();
	}

	async function deleteTask(taskId: string) {
		if (!confirm('Are you sure you want to delete this task?')) {
			return;
		}

		try {
			const result = await client.mutation(TASK_QUERIES.DELETE_TASK, { id: taskId });

			if (result.data?.deleteTask) {
				tasks = tasks.filter((t) => t.id !== taskId);
				taskStore.invalidate(taskId);
			}
		} catch (error) {
			console.error('Failed to delete task:', error);
			alert('Failed to delete task. Please try again.');
		}
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold text-gray-900">My Tasks</h1>
		<a
			href="/dashboard/create"
			class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
			New Task
		</a>
	</div>

	<!-- Filters -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			<div>
				<label for="search" class="block text-sm font-medium text-gray-700 mb-2"> Search </label>
				<input
					id="search"
					type="text"
					bind:value={searchQuery}
					oninput={handleSearchChange}
					placeholder="Search tasks..."
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
				/>
			</div>

			<div>
				<label for="status" class="block text-sm font-medium text-gray-700 mb-2"> Status </label>
				<select
					id="status"
					bind:value={filterStatus}
					onchange={handleFilterChange}
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
				>
					<option value="">All Status</option>
					{#each Object.values(TASK_STATUS) as status}
						<option value={status}>{toTitleCaseFromEnum(status)}</option>
					{/each}
				</select>
			</div>

			<div>
				<label for="priority" class="block text-sm font-medium text-gray-700 mb-2">
					Priority
				</label>
				<select
					id="priority"
					bind:value={filterPriority}
					onchange={handleFilterChange}
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
				>
					<option value="">All Priority</option>
					{#each Object.values(TASK_PRIORITY) as priority}
						<option value={priority}>{toTitleCaseFromEnum(priority)}</option>
					{/each}
				</select>
			</div>
		</div>
	</div>

	<!-- Tasks List -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-100">
		{#if isLoading}
			<div class="flex justify-center py-12">
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
			</div>
		{:else if tasks.length === 0}
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
				<h3 class="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
				<p class="mt-1 text-sm text-gray-500">
					{filterStatus || filterPriority || searchQuery
						? 'Try adjusting your filters.'
						: 'Get started by creating a new task.'}
				</p>
			</div>
		{:else}
			<div class="divide-y divide-gray-200">
				{#each tasks as task}
					<TaskBlock {task} deleteTask={() => deleteTask(task.id)}></TaskBlock>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Pagination -->
	{#if !isLoading && tasks.length > 0}
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
			<div class="flex items-center justify-between">
				<!-- Page size selector -->
				<div class="flex items-center gap-2">
					<label for="pageSize" class="text-sm text-gray-700">Show:</label>
					<select
						id="pageSize"
						bind:value={pageSize}
						onchange={changePageSize}
						class="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
					>
						<option value={5}>5</option>
						<option value={10}>10</option>
						<option value={20}>20</option>
						<option value={50}>50</option>
					</select>
					<span class="text-sm text-gray-700">
						per page (Total: {totalTasks} tasks)
					</span>
				</div>

				<!-- Pagination controls -->
				<div class="flex items-center gap-2">
					<button
						onclick={() => changePage(1)}
						disabled={currentPage === 1}
						class="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						title="First page"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
							/>
						</svg>
					</button>

					<button
						onclick={() => changePage(currentPage - 1)}
						disabled={currentPage === 1}
						class="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						title="Previous page"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 19l-7-7 7-7"
							/>
						</svg>
					</button>

					<span class="px-4 py-1 text-sm text-gray-700">
						Page {currentPage} of {totalPages}
					</span>

					<button
						onclick={() => changePage(currentPage + 1)}
						disabled={currentPage === totalPages}
						class="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						title="Next page"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</button>

					<button
						onclick={() => changePage(totalPages)}
						disabled={currentPage === totalPages}
						class="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						title="Last page"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 5l7 7-7 7M5 5l7 7-7 7"
							/>
						</svg>
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
