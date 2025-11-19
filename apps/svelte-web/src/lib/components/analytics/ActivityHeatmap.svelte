<script lang="ts">
	interface HeatmapData {
		date: string;
		hour: number;
		activityCount: number;
	}

	interface Props {
		title: string;
		data: HeatmapData[];
		peakHour: number;
	}

	let { title, data, peakHour }: Props = $props();

	// Process data into a 7x24 grid (7 days, 24 hours)
	const processedData = $derived(() => {
		const grid: { [key: string]: number } = {};

		data.forEach((item) => {
			const key = `${item.date}-${item.hour}`;
			grid[key] = item.activityCount;
		});
		return grid;
	});
	// Get unique dates and sort them
	const dates = $derived(() => {
		const uniqueDates = [...new Set(data.map((d) => d.date))].sort();
		return uniqueDates.slice(-7); // Last 7 days
	});

	// Hours array
	const hours = Array.from({ length: 24 }, (_, i) => i);

	// Get max activity for color scaling
	const maxActivity = $derived(() => {
		return Math.max(...data.map((d) => d.activityCount), 1);
	});

	// Get color intensity based on activity count
	function getColorIntensity(count: number): string {
		if (count === 0) return 'bg-gray-100';
		const intensity = Math.min((count / maxActivity()) * 100, 100);
		if (intensity < 20) return 'bg-blue-200';
		if (intensity < 40) return 'bg-blue-300';
		if (intensity < 60) return 'bg-blue-400';
		if (intensity < 80) return 'bg-blue-500';
		return 'bg-blue-600';
	}

	// Format date for display
	function formatDate(dateStr: string): string {
		const date = new Date(dateStr);
		return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
	}

	// Format hour
	function formatHour(hour: number): string {
		return `${hour.toString().padStart(2, '0')}:00`;
	}
</script>

<div class="bg-white rounded-lg shadow-md p-6">
	<div class="flex items-center justify-between mb-4">
		<h3 class="text-lg font-semibold text-gray-900">{title}</h3>
		<span class="text-sm text-gray-600">Peak Hour: {formatHour(peakHour)}</span>
	</div>

	<div class="overflow-x-auto">
		<div class="inline-block min-w-full">
			<div class="flex mb-2">
				<div class="w-24"></div>
				<div class="flex-1 flex gap-1">
					{#each hours.filter((_, i) => i % 3 === 0) as hour (hour)}
						<div class="flex-1 text-xs text-gray-500 text-center">
							{formatHour(hour)}
						</div>
					{/each}
				</div>
			</div>

			{#each dates() as date (date)}
				<div class="flex gap-1 mb-1">
					<div class="w-24 text-xs text-gray-600 flex items-center">
						{formatDate(date)}
					</div>
					<div class="flex-1 flex gap-1">
						{#each hours as hour (`${date}-${hour}`)}
							{@const key = `${date}-${hour}`}
							{@const count = processedData()[key] || 0}
							<div
								class="flex-1 h-8 rounded {getColorIntensity(
									count
								)} transition-colors hover:opacity-80 cursor-pointer"
								title="{formatDate(date)} at {formatHour(hour)}: {count} activities"
							></div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>

	<div class="mt-4 flex items-center justify-center gap-2">
		<span class="text-xs text-gray-600">Less</span>
		<div class="flex gap-1">
			<div class="w-4 h-4 rounded bg-gray-100"></div>
			<div class="w-4 h-4 rounded bg-blue-200"></div>
			<div class="w-4 h-4 rounded bg-blue-300"></div>
			<div class="w-4 h-4 rounded bg-blue-400"></div>
			<div class="w-4 h-4 rounded bg-blue-500"></div>
			<div class="w-4 h-4 rounded bg-blue-600"></div>
		</div>
		<span class="text-xs text-gray-600">More</span>
	</div>
</div>
