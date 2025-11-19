import { Injectable, Logger } from '@nestjs/common';
import { startOfDay, addDays } from 'date-fns';
import { AnalyticsRepository } from './analytics.repository';
import { TaskEventData } from '../types/analytics.type';
import { MetricsLogic } from './metrics.logic';

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);

  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  async recordTaskEvent(data: TaskEventData): Promise<void> {
    await this.analyticsRepository.createTaskEvent(data);
    this.logger.log(
      `📊 Recorded ${data.eventType} event for task ${data.taskId}`,
    );
  }

  async updateUserProductivity(userIds: string[], date: Date): Promise<void> {
    try {
      const startDate = startOfDay(date);
      const endDate = addDays(startDate, 1);
      const factors: {
        userId: string;
        created: number;
        inProgress: number;
        completed: number;
      }[] = await this.analyticsRepository.countUserProductivityFactor(
        startDate,
        endDate,
        userIds,
      );
      for (const factor of factors) {
        // Calculate productivity score (0-100)
        const productivityScore = MetricsLogic.calculateProductivityScore(
          factor.created,
          factor.completed,
          factor.inProgress,
        );
        // Calculate average completion time (simplified - would need task creation/completion timestamps)
        const averageCompletionTime = 0; // TODO: Implement proper calculation
        const tasksOverdue = 0; // TODO: Implement proper calculation
        const totalCompletionTime = 0; // TODO: Implement proper calculation
        await this.analyticsRepository.upsertUserProductivity(
          factor.userId,
          startDate,
          factor.created,
          factor.completed,
          factor.inProgress,
          tasksOverdue,
          totalCompletionTime,
          averageCompletionTime,
          productivityScore,
        );
      }
      this.logger.log(
        `📈 Updated productivity metrics for user ${userIds.join(', ')}`,
      );
    } catch (error) {
      this.logger.error('Failed to update user productivity:', error);
    }
  }

  async updateTaskMetrics(date: Date): Promise<void> {
    try {
      const startDate = startOfDay(date);
      const endDate = addDays(startDate, 1);

      const counts = await this.analyticsRepository.countTaskMetricsFactor(
        startDate,
        endDate,
      );
      const completionRate = MetricsLogic.calculateCompletionRate(
        counts.created,
        counts.completed,
      );
      const averageCompletionTime = 0; // TODO: Implement proper calculation
      const tasksOverdue = 0; // TODO: Implement proper calculation
      await this.analyticsRepository.upsertTaskMetrics(
        startDate,
        counts.total,
        counts.created,
        counts.completed,
        counts.inProgress,
        counts.review,
        counts.cancelled,
        tasksOverdue,
        completionRate,
        averageCompletionTime,
      );
      this.logger.log(`📊 Updated task metrics for ${startDate.toISOString()}`);
    } catch (error) {
      this.logger.error('Failed to update task metrics:', error);
    }
  }

  async updatePriorityDistribution(date: Date): Promise<void> {
    try {
      const startDate = startOfDay(date);
      const endDate = addDays(startDate, 1);
      const count = await this.analyticsRepository.countPriorityDistribution(
        startDate,
        endDate,
      );
      await this.analyticsRepository.upsertPriorityDistribution(
        startDate,
        count.low,
        count.medium,
        count.high,
        count.urgent,
      );
      this.logger.log(
        `📊 Updated priority distribution for ${startDate.toISOString()}`,
      );
    } catch (error) {
      this.logger.error('Failed to update priority distribution:', error);
    }
  }

  async updateStatusDistribution(date: Date): Promise<void> {
    try {
      const startDate = startOfDay(date);
      const endDate = addDays(startDate, 1);
      const count = await this.analyticsRepository.countStatusDistribution(
        startDate,
        endDate,
      );
      await this.analyticsRepository.upsertStatusDistribution(
        startDate,
        count.todo,
        count.inProgress,
        count.review,
        count.completed,
        count.cancelled,
      );
      this.logger.log(
        `📊 Updated status distribution for ${startDate.toISOString()}`,
      );
    } catch (error) {
      this.logger.error('Failed to update status distribution:', error);
    }
  }
}
