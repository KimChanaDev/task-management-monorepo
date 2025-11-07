<script lang="ts">
	import type { Snippet } from 'svelte';

	interface ComponentProps {
		sidebarOpen: boolean;
	}

	let { sidebarOpen = $bindable() }: ComponentProps = $props();
</script>

<header class="bg-white shadow-sm">
	<div class="flex items-center justify-between px-6 py-4">
		<button
			aria-label="logo button"
			onclick={() => (sidebarOpen = !sidebarOpen)}
			class="lg:hidden text-gray-500 hover:text-gray-700"
		>
			<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M4 6h16M4 12h16M4 18h16"
				/>
			</svg>
		</button>

		<h2 class="text-2xl font-semibold text-gray-800">Dashboard</h2>

		<div class="flex items-center space-x-4">
			<button class="relative text-gray-500 hover:text-gray-700" aria-label="logo button">
				<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
					/>
				</svg>
				<span class="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
			</button>
		</div>
	</div>
</header>
