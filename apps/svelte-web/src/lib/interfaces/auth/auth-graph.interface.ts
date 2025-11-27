export interface ILoginInput {
	email: string;
	password: string;
}

export interface IRegisterInput {
	email: string;
	username: string;
	password: string;
}

export interface IAuthResponse {
	id: string;
	email: string;
	username: string;
}

export interface ILogoutResponse {
	message: string;
}
