<script lang="ts">
	import '../app.css';
	import { createClient, cacheExchange, fetchExchange, setContextClient } from '@urql/svelte';
	import { PUBLIC_GRAPHQL_GATWAY_URL } from '$env/static/public';

	// GraphQL client setup
	const client = createClient({
		url: `${PUBLIC_GRAPHQL_GATWAY_URL}/graphql`,
		exchanges: [cacheExchange, fetchExchange],
		fetchOptions: {
			credentials: 'include' // Include cookies in requests
		}
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
