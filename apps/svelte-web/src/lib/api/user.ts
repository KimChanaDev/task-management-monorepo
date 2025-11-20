import type { Client } from '@urql/svelte';
import { USER_QUERIES } from '$lib/graphql';

export interface IUser {
	id: string;
	email: string;
	username: string;
}

export class UserAPI {
	constructor(private client: Client) {}

	async getMe(): Promise<IUser | undefined> {
		const result = await this.client.query(USER_QUERIES.GET_ME, {});
		if (result.error) {
			throw new Error(result.error.graphQLErrors[0]?.message ?? result.error.message);
		}
		return result.data?.me as IUser | undefined;
	}
}

// Helper function to create UserAPI instance
export function createUserAPI(client: Client): UserAPI {
	return new UserAPI(client);
}
