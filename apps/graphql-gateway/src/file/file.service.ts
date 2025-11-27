import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { ProtoPackage } from '@repo/grpc/package';
import {
  FILE_SERVICE_NAME,
  FileServiceClient,
  UploadFileRequest,
  UploadFileResponse,
  DeleteFileRequest,
  DeleteFileResponse,
  ListFilesResponse,
  GetFilesByTaskRequest,
} from '@repo/grpc/file';
import { firstValueFrom } from 'rxjs';
import { GrpcCall } from '../utilities/grpc-call.handler';
import { UploadFileInput, GetFilesByTaskInput } from './dto/file.input';

@Injectable()
export class FileService implements OnModuleInit {
  private fileGrpcService: FileServiceClient;

  constructor(@Inject(ProtoPackage.FILE) private client: ClientGrpc) {}

  onModuleInit() {
    this.fileGrpcService =
      this.client.getService<FileServiceClient>(FILE_SERVICE_NAME);
  }

  async uploadFile(
    input: UploadFileInput,
    userId: string,
  ): Promise<UploadFileResponse> {
    // Decode base64 content to Uint8Array
    const buffer = Buffer.from(input.content, 'base64');
    const content = new Uint8Array(buffer);

    const request: UploadFileRequest = {
      content,
      filename: input.filename,
      mimeType: input.mimeType,
      uploadedBy: userId,
      taskId: input.taskId,
      description: input.description,
    };

    return await GrpcCall.callByHandlerException(() =>
      firstValueFrom(this.fileGrpcService.uploadFile(request)),
    );
  }

  async deleteFile(id: string, userId: string): Promise<DeleteFileResponse> {
    const request: DeleteFileRequest = { id, userId };
    return await GrpcCall.callByHandlerException(() =>
      firstValueFrom(this.fileGrpcService.deleteFile(request)),
    );
  }

  async getFilesByTask(input: GetFilesByTaskInput): Promise<ListFilesResponse> {
    const request: GetFilesByTaskRequest = {
      taskId: input.taskId,
      page: input.page || 1,
      limit: input.limit || 10,
    };
    return await GrpcCall.callByHandlerException(() =>
      firstValueFrom(this.fileGrpcService.getFilesByTask(request)),
    );
  }
}
