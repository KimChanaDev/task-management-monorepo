import { gql } from '@urql/svelte';

export const REFRESH_ACCESS_TOKEN_OPERATION = 'refreshAccessToken';
export const LOGIN_OPERATION = 'login';
export const REGISTER_OPERATION = 'register';

export const AUTH_QUERIES = {
	LOGIN: gql`
		mutation Login($input: LoginInput!) {
			${LOGIN_OPERATION}(input: $input) {
				id
				email
				username
			}
		}
	`,
	REGISTER: gql`
		mutation Register($input: RegisterInput!) {
			${REGISTER_OPERATION}(input: $input) {
				id
				email
				username
			}
		}
	`,
	LOGOUT: gql`
		mutation Logout {
			logout {
				message
			}
		}
	`,
	REFRESH_TOKEN: gql`
		mutation RefreshAccessToken {
			${REFRESH_ACCESS_TOKEN_OPERATION} {
				message
			}
		}
	`
};
