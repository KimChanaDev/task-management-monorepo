export { TaskAPI, createTaskAPI } from './tasks';
export { AuthAPI, createAuthAPI } from './auth';
export { UserAPI, createUserAPI } from './user';

export type { ILoginInput, IRegisterInput, IAuthResponse, ILogoutResponse } from './auth';
export type { IUser } from './user';
export type {
	ITaskResponse,
	ICreateTaskInput,
	IUpdateTaskInput,
	IMyTaskFilterInput
} from './tasks';
