import { writable } from 'svelte/store';
import { io, type Socket } from 'socket.io-client';
import type { Notification } from '@repo/socket/types';
import { env } from '$env/dynamic/public';
const PUBLIC_NOTIFICATION_WS_URL = env.PUBLIC_NOTIFICATION_WS_URL ?? 'http://localhost:4004';

interface WebSocketState {
	connected: boolean;
	authenticated: boolean;
	socket: Socket | null;
	error: string | null;
}

function createWebSocketStore() {
	const { subscribe, set, update } = writable<WebSocketState>({
		connected: false,
		authenticated: false,
		socket: null,
		error: null
	});

	let socket: Socket | null = null;
	let reconnectAttempts = 0;
	const MAX_RECONNECT_ATTEMPTS = 5;

	return {
		subscribe,

		// Connect to WebSocket server
		connect() {
			if (socket?.connected) {
				console.log('[WebSocket] Already connected');
				return;
			}

			console.log('[WebSocket] Connecting to:', PUBLIC_NOTIFICATION_WS_URL);

			socket = io(PUBLIC_NOTIFICATION_WS_URL, {
				transports: ['websocket', 'polling'],
				reconnection: true,
				reconnectionDelay: 1000,
				reconnectionDelayMax: 5000,
				reconnectionAttempts: MAX_RECONNECT_ATTEMPTS
			});

			// Connection events
			socket.on('connect', () => {
				console.log('[WebSocket] Connected:', socket?.id);
				reconnectAttempts = 0;
				update((state) => ({
					...state,
					connected: true,
					socket,
					error: null
				}));
			});

			socket.on('disconnect', (reason) => {
				console.log('[WebSocket] Disconnected:', reason);
				update((state) => ({
					...state,
					connected: false,
					authenticated: false,
					error: `Disconnected: ${reason}`
				}));
			});

			socket.on('connect_error', (error) => {
				reconnectAttempts++;
				console.error('[WebSocket] Connection error:', error);
				update((state) => ({
					...state,
					connected: false,
					error: `Connection error: ${error.message}`
				}));

				if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
					console.error('[WebSocket] Max reconnection attempts reached');
					socket?.disconnect();
				}
			});

			socket.on('authenticated', (data) => {
				console.log('[WebSocket] Authenticated:', data);
				update((state) => ({
					...state,
					authenticated: true
				}));
			});

			update((state) => ({ ...state, socket }));
		},

		// Authenticate with user ID
		authenticate(userId: string) {
			if (!socket) {
				console.error('[WebSocket] Cannot authenticate: not connected');
				return;
			}

			console.log('[WebSocket] Authenticating user:', userId);
			socket.emit('authenticate', { userId });
		},

		// Subscribe to notification events
		onNotification(callback: (notification: Notification) => void) {
			if (!socket) {
				console.error('[WebSocket] Cannot subscribe: not connected');
				return;
			}

			socket.on('notification', callback);
			console.log('[WebSocket] Subscribed to notifications');
		},

		// Unsubscribe from notification events
		offNotification(callback: (notification: Notification) => void) {
			if (!socket) return;
			socket.off('notification', callback);
			console.log('[WebSocket] Unsubscribed from notifications');
		},

		// Disconnect from WebSocket server
		disconnect() {
			if (socket) {
				console.log('[WebSocket] Disconnecting...');
				socket.disconnect();
				socket = null;
				set({
					connected: false,
					authenticated: false,
					socket: null,
					error: null
				});
			}
		},

		// Get current socket instance
		getSocket(): Socket | null {
			return socket;
		}
	};
}

export const websocketStore = createWebSocketStore();
