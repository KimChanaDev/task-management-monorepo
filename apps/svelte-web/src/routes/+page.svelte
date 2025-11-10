<script lang="ts">
	import { getContextClient } from '@urql/svelte';
	import { USER_QUERIES } from '$lib/graphql';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	const client = getContextClient();
	let isChecking = $state(true);

	onMount(async () => {
		// Check if user is already logged in
		try {
			const result = await client.query(USER_QUERIES.GET_ME, {});
			if (result.data?.me) {
				// User is logged in, redirect to dashboard
				goto('/dashboard');
			}
		} catch (error) {
			// User not logged in, stay on landing page
		} finally {
			isChecking = false;
		}
	});
</script>

{#if isChecking}
	<div
		class="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center"
	>
		<div class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
	</div>
{:else}
	<div class="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
		<!-- Hero Section -->
		<div class="container mx-auto px-3 sm:px-4 md:px-6 py-12 sm:py-16 md:py-20">
			<div class="text-center max-w-4xl mx-auto">
				<div
					class="inline-block mb-4 sm:mb-6 px-3 py-1.5 sm:px-4 sm:py-2 bg-indigo-100 text-indigo-800 rounded-full text-xs sm:text-sm font-semibold"
				>
					✨ Modern Task Management Platform
				</div>

				<h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6">
					<span
						class="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
					>
						Manage Tasks
					</span>
					<br />
					<span class="text-gray-900">Like Never Before</span>
				</h1>

				<p
					class="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-8 sm:mb-12 leading-relaxed px-2"
				>
					Real-time collaboration for teams. Built with cutting-edge microservices architecture for
					maximum performance and scalability.
				</p>

				<div
					class="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center px-4 sm:px-0"
				>
					<a
						href="/auth/register"
						class="group relative inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 font-bold text-white transition-all duration-200 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base"
					>
						<span class="flex items-center space-x-2">
							<span>Get Started Free</span>
							<svg
								class="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M13 7l5 5m0 0l-5 5m5-5H6"
								/>
							</svg>
						</span>
					</a>
					<a
						href="/auth/login"
						class="inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 font-bold text-indigo-600 transition-all duration-200 bg-white border-2 border-indigo-600 rounded-xl hover:bg-indigo-50 shadow-md hover:shadow-lg transform hover:scale-105 text-sm sm:text-base"
					>
						Login
					</a>
				</div>

				<div
					class="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-8 text-xs sm:text-sm text-gray-500"
				>
					<div class="flex items-center space-x-2">
						<svg
							class="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0"
							fill="currentColor"
							viewBox="0 0 20 20"
						>
							<path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
								clip-rule="evenodd"
							/>
						</svg>
						<span>No credit card required</span>
					</div>
					<div class="flex items-center space-x-2">
						<svg
							class="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0"
							fill="currentColor"
							viewBox="0 0 20 20"
						>
							<path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
								clip-rule="evenodd"
							/>
						</svg>
						<span>Free forever</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Features Section -->
		<div class="container mx-auto px-3 sm:px-4 md:px-6 py-12 sm:py-16">
			<div class="text-center mb-10 sm:mb-16">
				<h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Powerful Features</h2>
				<p class="text-lg sm:text-xl text-gray-600 px-4">
					Everything you need to manage tasks effectively
				</p>
			</div>

			<div
				class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto"
			>
				<!-- Feature 1 -->
				<div
					class="group bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
				>
					<div
						class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform shadow-lg"
					>
						<svg
							class="w-6 h-6 sm:w-8 sm:h-8 text-white"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 10V3L4 14h7v7l9-11h-7z"
							/>
						</svg>
					</div>
					<h3 class="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-gray-900">
						Real-time Updates
					</h3>
					<p class="text-sm sm:text-base text-gray-600 leading-relaxed">
						See changes instantly across all devices with WebSocket-powered live updates. Stay
						synchronized with your team.
					</p>
				</div>

				<!-- Feature 2 -->
				<div
					class="group bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
				>
					<div
						class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform shadow-lg"
					>
						<svg
							class="w-6 h-6 sm:w-8 sm:h-8 text-white"
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
					<h3 class="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-gray-900">
						Secure Authentication
					</h3>
					<p class="text-sm sm:text-base text-gray-600 leading-relaxed">
						Enterprise-grade security with JWT-based authentication and automatic token rotation.
						Your data is always protected.
					</p>
				</div>

				<!-- Feature 3 -->
				<div
					class="group bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
				>
					<div
						class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform shadow-lg"
					>
						<svg
							class="w-6 h-6 sm:w-8 sm:h-8 text-white"
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
					</div>
					<h3 class="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-gray-900">
						Analytics Dashboard
					</h3>
					<p class="text-sm sm:text-base text-gray-600 leading-relaxed">
						Track productivity with comprehensive metrics and insights. Make data-driven decisions
						for your team.
					</p>
				</div>

				<!-- Feature 4 -->
				<div
					class="group bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
				>
					<div
						class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform shadow-lg"
					>
						<svg
							class="w-6 h-6 sm:w-8 sm:h-8 text-white"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
							/>
						</svg>
					</div>
					<h3 class="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-gray-900">
						Team Collaboration
					</h3>
					<p class="text-sm sm:text-base text-gray-600 leading-relaxed">
						Work together seamlessly with your team. Assign tasks, share updates, and achieve goals
						faster.
					</p>
				</div>

				<!-- Feature 5 -->
				<div
					class="group bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
				>
					<div
						class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform shadow-lg"
					>
						<svg
							class="w-6 h-6 sm:w-8 sm:h-8 text-white"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
							/>
						</svg>
					</div>
					<h3 class="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-gray-900">
						Smart Notifications
					</h3>
					<p class="text-sm sm:text-base text-gray-600 leading-relaxed">
						Stay informed with intelligent notifications. Never miss important updates or deadlines.
					</p>
				</div>

				<!-- Feature 6 -->
				<div
					class="group bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
				>
					<div
						class="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform shadow-lg"
					>
						<svg
							class="w-6 h-6 sm:w-8 sm:h-8 text-white"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
							/>
						</svg>
					</div>
					<h3 class="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-gray-900">Custom Workflows</h3>
					<p class="text-sm sm:text-base text-gray-600 leading-relaxed">
						Create workflows that match your process. Flexible and adaptable to your team's unique
						needs.
					</p>
				</div>
			</div>
		</div>

		<!-- CTA Section -->
		<div class="container mx-auto px-3 sm:px-4 md:px-6 py-12 sm:py-16 md:py-20">
			<div
				class="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-12 text-center"
			>
				<h2 class="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
					Ready to Get Started?
				</h2>
				<p
					class="text-base sm:text-lg md:text-xl text-indigo-100 mb-6 sm:mb-8 max-w-2xl mx-auto px-2"
				>
					Join thousands of teams who are already managing their tasks more effectively with
					TaskFlow.
				</p>
				<a
					href="/auth/register"
					class="inline-flex items-center justify-center px-8 py-3 sm:px-10 sm:py-4 font-bold text-indigo-600 bg-white rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base"
				>
					<span>Start Free Today</span>
					<svg
						class="w-4 h-4 sm:w-5 sm:h-5 ml-2"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 7l5 5m0 0l-5 5m5-5H6"
						/>
					</svg>
				</a>
			</div>
		</div>
	</div>
{/if}
