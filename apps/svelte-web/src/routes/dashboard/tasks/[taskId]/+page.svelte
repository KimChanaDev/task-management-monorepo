<script lang="ts">
	import { TASK_QUERIES, type ITaskResponse } from '$lib/graphql';
	import { TaskTag } from '$components';
	import { taskStore } from '$lib/stores/task-store';
	import { onMount } from 'svelte';
	import { getContextClient } from '@urql/svelte';
	import { formatDate } from '$utils';

	const client = getContextClient();

	interface ComponentProps {
		data: {
			taskId: string;
		};
	}
	let { data }: ComponentProps = $props();

	let taskId: string = $derived(data.taskId);
	let task: ITaskResponse | undefined = $state();
	let loading = $state(true);
	let error = $state('');
	let deleteLoading = $state(false);

	onMount(async () => {
		const cachedTask = taskStore.getTask(taskId);

		if (cachedTask) {
			task = cachedTask;
			loading = false;
			fetchTaskInBackground();
		} else {
			await fetchTask();
		}
	});

	async function fetchTask() {
		loading = true;
		error = '';

		try {
			const data = await client.query(TASK_QUERIES.GET_TASK, { id: taskId });
			if (data.error) {
				error = data.error.message || 'Failed to fetch task';
			} else if (data.data?.task) {
				task = data.data.task;
				taskStore.setTask(data.data.task);
			} else {
				error = 'Task not found';
			}
		} catch (err) {
			console.error('Error fetching task:', err);
			error = err instanceof Error ? err.message : 'An error occurred';
		} finally {
			loading = false;
		}
	}

	async function fetchTaskInBackground() {
		try {
			const data = await client.query(TASK_QUERIES.GET_TASK, { id: taskId });
			if (data.data?.task) {
				task = data.data.task;
				taskStore.setTask(data.data.task);
			}
		} catch (err) {
			console.error('Background fetch failed:', err);
		}
	}

	async function handleDelete() {
		if (!confirm('Are you sure you want to delete this task?')) {
			return;
		}
		deleteLoading = true;
		error = '';

		try {
			const result = await client.mutation(TASK_QUERIES.DELETE_TASK, { id: taskId });

			if (result.data?.deleteTask) {
				taskStore.invalidate(taskId);
				window.location.href = '/dashboard/tasks';
			} else {
				error = result.error?.message || 'Failed to delete task';
			}
		} catch (err) {
			console.error('Error deleting task:', err);
			error = err instanceof Error ? err.message : 'An error occurred';
		} finally {
			deleteLoading = false;
		}
	}
</script>

<div class="max-w-5xl mx-auto p-6">
	<!-- Header with back button -->
	<div class="mb-6">
		<a
			href="/dashboard/tasks"
			class="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors mb-4"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M10 19l-7-7m0 0l7-7m-7 7h18"
				/>
			</svg>
			Back to Tasks
		</a>
	</div>

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
		</div>
	{:else if error}
		<div class="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
			<p class="font-medium">Error</p>
			<p class="mt-1">{error}</p>
		</div>
	{:else if task}
		<div class="bg-white shadow-lg rounded-xl overflow-hidden">
			<!-- Task Header -->
			<div class="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-6">
				<div class="flex items-start justify-between">
					<div class="flex-1">
						<h1 class="text-3xl font-bold text-white mb-3">{task.title}</h1>
						<div class="flex items-center gap-3">
							<TaskTag taskStatus={task.status} />
							<TaskTag taskPriority={task.priority} />
						</div>
					</div>
					<div class="flex items-center gap-2">
						<a
							href="/dashboard/tasks/{task.id}/edit"
							class="px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-medium inline-flex items-center gap-2"
						>
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
								/>
							</svg>
							Edit
						</a>
						<button
							onclick={handleDelete}
							disabled={deleteLoading}
							class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
								/>
							</svg>
							{deleteLoading ? 'Deleting...' : 'Delete'}
						</button>
					</div>
				</div>
			</div>

			<!-- Task Details -->
			<div class="px-8 py-6">
				<!-- Description -->
				<div class="mb-6">
					<h2 class="text-xl font-semibold text-gray-900 mb-3">Description</h2>
					{#if task.description}
						<p class="text-gray-700 leading-relaxed whitespace-pre-wrap">{task.description}</p>
					{:else}
						<p class="text-gray-400 italic">No description provided</p>
					{/if}
				</div>

				<!-- Task Info Grid -->
				<div class="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-200 pt-6">
					<div>
						<h3 class="text-sm font-medium text-gray-500 mb-2">Status</h3>
						<div class="flex items-center gap-2">
							<TaskTag taskStatus={task.status} />
						</div>
					</div>

					<div>
						<h3 class="text-sm font-medium text-gray-500 mb-2">Priority</h3>
						<div class="flex items-center gap-2">
							<TaskTag taskPriority={task.priority} />
						</div>
					</div>

					{#if task.dueDate}
						<div>
							<h3 class="text-sm font-medium text-gray-500 mb-2">Due Date</h3>
							<p class="text-gray-900 flex items-center gap-2">
								<svg
									class="w-5 h-5 text-gray-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
									/>
								</svg>
								{formatDate(task.dueDate)}
							</p>
						</div>
					{/if}

					{#if task.assignedTo}
						<div>
							<h3 class="text-sm font-medium text-gray-500 mb-2">Assigned To</h3>
							<p class="text-gray-900 flex items-center gap-2">
								<svg
									class="w-5 h-5 text-gray-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
									/>
								</svg>
								{task.assignedTo}
							</p>
						</div>
					{/if}

					<div>
						<h3 class="text-sm font-medium text-gray-500 mb-2">Created By</h3>
						<p class="text-gray-900 flex items-center gap-2">
							<svg
								class="w-5 h-5 text-gray-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
								/>
							</svg>
							{task.createdBy}
						</p>
					</div>

					<div>
						<h3 class="text-sm font-medium text-gray-500 mb-2">Created At</h3>
						<p class="text-gray-900 flex items-center gap-2">
							<svg
								class="w-5 h-5 text-gray-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							{formatDate(task.createdAt)}
						</p>
					</div>

					<div>
						<h3 class="text-sm font-medium text-gray-500 mb-2">Last Updated</h3>
						<p class="text-gray-900 flex items-center gap-2">
							<svg
								class="w-5 h-5 text-gray-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
								/>
							</svg>
							{formatDate(task.updatedAt)}
						</p>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
