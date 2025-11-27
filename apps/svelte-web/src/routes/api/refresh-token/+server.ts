import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { AUTH_QUERIES } from '$queries';
import { setAuthCookies, findAuthCookies, clearAuthCookies } from '$utils';
import { GRAPHQL_GATWAY_URL } from '$env/static/private';

/**
 * API endpoint for refreshing access token
 * Called by the urql auth exchange when access token expires
 */
export const POST: RequestHandler = async ({ cookies, fetch }) => {
	const refreshToken = cookies.get('RefreshToken');
	if (!refreshToken) {
		return json({ success: false, error: 'No refresh token' }, { status: 401 });
	}
	try {
		const response = await fetch(`${GRAPHQL_GATWAY_URL}/graphql`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Cookie: `RefreshToken=${refreshToken}`
			},
			body: JSON.stringify({
				query: AUTH_QUERIES.REFRESH_TOKEN
			})
		});
		if (!response.ok) {
			throw new Error('Failed to refresh token');
		}
		const result = await response.json();
		if (!result.data?.refreshAccessToken) {
			throw new Error('Invalid refresh token response');
		}
		const setCookieHeader = response.headers.get('set-cookie');
		const newAccessToken = findAuthCookies(setCookieHeader, 'AccessToken');
		const newRefreshToken = findAuthCookies(setCookieHeader, 'RefreshToken');
		if (!newAccessToken || !newRefreshToken) {
			throw new Error('Failed to extract tokens from response');
		}
		setAuthCookies({ cookies }, newAccessToken, newRefreshToken);
		return json({ success: true, message: 'Token refreshed successfully' });
	} catch (error) {
		console.error('Token refresh error:', error);
		clearAuthCookies({ cookies });
		return json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Token refresh failed'
			},
			{ status: 401 }
		);
	}
};
