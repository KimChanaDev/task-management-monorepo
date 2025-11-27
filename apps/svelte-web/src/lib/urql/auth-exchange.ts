import { authExchange as createAuthExchange } from '@urql/exchange-auth';
import type { Operation, CombinedError } from '@urql/core';
import { LOGIN_OPERATION, REFRESH_ACCESS_TOKEN_OPERATION, REGISTER_OPERATION } from '$queries';
import { redirect } from '@sveltejs/kit';

/**
 * Auth Exchange for urql using official @urql/exchange-auth
 * Automatically refreshes access token when it expires (401/403 errors)
 * and retries the failed operation with the new token
 */
export const authExchange = createAuthExchange(async () => {
	return {
		// Add auth state to operations
		addAuthToOperation: (operation: Operation) => {
			// No need to add anything to headers since we use httpOnly cookies
			return operation;
		},

		// Check if operation has auth error
		didAuthError: (error: CombinedError, operation: Operation) => {
			// Skip refresh for login, register, and refresh token operations
			const isRefreshOperation = operation.query.loc?.source.body.includes(
				REFRESH_ACCESS_TOKEN_OPERATION
			);
			const isLoginOperation = operation.query.loc?.source.body.includes(LOGIN_OPERATION);
			const isRegisterOperation = operation.query.loc?.source.body.includes(REGISTER_OPERATION);

			// Don't trigger refresh for these operations
			if (isRefreshOperation || isLoginOperation || isRegisterOperation) {
				console.log('[Auth Exchange] Skipping refresh for auth operation');
				return false;
			}

			// Check if error is 401 (unauthorized)
			const hasAuthError = error.graphQLErrors.some(
				(err: any) => err.extensions?.statusCode === 401
			);

			if (hasAuthError) {
				console.log('[Auth Exchange] Detected 401 error, will refresh token');
			}

			return hasAuthError;
		},

		// Refresh auth when needed
		refreshAuth: async () => {
			console.log('[Auth Exchange] Token expired, attempting refresh...');

			try {
				const response = await fetch('/api/refresh-token', {
					method: 'POST',
					credentials: 'include'
				});

				if (!response.ok) {
					throw new Error('Token refresh failed');
				}

				const result = await response.json();

				if (result.success) {
					console.log('[Auth Exchange] Token refreshed successfully');
					// Return void to indicate success (cookies are automatically updated)
					return;
				}

				throw new Error('Refresh token response was not successful');
			} catch (error) {
				console.error('[Auth Exchange] Error refreshing token:', error);
				throw redirect(303, '/auth/login');
			}
		},

		// Check if operation should trigger auth (called before sending request)
		willAuthError: () => {
			// Always return false to let the request go through first
			// Then check errors with didAuthError after getting response
			return false;
		}
	};
});
