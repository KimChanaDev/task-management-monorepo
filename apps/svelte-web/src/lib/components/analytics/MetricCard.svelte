<script lang="ts">
	interface Props {
		title: string;
		value: string | number;
		subtitle?: string;
		trend?: 'up' | 'down' | 'neutral';
		trendValue?: string;
		icon?: string;
	}

	let { title, value, subtitle, trend, trendValue, icon }: Props = $props();
</script>

<div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
	<div class="flex items-start justify-between">
		<div class="flex-1">
			<p class="text-sm font-medium text-gray-600 mb-1">{title}</p>
			<p class="text-3xl font-bold text-gray-900">{value}</p>
			{#if subtitle}
				<p class="text-sm text-gray-500 mt-1">{subtitle}</p>
			{/if}
		</div>
		{#if icon}
			<div class="text-3xl">{icon}</div>
		{/if}
	</div>
	{#if trend && trendValue}
		<div class="mt-4 flex items-center">
			{#if trend === 'up'}
				<span class="text-green-600 text-sm font-medium flex items-center">
					<svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
						<path
							fill-rule="evenodd"
							d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
							clip-rule="evenodd"
						/>
					</svg>
					{trendValue}
				</span>
			{:else if trend === 'down'}
				<span class="text-red-600 text-sm font-medium flex items-center">
					<svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
						<path
							fill-rule="evenodd"
							d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
							clip-rule="evenodd"
						/>
					</svg>
					{trendValue}
				</span>
			{:else}
				<span class="text-gray-600 text-sm font-medium">{trendValue}</span>
			{/if}
		</div>
	{/if}
</div>
