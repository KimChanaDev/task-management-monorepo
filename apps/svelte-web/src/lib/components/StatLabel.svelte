<script lang="ts">
	interface ComponentProps {
		d: string;
		head: string;
		value: number | string;
		color: string;
	}
	let { d, head, value, color }: ComponentProps = $props();

	const colorClasses: Record<string, { text: string; bg: string }> = {
		indigo: { text: 'text-indigo-600', bg: 'bg-indigo-100' },
		gray: { text: 'text-gray-600', bg: 'bg-gray-100' },
		blue: { text: 'text-blue-600', bg: 'bg-blue-100' },
		green: { text: 'text-green-600', bg: 'bg-green-100' },
		yellow: { text: 'text-yellow-600', bg: 'bg-yellow-100' },
		red: { text: 'text-red-600', bg: 'bg-red-100' },
		purple: { text: 'text-purple-600', bg: 'bg-purple-100' },
		pink: { text: 'text-pink-600', bg: 'bg-pink-100' }
	};

	const currentColor = $derived(colorClasses[color] || colorClasses.indigo);
</script>

<div class="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
	<div class="flex items-center justify-between">
		<div class="min-w-0 flex-1">
			<p class="text-xs sm:text-sm font-medium text-gray-600 truncate">{head}</p>
			<p class="text-2xl sm:text-3xl font-bold {currentColor.text} mt-1 sm:mt-2">{value}</p>
		</div>
		<div
			class="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0 ml-2 sm:ml-3"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				class="w-5 h-5 sm:w-6 sm:h-6 {currentColor.text}"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" {d} />
			</svg>
		</div>
	</div>
</div>
