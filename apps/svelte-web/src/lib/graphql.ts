// GraphQL queries and mutations

export const AUTH_QUERIES = {
	LOGIN: `
		mutation Login($input: LoginInput!) {
			login(input: $input) {
				id
				email
				username
			}
		}
	`,
	REGISTER: `
		mutation Register($input: RegisterInput!) {
			register(input: $input) {
				id
				email
				username
			}
		}
	`,
	LOGOUT: `
		mutation Logout {
			logout {
				message
			}
		}
	`,
	REFRESH_TOKEN: `
		mutation RefreshAccessToken {
			refreshAccessToken {
				message
			}
		}
	`
};

export const USER_QUERIES = {
	GET_ME: `
		query GetMe {
			me {
				id
				email
				username
			}
		}
	`
};
