import type { ITaskResponse } from '$lib/api';
import { writable, get } from 'svelte/store';

interface TaskState {
	tasks: ITaskResponse[];
	dashboard: {
		recentTasks: ITaskResponse[];
		stats: {
			totalTasks: number;
			todoTasks: number;
			reviewTasks: number;
			completedTasks: number;
			inProgressTasks: number;
			cancelledTasks: number;
		};
	};
	individualPage: {
		task: ITaskResponse | undefined;
		error: string;
	};
}

function createTaskStore() {
	const { subscribe, update } = writable<TaskState>({
		tasks: [],
		dashboard: {
			recentTasks: [],
			stats: {
				totalTasks: 0,
				todoTasks: 0,
				reviewTasks: 0,
				completedTasks: 0,
				inProgressTasks: 0,
				cancelledTasks: 0
			}
		},
		individualPage: {
			task: undefined,
			error: ''
		}
	});

	return {
		subscribe,
		addTask(task: ITaskResponse) {
			update((state) => {
				state.tasks = [task, ...state.tasks];
				return state;
			});
		},
		addRecentTask(task: ITaskResponse) {
			update((state) => {
				state.dashboard.recentTasks = [task, ...state.dashboard.recentTasks];
				state.dashboard.recentTasks.pop();
				return state;
			});
		},
		updateTask(updatedTask: ITaskResponse) {
			update((state) => {
				const index = state.tasks.findIndex((task) => task.id === updatedTask.id);
				if (index !== -1) {
					state.tasks[index] = updatedTask;
				}

				const dashboardIndex = state.dashboard.recentTasks.findIndex(
					(task) => task.id === updatedTask.id
				);
				if (dashboardIndex !== -1) {
					state.dashboard.recentTasks[dashboardIndex] = updatedTask;
				}

				if (state.individualPage.task?.id === updatedTask.id) {
					state.individualPage.task = updatedTask;
				}
				return state;
			});
		},
		setTasks(tasks: ITaskResponse[]) {
			update((state) => {
				state.tasks = tasks;
				return state;
			});
		},
		setDashboard(
			tasks: ITaskResponse[],
			stats: {
				totalTasks: number;
				todoTasks: number;
				reviewTasks: number;
				completedTasks: number;
				inProgressTasks: number;
				cancelledTasks: number;
			}
		) {
			update((state) => {
				state.dashboard.recentTasks = tasks;
				state.dashboard.stats = stats;
				return state;
			});
		},
		setIndividualPage(task: ITaskResponse | undefined, error: string) {
			update((state) => {
				state.individualPage.task = task;
				state.individualPage.error = error;
				return state;
			});
		},
		getTask(taskId: string): ITaskResponse | null {
			const state: TaskState = get({ subscribe });
			return state.tasks.find((task) => task.id === taskId) || null;
		},

		// Delete task from store
		invalidate(taskId: string) {
			update((state) => {
				state.tasks = state.tasks.filter((task) => task.id !== taskId);
				state.dashboard.recentTasks = state.dashboard.recentTasks.filter(
					(task) => task.id !== taskId
				);
				if (state.individualPage.task?.id === taskId) {
					state.individualPage.task = undefined;
					state.individualPage.error = 'Task not found';
				}
				return state;
			});
		}
	};
}

export const taskStore = createTaskStore();
