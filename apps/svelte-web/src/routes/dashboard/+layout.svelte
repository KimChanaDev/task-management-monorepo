<script lang="ts">
	import type { LayoutData } from './$types';
	import { Sidebar, DashboardTopbar, ToastContainer } from '$components';
	import { type Snippet, onMount, onDestroy } from 'svelte';
	import { websocketStore, notificationStore, taskStore } from '$stores';
	import { type Notification, NotificationType } from '@repo/socket/types';
	import { page } from '$app/stores';
	import { getContextClient } from '@urql/svelte';
	import { createTaskAPI } from '$lib/api';
	import { TASK_RECENT_LIMIT } from '$lib/consts';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	let client = getContextClient();
	let taskAPI = createTaskAPI(client);

	interface ComponentProps {
		data: LayoutData;
		children: Snippet;
	}

	let { data, children }: ComponentProps = $props();
	let sidebarOpen = $state(true);
	let user = $derived(data.user);

	// WebSocket connection lifecycle
	onMount(() => {
		connectWebSocket();
	});

	onDestroy(() => {
		websocketStore.disconnect();
	});

	function connectWebSocket() {
		websocketStore.connect();

		// Authenticate with user ID when connected
		const unsubscribe = websocketStore.subscribe((state) => {
			if (state.connected && !state.authenticated && user?.id) {
				websocketStore.authenticate(user.id);
			}
		});

		const caseDeletedNotification = (notification: Notification) => {
			taskStore.invalidate(notification.data.taskId);
			const currentPath = $page.url.pathname;
			if (
				currentPath.startsWith('/dashboard/tasks') &&
				currentPath.split('/')[3] === notification.data.taskId
			) {
				goto(resolve('/dashboard/tasks'));
			}
		};

		const caseCreatedNotification = async (notification: Notification) => {
			const currentPath = $page.url.pathname;
			if (currentPath === '/dashboard/tasks') {
				fetchNewTask(notification.data.taskId);
			}
			if (currentPath === '/dashboard') {
				fetchDashboard();
			}
		};

		const caseUpdatedNotification = async (notification: Notification) => {
			const currentPath = $page.url.pathname;
			if (currentPath === '/dashboard/tasks') {
				try {
					const task = await taskAPI.getTask(notification.data.taskId);
					if (task) {
						taskStore.updateTask(task);
					} else {
						taskStore.invalidate(notification.data.taskId);
					}
				} catch {
					console.error('Failed to fetch updated task');
				}
			}
			if (currentPath === '/dashboard') {
				fetchDashboard();
			}
			if (
				currentPath.startsWith('/dashboard/tasks') &&
				currentPath.split('/')[3] === notification.data.taskId
			) {
				try {
					const task = await taskAPI.getTask(notification.data.taskId);
					if (task) {
						taskStore.setIndividualPage(task, '');
					} else {
						taskStore.setIndividualPage(undefined, 'Task not found');
					}
				} catch {
					console.error('Failed to fetch updated task');
				}
			}
		};

		const caseAssignedNotification = async (notification: Notification) => {
			const currentPath = $page.url.pathname;
			if (currentPath === '/dashboard/tasks') {
				fetchNewTask(notification.data.taskId);
			}
			if (currentPath === '/dashboard') {
				fetchDashboard();
			}
		};

		const handleNotification = (notification: Notification) => {
			console.log('[Dashboard] Received notification:', notification);
			notificationStore.add(notification);
			switch (notification.type) {
				case NotificationType.TASK_DELETED:
					caseDeletedNotification(notification);
					break;
				case NotificationType.TASK_CREATED:
					caseCreatedNotification(notification);
					break;
				case NotificationType.TASK_UPDATED:
					caseUpdatedNotification(notification);
					break;
				case NotificationType.TASK_ASSIGNED:
					caseAssignedNotification(notification);
					break;
				default:
					break;
			}
		};

		websocketStore.onNotification(handleNotification);
		// Cleanup
		return () => {
			unsubscribe();
			websocketStore.offNotification(handleNotification);
		};
	}

	async function fetchDashboard() {
		try {
			const dashboard = await taskAPI.getDashboard(TASK_RECENT_LIMIT);
			if (dashboard) {
				taskStore.setDashboard(dashboard.recentTasks ?? [], {
					totalTasks: dashboard.totalCount,
					todoTasks: dashboard.todoCount,
					inProgressTasks: dashboard.inProgressCount,
					reviewTasks: dashboard.reviewCount,
					completedTasks: dashboard.completedCount,
					cancelledTasks: dashboard.cancelledCount
				});
			}
		} catch (error) {
			console.error('Failed to fetch dashboard data:', error);
		}
	}

	async function fetchNewTask(taskId: string) {
		try {
			const task = await taskAPI.getTask(taskId);
			if (task) {
				taskStore.addTask(task);
			}
		} catch (error) {
			console.error('Failed to fetch new task: ', error);
		}
	}
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Sidebar -->
	<Sidebar {user} bind:sidebarOpen />

	<!-- Main Content -->
	<div class="lg:pl-64 min-h-screen">
		<DashboardTopbar bind:sidebarOpen />
		<!-- Page Content -->
		<main class="p-3 sm:p-4 md:p-6 lg:p-8">
			{@render children()}
		</main>
	</div>

	<!-- Toast Notifications Container -->
	<ToastContainer />
</div>
