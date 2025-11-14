<script lang="ts">
	import { recentNotifications } from '$stores';
	import { ToastNotification } from '$components';
</script>

<!-- Toast Container - Fixed position at top-right -->
<div class="toast-container fixed top-4 right-4 z-50 space-y-3 pointer-events-none">
	{#each $recentNotifications as notification (notification.id)}
		<div class="pointer-events-auto">
			<ToastNotification {notification} />
		</div>
	{/each}
</div>

<style>
	.toast-container {
		max-width: calc(100vw - 2rem);
	}

	@media (max-width: 640px) {
		.toast-container {
			right: 1rem;
			left: 1rem;
			top: 1rem;
		}
	}
</style>
