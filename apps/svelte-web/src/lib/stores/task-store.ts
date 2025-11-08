import { writable, get } from 'svelte/store';
import type { ITaskResponse } from '$lib/graphql';

interface TaskCache {
	[taskId: string]: {
		data: ITaskResponse;
		timestamp: number;
	};
}

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

function createTaskStore() {
	const { subscribe, update } = writable<TaskCache>({});

	return {
		subscribe,

		/**
		 * Store task in cache
		 */
		setTask(task: ITaskResponse) {
			update((cache) => ({
				...cache,
				[task.id]: {
					data: task,
					timestamp: Date.now()
				}
			}));
		},

		/**
		 * Store multiple tasks in cache simultaneously
		 */
		setTasks(tasks: ITaskResponse[]) {
			update((cache) => {
				const newCache = { ...cache };
				const now = Date.now();
				tasks.forEach((task) => {
					newCache[task.id] = {
						data: task,
						timestamp: now
					};
				});
				return newCache;
			});
		},

		/**
		 * Get multiple task from cache (if not expired)
		 * @returns task data | null if no cache or expired
		 */
		getTask(taskId: string): ITaskResponse | null {
			const cache = get({ subscribe });
			const cached = cache[taskId];

			if (!cached) return null;

			const isExpired = Date.now() - cached.timestamp > CACHE_DURATION;
			return isExpired ? null : cached.data;
		},

		/**
		 * Checking there is task in cache (if not expired)
		 */
		hasTask(taskId: string): boolean {
			return this.getTask(taskId) !== null;
		},

		/**
		 * Delete task from cache (use when edit or delete task)
		 */
		invalidate(taskId: string) {
			update((cache) => {
				const { [taskId]: _, ...rest } = cache;
				return rest;
			});
		},

		/**
		 * delete multiple tasks from cache
		 */
		invalidateMultiple(taskIds: string[]) {
			update((cache) => {
				const newCache = { ...cache };
				taskIds.forEach((id) => {
					delete newCache[id];
				});
				return newCache;
			});
		},

		/**
		 * Clear all cache
		 */
		clear() {
			update(() => ({}));
		},

		/**
		 * Delete expired tasks out of cache
		 */
		cleanExpired() {
			update((cache) => {
				const now = Date.now();
				const newCache: TaskCache = {};
				Object.entries(cache).forEach(([taskId, cachedTask]) => {
					if (now - cachedTask.timestamp <= CACHE_DURATION) {
						newCache[taskId] = cachedTask;
					}
				});
				return newCache;
			});
		}
	};
}

export const taskStore = createTaskStore();
