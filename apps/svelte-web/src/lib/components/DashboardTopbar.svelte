<script lang="ts">
	import { ActivityFeed } from '$components';

	interface ComponentProps {
		sidebarOpen: boolean;
	}

	let { sidebarOpen = $bindable() }: ComponentProps = $props();
</script>

<header class="bg-white shadow-sm sticky top-0 z-30">
	<div class="flex items-center justify-between px-3 sm:px-4 md:px-6 py-3 sm:py-4">
		<div class="flex items-center gap-2 sm:gap-3">
			<button
				aria-label="Toggle sidebar"
				onclick={() => {
					sidebarOpen = !sidebarOpen;
				}}
				class="lg:hidden text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
			>
				<svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 12h16M4 18h16"
					/>
				</svg>
			</button>

			<h2 class="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">Dashboard</h2>
		</div>

		<div class="flex items-center space-x-2 sm:space-x-4">
			<!-- Activity Feed with Live Notifications -->
			<ActivityFeed />
		</div>
	</div>
</header>
