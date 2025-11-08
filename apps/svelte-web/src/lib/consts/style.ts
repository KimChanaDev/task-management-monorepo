import { TASK_PRIORITY } from './task-priority.enum';
import { TASK_STATUS } from './task-status.enum';

export class StyleConsts {
	public static getPriorityColor(priority: string) {
		switch (priority) {
			case TASK_PRIORITY.URGENT:
				return 'text-purple-600 bg-purple-50 border-purple-200';
			case TASK_PRIORITY.HIGH:
				return 'text-red-600 bg-red-50 border-red-200';
			case TASK_PRIORITY.MEDIUM:
				return 'text-yellow-600 bg-yellow-50 border-yellow-200';
			case TASK_PRIORITY.LOW:
				return 'text-green-600 bg-green-50 border-green-200';
			default:
				return 'text-gray-600 bg-gray-50 border-gray-200';
		}
	}
	public static getStatusColor(status: string) {
		switch (status) {
			case TASK_STATUS.DONE:
				return 'text-green-600 bg-green-50 border-green-200';
			case TASK_STATUS.IN_PROGRESS:
				return 'text-blue-600 bg-blue-50 border-blue-200';
			case TASK_STATUS.TODO:
				return 'text-gray-600 bg-gray-50 border-gray-200';
			case TASK_STATUS.CANCELLED:
				return 'text-red-600 bg-red-50 border-red-200';
			case TASK_STATUS.REVIEW:
				return 'text-yellow-600 bg-yellow-50 border-yellow-200';
			default:
				return 'text-gray-600 bg-gray-50 border-gray-200';
		}
	}
}
