import { Resolver, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  UserProductivityResponse,
  TaskMetricsResponse,
  TeamAnalyticsResponse,
  TrendAnalysisResponse,
  PriorityDistributionResponse,
  StatusDistributionResponse,
  UserActivityHeatmapResponse,
  ProductivityComparisonResponse,
} from './dto/analytics.dto';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { AnalyticsService } from './analytics.service';
import { GetUserProductivityRequest } from '@repo/grpc/analytics';

@Resolver()
@UseGuards(GqlAuthGuard)
export class AnalyticsResolver {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Query(() => UserProductivityResponse)
  async getUserProductivity(
    @CurrentUser() user: any,
    @Args('startDate') startDate: string,
    @Args('endDate') endDate: string,
    @Args('granularity', { nullable: true, defaultValue: 'DAY' })
    granularity?: string,
  ) {
    return await this.analyticsService.getUserProductivity({
      userId: user.sub,
      startDate,
      endDate,
      granularity: granularity || 'DAY',
    } as GetUserProductivityRequest);
  }

  @Query(() => TaskMetricsResponse)
  async getTaskMetrics(
    @Args('startDate') startDate: string,
    @Args('endDate') endDate: string,
    @Args('granularity', { nullable: true, defaultValue: 'DAY' })
    granularity?: string,
  ) {
    return await this.analyticsService.getTaskMetrics({
      startDate,
      endDate,
      granularity: granularity || 'DAY',
    });
  }

  @Query(() => TeamAnalyticsResponse)
  async getTeamAnalytics(
    @Args('teamId', { nullable: true, defaultValue: 'default' }) teamId: string,
    @Args('startDate') startDate: string,
    @Args('endDate') endDate: string,
    @Args('granularity', { nullable: true, defaultValue: 'DAY' })
    granularity?: string,
  ) {
    return await this.analyticsService.getTeamAnalytics({
      teamId: teamId || 'default',
      startDate,
      endDate,
      granularity: granularity || 'DAY',
    });
  }

  @Query(() => TrendAnalysisResponse)
  async getTrendAnalysis(
    @CurrentUser() user: any,
    @Args('metric') metric: string,
    @Args('startDate') startDate: string,
    @Args('endDate') endDate: string,
  ) {
    return await this.analyticsService.getTrendAnalysis({
      userId: user.sub,
      metric,
      startDate,
      endDate,
    });
  }

  @Query(() => PriorityDistributionResponse)
  async getPriorityDistribution(
    @Args('startDate') startDate: string,
    @Args('endDate') endDate: string,
  ) {
    return await this.analyticsService.getPriorityDistribution({
      startDate,
      endDate,
    });
  }

  @Query(() => StatusDistributionResponse)
  async getStatusDistribution(
    @Args('startDate') startDate: string,
    @Args('endDate') endDate: string,
  ) {
    return await this.analyticsService.getStatusDistribution({
      startDate,
      endDate,
    });
  }

  @Query(() => UserActivityHeatmapResponse)
  async getUserActivityHeatmap(
    @CurrentUser() user: any,
    @Args('startDate') startDate: string,
    @Args('endDate') endDate: string,
  ) {
    return await this.analyticsService.getUserActivityHeatmap({
      userId: user.sub,
      startDate,
      endDate,
    });
  }

  @Query(() => ProductivityComparisonResponse)
  async getProductivityComparison(
    @Args('userIds', { type: () => [String] }) userIds: string[],
    @Args('startDate') startDate: string,
    @Args('endDate') endDate: string,
  ) {
    return await this.analyticsService.getProductivityComparison({
      userIds,
      startDate,
      endDate,
    });
  }
}
