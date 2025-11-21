import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private minioClient: Minio.Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    const endpoint = this.configService.get<string>(
      'MINIO_ENDPOINT',
      'localhost',
    );
    const port = parseInt(this.configService.get<string>('MINIO_PORT', '9000'));
    const useSSL =
      this.configService.get<string>('MINIO_USE_SSL', 'false') === 'true';
    const accessKey = this.configService.get<string>(
      'MINIO_ACCESS_KEY',
      'minioadmin',
    );
    const secretKey = this.configService.get<string>(
      'MINIO_SECRET_KEY',
      'minioadmin',
    );

    this.bucketName = this.configService.get<string>(
      'MINIO_BUCKET_NAME',
      'task-files',
    );

    this.minioClient = new Minio.Client({
      endPoint: endpoint,
      port: port,
      useSSL: useSSL,
      accessKey: accessKey,
      secretKey: secretKey,
    });

    this.logger.log(`MinIO Client configured for ${endpoint}:${port}`);
  }

  async onModuleInit() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        this.logger.log(`✅ Created bucket: ${this.bucketName}`);
      } else {
        this.logger.log(`✅ Bucket exists: ${this.bucketName}`);
      }
    } catch (error) {
      this.logger.error(`❌ Failed to initialize MinIO: ${error.message}`);
      throw error;
    }
  }

  getButketName(): string {
    return this.bucketName;
  }

  async uploadFile(
    objectName: string,
    buffer: Buffer,
    size: number,
    metaData: Record<string, string>,
  ): Promise<string> {
    try {
      await this.minioClient.putObject(
        this.bucketName,
        objectName,
        buffer,
        size,
        metaData,
      );

      const url = await this.getFileUrl(objectName);
      this.logger.log(`✅ Uploaded file: ${objectName}`);
      return url;
    } catch (error) {
      this.logger.error(`❌ Failed to upload file: ${error.message}`);
      throw error;
    }
  }

  async downloadFile(objectName: string): Promise<Buffer> {
    try {
      const dataStream = await this.minioClient.getObject(
        this.bucketName,
        objectName,
      );
      const chunks: Buffer[] = [];

      return new Promise((resolve, reject) => {
        dataStream.on('data', (chunk) => chunks.push(chunk));
        dataStream.on('end', () => resolve(Buffer.concat(chunks)));
        dataStream.on('error', reject);
      });
    } catch (error) {
      this.logger.error(`❌ Failed to download file: ${error.message}`);
      throw error;
    }
  }

  async deleteFile(objectName: string): Promise<void> {
    try {
      await this.minioClient.removeObject(this.bucketName, objectName);
      this.logger.log(`✅ Deleted file: ${objectName}`);
    } catch (error) {
      this.logger.error(`❌ Failed to delete file: ${error.message}`);
      throw error;
    }
  }

  async getFileUrl(
    objectName: string,
    expiry: number = 7 * 24 * 60 * 60,
  ): Promise<string> {
    try {
      return await this.minioClient.presignedGetObject(
        this.bucketName,
        objectName,
        expiry,
      );
    } catch (error) {
      this.logger.error(`❌ Failed to get file URL: ${error.message}`);
      throw error;
    }
  }

  async fileExists(objectName: string): Promise<boolean> {
    try {
      await this.minioClient.statObject(this.bucketName, objectName);
      return true;
    } catch (error) {
      if (error.code === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  async getFileStat(objectName: string) {
    try {
      return await this.minioClient.statObject(this.bucketName, objectName);
    } catch (error) {
      this.logger.error(`❌ Failed to get file stat: ${error.message}`);
      throw error;
    }
  }
}
