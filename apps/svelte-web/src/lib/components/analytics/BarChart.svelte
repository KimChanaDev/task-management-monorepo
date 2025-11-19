<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Chart,
		BarController,
		BarElement,
		LinearScale,
		CategoryScale,
		Title,
		Tooltip,
		Legend
	} from 'chart.js';

	// Register Chart.js components
	Chart.register(BarController, BarElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

	interface Props {
		title: string;
		labels: string[];
		datasets: {
			label: string;
			data: number[];
			backgroundColor?: string | string[];
			borderColor?: string | string[];
			borderWidth?: number;
		}[];
		height?: number;
		horizontal?: boolean;
	}

	let { title, labels, datasets, height = 300, horizontal = false }: Props = $props();

	let canvas: HTMLCanvasElement;
	let chart: Chart | null = null;

	onMount(() => {
		if (canvas) {
			chart = new Chart(canvas, {
				type: 'bar',
				data: {
					labels,
					datasets: datasets.map((dataset) => ({
						...dataset,
						backgroundColor: dataset.backgroundColor || 'rgba(59, 130, 246, 0.8)',
						borderColor: dataset.borderColor || 'rgba(59, 130, 246, 1)',
						borderWidth: dataset.borderWidth || 1
					}))
				},
				options: {
					indexAxis: horizontal ? 'y' : 'x',
					responsive: true,
					maintainAspectRatio: false,
					plugins: {
						legend: {
							display: true,
							position: 'bottom'
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
				backgroundColor: dataset.backgroundColor || 'rgba(59, 130, 246, 0.8)',
				borderColor: dataset.borderColor || 'rgba(59, 130, 246, 1)',
				borderWidth: dataset.borderWidth || 1
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
