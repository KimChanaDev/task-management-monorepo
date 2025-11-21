<script lang="ts">
	import { createCustomNotification, notificationStore } from '$lib/stores';
	import { exportToPDF, exportToCSV, exportToJSON, type ExportData } from '$lib/utils/export';
	import { format as formatDate } from 'date-fns';

	interface Props {
		data: ExportData;
		disabled?: boolean;
	}

	let { data, disabled = false }: Props = $props();

	let showMenu = $state(false);
	let isExporting = $state(false);

	function toggleMenu() {
		if (!disabled) {
			showMenu = !showMenu;
		}
	}

	function closeMenu() {
		showMenu = false;
	}

	async function handleExport(exportFormat: 'pdf' | 'csv' | 'json') {
		isExporting = true;
		showMenu = false;

		try {
			const timestamp = formatDate(new Date(), 'yyyy-MM-dd-HHmmss');

			switch (exportFormat) {
				case 'pdf':
					exportToPDF(data, `analytics-report-${timestamp}.pdf`);
					break;
				case 'csv':
					exportToCSV(data, `analytics-report-${timestamp}.csv`);
					break;
				case 'json':
					exportToJSON(data, `analytics-report-${timestamp}.json`);
					break;
			}
			notificationStore.add(
				createCustomNotification(`Your report has been exported as ${exportFormat.toUpperCase()}.`)
			);
		} catch (error) {
			console.error('Export failed:', error);
			alert('Failed to export report. Please try again.');
		} finally {
			isExporting = false;
		}
	}
</script>

<div class="relative inline-block text-left">
	<button
		type="button"
		onclick={toggleMenu}
		disabled={disabled || isExporting}
		class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
	>
		{#if isExporting}
			<svg
				class="animate-spin h-5 w-5"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
			>
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
				></circle>
				<path
					class="opacity-75"
					fill="currentColor"
					d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
				></path>
			</svg>
			Exporting...
		{:else}
			<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
				/>
			</svg>
			Export Report
			<svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
				<path
					fill-rule="evenodd"
					d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
					clip-rule="evenodd"
				/>
			</svg>
		{/if}
	</button>

	{#if showMenu}
		<!-- Backdrop -->
		<button class="fixed inset-0 z-10" onclick={closeMenu} aria-label="close menu"></button>

		<!-- Dropdown menu -->
		<div
			class="absolute right-0 z-20 mt-2 w-56 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100"
		>
			<div class="py-1">
				<button
					type="button"
					onclick={() => handleExport('pdf')}
					class="group flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left transition-colors"
				>
					<svg class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
						<path
							fill-rule="evenodd"
							d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
							clip-rule="evenodd"
						/>
					</svg>
					<div>
						<div class="font-medium">Export as PDF</div>
						<div class="text-xs text-gray-500">Formatted report</div>
					</div>
				</button>

				<button
					type="button"
					onclick={() => handleExport('csv')}
					class="group flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left transition-colors"
				>
					<svg class="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
						<path
							fill-rule="evenodd"
							d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
							clip-rule="evenodd"
						/>
					</svg>
					<div>
						<div class="font-medium">Export as CSV</div>
						<div class="text-xs text-gray-500">Spreadsheet format</div>
					</div>
				</button>

				<button
					type="button"
					onclick={() => handleExport('json')}
					class="group flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left transition-colors"
				>
					<svg class="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
						<path
							fill-rule="evenodd"
							d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
							clip-rule="evenodd"
						/>
					</svg>
					<div>
						<div class="font-medium">Export as JSON</div>
						<div class="text-xs text-gray-500">Raw data format</div>
					</div>
				</button>
			</div>
		</div>
	{/if}
</div>
