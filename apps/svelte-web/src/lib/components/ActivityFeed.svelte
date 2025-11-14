<script lang="ts">
	import { notificationStore, unreadCount, allNotifications } from '$stores';
	import { NotificationType } from '@repo/socket/types';
	import { fade } from 'svelte/transition';

	let showFeed = $state(false);
	let notifications = $derived($allNotifications);

	function toggleFeed() {
		showFeed = !showFeed;
		if (showFeed) {
			notificationStore.markAllAsRead();
		}
	}

	function formatTime(timestamp: Date): string {
		const date = new Date(timestamp);
		const now = new Date();
		const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

		if (diffInMinutes < 1) return 'Just now';
		if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

		const diffInHours = Math.floor(diffInMinutes / 60);
		if (diffInHours < 24) return `${diffInHours}h ago`;

		const diffInDays = Math.floor(diffInHours / 24);
		return `${diffInDays}d ago`;
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

	function getNotificationColor(type: NotificationType): string {
		switch (type) {
			case NotificationType.TASK_CREATED:
				return 'bg-green-100';
			case NotificationType.TASK_UPDATED:
				return 'bg-blue-100';
			case NotificationType.TASK_DELETED:
				return 'bg-red-100';
			default:
				return 'bg-gray-100';
		}
	}

	function clearAll() {
		notificationStore.clear();
		showFeed = false;
	}
</script>

<div class="activity-feed relative">
	<!-- Bell Icon Button -->
	<button
		onclick={toggleFeed}
		class="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
		aria-label="Activity feed"
	>
		<svg
			class="w-6 h-6"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
			></path>
		</svg>

		<!-- Badge for unread count -->
		{#if $unreadCount > 0}
			<span
				class="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full"
			>
				{$unreadCount > 99 ? '99+' : $unreadCount}
			</span>
		{/if}
	</button>

	<!-- Activity Feed Dropdown -->
	{#if showFeed}
		<div
			transition:fade={{ duration: 150 }}
			class="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden"
		>
			<!-- Header -->
			<div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
				<h3 class="text-lg font-semibold text-gray-900">Activity Feed</h3>
				{#if notifications.length > 0}
					<button
						onclick={clearAll}
						class="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
					>
						Clear all
					</button>
				{/if}
			</div>

			<!-- Notifications List -->
			<div class="max-h-96 overflow-y-auto">
				{#if notifications.length === 0}
					<div class="p-8 text-center text-gray-500">
						<svg
							class="w-16 h-16 mx-auto mb-4 text-gray-300"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
							></path>
						</svg>
						<p class="text-sm">No activity yet</p>
					</div>
				{:else}
					{#each notifications as notification (notification.id)}
						<div
							class="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors {notification.read
								? 'opacity-60'
								: ''}"
						>
							<div class="flex items-start gap-3">
								<!-- Icon -->
								<div
									class="flex-shrink-0 w-10 h-10 {getNotificationColor(
										notification.type
									)} rounded-full flex items-center justify-center text-lg"
								>
									{getNotificationIcon(notification.type)}
								</div>

								<!-- Content -->
								<div class="flex-1 min-w-0">
									<p class="text-sm text-gray-900 font-medium mb-1">
										{notification.message}
									</p>
									{#if 'data' in notification}
										<p class="text-xs text-gray-600">
											{#if notification.type === NotificationType.TASK_CREATED}
												<span class="font-medium">{notification.data.taskTitle}</span>
											{:else if notification.type === NotificationType.TASK_UPDATED}
												<span class="font-medium">{notification.data.taskTitle}</span>
											{:else if notification.type === NotificationType.TASK_DELETED}
												<span class="font-medium">{notification.data.taskTitle}</span>
											{/if}
										</p>
									{/if}
									<p class="text-xs text-gray-500 mt-1">
										{formatTime(notification.timestamp)}
									</p>
								</div>

								<!-- Remove button -->
								<button
									onclick={() => notificationStore.remove(notification.id)}
									class="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
									aria-label="Remove notification"
								>
									<svg
										class="w-4 h-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M6 18L18 6M6 6l12 12"
										></path>
									</svg>
								</button>
							</div>
						</div>
					{/each}
				{/if}
			</div>
		</div>
	{/if}
</div>

<!-- Click outside to close -->
{#if showFeed}
	<button
		onclick={() => (showFeed = false)}
		class="fixed inset-0 z-40"
		aria-label="Close activity feed"
	></button>
{/if}
