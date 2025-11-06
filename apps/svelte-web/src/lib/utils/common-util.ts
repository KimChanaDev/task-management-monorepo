export function ensureDataExisted(data: any, errorMessage: string) {
	if (!data) {
		throw new Error(errorMessage);
	}
}
