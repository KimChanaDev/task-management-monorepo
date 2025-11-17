import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import {
  ANALYTICS_SERVICE_NAME,
  AnalyticsServiceClient,
  GetUserProductivityRequest,
  GetTaskMetricsRequest,
  GetTeamAnalyticsRequest,
  GetTrendAnalysisRequest,
  GetPriorityDistributionRequest,
  GetStatusDistributionRequest,
  GetUserActivityHeatmapRequest,
  GetProductivityComparisonRequest,
} from '@repo/grpc/analytics';
import { ProtoPackage } from '@repo/grpc/package';
import { GrpcCall } from '../utilities/grpc-call.handler';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AnalyticsService implements OnModuleInit {
  private analyticsGrpcService: AnalyticsServiceClient;

  constructor(@Inject(ProtoPackage.ANALYTICS) private client: ClientGrpc) {}

  onModuleInit() {
    this.analyticsGrpcService = this.client.getService<AnalyticsServiceClient>(
      ANALYTICS_SERVICE_NAME,
    );
  }

  async getUserProductivity(data: GetUserProductivityRequest) {
    return await GrpcCall.callByHandlerException(() => {
      return firstValueFrom(
        this.analyticsGrpcService.getUserProductivity(data),
      );
    });
  }

  async getTaskMetrics(data: GetTaskMetricsRequest) {
    return await GrpcCall.callByHandlerException(() => {
      return firstValueFrom(this.analyticsGrpcService.getTaskMetrics(data));
    });
  }

  async getTeamAnalytics(data: GetTeamAnalyticsRequest) {
    return await GrpcCall.callByHandlerException(() => {
      return firstValueFrom(this.analyticsGrpcService.getTeamAnalytics(data));
    });
  }

  async getTrendAnalysis(data: GetTrendAnalysisRequest) {
    return await GrpcCall.callByHandlerException(() => {
      return firstValueFrom(this.analyticsGrpcService.getTrendAnalysis(data));
    });
  }

  async getPriorityDistribution(data: GetPriorityDistributionRequest) {
    return await GrpcCall.callByHandlerException(() => {
      return firstValueFrom(
        this.analyticsGrpcService.getPriorityDistribution(data),
      );
    });
  }

  async getStatusDistribution(data: GetStatusDistributionRequest) {
    return await GrpcCall.callByHandlerException(() => {
      return firstValueFrom(
        this.analyticsGrpcService.getStatusDistribution(data),
      );
    });
  }

  async getUserActivityHeatmap(data: GetUserActivityHeatmapRequest) {
    return await GrpcCall.callByHandlerException(() => {
      return firstValueFrom(
        this.analyticsGrpcService.getUserActivityHeatmap(data),
      );
    });
  }

  async getProductivityComparison(data: GetProductivityComparisonRequest) {
    return await GrpcCall.callByHandlerException(() => {
      return firstValueFrom(
        this.analyticsGrpcService.getProductivityComparison(data),
      );
    });
  }
}
