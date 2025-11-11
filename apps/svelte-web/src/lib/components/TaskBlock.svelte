<script lang="ts">
	import { TaskTag } from '$components';
	import { resolve } from '$app/paths';

	interface ComponentProps {
		task: {
			id: string;
			title: string;
			description?: string;
			status: string;
			priority: string;
			createdAt: string;
			dueDate?: string;
		};
		deleteTask: (id: string) => void;
	}
	let { task, deleteTask }: ComponentProps = $props();
</script>

<div class="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
	<div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0">
		<div class="flex-1 min-w-0">
			<div class="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
				<h3 class="text-base sm:text-lg font-semibold text-gray-900 break-words">{task.title}</h3>
				<div class="flex flex-wrap gap-2">
					<TaskTag taskStatus={task.status}></TaskTag>
					<TaskTag taskPriority={task.priority}></TaskTag>
				</div>
			</div>

			{#if task.description}
				<p class="text-sm sm:text-base text-gray-600 mb-3 break-words">
					{task.description.slice(0, 100)}{task.description.length > 100 ? '...' : ''}
				</p>
			{/if}

			<div
				class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500"
			>
				<span class="flex items-center gap-1">
					<svg
						class="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0"
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
					<span class="truncate">Created: {new Date(task.createdAt).toLocaleDateString()}</span>
				</span>
				{#if task.dueDate}
					<span class="flex items-center gap-1">
						<svg
							class="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0"
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
						<span class="truncate">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
					</span>
				{/if}
			</div>
		</div>

		<div class="flex items-center gap-1.5 sm:gap-2 sm:ml-4 justify-end sm:justify-start">
			<a
				href={resolve(`/dashboard/tasks/${task.id}`)}
				class="p-1.5 sm:p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
				title="View Details"
			>
				<svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
					/>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
					/>
				</svg>
			</a>
			<a
				href={resolve(`/dashboard/tasks/${task.id}/edit`)}
				class="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
				title="Edit"
			>
				<svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
					/>
				</svg>
			</a>
			<button
				onclick={() => deleteTask(task.id)}
				class="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
				title="Delete"
			>
				<svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
					/>
				</svg>
			</button>
		</div>
	</div>
</div>
