import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ parent, params }) => {
	const { taskId } = params;
	if (taskId) {
		return { taskId };
	}

	error(404, 'taskId not found');
};
