import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MetricsService } from './metrics.service';
import { PrismaService } from '../prisma/prisma.service';
import { startOfDay, subDays } from 'date-fns';
import { AnalyticsRepository } from './analytics.repository';

@Injectable()
export class AggregationService {
  private readonly logger = new Logger(AggregationService.name);

  constructor(
    private readonly metricsService: MetricsService,
    private readonly prisma: PrismaService,
    private readonly analyticsRepository: AnalyticsRepository,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyAggregation() {
    this.logger.log('🔄 Starting daily aggregation...');
    const yesterday = subDays(new Date(), 1);
    await this.aggregateDailyMetrics(yesterday);
    this.logger.log('✅ Daily aggregation completed');
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleHourlyAggregation() {
    this.logger.log('🔄 Starting hourly aggregation...');
    const today = new Date();
    await this.aggregateDailyMetrics(today);
    this.logger.log('✅ Hourly aggregation completed');
  }

  @Cron(CronExpression.EVERY_WEEK)
  async cleanupOldEvents() {
    this.logger.log('🧹 Cleaning up old events...');
    const retentionDays = 90;
    const cutoffDate = subDays(new Date(), retentionDays);

    try {
      const result = await this.prisma.taskEvent.deleteMany({
        where: {
          timestamp: {
            lt: cutoffDate,
          },
        },
      });

      this.logger.log(`🧹 Deleted ${result.count} old events`);
    } catch (error) {
      console.error('Failed to cleanup old events:', error);
    }
  }

  async aggregateDailyMetrics(date: Date): Promise<void> {
    const targetDate = startOfDay(date);
    try {
      const activeUserIds: string[] =
        await this.analyticsRepository.getAllActiveUsers(targetDate);

      await this.metricsService.updateUserProductivity(
        activeUserIds,
        targetDate,
      );

      await this.metricsService.updateTaskMetrics(targetDate);

      // Update distribution metrics
      await this.metricsService.updatePriorityDistribution(targetDate);
      await this.metricsService.updateStatusDistribution(targetDate);

      this.logger.log(`✅ Aggregated metrics for ${targetDate.toISOString()}`);
    } catch (error) {
      console.error('Failed to aggregate daily metrics:', error);
    }
  }

  async backfillMetrics(startDate: Date, endDate: Date): Promise<void> {
    this.logger.log(
      `🔄 Backfilling metrics from ${startDate.toISOString()} to ${endDate.toISOString()}`,
    );

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      await this.aggregateDailyMetrics(currentDate);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    this.logger.log('✅ Backfill completed');
  }
}
