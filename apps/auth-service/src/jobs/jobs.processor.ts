import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { type Job } from 'bull';
import { AuthRepository } from '../auth/auth.repository';
import { JOB_NAMES, QUEUE_NAMES } from './constants/job-names.constant';

@Processor(QUEUE_NAMES.AUTH_CLEANUP)
export class JobsProcessor {
  private readonly logger = new Logger(JobsProcessor.name);

  constructor(private readonly authRepository: AuthRepository) {}

  @Process(JOB_NAMES.CLEANUP_EXPIRED_TOKENS)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async handleCleanupExpiredTokens(job: Job) {
    this.logger.log('🧹 Starting expired tokens cleanup job...');
    const startTime = Date.now();

    try {
      const expiredCount =
        await this.authRepository.deleteExpiredRefreshTokens();
      const revokedCount = await this.authRepository.deleteOldRevokedTokens();
      const duration = Date.now() - startTime;
      this.logger.log(
        `✅ Expired tokens cleanup completed in ${duration}ms (expired: ${expiredCount}, old revoked: ${revokedCount})`,
      );

      return {
        success: true,
        expiredDeleted: expiredCount,
        revokedDeleted: revokedCount,
        duration,
      };
    } catch (error) {
      this.logger.error(
        `❌ Failed to cleanup expired tokens: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
