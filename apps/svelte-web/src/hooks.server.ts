// src/hooks.server.ts
import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { AUTH_QUERIES, USER_QUERIES } from '$queries';
import { ensureDataExisted, setAuthCookies, clearAuthCookies, findAuthCookies } from '$utils';
import { env } from '$env/dynamic/private';
import { print } from 'graphql';
const GRAPHQL_GATWAY_URL = env.GRAPHQL_GATWAY_URL ?? 'http://localhost:4002';

const PUBLIC_ROUTES = ['/', '/auth/login', '/auth/register'];

const session: Handle = async ({ event, resolve }) => {
	const accessToken = event.cookies.get('AccessToken');
	const refreshToken = event.cookies.get('RefreshToken');
	event.locals.user = null;

	try {
		let currentAccessToken = accessToken;

		// If no access token but have refresh token, refresh it first
		if (!currentAccessToken && refreshToken) {
			const newAccessToken = await fetchAccessToken(refreshToken, event);
			ensureDataExisted(newAccessToken, 'Refresh token failed, clearing cookies');
			currentAccessToken = newAccessToken!;
		}

		// Try to fetch user with current access token
		if (currentAccessToken) {
			try {
				const data = await fetchUser(currentAccessToken);
				ensureDataExisted(data, 'Failed to fetch user');
				event.locals.user = data.user;
			} catch {
				ensureDataExisted(refreshToken, 'Failed to authenticate user, clearing cookies');
				const newAccessToken = await fetchAccessToken(refreshToken!, event);
				ensureDataExisted(newAccessToken, 'Refresh token invalid, clearing cookies');
				const data = await fetchUser(newAccessToken!);
				ensureDataExisted(data, 'Failed to fetch user after token refresh');
				event.locals.user = data.user;
			}
		}
	} catch (error: any) {
		console.error('Authentication error:', error);
		clearAuthCookies(event);
	}

	return await resolve(event);
};

const authGuard: Handle = async ({ event, resolve }) => {
	const { pathname } = event.url;
	const isProtectedRoute = pathname.startsWith('/dashboard');
	const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname === route);

	// Redirect authenticated users away from auth pages
	if (isPublicRoute && event.locals.user) {
		throw redirect(303, '/dashboard');
	}

	// Redirect unauthenticated users to login
	if (isProtectedRoute && !event.locals.user) {
		throw redirect(303, '/auth/login');
	}

	return await resolve(event);
};

export const handle: Handle = sequence(session, authGuard);

async function fetchUser(accessToken: string): Promise<App.Locals> {
	const response = await fetch(`${GRAPHQL_GATWAY_URL}/graphql`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Cookie: `AccessToken=${accessToken}`
		},
		body: JSON.stringify({
			query: print(USER_QUERIES.GET_ME)
		})
	});

	if (!response.ok) {
		throw new Error(`Error fetching user, status: ${response.status}`);
	}

	const result = await response.json();
	if (result.errors) {
		throw new Error('Error fetching user: ' + result.errors[0].message);
	}
	const data: App.Locals = {
		user: result.data?.me || null
	};
	return data;
}

async function fetchAccessToken(refreshToken: string, event: any): Promise<string | null> {
	const refreshResponse = await fetch(`${GRAPHQL_GATWAY_URL}/graphql`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Cookie: `RefreshToken=${refreshToken}`
		},
		body: JSON.stringify({
			query: print(AUTH_QUERIES.REFRESH_TOKEN)
		})
	});

	if (!refreshResponse.ok) {
		throw new Error('Failed to fetch user');
	}

	const refreshResult = await refreshResponse.json();
	if (!refreshResult.data?.refreshAccessToken) {
		return null;
	}
	const setCookieHeader = refreshResponse.headers.get('set-cookie');
	const newAccessToken = findAuthCookies(setCookieHeader, 'AccessToken');
	const newRefreshToken = findAuthCookies(setCookieHeader, 'RefreshToken');
	if (newAccessToken && newRefreshToken) {
		setAuthCookies(event, newAccessToken, newRefreshToken);
	}
	return newAccessToken ?? null;
}
