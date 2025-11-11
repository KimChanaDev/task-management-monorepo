<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { getContextClient } from '@urql/svelte';
	import { AUTH_QUERIES } from '$lib/graphql';
	import { resolve } from '$app/paths';
	const client = getContextClient();

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let isLoading = $state(false);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		error = '';
		isLoading = true;

		try {
			const result = await client.mutation(AUTH_QUERIES.LOGIN, {
				input: {
					email,
					password
				}
			});

			if (result.error?.graphQLErrors[0]?.message) {
				error = result.error.graphQLErrors[0].message;
				isLoading = false;
				return;
			}

			if (result.data?.login) {
				await invalidateAll();
				goto(resolve('/dashboard'));
			}
		} catch (err: any) {
			error = err.message || 'An error occurred during login';
		} finally {
			isLoading = false;
		}
	}
</script>

<div
	class="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-3 sm:px-4 md:px-6 py-8 sm:py-12"
>
	<div class="max-w-md w-full">
		<!-- Card with enhanced styling -->
		<div
			class="bg-white rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl p-6 sm:p-8 space-y-6 sm:space-y-8 border border-gray-100 backdrop-blur-sm"
		>
			<!-- Header with icon -->
			<div class="text-center space-y-2">
				<div class="flex justify-center mb-3 sm:mb-4">
					<div
						class="p-2.5 sm:p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl sm:rounded-2xl shadow-lg"
					>
						<a href={resolve('/')} aria-label="back home">
							<svg
								class="w-10 h-10 sm:w-12 sm:h-12 text-white"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
								></path>
							</svg>
						</a>
					</div>
				</div>
				<h1
					class="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
				>
					Welcome Back
				</h1>
				<p class="text-gray-500 text-xs sm:text-sm">Sign in to continue to your dashboard</p>
			</div>

			{#if error}
				<div
					class="animate-shake p-3 sm:p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg shadow-sm"
				>
					<div class="flex items-center space-x-2">
						<svg
							class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
							fill="currentColor"
							viewBox="0 0 20 20"
						>
							<path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
								clip-rule="evenodd"
							/>
						</svg>
						<span class="font-medium text-xs sm:text-sm">{error}</span>
					</div>
				</div>
			{/if}

			<form onsubmit={handleSubmit} class="space-y-5 sm:space-y-6">
				<div class="space-y-1">
					<label for="email" class="block text-xs sm:text-sm font-semibold text-gray-700">
						Email Address
					</label>
					<div class="relative">
						<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<svg
								class="h-4 w-4 sm:h-5 sm:w-5 text-gray-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
								/>
							</svg>
						</div>
						<input
							id="email"
							type="email"
							bind:value={email}
							required
							class="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
							placeholder="you@example.com"
						/>
					</div>
				</div>

				<div class="space-y-1">
					<label for="password" class="block text-xs sm:text-sm font-semibold text-gray-700">
						Password
					</label>
					<div class="relative">
						<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<svg
								class="h-4 w-4 sm:h-5 sm:w-5 text-gray-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
								/>
							</svg>
						</div>
						<input
							id="password"
							type="password"
							bind:value={password}
							required
							class="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
							placeholder="Enter your password"
						/>
					</div>
				</div>

				<button
					type="submit"
					disabled={isLoading}
					class="w-full py-2.5 sm:py-3 px-4 text-sm sm:text-base bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg sm:rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
				>
					{#if isLoading}
						<span class="flex items-center justify-center space-x-2">
							<svg
								class="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								></circle>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							<span class="text-sm sm:text-base">Signing in...</span>
						</span>
					{:else}
						Sign In
					{/if}
				</button>
			</form>

			<div class="relative">
				<div class="absolute inset-0 flex items-center">
					<div class="w-full border-t border-gray-200"></div>
				</div>
				<div class="relative flex justify-center text-xs sm:text-sm">
					<span class="px-3 sm:px-4 bg-white text-gray-500">New to TaskFlow?</span>
				</div>
			</div>

			<div class="text-center">
				<a
					href={resolve('/auth/register')}
					class="inline-flex items-center justify-center w-full py-2.5 sm:py-3 px-4 text-sm sm:text-base border-2 border-indigo-600 text-indigo-600 font-semibold rounded-lg sm:rounded-xl hover:bg-indigo-50 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
				>
					Create an account
				</a>
			</div>
		</div>

		<!-- Additional info -->
		<p class="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-500">
			Protected by industry-standard encryption
		</p>
	</div>
</div>
