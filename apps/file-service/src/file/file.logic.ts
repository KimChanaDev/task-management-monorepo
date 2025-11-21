import {
  BadRequestRpcException,
  NotFoundRpcException,
  UnAuthenticateRpcException,
} from '@repo/grpc/exception';
import { Prisma } from '@prisma/client/file-service/index.js';
import { FileInfo, ListFilesResponse } from '@repo/grpc/file';
export class FileLogic {
  public static ensureValidFileSize(
    contentLength: number,
    maxFileSize: number,
  ) {
    if (contentLength > maxFileSize) {
      throw new BadRequestRpcException(
        `File size exceeds maximum allowed size of ${maxFileSize} bytes`,
      );
    }
  }

  public static ensureValidFileType(
    mimeType: string,
    allowedFileTypes: string[],
  ) {
    if (!allowedFileTypes.includes(mimeType)) {
      throw new BadRequestRpcException(`File type ${mimeType} is not allowed`);
    }
  }

  public static ensureFileExists(file: any, id: string) {
    if (!file) {
      throw new NotFoundRpcException(`File with ID ${id} does not exist`);
    }
  }

  public static ensureUserFileOwner(uploadedBy: string, userId: string) {
    if (uploadedBy !== userId) {
      throw new UnAuthenticateRpcException(
        'You are not authorized to delete this file',
      );
    }
  }

  public static convertToListFilesResponse(
    files: Prisma.FileGetPayload<any>[],
    total: number,
    page: number,
    limit: number,
  ) {
    return {
      files: files.map(
        (file) =>
          ({
            id: file.id,
            filename: file.filename,
            originalName: file.originalName,
            mimeType: file.mimeType,
            size: file.size,
            url: file.url,
            thumbnailUrl: file.thumbnailUrl ?? undefined,
            uploadedBy: file.uploadedBy,
            taskId: file.taskId ?? undefined,
            description: file.description ?? undefined,
            createdAt: file.createdAt.toISOString(),
            updatedAt: file.updatedAt.toISOString(),
          }) as FileInfo,
      ),
      total: total,
      page: page,
      limit: limit,
    } as ListFilesResponse;
  }
}
