<script lang="ts">
	import type { LayoutData } from './$types';
	import { Sidebar, DashboardTopbar } from '$components';
	import type { Snippet } from 'svelte';

	interface ComponentProps {
		data: LayoutData;
		children: Snippet;
	}

	let { data, children }: ComponentProps = $props();
	let sidebarOpen = $state(true);

	let user = $derived(data.user);
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Sidebar -->
	<Sidebar {user} bind:sidebarOpen />

	<!-- Main Content -->
	<div class="lg:pl-64">
		<DashboardTopbar bind:sidebarOpen />
		<!-- Page Content -->
		<main class="p-6">
			{@render children()}
		</main>
	</div>
</div>
