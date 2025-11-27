<script lang="ts">
	import { TaskTag } from '$components';
	import { taskStore } from '$lib/stores/task-store';
	import { onMount } from 'svelte';
	import { getContextClient } from '@urql/svelte';
	import { createTaskAPI } from '$lib/api';
	import { formatDate, formatFileSize } from '$utils';
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';

	const client = getContextClient();
	const taskAPI = createTaskAPI(client);

	interface ComponentProps {
		data: {
			taskId: string;
		};
	}
	let { data }: ComponentProps = $props();

	let taskId: string = $derived(data.taskId);
	let loading = $state(true);
	let deleteLoading = $state(false);
	let selectedImage = $state<{ url: string; filename: string } | null>(null);

	onMount(async () => {
		await fetchTask();
		loading = false;
	});

	async function fetchTask() {
		try {
			const task = await taskAPI.getTask(taskId);
			if (task) {
				taskStore.setIndividualPage(task, '');
			} else {
				taskStore.setIndividualPage(undefined, 'Task not found');
			}
		} catch (err) {
			console.error('Error fetching task:', err);
			taskStore.setIndividualPage(
				undefined,
				err instanceof Error ? err.message : 'An error occurred'
			);
		}
	}

	async function handleDelete() {
		if (!confirm('Are you sure you want to delete this task?')) {
			return;
		}
		deleteLoading = true;

		try {
			const success = await taskAPI.deleteTask(taskId);

			if (success) {
				taskStore.invalidate(taskId);
				goto(resolve('/dashboard/tasks'));
			} else {
				taskStore.setIndividualPage(undefined, 'Failed to delete task');
			}
		} catch (err) {
			console.error('Error deleting task:', err);
			taskStore.setIndividualPage(
				undefined,
				err instanceof Error ? err.message : 'An error occurred'
			);
		} finally {
			deleteLoading = false;
		}
	}

	function openImageModal(url: string, filename: string) {
		selectedImage = { url, filename };
	}

	function closeImageModal() {
		selectedImage = null;
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Escape' && selectedImage) {
			closeImageModal();
		}
	}
</script>

<svelte:window onkeydown={handleKeyDown} />

<div class="max-w-5xl mx-auto p-3 sm:p-4 md:p-6">
	<!-- Header with back button -->
	<div class="mb-4 sm:mb-6">
		<a
			href={resolve('/dashboard/tasks')}
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
			Back to Tasks
		</a>
	</div>

	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div
				class="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-indigo-600"
			></div>
		</div>
	{:else if $taskStore.individualPage.error}
		<div
			class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 sm:px-6 sm:py-4 rounded-lg text-sm sm:text-base"
		>
			<p class="font-medium">Error</p>
			<p class="mt-1">{$taskStore.individualPage.error}</p>
		</div>
	{:else if $taskStore.individualPage.task}
		<div class="bg-white shadow-lg rounded-xl overflow-hidden">
			<!-- Task Header -->
			<div
				class="bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6"
			>
				<div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
					<div class="flex-1 min-w-0">
						<h1 class="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3 break-words">
							{$taskStore.individualPage.task.title}
						</h1>
						<div class="flex flex-wrap items-center gap-2">
							<TaskTag taskStatus={$taskStore.individualPage.task.status} />
							<TaskTag taskPriority={$taskStore.individualPage.task.priority} />
						</div>
					</div>
					<div class="flex items-center gap-1.5 sm:gap-2 justify-end sm:justify-start">
						<a
							href={resolve(`/dashboard/tasks/${$taskStore.individualPage.task.id}/edit`)}
							class="px-3 py-1.5 sm:px-4 sm:py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-medium inline-flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base"
						>
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
									d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
								/>
							</svg>
							<span class="hidden sm:inline">Edit</span>
						</a>
						<button
							onclick={handleDelete}
							disabled={deleteLoading}
							class="px-3 py-1.5 sm:px-4 sm:py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium inline-flex items-center gap-1.5 sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
						>
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
									d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
								/>
							</svg>
							<span class="hidden sm:inline">{deleteLoading ? 'Deleting...' : 'Delete'}</span>
						</button>
					</div>
				</div>
			</div>

			<!-- Task Details -->
			<div class="px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6">
				<!-- Description -->
				<div class="mb-4 sm:mb-6">
					<h2 class="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Description</h2>
					{#if $taskStore.individualPage.task.description}
						<p
							class="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap break-words"
						>
							{$taskStore.individualPage.task.description}
						</p>
					{:else}
						<p class="text-sm sm:text-base text-gray-400 italic">No description provided</p>
					{/if}
				</div>

				<!-- Task Info Grid -->
				<div
					class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 border-t border-gray-200 pt-4 sm:pt-6"
				>
					<div>
						<h3 class="text-xs sm:text-sm font-medium text-gray-500 mb-1.5 sm:mb-2">Status</h3>
						<div class="flex items-center gap-2">
							<TaskTag taskStatus={$taskStore.individualPage.task.status} />
						</div>
					</div>

					<div>
						<h3 class="text-xs sm:text-sm font-medium text-gray-500 mb-1.5 sm:mb-2">Priority</h3>
						<div class="flex items-center gap-2">
							<TaskTag taskPriority={$taskStore.individualPage.task.priority} />
						</div>
					</div>

					{#if $taskStore.individualPage.task.dueDate}
						<div>
							<h3 class="text-xs sm:text-sm font-medium text-gray-500 mb-1.5 sm:mb-2">Due Date</h3>
							<p class="text-sm sm:text-base text-gray-900 flex items-center gap-1.5 sm:gap-2">
								<svg
									class="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0"
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
								<span class="truncate">{formatDate($taskStore.individualPage.task.dueDate)}</span>
							</p>
						</div>
					{/if}

					{#if $taskStore.individualPage.task.assignedTo}
						<div>
							<h3 class="text-xs sm:text-sm font-medium text-gray-500 mb-1.5 sm:mb-2">
								Assigned To
							</h3>
							<p class="text-sm sm:text-base text-gray-900 flex items-center gap-1.5 sm:gap-2">
								<svg
									class="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0"
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
								<span class="truncate">{$taskStore.individualPage.task.assignedTo}</span>
							</p>
						</div>
					{/if}

					<div>
						<h3 class="text-xs sm:text-sm font-medium text-gray-500 mb-1.5 sm:mb-2">Created By</h3>
						<p class="text-sm sm:text-base text-gray-900 flex items-center gap-1.5 sm:gap-2">
							<svg
								class="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0"
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
							<span class="truncate">{$taskStore.individualPage.task.createdBy}</span>
						</p>
					</div>

					<div>
						<h3 class="text-xs sm:text-sm font-medium text-gray-500 mb-1.5 sm:mb-2">Created At</h3>
						<p class="text-sm sm:text-base text-gray-900 flex items-center gap-1.5 sm:gap-2">
							<svg
								class="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0"
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
							<span class="truncate">{formatDate($taskStore.individualPage.task.createdAt)}</span>
						</p>
					</div>

					<div>
						<h3 class="text-xs sm:text-sm font-medium text-gray-500 mb-1.5 sm:mb-2">
							Last Updated
						</h3>
						<p class="text-sm sm:text-base text-gray-900 flex items-center gap-1.5 sm:gap-2">
							<svg
								class="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0"
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
							<span class="truncate">{formatDate($taskStore.individualPage.task.updatedAt)}</span>
						</p>
					</div>
				</div>

				<!-- Attachments Section -->
				{#if $taskStore.individualPage.task.attachments && $taskStore.individualPage.task.attachments.length > 0}
					<div class="border-t border-gray-200 pt-4 sm:pt-6 mt-4 sm:mt-6">
						<h2
							class="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2"
						>
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
									d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
								/>
							</svg>
							Attachments ({$taskStore.individualPage.task.attachments.length})
						</h2>
						<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
							{#each $taskStore.individualPage.task.attachments as attachment (attachment.id)}
								<button
									type="button"
									onclick={() =>
										openImageModal(attachment.url, attachment.originalName ?? attachment.filename)}
									class="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200 hover:border-indigo-300 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
								>
									<img
										src={attachment.thumbnailUrl || attachment.url}
										alt={attachment.originalName}
										class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
									/>
									<div
										class="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center"
									>
										<svg
											class="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
											/>
										</svg>
									</div>
									<div
										class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2"
									>
										<p class="text-white text-xs truncate">{attachment.originalName}</p>
										<p class="text-white/70 text-xs">{formatFileSize(attachment.size)}</p>
									</div>
								</button>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<!-- Image Modal -->
{#if selectedImage}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
		role="dialog"
		aria-modal="true"
	>
		<button
			type="button"
			aria-label="Close image preview"
			onclick={closeImageModal}
			class="absolute top-4 right-4 p-2 text-white hover:text-gray-300 transition-colors z-10"
		>
			<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M6 18L18 6M6 6l12 12"
				/>
			</svg>
		</button>
		<button
			type="button"
			aria-label="Close modal"
			onclick={closeImageModal}
			class="absolute inset-0 w-full h-full"
		></button>
		<div class="relative max-w-4xl max-h-[90vh] mx-4">
			<img
				src={selectedImage.url}
				alt={selectedImage.filename}
				class="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
			/>
			<p class="text-center text-white mt-2 text-sm sm:text-base">{selectedImage.filename}</p>
		</div>
	</div>
{/if}
