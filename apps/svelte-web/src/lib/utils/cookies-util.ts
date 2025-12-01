import { COOKIE_MAX_AGE } from '$consts';
import { env } from '$env/dynamic/public';
const PUBLIC_AUTH_SECURE_COOKIES = env.PUBLIC_AUTH_SECURE_COOKIES ?? 'false';

export function findAuthCookies(
	setCookieHeader: string | null,
	cookieName: string
): string | undefined {
	return setCookieHeader
		?.split(',')
		.find((cookie) => cookie.trim().startsWith(`${cookieName}=`))
		?.split(';')[0]
		?.split('=')[1];
}

const isSecure: boolean =
	PUBLIC_AUTH_SECURE_COOKIES &&
	typeof PUBLIC_AUTH_SECURE_COOKIES === 'string' &&
	PUBLIC_AUTH_SECURE_COOKIES.toLowerCase() === 'false'
		? false
		: !!PUBLIC_AUTH_SECURE_COOKIES;

export function setAuthCookies(event: any, accessToken: string, refreshToken: string) {
	event.cookies.set('AccessToken', accessToken, {
		path: '/',
		httpOnly: true,
		secure: isSecure,
		sameSite: 'lax', // 'lax' is more compatible than 'strict' for cross-origin scenarios
		maxAge: COOKIE_MAX_AGE.ACCESS_TOKEN
	});
	event.cookies.set('RefreshToken', refreshToken, {
		path: '/',
		httpOnly: true,
		secure: isSecure,
		sameSite: 'lax',
		maxAge: COOKIE_MAX_AGE.REFRESH_TOKEN
	});
}

export function clearAuthCookies(event: any) {
	if (event.cookies.get('AccessToken')) {
		event.cookies.delete('AccessToken', { path: '/' });
	}
	if (event.cookies.get('RefreshToken')) {
		event.cookies.delete('RefreshToken', { path: '/' });
	}
}
