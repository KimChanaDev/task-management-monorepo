export function ensureDataExisted(data: any, errorMessage: string) {
	if (!data) {
		throw new Error(errorMessage);
	}
}

export function toTitleCaseFromEnum(value: string): string {
	return value
		.toLowerCase() // "in_progress"
		.split('_') // ["in", "progress"]
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // ["In", "Progress"]
		.join(' '); // "In Progress"
}

export function formatDate(dateString: string) {
	return new Date(dateString).toLocaleString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
}
