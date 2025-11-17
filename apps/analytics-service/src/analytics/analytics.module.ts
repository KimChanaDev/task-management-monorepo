import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { MetricsService } from './metrics.service';
import { AggregationService } from './aggregation.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, MetricsService, AggregationService],
  exports: [AnalyticsService, MetricsService],
})
export class AnalyticsModule {}
