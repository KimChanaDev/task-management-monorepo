import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MetricsService } from './metrics.service';
import { PrismaService } from '../prisma/prisma.service';
import { startOfDay, subDays } from 'date-fns';

@Injectable()
export class AggregationService {
  constructor(
    private readonly metricsService: MetricsService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Run daily aggregation at midnight
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyAggregation() {
    console.log('🔄 Starting daily aggregation...');
    const yesterday = subDays(new Date(), 1);
    await this.aggregateDailyMetrics(yesterday);
    console.log('✅ Daily aggregation completed');
  }

  /**
   * Run hourly aggregation for recent data
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleHourlyAggregation() {
    console.log('🔄 Starting hourly aggregation...');
    const today = new Date();
    await this.aggregateDailyMetrics(today);
    console.log('✅ Hourly aggregation completed');
  }

  /**
   * Aggregate all metrics for a specific date
   */
  async aggregateDailyMetrics(date: Date): Promise<void> {
    const targetDate = startOfDay(date);

    try {
      // Get all active users for this date
      const events = await this.prisma.taskEvent.findMany({
        where: {
          timestamp: {
            gte: targetDate,
            lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000),
          },
        },
        select: {
          userId: true,
        },
      });

      const activeUserIds = new Set(events.map((e) => e.userId));

      // Update metrics for each user
      await Promise.all(
        Array.from(activeUserIds).map((userId) =>
          this.metricsService.updateUserProductivity(userId, targetDate),
        ),
      );

      // Update global task metrics
      await this.metricsService.updateTaskMetrics(targetDate);

      // Update distribution metrics
      await this.metricsService.updatePriorityDistribution(targetDate);
      await this.metricsService.updateStatusDistribution(targetDate);

      // Update team analytics
      await this.metricsService.updateTeamAnalytics(
        'default',
        targetDate,
        activeUserIds,
      );

      console.log(`✅ Aggregated metrics for ${targetDate.toISOString()}`);
    } catch (error) {
      console.error('Failed to aggregate daily metrics:', error);
    }
  }

  /**
   * Backfill metrics for a date range
   */
  async backfillMetrics(startDate: Date, endDate: Date): Promise<void> {
    console.log(
      `🔄 Backfilling metrics from ${startDate.toISOString()} to ${endDate.toISOString()}`,
    );

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      await this.aggregateDailyMetrics(currentDate);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log('✅ Backfill completed');
  }

  /**
   * Clean up old events (retention policy)
   */
  @Cron(CronExpression.EVERY_WEEK)
  async cleanupOldEvents() {
    console.log('🧹 Cleaning up old events...');
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

      console.log(`🧹 Deleted ${result.count} old events`);
    } catch (error) {
      console.error('Failed to cleanup old events:', error);
    }
  }
}
