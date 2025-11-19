import { Controller } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import {
  AnalyticsServiceController,
  AnalyticsServiceControllerMethods,
} from '@repo/grpc/analytics';

@Controller()
@AnalyticsServiceControllerMethods()
export class AnalyticsController implements AnalyticsServiceController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  async getUserProductivity(data: {
    userId: string;
    startDate: string;
    endDate: string;
    granularity?: string;
  }) {
    return this.analyticsService.getUserProductivity(
      data.userId,
      data.startDate,
      data.endDate,
      data.granularity || 'DAY',
    );
  }

  async getTaskMetrics(data: {
    startDate: string;
    endDate: string;
    granularity?: string;
  }) {
    return this.analyticsService.getTaskMetrics(
      data.startDate,
      data.endDate,
      data.granularity || 'DAY',
    );
  }

  async getPriorityDistribution(data: { startDate: string; endDate: string }) {
    return this.analyticsService.getPriorityDistribution(
      data.startDate,
      data.endDate,
    );
  }

  async getStatusDistribution(data: { startDate: string; endDate: string }) {
    return this.analyticsService.getStatusDistribution(
      data.startDate,
      data.endDate,
    );
  }

  async getUserActivityHeatmap(data: {
    userId: string;
    startDate: string;
    endDate: string;
  }) {
    return this.analyticsService.getUserActivityHeatmap(
      data.userId,
      data.startDate,
      data.endDate,
    );
  }
}
