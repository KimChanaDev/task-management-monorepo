<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { notificationStore } from '$stores';
	import { NotificationType, type Notification } from '@repo/socket/types';

	interface ComponentProps {
		notification: Notification;
	}

	let { notification }: ComponentProps = $props();

	function handleClose() {
		notificationStore.markAsRead(notification.id);
		notificationStore.dismiss(notification.id);
	}

	function getNotificationColor(type: NotificationType): string {
		switch (type) {
			case NotificationType.TASK_CREATED:
				return 'bg-green-50 border-green-200 text-green-800';
			case NotificationType.TASK_UPDATED:
				return 'bg-blue-50 border-blue-200 text-blue-800';
			case NotificationType.TASK_DELETED:
				return 'bg-red-50 border-red-200 text-red-800';
			default:
				return 'bg-gray-50 border-gray-200 text-gray-800';
		}
	}

	function getNotificationIcon(type: NotificationType): string {
		switch (type) {
			case NotificationType.TASK_CREATED:
				return '✅';
			case NotificationType.TASK_UPDATED:
				return '✏️';
			case NotificationType.TASK_DELETED:
				return '🗑️';
			default:
				return '📢';
		}
	}

	function getNotificationTitle(type: NotificationType): string {
		switch (type) {
			case NotificationType.TASK_CREATED:
				return 'Task Created';
			case NotificationType.TASK_UPDATED:
				return 'Task Updated';
			case NotificationType.TASK_DELETED:
				return 'Task Deleted';
			default:
				return 'Notification';
		}
	}
</script>

<div
	in:fly={{ x: 300, duration: 300 }}
	out:fade={{ duration: 200 }}
	class="toast-notification flex items-start gap-3 p-4 rounded-lg border-2 shadow-lg max-w-md min-w-[320px] {getNotificationColor(
		notification.type
	)}"
	role="alert"
>
	<!-- Icon -->
	<div class="flex-shrink-0 text-2xl">
		{getNotificationIcon(notification.type)}
	</div>

	<!-- Content -->
	<div class="flex-1 min-w-0">
		<p class="font-semibold text-sm mb-1">
			{getNotificationTitle(notification.type)}
		</p>
		<p class="text-sm break-words">
			{notification.message}
		</p>
		{#if 'data' in notification}
			<p class="text-xs mt-1 opacity-75">
				{#if notification.type === NotificationType.TASK_CREATED}
					Task: {notification.data.taskTitle}
				{:else if notification.type === NotificationType.TASK_UPDATED}
					Task: {notification.data.taskTitle}
				{:else if notification.type === NotificationType.TASK_DELETED}
					Task: {notification.data.taskTitle}
				{/if}
			</p>
		{/if}
	</div>

	<!-- Close Button -->
	<button
		onclick={handleClose}
		class="flex-shrink-0 text-gray-500 hover:text-gray-700 transition-colors"
		aria-label="Close notification"
	>
		<svg
			class="w-5 h-5"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"
			></path>
		</svg>
	</button>
</div>

<style>
	.toast-notification {
		animation: slideIn 0.3s ease-out;
	}

	@keyframes slideIn {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}
</style>
