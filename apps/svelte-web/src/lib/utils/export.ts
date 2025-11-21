import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import { format } from 'date-fns';

export interface ExportData {
	summary?: {
		productivityScore: number;
		tasksCompleted: number;
		tasksCreated: number;
		completionRate: number;
	};
	productivityTrends?: Array<{
		date: string;
		productivityScore: number;
		tasksCompleted: number;
	}>;
	taskMetrics?: Array<{
		date: string;
		completionRate: number;
		tasksCreated: number;
		tasksCompleted: number;
	}>;
	priorityDistribution?: {
		low: number;
		medium: number;
		high: number;
		urgent: number;
	};
	statusDistribution?: {
		todo: number;
		inProgress: number;
		review: number;
		completed: number;
		cancelled: number;
	};
}

/**
 * Export analytics data as PDF
 */
export function exportToPDF(data: ExportData, fileName: string = 'analytics-report.pdf'): void {
	const doc = new jsPDF();
	const pageWidth = doc.internal.pageSize.getWidth();
	let yPosition = 20;

	// Title
	doc.setFontSize(20);
	doc.setTextColor(31, 41, 55); // gray-800
	doc.text('Analytics Report', pageWidth / 2, yPosition, { align: 'center' });
	yPosition += 10;

	// Date range
	doc.setFontSize(10);
	doc.setTextColor(107, 114, 128); // gray-500
	doc.text(`Generated on: ${format(new Date(), 'MMMM dd, yyyy HH:mm')}`, pageWidth / 2, yPosition, {
		align: 'center'
	});
	yPosition += 15;

	// Summary Section
	if (data.summary) {
		doc.setFontSize(14);
		doc.setTextColor(31, 41, 55);
		doc.text('Summary Metrics', 14, yPosition);
		yPosition += 7;

		const summaryData = [
			['Productivity Score', data.summary.productivityScore.toFixed(1)],
			['Tasks Completed', data.summary.tasksCompleted.toString()],
			['Tasks Created', data.summary.tasksCreated.toString()],
			['Completion Rate', `${data.summary.completionRate.toFixed(1)}%`]
		];

		autoTable(doc, {
			startY: yPosition,
			head: [['Metric', 'Value']],
			body: summaryData,
			theme: 'grid',
			headStyles: { fillColor: [59, 130, 246] }, // blue-600
			styles: { fontSize: 10 }
		});

		yPosition = (doc as any).lastAutoTable.finalY + 15;
	}

	// Priority Distribution
	if (data.priorityDistribution) {
		doc.setFontSize(14);
		doc.setTextColor(31, 41, 55);
		doc.text('Priority Distribution', 14, yPosition);
		yPosition += 7;

		const priorityData = [
			['Low', data.priorityDistribution.low.toString()],
			['Medium', data.priorityDistribution.medium.toString()],
			['High', data.priorityDistribution.high.toString()],
			['Urgent', data.priorityDistribution.urgent.toString()]
		];

		autoTable(doc, {
			startY: yPosition,
			head: [['Priority', 'Count']],
			body: priorityData,
			theme: 'grid',
			headStyles: { fillColor: [59, 130, 246] },
			styles: { fontSize: 10 }
		});

		yPosition = (doc as any).lastAutoTable.finalY + 15;
	}

	// Status Distribution
	if (data.statusDistribution) {
		if (yPosition > 250) {
			doc.addPage();
			yPosition = 20;
		}

		doc.setFontSize(14);
		doc.setTextColor(31, 41, 55);
		doc.text('Status Distribution', 14, yPosition);
		yPosition += 7;

		const statusData = [
			['Todo', data.statusDistribution.todo.toString()],
			['In Progress', data.statusDistribution.inProgress.toString()],
			['Review', data.statusDistribution.review.toString()],
			['Completed', data.statusDistribution.completed.toString()],
			['Cancelled', data.statusDistribution.cancelled.toString()]
		];

		autoTable(doc, {
			startY: yPosition,
			head: [['Status', 'Count']],
			body: statusData,
			theme: 'grid',
			headStyles: { fillColor: [59, 130, 246] },
			styles: { fontSize: 10 }
		});

		yPosition = (doc as any).lastAutoTable.finalY + 15;
	}

	// Productivity Trends
	if (data.productivityTrends && data.productivityTrends.length > 0) {
		doc.addPage();
		yPosition = 20;

		doc.setFontSize(14);
		doc.setTextColor(31, 41, 55);
		doc.text('Productivity Trends (Last 10 Days)', 14, yPosition);
		yPosition += 7;

		const trendData = data.productivityTrends
			.slice(-10)
			.map((item) => [
				format(new Date(item.date), 'MMM dd'),
				item.productivityScore.toFixed(1),
				item.tasksCompleted.toString()
			]);

		autoTable(doc, {
			startY: yPosition,
			head: [['Date', 'Productivity Score', 'Tasks Completed']],
			body: trendData,
			theme: 'grid',
			headStyles: { fillColor: [59, 130, 246] },
			styles: { fontSize: 9 }
		});
	}

	// Footer
	const totalPages = (doc as any).internal.getNumberOfPages();
	for (let i = 1; i <= totalPages; i++) {
		doc.setPage(i);
		doc.setFontSize(8);
		doc.setTextColor(107, 114, 128);
		doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, {
			align: 'center'
		});
	}

	// Save the PDF
	doc.save(fileName);
}

/**
 * Export analytics data as CSV
 */
export function exportToCSV(data: ExportData, fileName: string = 'analytics-report.csv'): void {
	const csvData: any[] = [];

	// Add header
	csvData.push(['Analytics Report']);
	csvData.push([`Generated on: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`]);
	csvData.push([]);

	// Summary Section
	if (data.summary) {
		csvData.push(['Summary Metrics']);
		csvData.push(['Metric', 'Value']);
		csvData.push(['Productivity Score', data.summary.productivityScore.toFixed(1)]);
		csvData.push(['Tasks Completed', data.summary.tasksCompleted]);
		csvData.push(['Tasks Created', data.summary.tasksCreated]);
		csvData.push(['Completion Rate', `${data.summary.completionRate.toFixed(1)}%`]);
		csvData.push([]);
	}

	// Priority Distribution
	if (data.priorityDistribution) {
		csvData.push(['Priority Distribution']);
		csvData.push(['Priority', 'Count']);
		csvData.push(['Low', data.priorityDistribution.low]);
		csvData.push(['Medium', data.priorityDistribution.medium]);
		csvData.push(['High', data.priorityDistribution.high]);
		csvData.push(['Urgent', data.priorityDistribution.urgent]);
		csvData.push([]);
	}

	// Status Distribution
	if (data.statusDistribution) {
		csvData.push(['Status Distribution']);
		csvData.push(['Status', 'Count']);
		csvData.push(['Todo', data.statusDistribution.todo]);
		csvData.push(['In Progress', data.statusDistribution.inProgress]);
		csvData.push(['Review', data.statusDistribution.review]);
		csvData.push(['Completed', data.statusDistribution.completed]);
		csvData.push(['Cancelled', data.statusDistribution.cancelled]);
		csvData.push([]);
	}

	// Productivity Trends
	if (data.productivityTrends && data.productivityTrends.length > 0) {
		csvData.push(['Productivity Trends']);
		csvData.push(['Date', 'Productivity Score', 'Tasks Completed']);
		data.productivityTrends.forEach((item) => {
			csvData.push([
				format(new Date(item.date), 'yyyy-MM-dd'),
				item.productivityScore.toFixed(1),
				item.tasksCompleted
			]);
		});
		csvData.push([]);
	}

	// Task Metrics
	if (data.taskMetrics && data.taskMetrics.length > 0) {
		csvData.push(['Task Metrics']);
		csvData.push(['Date', 'Completion Rate (%)', 'Tasks Created', 'Tasks Completed']);
		data.taskMetrics.forEach((item) => {
			csvData.push([
				format(new Date(item.date), 'yyyy-MM-dd'),
				item.completionRate.toFixed(1),
				item.tasksCreated,
				item.tasksCompleted
			]);
		});
	}

	// Convert to CSV string
	const csv = Papa.unparse(csvData);

	// Create blob and download
	const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
	const link = document.createElement('a');
	const url = URL.createObjectURL(blob);

	link.setAttribute('href', url);
	link.setAttribute('download', fileName);
	link.style.visibility = 'hidden';
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

/**
 * Export raw data as JSON
 */
export function exportToJSON(data: ExportData, fileName: string = 'analytics-report.json'): void {
	const jsonData = {
		generatedAt: new Date().toISOString(),
		...data
	};

	const dataStr = JSON.stringify(jsonData, null, 2);
	const blob = new Blob([dataStr], { type: 'application/json' });
	const link = document.createElement('a');
	const url = URL.createObjectURL(blob);

	link.setAttribute('href', url);
	link.setAttribute('download', fileName);
	link.style.visibility = 'hidden';
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}
