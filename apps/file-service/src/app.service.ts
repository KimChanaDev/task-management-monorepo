import { Injectable, Logger } from '@nestjs/common';
import { MinioService } from './minio/minio.service';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly minioService: MinioService,
  ) {}

  async check() {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkMinIO(),
    ]);

    const database =
      checks[0].status === 'fulfilled' ? checks[0].value : { status: 'error' };
    const minio =
      checks[1].status === 'fulfilled' ? checks[1].value : { status: 'error' };

    const overallStatus =
      database.status === 'ok' && minio.status === 'ok'
        ? 'healthy'
        : 'unhealthy';

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks: {
        database,
        minio,
      },
    };
  }

  private async checkDatabase() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', message: 'Database is connected' };
    } catch (error) {
      this.logger.error(`Database health check failed: ${error.message}`);
      return { status: 'error', message: error.message };
    }
  }

  private async checkMinIO() {
    try {
      await this.minioService.fileExists('health-check');
      return { status: 'ok', message: 'MinIO is connected' };
    } catch (error) {
      this.logger.error(`MinIO health check failed: ${error.message}`);
      return { status: 'error', message: error.message };
    }
  }
}
