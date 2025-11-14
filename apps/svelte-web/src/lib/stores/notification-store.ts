import { writable, derived } from 'svelte/store';
import type { Notification } from '@repo/socket/types';

interface NotificationState {
	items: Notification[];
	unreadCount: number;
	toastNotifications: Set<string>;
}

const MAX_NOTIFICATIONS = 50;
const NOTIFICATION_DISPLAY_DURATION = 5000; // 5 seconds

function createNotificationStore() {
	const { subscribe, update } = writable<NotificationState>({
		items: [],
		unreadCount: 0,
		toastNotifications: new Set<string>() // IDs of notifications to show as toast
	});

	// Auto-dismiss timers
	const dismissTimers = new Map<string, ReturnType<typeof setTimeout>>(); // notification's id -> timer

	return {
		subscribe,
		add(notification: Notification) {
			update((state) => {
				// Prevent duplicates
				const exists = state.items.some((n) => n.id === notification.id);
				if (exists) return state;

				const newItems = [notification, ...state.items].slice(0, MAX_NOTIFICATIONS);

				return {
					items: newItems,
					unreadCount: state.unreadCount + 1,
					toastNotifications: state.toastNotifications.add(notification.id)
				};
			});

			// Auto-dismiss after duration (for toast display)
			const timer = setTimeout(() => {
				this.dismiss(notification.id);
			}, NOTIFICATION_DISPLAY_DURATION);

			dismissTimers.set(notification.id, timer);
		},
		markAsRead(notificationId: string) {
			update((state) => {
				const items = state.items.map((n) => (n.id === notificationId ? { ...n, read: true } : n));

				const unreadCount = items.filter((n) => !n.read).length;

				return { ...state, items, unreadCount };
			});
		},
		markAllAsRead() {
			update((state) => ({
				...state,
				items: state.items.map((n) => ({ ...n, read: true })),
				unreadCount: 0
			}));
		},

		/**
		 * Dismiss (hide) notification from toast display
		 * Note: This doesn't remove from the (items) list, just stops showing as toast
		 */
		dismiss(notificationId: string) {
			const timer = dismissTimers.get(notificationId);
			if (timer) {
				clearTimeout(timer);
				dismissTimers.delete(notificationId);
			}
			update((state) => {
				state.toastNotifications.delete(notificationId);
				return state;
			});
		},

		// Remove notification from the list completely
		remove(notificationId: string) {
			this.dismiss(notificationId);

			update((state) => {
				const items = state.items.filter((n) => n.id !== notificationId);
				const unreadCount = items.filter((n) => !n.read).length;

				return { ...state, items, unreadCount };
			});
		},
		clear() {
			// Clear all timers
			dismissTimers.forEach((timer) => clearTimeout(timer));
			dismissTimers.clear();

			update(() => ({
				items: [],
				unreadCount: 0,
				toastNotifications: new Set<string>()
			}));
		}
	};
}

export const notificationStore = createNotificationStore();

// Derived store for recent notifications (for toast display)
export const recentNotifications = derived(notificationStore, (state) =>
	state.items
		.filter((n) => !n.read && state.toastNotifications.has(n.id))
		.slice(0, 5)
		.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
);

// Derived store for unread count
export const unreadCount = derived(notificationStore, (state) => state.unreadCount);

// Derived store for all notifications (for activity feed)
export const allNotifications = derived(notificationStore, (state) => state.items);
