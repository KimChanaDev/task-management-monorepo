<script lang="ts">
	import { onMount } from 'svelte';
	import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';

	// Register Chart.js components
	Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

	interface Props {
		title: string;
		labels: string[];
		data: number[];
		backgroundColors?: string[];
		height?: number;
	}

	let {
		title,
		labels,
		data,
		backgroundColors = [
			'rgba(59, 130, 246, 0.8)',
			'rgba(16, 185, 129, 0.8)',
			'rgba(251, 191, 36, 0.8)',
			'rgba(239, 68, 68, 0.8)',
			'rgba(139, 92, 246, 0.8)'
		],
		height = 300
	}: Props = $props();

	let canvas: HTMLCanvasElement;
	let chart: Chart | null = null;

	onMount(() => {
		if (canvas) {
			chart = new Chart(canvas, {
				type: 'doughnut',
				data: {
					labels,
					datasets: [
						{
							data,
							backgroundColor: backgroundColors,
							borderWidth: 2,
							borderColor: '#fff'
						}
					]
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					plugins: {
						legend: {
							display: true,
							position: 'bottom'
						}
					}
				}
			});
		}

		return () => {
			if (chart) {
				chart.destroy();
			}
		};
	});

	// Update chart when data changes
	$effect(() => {
		if (chart) {
			chart.data.labels = labels;
			chart.data.datasets[0].data = data;
			chart.data.datasets[0].backgroundColor = backgroundColors;
			chart.update();
		}
	});
</script>

<div class="bg-white rounded-lg shadow-md p-6">
	<h3 class="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
	<div style="height: {height}px;">
		<canvas bind:this={canvas}></canvas>
	</div>
</div>
