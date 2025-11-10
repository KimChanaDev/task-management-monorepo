<script lang="ts">
	import { TaskTag } from '$components';

	interface ComponentProps {
		taskId: string;
		taskTitle: string;
		taskStatus: string;
		taskPriority: string;
		taskDueDate?: string;
	}
	let { taskId, taskTitle, taskStatus, taskPriority, taskDueDate }: ComponentProps = $props();
</script>

<a
	href="/dashboard/tasks/{taskId}"
	class="block p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all"
>
	<div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0">
		<div class="flex-1 min-w-0">
			<h4 class="text-sm sm:text-base font-semibold text-gray-900 break-words">{taskTitle}</h4>
			<div class="mt-2 flex flex-wrap items-center gap-2">
				<TaskTag {taskStatus} />
				<TaskTag {taskPriority} />
			</div>
		</div>
		{#if taskDueDate}
			<div class="text-xs sm:text-sm text-gray-500 sm:ml-3 flex-shrink-0">
				Due: {new Date(taskDueDate).toLocaleDateString()}
			</div>
		{/if}
	</div>
</a>
