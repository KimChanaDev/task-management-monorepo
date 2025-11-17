import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

// User Productivity
@ObjectType()
export class UserProductivityData {
  @Field()
  date: string;

  @Field(() => Int)
  tasksCreated: number;

  @Field(() => Int)
  tasksCompleted: number;

  @Field(() => Int)
  tasksInProgress: number;

  @Field(() => Int)
  tasksOverdue: number;

  @Field(() => Float)
  averageCompletionTime: number;

  @Field(() => Float)
  productivityScore: number;
}

@ObjectType()
export class UserProductivitySummary {
  @Field(() => Int)
  totalTasksCreated: number;

  @Field(() => Int)
  totalTasksCompleted: number;

  @Field(() => Float)
  averageProductivityScore: number;

  @Field(() => Float)
  completionRate: number;

  @Field(() => Float)
  averageCompletionTime: number;
}

@ObjectType()
export class UserProductivityResponse {
  @Field(() => [UserProductivityData])
  data: UserProductivityData[];

  @Field(() => UserProductivitySummary)
  summary: UserProductivitySummary;
}

// Task Metrics
@ObjectType()
export class TaskMetricsData {
  @Field()
  date: string;

  @Field(() => Int)
  totalTasks: number;

  @Field(() => Int)
  tasksCreated: number;

  @Field(() => Int)
  tasksCompleted: number;

  @Field(() => Int)
  tasksInProgress: number;

  @Field(() => Int)
  tasksInReview: number;

  @Field(() => Int)
  tasksCancelled: number;

  @Field(() => Int)
  tasksOverdue: number;

  @Field(() => Float)
  completionRate: number;

  @Field(() => Float)
  averageCompletionTime: number;
}

@ObjectType()
export class TaskMetricsSummary {
  @Field(() => Int)
  totalTasks: number;

  @Field(() => Int)
  totalCompleted: number;

  @Field(() => Float)
  overallCompletionRate: number;

  @Field(() => Float)
  averageCompletionTime: number;
}

@ObjectType()
export class TaskMetricsResponse {
  @Field(() => [TaskMetricsData])
  data: TaskMetricsData[];

  @Field(() => TaskMetricsSummary)
  summary: TaskMetricsSummary;
}

// Team Analytics
@ObjectType()
export class TeamAnalyticsData {
  @Field()
  date: string;

  @Field(() => Int)
  activeUsers: number;

  @Field(() => Int)
  totalTasksCreated: number;

  @Field(() => Int)
  totalTasksCompleted: number;

  @Field(() => Float)
  teamProductivityScore: number;

  @Field(() => Float)
  collaborationScore: number;
}

@ObjectType()
export class TeamAnalyticsSummary {
  @Field(() => Int)
  totalActiveUsers: number;

  @Field(() => Int)
  totalTasks: number;

  @Field(() => Int)
  totalCompleted: number;

  @Field(() => Float)
  averageProductivityScore: number;

  @Field(() => Float)
  averageCollaborationScore: number;
}

@ObjectType()
export class TeamAnalyticsResponse {
  @Field(() => [TeamAnalyticsData])
  data: TeamAnalyticsData[];

  @Field(() => TeamAnalyticsSummary)
  summary: TeamAnalyticsSummary;
}

// Trend Analysis
@ObjectType()
export class TrendDataPoint {
  @Field()
  date: string;

  @Field(() => Float)
  value: number;
}

@ObjectType()
export class TrendAnalysisResponse {
  @Field(() => [TrendDataPoint])
  data: TrendDataPoint[];

  @Field()
  trend: string;

  @Field(() => Float)
  changePercentage: number;

  @Field(() => Float)
  average: number;
}

// Priority Distribution
@ObjectType()
export class PriorityDistributionData {
  @Field()
  date: string;

  @Field(() => Int)
  low: number;

  @Field(() => Int)
  medium: number;

  @Field(() => Int)
  high: number;

  @Field(() => Int)
  urgent: number;
}

@ObjectType()
export class PriorityDistributionSummary {
  @Field(() => Int)
  totalLow: number;

  @Field(() => Int)
  totalMedium: number;

  @Field(() => Int)
  totalHigh: number;

  @Field(() => Int)
  totalUrgent: number;
}

@ObjectType()
export class PriorityDistributionResponse {
  @Field(() => [PriorityDistributionData])
  data: PriorityDistributionData[];

  @Field(() => PriorityDistributionSummary)
  summary: PriorityDistributionSummary;
}

// Status Distribution
@ObjectType()
export class StatusDistributionData {
  @Field()
  date: string;

  @Field(() => Int)
  todo: number;

  @Field(() => Int)
  inProgress: number;

  @Field(() => Int)
  review: number;

  @Field(() => Int)
  completed: number;

  @Field(() => Int)
  cancelled: number;
}

@ObjectType()
export class StatusDistributionSummary {
  @Field(() => Int)
  totalTodo: number;

  @Field(() => Int)
  totalInProgress: number;

  @Field(() => Int)
  totalReview: number;

  @Field(() => Int)
  totalCompleted: number;

  @Field(() => Int)
  totalCancelled: number;
}

@ObjectType()
export class StatusDistributionResponse {
  @Field(() => [StatusDistributionData])
  data: StatusDistributionData[];

  @Field(() => StatusDistributionSummary)
  summary: StatusDistributionSummary;
}

// User Activity Heatmap
@ObjectType()
export class HeatmapDataPoint {
  @Field()
  date: string;

  @Field(() => Int)
  hour: number;

  @Field(() => Int)
  activityCount: number;
}

@ObjectType()
export class UserActivityHeatmapResponse {
  @Field(() => [HeatmapDataPoint])
  data: HeatmapDataPoint[];

  @Field(() => Int)
  totalActivities: number;

  @Field(() => Int)
  peakHour: number;

  @Field(() => Int)
  peakDay: number;
}

// Productivity Comparison
@ObjectType()
export class UserProductivityComparison {
  @Field()
  userId: string;

  @Field(() => Int)
  tasksCompleted: number;

  @Field(() => Float)
  productivityScore: number;

  @Field(() => Float)
  completionRate: number;

  @Field(() => Float)
  averageCompletionTime: number;
}

@ObjectType()
export class ProductivityComparisonResponse {
  @Field(() => [UserProductivityComparison])
  users: UserProductivityComparison[];

  @Field()
  topPerformer: string;

  @Field(() => Float)
  averageProductivityScore: number;
}
