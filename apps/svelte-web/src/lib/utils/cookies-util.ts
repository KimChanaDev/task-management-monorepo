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

export function setAuthCookies(event: any, accessToken: string, refreshToken: string) {
	event.cookies.set('AccessToken', accessToken, {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'strict',
		maxAge: 15 * 60 * 1000 // 15 minutes
	});
	event.cookies.set('RefreshToken', refreshToken, {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'strict',
		maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
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
