import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { type Queue } from 'bull';
import { Cron, CronExpression } from '@nestjs/schedule';
import { JOB_NAMES, QUEUE_NAMES } from './constants/job-names.constant';

@Injectable()
export class JobsService implements OnModuleInit {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    @InjectQueue(QUEUE_NAMES.AUTH_CLEANUP) private readonly cleanupQueue: Queue,
  ) {}

  onModuleInit() {
    this.logger.log('🚀 Jobs Service initialized');
    this.logger.log('📅 Cron jobs scheduled:');
    this.logger.log('  - Cleanup expired tokens: Every 1 hour');
  }

  @Cron(CronExpression.EVERY_HOUR, {
    name: 'cleanup-expired-tokens',
  })
  async scheduleExpiredTokensCleanup() {
    this.logger.log('⏰ Triggering expired tokens cleanup job...');
    await this.cleanupQueue.add(
      JOB_NAMES.CLEANUP_EXPIRED_TOKENS,
      {},
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: 100, // Keep last 100 completed jobs
        removeOnFail: 50, // Keep last 50 failed jobs
      },
    );
  }

  /**
   * Get queue statistics
   */
  async getQueueStats() {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.cleanupQueue.getWaitingCount(),
      this.cleanupQueue.getActiveCount(),
      this.cleanupQueue.getCompletedCount(),
      this.cleanupQueue.getFailedCount(),
      this.cleanupQueue.getDelayedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed,
    };
  }
}
