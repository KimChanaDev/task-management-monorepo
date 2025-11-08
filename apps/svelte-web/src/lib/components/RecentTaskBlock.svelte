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
	class="block p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all"
>
	<div class="flex items-start justify-between">
		<div class="flex-1">
			<h4 class="text-base font-semibold text-gray-900">{taskTitle}</h4>
			<div class="mt-2 flex items-center gap-3">
				<TaskTag {taskStatus} />
				<TaskTag {taskPriority} />
			</div>
		</div>
		{#if taskDueDate}
			<div class="text-sm text-gray-500">
				Due: {new Date(taskDueDate).toLocaleDateString()}
			</div>
		{/if}
	</div>
</a>
