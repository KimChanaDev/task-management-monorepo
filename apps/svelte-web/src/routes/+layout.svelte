<script lang="ts">
	import '../app.css';
	import { createClient, cacheExchange, fetchExchange, setContextClient } from '@urql/svelte';
	import { PUBLIC_GRAPHQL_GATWAY_URL } from '$env/static/public';
	import { authExchange } from '$lib/urql/auth-exchange';

	// GraphQL client setup with auth exchange for automatic token refresh
	const client = createClient({
		url: `${PUBLIC_GRAPHQL_GATWAY_URL}/graphql`,
		exchanges: [cacheExchange, authExchange, fetchExchange],
		fetchOptions: {
			credentials: 'include' // Include cookies in requests
		},
		requestPolicy: 'network-only' // Always fetch fresh data
	});

	setContextClient(client);

	let { children } = $props();
</script>

<svelte:head>
	<title>Task Management Platform</title>
	<meta name="description" content="Real-time task management with collaboration" />
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<main>
		{@render children()}
	</main>
</div>
