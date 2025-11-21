import { Controller } from '@nestjs/common';
import { FileService } from './file.service';
import {
  DeleteFileRequest,
  DeleteFileResponse,
  FileServiceController,
  FileServiceControllerMethods,
  GetFileRequest,
  GetFileResponse,
  GetFilesByTaskRequest,
  GetFilesByUserRequest,
  ListFilesRequest,
  ListFilesResponse,
  UploadFileRequest,
  UploadFileResponse,
} from '@repo/grpc/file';

@Controller()
@FileServiceControllerMethods()
export class FileController implements FileServiceController {
  constructor(private readonly fileService: FileService) {}

  async uploadFile(req: UploadFileRequest): Promise<UploadFileResponse> {
    return await this.fileService.uploadFile(req);
  }

  async getFile(req: GetFileRequest): Promise<GetFileResponse> {
    const file = await this.fileService.getFile(req.id);
    return {
      id: file!.id,
      filename: file!.filename,
      originalName: file!.originalName,
      mimeType: file!.mimeType,
      size: file!.size,
      url: file!.url,
      thumbnailUrl: file!.thumbnailUrl ?? undefined,
      uploadedBy: file!.uploadedBy,
      taskId: file!.taskId ?? undefined,
      description: file!.description ?? undefined,
      createdAt: file!.createdAt.toISOString(),
      updatedAt: file!.updatedAt.toISOString(),
    } as GetFileResponse;
  }

  async deleteFile(req: DeleteFileRequest): Promise<DeleteFileResponse> {
    return await this.fileService.deleteFile(req.id, req.userId);
  }

  async listFiles(req: ListFilesRequest): Promise<ListFilesResponse> {
    return await this.fileService.listFiles(req.page, req.limit);
  }

  async getFilesByTask(req: GetFilesByTaskRequest): Promise<ListFilesResponse> {
    return await this.fileService.getFilesByTask(
      req.taskId,
      req.page,
      req.limit,
    );
  }

  async getFilesByUser(req: GetFilesByUserRequest): Promise<ListFilesResponse> {
    return await this.fileService.getFilesByUser(
      req.userId,
      req.page,
      req.limit,
    );
  }
}
