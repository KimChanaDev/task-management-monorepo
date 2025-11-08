<script lang="ts">
	import { StyleConsts } from '$consts';

	interface PriorityProps {
		taskPriority: string;
		taskStatus?: never;
	}
	interface StatusProps {
		taskPriority?: never;
		taskStatus: string;
	}
	let { taskStatus, taskPriority }: PriorityProps | StatusProps = $props();

	function getStyle() {
		if (taskStatus) {
			return StyleConsts.getStatusColor(taskStatus);
		} else if (taskPriority) {
			return StyleConsts.getPriorityColor(taskPriority);
		}
		return '';
	}
	function getText() {
		let text = taskStatus ?? taskPriority!;
		return text.replace('_', ' ');
	}
</script>

<span
	class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border {getStyle()}"
>
	{getText()}
</span>
