import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import {
  ANALYTICS_SERVICE_NAME,
  AnalyticsServiceClient,
  GetUserProductivityRequest,
  GetTaskMetricsRequest,
  GetPriorityDistributionRequest,
  GetStatusDistributionRequest,
  GetUserActivityHeatmapRequest,
  UserProductivityResponse,
  TaskMetricsResponse,
  PriorityDistributionResponse,
  StatusDistributionResponse,
  UserActivityHeatmapResponse,
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

  async getUserProductivity(
    data: GetUserProductivityRequest,
  ): Promise<UserProductivityResponse> {
    return await GrpcCall.callByHandlerException(() => {
      return firstValueFrom(
        this.analyticsGrpcService.getUserProductivity(data),
      );
    }).then((response) => {
      if (!response.data) response.data = [];
      return response;
    });
  }

  async getTaskMetrics(
    data: GetTaskMetricsRequest,
  ): Promise<TaskMetricsResponse> {
    return await GrpcCall.callByHandlerException(() => {
      return firstValueFrom(this.analyticsGrpcService.getTaskMetrics(data));
    }).then((response) => {
      if (!response.data) response.data = [];
      return response;
    });
  }

  async getPriorityDistribution(
    data: GetPriorityDistributionRequest,
  ): Promise<PriorityDistributionResponse> {
    return await GrpcCall.callByHandlerException(() => {
      return firstValueFrom(
        this.analyticsGrpcService.getPriorityDistribution(data),
      );
    }).then((response) => {
      if (!response.data) response.data = [];
      return response;
    });
  }

  async getStatusDistribution(
    data: GetStatusDistributionRequest,
  ): Promise<StatusDistributionResponse> {
    return await GrpcCall.callByHandlerException(() => {
      return firstValueFrom(
        this.analyticsGrpcService.getStatusDistribution(data),
      );
    }).then((response) => {
      if (!response.data) response.data = [];
      return response;
    });
  }

  async getUserActivityHeatmap(
    data: GetUserActivityHeatmapRequest,
  ): Promise<UserActivityHeatmapResponse> {
    return await GrpcCall.callByHandlerException(() => {
      return firstValueFrom(
        this.analyticsGrpcService.getUserActivityHeatmap(data),
      );
    }).then((response) => {
      if (!response.data) response.data = [];
      return response;
    });
  }
}
