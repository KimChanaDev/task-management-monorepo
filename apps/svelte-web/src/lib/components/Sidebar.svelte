<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { getContextClient } from '@urql/svelte';
	import { resolve } from '$app/paths';
	import { createAuthAPI } from '$lib/api';

	const client = getContextClient();
	const authAPI = createAuthAPI(client);

	interface ComponentProps {
		user: {
			username: string;
			email: string;
		} | null;
		sidebarOpen: boolean;
	}

	let { user, sidebarOpen = $bindable() }: ComponentProps = $props();

	async function logout() {
		try {
			await authAPI.logout();
		} catch (error) {
			console.error('Logout error:', error);
		}
		await invalidateAll(); // Invalidate all data to trigger re-fetch
		goto(resolve('/auth/login'));
	}
</script>

<!-- Overlay for mobile -->
{#if sidebarOpen}
	<div
		class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity"
		onclick={() => {
			sidebarOpen = false;
		}}
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				sidebarOpen = false;
			}
		}}
		role="button"
		tabindex="-1"
		aria-label="Close sidebar"
	></div>
{/if}

<aside
	id="sidebar"
	class="fixed inset-y-0 left-0 z-50 w-64 sm:w-72 lg:w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out {sidebarOpen
		? 'translate-x-0'
		: '-translate-x-full'} lg:translate-x-0"
>
	<div class="flex flex-col h-full">
		<!-- Logo -->
		<div
			class="flex items-center justify-between h-14 sm:h-16 px-4 sm:px-6 border-b border-gray-200"
		>
			<h1 class="text-lg sm:text-xl font-bold text-indigo-600">TaskFlow</h1>
			<button
				aria-label="Close sidebar"
				onclick={() => (sidebarOpen = !sidebarOpen)}
				class="lg:hidden text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
			>
				<svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
		</div>

		<!-- Navigation -->
		<nav class="flex-1 px-3 sm:px-4 py-4 sm:py-6 space-y-1 sm:space-y-2 overflow-y-auto">
			<a
				href={resolve('/dashboard')}
				onclick={() => (sidebarOpen = false)}
				class="flex items-center px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-700 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
			>
				<svg
					class="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
					/>
				</svg>
				<span class="truncate">Dashboard</span>
			</a>

			<a
				href={resolve('/dashboard/tasks')}
				onclick={() => (sidebarOpen = false)}
				class="flex items-center px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-700 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
			>
				<svg
					class="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
					/>
				</svg>
				<span class="truncate">Tasks</span>
			</a>

			<a
				href={resolve('/dashboard/create')}
				onclick={() => (sidebarOpen = false)}
				class="flex items-center px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-700 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
			>
				<svg
					class="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 4v16m8-8H4"
					/>
				</svg>
				<span class="truncate">Create Task</span>
			</a>

			<a
				href={resolve('/dashboard/analytics')}
				onclick={() => (sidebarOpen = false)}
				class="flex items-center px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-700 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
			>
				<svg
					class="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
					/>
				</svg>
				<span class="truncate">Analytics</span>
			</a>
		</nav>

		<!-- User Profile -->
		{#if user}
			<div class="p-3 sm:p-4 border-t border-gray-200">
				<div class="flex items-center">
					<div class="flex-shrink-0">
						<div
							class="w-9 h-9 sm:w-10 sm:h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base"
						>
							{user.username?.charAt(0).toUpperCase() || 'U'}
						</div>
					</div>
					<div class="ml-2 sm:ml-3 flex-1 min-w-0">
						<p class="text-xs sm:text-sm font-medium text-gray-900 truncate">{user.username}</p>
						<p class="text-xs text-gray-500 truncate">{user.email}</p>
					</div>
					<button
						onclick={logout}
						class="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
						title="Logout"
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
								d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
							/>
						</svg>
					</button>
				</div>
			</div>
		{/if}
	</div>
</aside>
