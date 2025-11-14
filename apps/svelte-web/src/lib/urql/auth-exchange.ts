import { authExchange as createAuthExchange } from '@urql/exchange-auth';
import type { Operation, CombinedError } from '@urql/core';
import { LOGIN_OPERATION, REFRESH_ACCESS_TOKEN_OPERATION } from '$lib/graphql';

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
		didAuthError: (error: CombinedError) => {
			return error.graphQLErrors.some((err: any) => err.extensions?.statusCode === 401);
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

				// Redirect to login on refresh failure
				if (typeof window !== 'undefined') {
					window.location.href = '/auth/login';
				}
			}
		},

		// Check if operation should trigger auth
		willAuthError: (operation: Operation) => {
			// Skip auth check for refresh token mutation itself
			const isRefreshOperation = operation.query.loc?.source.body.includes(
				REFRESH_ACCESS_TOKEN_OPERATION
			);

			const isLoginOperation = operation.query.loc?.source.body.includes(LOGIN_OPERATION);

			return !isRefreshOperation && !isLoginOperation;
		}
	};
});
