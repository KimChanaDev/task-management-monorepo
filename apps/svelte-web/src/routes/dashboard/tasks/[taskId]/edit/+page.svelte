<script lang="ts">
	import { onMount } from 'svelte';
	import { TASK_QUERIES, type ITaskResponse, type IUpdateTaskInput } from '$lib/graphql';
	import { TASK_PRIORITY, TASK_STATUS } from '$consts';
	import { taskStore } from '$stores';
	import { toTitleCaseFromEnum } from '$utils';
	import { getContextClient } from '@urql/svelte';
	import { resolve } from '$app/paths';

	const client = getContextClient();

	interface ComponentProps {
		data: {
			taskId: string;
		};
	}
	let { data }: ComponentProps = $props();
	let taskId: string = $derived(data.taskId);
	let task: ITaskResponse | null = $state(null);
	let loading = $state(true);
	let submitting = $state(false);
	let error = $state('');
	let successMessage = $state('');

	// Form fields
	let title = $state('');
	let description = $state('');
	let status = $state(TASK_STATUS.TODO.toString());
	let priority = $state(TASK_PRIORITY.MEDIUM.toString());
	let dueDate = $state('');
	let assignedTo = $state('');

	onMount(async () => {
		const cachedTask = taskStore.getTask(taskId);
		if (cachedTask) {
			task = cachedTask;
			populateForm(cachedTask);
			loading = false;
		}
		await fetchTask();
	});

	function populateForm(taskData: ITaskResponse) {
		title = taskData.title;
		description = taskData.description || '';
		status = taskData.status;
		priority = taskData.priority;
		dueDate = taskData.dueDate ? new Date(taskData.dueDate).toISOString().slice(0, 16) : '';
		assignedTo = taskData.assignedTo || '';
	}

	async function fetchTask() {
		loading = true;
		error = '';

		try {
			const data = await client.query(TASK_QUERIES.GET_TASK, { id: taskId });

			if (data.error) {
				error = data.error.message || 'Failed to fetch task';
			} else if (data.data.task) {
				task = data.data.task;
				populateForm(data.data.task);
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

	async function handleSubmit(e: Event) {
		e.preventDefault();

		submitting = true;
		error = '';
		successMessage = '';

		const updateInput: IUpdateTaskInput = {
			id: taskId,
			title: title.trim(),
			description: description.trim() || undefined,
			status,
			priority,
			dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
			assignedTo: assignedTo.trim() || undefined
		};

		try {
			const data = await client.mutation(TASK_QUERIES.UPDATE_TASK, {
				updateTaskInput: updateInput
			});

			if (data.data?.updateTask) {
				taskStore.setTask(data.data.updateTask);
				successMessage = 'Task updated successfully!';
				setTimeout(() => {
					window.location.href = `/dashboard/tasks/${taskId}`;
				}, 1000);
			} else {
				error =
					data.error?.graphQLErrors[0].message || data.error?.message || 'Failed to update task';
				taskStore.invalidate(taskId);
			}
		} catch (err) {
			console.error('Error updating task:', err);
			error = err instanceof Error ? err.message : 'An error occurred';
		} finally {
			submitting = false;
		}
	}
</script>

<div class="max-w-4xl mx-auto p-3 sm:p-4 md:p-6">
	<!-- Header with back button -->
	<div class="mb-4 sm:mb-6">
		<a
			href={resolve(`/dashboard/tasks/${taskId}`)}
			class="inline-flex items-center gap-1.5 sm:gap-2 text-indigo-600 hover:text-indigo-800 transition-colors mb-3 sm:mb-4 text-sm sm:text-base"
		>
			<svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M10 19l-7-7m0 0l7-7m-7 7h18"
				/>
			</svg>
			Back to Task Details
		</a>
		<h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Edit Task</h1>
	</div>

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div
				class="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-indigo-600"
			></div>
		</div>
	{:else if error && !task}
		<div
			class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 sm:px-6 sm:py-4 rounded-lg text-sm sm:text-base"
		>
			<p class="font-medium">Error</p>
			<p class="mt-1">{error}</p>
		</div>
	{:else if task}
		<div class="bg-white shadow-lg rounded-xl p-4 sm:p-6 md:p-8">
			{#if error}
				<div
					class="bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg mb-4 sm:mb-6 text-sm sm:text-base"
				>
					<p class="font-medium">Error</p>
					<p class="mt-1">{error}</p>
				</div>
			{/if}

			{#if successMessage}
				<div
					class="bg-green-50 border border-green-200 text-green-700 px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg mb-4 sm:mb-6 text-sm sm:text-base"
				>
					<p class="font-medium">{successMessage}</p>
				</div>
			{/if}

			<form onsubmit={handleSubmit}>
				<!-- Title -->
				<div class="mb-4 sm:mb-6">
					<label
						for="title"
						class="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2"
					>
						Title <span class="text-red-500">*</span>
					</label>
					<input
						type="text"
						id="title"
						bind:value={title}
						required
						placeholder="Enter task title"
						class="w-full px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
					/>
				</div>

				<!-- Description -->
				<div class="mb-4 sm:mb-6">
					<label
						for="description"
						class="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2"
					>
						Description
					</label>
					<textarea
						id="description"
						bind:value={description}
						rows="5"
						placeholder="Enter task description"
						class="w-full px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
					></textarea>
				</div>

				<!-- Status and Priority -->
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
					<div>
						<label
							for="status"
							class="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2"
						>
							Status
						</label>
						<select
							id="status"
							bind:value={status}
							class="w-full px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
						>
							{#each Object.values(TASK_STATUS) as value (value)}
								<option {value}>{toTitleCaseFromEnum(value)}</option>
							{/each}
						</select>
					</div>

					<div>
						<label
							for="priority"
							class="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2"
						>
							Priority
						</label>
						<select
							id="priority"
							bind:value={priority}
							class="w-full px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
						>
							{#each Object.values(TASK_PRIORITY) as value (value)}
								<option {value}>{toTitleCaseFromEnum(value)}</option>
							{/each}
						</select>
					</div>
				</div>

				<!-- Due Date and Assigned To -->
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
					<div>
						<label
							for="dueDate"
							class="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2"
						>
							Due Date
						</label>
						<input
							type="datetime-local"
							id="dueDate"
							bind:value={dueDate}
							class="w-full px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
						/>
					</div>

					<div>
						<label
							for="assignedTo"
							class="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2"
						>
							Assigned To
						</label>
						<input
							type="text"
							id="assignedTo"
							bind:value={assignedTo}
							placeholder="User ID"
							class="w-full px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
						/>
					</div>
				</div>

				<!-- Form Actions -->
				<div
					class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200"
				>
					<button
						type="submit"
						disabled={submitting}
						class="px-5 py-2.5 sm:px-6 sm:py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base"
					>
						{#if submitting}
							<svg
								class="animate-spin h-4 w-4 sm:h-5 sm:w-5"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								></circle>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							Updating...
						{:else}
							<svg
								class="w-4 h-4 sm:w-5 sm:h-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M5 13l4 4L19 7"
								/>
							</svg>
							Update Task
						{/if}
					</button>

					<a
						href={resolve(`/dashboard/tasks/${taskId}`)}
						class="px-5 py-2.5 sm:px-6 sm:py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-center text-sm sm:text-base"
					>
						Cancel
					</a>
				</div>
			</form>
		</div>
	{/if}
</div>
