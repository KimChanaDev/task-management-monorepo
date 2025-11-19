<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Chart,
		LineController,
		LineElement,
		PointElement,
		LinearScale,
		CategoryScale,
		Title,
		Tooltip,
		Legend,
		Filler
	} from 'chart.js';

	// Register Chart.js components
	Chart.register(
		LineController,
		LineElement,
		PointElement,
		LinearScale,
		CategoryScale,
		Title,
		Tooltip,
		Legend,
		Filler
	);

	interface Props {
		title: string;
		labels: string[];
		datasets: {
			label: string;
			data: number[];
			borderColor?: string;
			backgroundColor?: string;
			fill?: boolean;
		}[];
		height?: number;
	}

	let { title, labels, datasets, height = 300 }: Props = $props();

	let canvas: HTMLCanvasElement;
	let chart: Chart | null = null;

	onMount(() => {
		if (canvas) {
			chart = new Chart(canvas, {
				type: 'line',
				data: {
					labels,
					datasets: datasets.map((dataset) => ({
						...dataset,
						borderColor: dataset.borderColor || '#3b82f6',
						backgroundColor: dataset.backgroundColor || 'rgba(59, 130, 246, 0.1)',
						tension: 0.4,
						fill: dataset.fill !== undefined ? dataset.fill : true
					}))
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					plugins: {
						legend: {
							display: true,
							position: 'bottom'
						},
						title: {
							display: false
						}
					},
					scales: {
						y: {
							beginAtZero: true,
							grid: {
								color: 'rgba(0, 0, 0, 0.05)'
							}
						},
						x: {
							grid: {
								display: false
							}
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
			chart.data.datasets = datasets.map((dataset) => ({
				...dataset,
				borderColor: dataset.borderColor || '#3b82f6',
				backgroundColor: dataset.backgroundColor || 'rgba(59, 130, 246, 0.1)',
				tension: 0.4,
				fill: dataset.fill !== undefined ? dataset.fill : true
			}));
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
