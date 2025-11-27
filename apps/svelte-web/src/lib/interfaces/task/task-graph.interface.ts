import type { IUploadFileInput } from '$interfaces';

export interface ICreateTaskInput {
	title: string;
	description?: string;
	status?: string;
	priority?: string;
	dueDate?: string;
	assignedTo?: string;
	attachments?: IUploadFileInput[];
}

export interface IMyTaskFilterInput {
	status?: string;
	priority?: string;
	search?: string;
	page: number;
	limit: number;
}

export interface IUpdateTaskInput {
	id: string;
	title?: string;
	description?: string;
	status?: string;
	priority?: string;
	dueDate?: string;
	assignedTo?: string;
	newAttachments?: IUploadFileInput[];
	removedAttachmentIds?: string[];
}

export interface ITaskAttachment {
	id: string;
	filename: string;
	originalName?: string;
	mimeType: string;
	size: number;
	url: string;
	thumbnailUrl?: string;
	createdAt: string;
}

export interface ITaskResponse {
	id: string;
	title: string;
	description: string;
	priority: string;
	status: string;
	dueDate: string;
	createdBy: string;
	assignedTo: string;
	createdAt: string;
	updatedAt: string;
	attachments?: ITaskAttachment[];
}
