import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { MinioService } from '../minio/minio.service';
import sharp from 'sharp';
import * as path from 'path';
import { UploadFileRequest, UploadFileResponse } from '@repo/grpc/file';
import { FileLogic } from './file.logic';

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);
  private readonly maxFileSize: number;
  private readonly allowedFileTypes: string[];
  private readonly thumbnailWidth: number;
  private readonly thumbnailHeight: number;
  private readonly thumbnailQuality: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly minioService: MinioService,
    private readonly configService: ConfigService,
  ) {
    this.maxFileSize = parseInt(
      this.configService.get<string>('MAX_FILE_SIZE', '10485760'),
    );
    this.allowedFileTypes = this.configService
      .get<string>('ALLOWED_FILE_TYPES', 'image/jpeg,image/png')
      .split(',');
    this.thumbnailWidth = parseInt(
      this.configService.get<string>('THUMBNAIL_WIDTH', '200'),
    );
    this.thumbnailHeight = parseInt(
      this.configService.get<string>('THUMBNAIL_HEIGHT', '200'),
    );
    this.thumbnailQuality = parseInt(
      this.configService.get<string>('THUMBNAIL_QUALITY', '80'),
    );
  }

  async uploadFile(req: UploadFileRequest): Promise<UploadFileResponse> {
    const content: Buffer = Buffer.from(req.content);
    FileLogic.ensureValidFileSize(content.length, this.maxFileSize);
    FileLogic.ensureValidFileType(req.mimeType, this.allowedFileTypes);
    const fileId = crypto.randomUUID();
    const ext = path.extname(req.filename);
    const filename = `${fileId}${ext}`;
    const filePath = `files/${filename}`;

    try {
      // Upload to MinIO
      const url = await this.minioService.uploadFile(
        filePath,
        content,
        content.length,
        {
          'Content-Type': req.mimeType,
          'Original-Name': req.filename,
        },
      );

      // Generate thumbnail for images
      let thumbnailUrl: string | null = null;
      let thumbnailPath: string | null = null;
      if (req.mimeType.startsWith('image/')) {
        const thumbnail = await this.generateThumbnail(
          content,
          fileId,
          ext,
          req.mimeType,
        );
        thumbnailUrl = thumbnail?.thumbnailUrl ?? null;
        thumbnailPath = thumbnail?.thumbnailPath ?? null;
      }

      // Save metadata to database
      const file = await this.prisma.file.create({
        data: {
          id: fileId,
          filename,
          originalName: req.filename,
          mimeType: req.mimeType,
          size: content.length,
          url,
          thumbnailUrl,
          bucket: this.minioService.getButketName(),
          path: filePath,
          thumbnailPath: thumbnailPath,
          uploadedBy: req.uploadedBy,
          taskId: req.taskId,
          description: req.description,
        },
      });

      return {
        id: file.id,
        filename: file.filename,
        url: file.url,
        thumbnailUrl: file.thumbnailUrl ?? undefined,
        size: file.size,
        message: 'File uploaded successfully',
      } as UploadFileResponse;
    } catch (error) {
      this.logger.error(`❌ Failed to upload file: ${error.message}`);
      throw error;
    }
  }

  private async generateThumbnail(
    imageBuffer: Buffer,
    fileId: string,
    ext: string,
    mimeType: string,
  ): Promise<{ thumbnailUrl: string; thumbnailPath: string } | null> {
    try {
      const thumbnailBuffer = await sharp(imageBuffer)
        .resize(this.thumbnailWidth, this.thumbnailHeight, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: this.thumbnailQuality })
        .toBuffer();

      const thumbnailFilename = `${fileId}-thumb${ext}`;
      const thumbnailPath = `thumbnails/${thumbnailFilename}`;

      const thumbnailUrl = await this.minioService.uploadFile(
        thumbnailPath,
        thumbnailBuffer,
        thumbnailBuffer.length,
        {
          'Content-Type': mimeType,
        },
      );

      this.logger.log(`✅ Thumbnail generated: ${thumbnailFilename}`);
      return { thumbnailUrl, thumbnailPath };
    } catch (error) {
      this.logger.warn(`⚠️ Failed to generate thumbnail: ${error.message}`);
      return null;
    }
  }

  async getFile(id: string) {
    const file = await this.prisma.file.findUnique({
      where: { id },
    });
    FileLogic.ensureFileExists(file, id);
    return file;
  }

  async deleteFile(id: string, userId: string) {
    const file = await this.getFile(id);
    FileLogic.ensureFileExists(file, id);
    FileLogic.ensureUserFileOwner(file!.uploadedBy, userId);
    try {
      await this.minioService.deleteFile(file!.path);
      if (file!.thumbnailPath) {
        await this.minioService.deleteFile(file!.thumbnailPath);
      }
      await this.prisma.file.delete({
        where: { id },
      });
      return {
        success: true,
        message: 'File deleted successfully',
      };
    } catch (error) {
      this.logger.error(`❌ Failed to delete file: ${error.message}`);
      throw error;
    }
  }

  async listFiles(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [files, total] = await Promise.all([
      this.prisma.file.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.file.count(),
    ]);
    return FileLogic.convertToListFilesResponse(files, total, page, limit);
  }

  async getFilesByTask(taskId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [files, total] = await Promise.all([
      this.prisma.file.findMany({
        where: { taskId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.file.count({ where: { taskId } }),
    ]);
    return FileLogic.convertToListFilesResponse(files, total, page, limit);
  }

  async getFilesByUser(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [files, total] = await Promise.all([
      this.prisma.file.findMany({
        where: { uploadedBy: userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.file.count({ where: { uploadedBy: userId } }),
    ]);
    return FileLogic.convertToListFilesResponse(files, total, page, limit);
  }
}
