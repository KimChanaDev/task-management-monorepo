import { gql } from '@urql/svelte';

export const USER_QUERIES = {
	GET_ME: gql`
		query GetMe {
			me {
				id
				email
				username
			}
		}
	`
};
