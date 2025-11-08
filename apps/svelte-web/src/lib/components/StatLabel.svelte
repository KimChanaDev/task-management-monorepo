<script lang="ts">
	interface ComponentProps {
		d: string;
		head: string;
		value: number | string;
		color: string;
	}
	let { d, head, value, color }: ComponentProps = $props();
</script>

<div class="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
	<div class="flex items-center justify-between">
		<div>
			<p class="text-sm font-medium text-gray-600">{head}</p>
			<p class="text-3xl font-bold text-{color}-600 mt-2">{value}</p>
		</div>
		<div class="w-12 h-12 bg-{color}-100 rounded-lg flex items-center justify-center">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				class="w-6 h-6 text-{color}-600"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" {d} />
			</svg>
		</div>
	</div>
</div>
