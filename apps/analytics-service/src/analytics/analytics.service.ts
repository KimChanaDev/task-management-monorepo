/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { startOfDay, endOfDay, parseISO, format } from 'date-fns';
import { AnalyticsRepository } from './analytics.repository';
import {
  HeatmapDataPoint,
  PriorityDistributionData,
  PriorityDistributionResponse,
  PriorityDistributionSummary,
  StatusDistributionData,
  StatusDistributionResponse,
  StatusDistributionSummary,
  TaskMetricsData,
  TaskMetricsResponse,
  TaskMetricsSummary,
  UserActivityHeatmapResponse,
  UserProductivityData,
  UserProductivityResponse,
  UserProductivitySummary,
} from '@repo/grpc/analytics';

@Injectable()
export class AnalyticsService {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  async getUserProductivity(
    userId: string,
    startDate: string,
    endDate: string,
    granularity: string,
  ) {
    const productivityData = await this.analyticsRepository.getUserProductivity(
      startOfDay(parseISO(startDate)),
      endOfDay(parseISO(endDate)),
      userId,
    );

    const data: UserProductivityData[] = productivityData.map((item) => ({
      date: format(item.date, 'yyyy-MM-dd'),
      tasksCreated: item.tasksCreated,
      tasksCompleted: item.tasksCompleted,
      tasksInProgress: item.tasksInProgress,
      tasksOverdue: item.tasksOverdue,
      averageCompletionTime: item.averageCompletionTime || 0,
      productivityScore: item.productivityScore || 0,
    }));

    // Calculate summary
    const summary: UserProductivitySummary = {
      totalTasksCreated: data.reduce((sum, d) => sum + d.tasksCreated, 0),
      totalTasksCompleted: data.reduce((sum, d) => sum + d.tasksCompleted, 0),
      averageProductivityScore:
        data.reduce((sum, d) => sum + d.productivityScore, 0) / data.length ||
        0,
      completionRate:
        data.reduce((sum, d) => sum + d.tasksCreated, 0) > 0
          ? (data.reduce((sum, d) => sum + d.tasksCompleted, 0) /
              data.reduce((sum, d) => sum + d.tasksCreated, 0)) *
            100
          : 0,
      averageCompletionTime:
        data.reduce((sum, d) => sum + d.averageCompletionTime, 0) /
          data.length || 0,
    };

    return { data, summary } as UserProductivityResponse;
  }

  async getTaskMetrics(
    startDate: string,
    endDate: string,
    granularity: string,
  ) {
    const metricsData = await this.analyticsRepository.getTaskMetrics(
      startOfDay(parseISO(startDate)),
      endOfDay(parseISO(endDate)),
    );
    const data: TaskMetricsData[] = metricsData.map((item) => ({
      date: format(item.date, 'yyyy-MM-dd'),
      totalTasks: item.totalTasks,
      tasksCreated: item.tasksCreated,
      tasksCompleted: item.tasksCompleted,
      tasksInProgress: item.tasksInProgress,
      tasksInReview: item.tasksInReview,
      tasksCancelled: item.tasksCancelled,
      tasksOverdue: item.tasksOverdue,
      completionRate: item.completionRate || 0,
      averageCompletionTime: item.averageCompletionTime || 0,
    }));

    const summary: TaskMetricsSummary = {
      totalTasks: data.reduce((sum, d) => sum + d.totalTasks, 0),
      totalCompleted: data.reduce((sum, d) => sum + d.tasksCompleted, 0),
      overallCompletionRate:
        data.reduce((sum, d) => sum + d.tasksCreated, 0) > 0
          ? (data.reduce((sum, d) => sum + d.tasksCompleted, 0) /
              data.reduce((sum, d) => sum + d.tasksCreated, 0)) *
            100
          : 0,
      averageCompletionTime:
        data.reduce((sum, d) => sum + d.averageCompletionTime, 0) /
          data.length || 0,
    };

    return { data, summary } as TaskMetricsResponse;
  }

  async getPriorityDistribution(startDate: string, endDate: string) {
    const distributionData =
      await this.analyticsRepository.getPriorityDistribution(
        startOfDay(parseISO(startDate)),
        endOfDay(parseISO(endDate)),
      );

    const data: PriorityDistributionData[] = distributionData.map((item) => ({
      date: format(item.date, 'yyyy-MM-dd'),
      low: item.low,
      medium: item.medium,
      high: item.high,
      urgent: item.urgent,
    }));

    const summary: PriorityDistributionSummary = {
      totalLow: data.reduce((sum, d) => sum + d.low, 0),
      totalMedium: data.reduce((sum, d) => sum + d.medium, 0),
      totalHigh: data.reduce((sum, d) => sum + d.high, 0),
      totalUrgent: data.reduce((sum, d) => sum + d.urgent, 0),
    };

    return { data, summary } as PriorityDistributionResponse;
  }

  async getStatusDistribution(startDate: string, endDate: string) {
    const distributionData =
      await this.analyticsRepository.getStatusDistribution(
        startOfDay(parseISO(startDate)),
        endOfDay(parseISO(endDate)),
      );

    const data: StatusDistributionData[] = distributionData.map((item) => ({
      date: format(item.date, 'yyyy-MM-dd'),
      todo: item.todo,
      inProgress: item.inProgress,
      review: item.review,
      completed: item.completed,
      cancelled: item.cancelled,
    }));

    const summary: StatusDistributionSummary = {
      totalTodo: data.reduce((sum, d) => sum + d.todo, 0),
      totalInProgress: data.reduce((sum, d) => sum + d.inProgress, 0),
      totalReview: data.reduce((sum, d) => sum + d.review, 0),
      totalCompleted: data.reduce((sum, d) => sum + d.completed, 0),
      totalCancelled: data.reduce((sum, d) => sum + d.cancelled, 0),
    };

    return { data, summary } as StatusDistributionResponse;
  }

  async getUserActivityHeatmap(
    userId: string,
    startDate: string,
    endDate: string,
  ) {
    const events = await this.analyticsRepository.getTaskEventForActivity(
      startOfDay(parseISO(startDate)),
      endOfDay(parseISO(endDate)),
      userId,
    );

    // Group by date and hour
    const heatmapMap = new Map<string, number>();
    events.forEach((event) => {
      const date = format(event.timestamp, 'yyyy-MM-dd');
      const hour = event.timestamp.getHours();
      const key = `${date}/${hour}`;
      heatmapMap.set(key, (heatmapMap.get(key) || 0) + 1);
    });

    const data: HeatmapDataPoint[] = Array.from(heatmapMap.entries()).map(
      ([key, count]) => {
        const [date, hour] = key.split('/');
        return {
          date,
          hour: parseInt(hour),
          activityCount: count,
        };
      },
    );
    // Calculate peak hour
    const hourCounts = new Map<number, number>();
    data.forEach((d) => {
      hourCounts.set(d.hour, (hourCounts.get(d.hour) || 0) + d.activityCount);
    });

    const peakHour: number =
      Array.from(hourCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 0;
    return {
      data,
      totalActivities: events.length,
      peakHour,
    } as UserActivityHeatmapResponse;
  }
}
