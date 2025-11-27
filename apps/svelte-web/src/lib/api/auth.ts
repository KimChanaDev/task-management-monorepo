import type { Client } from '@urql/svelte';
import { AUTH_QUERIES } from '$queries';
import type { ILoginInput, IRegisterInput, IAuthResponse, ILogoutResponse } from '$interfaces';

export class AuthAPI {
	constructor(private client: Client) {}

	async login(input: ILoginInput): Promise<IAuthResponse> {
		const result = await this.client.mutation(AUTH_QUERIES.LOGIN, { input });
		if (result.error) {
			throw new Error(result.error.graphQLErrors[0]?.message ?? result.error.message);
		}
		return result.data?.login as IAuthResponse;
	}

	async register(input: IRegisterInput): Promise<IAuthResponse> {
		const result = await this.client.mutation(AUTH_QUERIES.REGISTER, { input });
		if (result.error) {
			throw new Error(result.error.graphQLErrors[0]?.message ?? result.error.message);
		}
		return result.data?.register as IAuthResponse;
	}

	async logout(): Promise<ILogoutResponse> {
		const result = await this.client.mutation(AUTH_QUERIES.LOGOUT, {});
		if (result.error) {
			throw new Error(result.error.graphQLErrors[0]?.message ?? result.error.message);
		}
		return result.data?.logout as ILogoutResponse;
	}

	async refreshAccessToken(): Promise<ILogoutResponse> {
		const result = await this.client.mutation(AUTH_QUERIES.REFRESH_TOKEN, {});
		if (result.error) {
			throw new Error(result.error.graphQLErrors[0]?.message ?? result.error.message);
		}
		return result.data?.refreshAccessToken as ILogoutResponse;
	}
}

// Helper function to create AuthAPI instance
export function createAuthAPI(client: Client): AuthAPI {
	return new AuthAPI(client);
}
