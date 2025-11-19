import { PrismaService } from '../prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { InternalRpcException } from '@repo/grpc/exception';
import { TaskEventData } from '../types/analytics.type';
import { TaskStatus } from '../types/task-status.enum';
import { TaskPriority } from '../types/task-priority.enum';
import { EventType } from '../types/event-type.enum';

@Injectable()
export class AnalyticsRepository {
  private readonly logger = new Logger(AnalyticsRepository.name);
  constructor(private readonly prisma: PrismaService) {}

  public async createTaskEvent(data: TaskEventData): Promise<void> {
    try {
      await this.prisma.taskEvent.create({
        data: {
          taskId: data.taskId,
          userId: data.userId,
          eventType: data.eventType,
          status: data.status,
          priority: data.priority,
          assignedTo: data.assignedTo,
          metadata: data.metadata,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(`Failed to create task event: ${error.message}`);
      throw new InternalRpcException(
        `Failed to create task event: ${error.message}`,
      );
    }
  }

  public async getAllActiveUsers(targetDate: Date): Promise<string[]> {
    try {
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
      return Array.from(new Set(events.map((e) => e.userId))); // new Set to get unique userIds
    } catch (error) {
      this.logger.error(`Failed to get task_events: ${error.message}`);
      throw new InternalRpcException(
        `Failed to get task_events: ${error.message}`,
      );
    }
  }

  public async getTaskEventForActivity(
    startDate: Date,
    endDate: Date,
    userId: string,
  ) {
    try {
      return await this.prisma.taskEvent.findMany({
        where: {
          userId,
          timestamp: {
            gte: startDate,
            lte: endDate,
          },
          OR: [
            { eventType: EventType.UPDATED },
            { eventType: EventType.CREATED },
            { eventType: EventType.DELETED },
          ],
        },
      });
    } catch (error) {
      this.logger.error(`Failed to get task_events: ${error.message}`);
      throw new InternalRpcException(
        `Failed to get task_events: ${error.message}`,
      );
    }
  }

  public async getUserProductivity(
    startDate: Date,
    endDate: Date,
    userId: string,
  ) {
    try {
      return await this.prisma.userProductivity.findMany({
        where: {
          userId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          date: 'asc',
        },
      });
    } catch (error) {
      this.logger.error(`Failed to get user_productivity: ${error.message}`);
      throw new InternalRpcException(
        `Failed to get user_productivity: ${error.message}`,
      );
    }
  }

  public async getTaskMetrics(startDate: Date, endDate: Date) {
    try {
      return await this.prisma.taskMetrics.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          date: 'asc',
        },
      });
    } catch (error) {
      this.logger.error(`Failed to get task_metrics: ${error.message}`);
      throw new InternalRpcException(
        `Failed to get task_metrics: ${error.message}`,
      );
    }
  }

  public async getPriorityDistribution(startDate: Date, endDate: Date) {
    try {
      return await this.prisma.priorityDistribution.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          date: 'asc',
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to get priority_distribution: ${error.message}`,
      );
      throw new InternalRpcException(
        `Failed to get priority_distribution: ${error.message}`,
      );
    }
  }

  public async getStatusDistribution(startDate: Date, endDate: Date) {
    try {
      return await this.prisma.statusDistribution.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          date: 'asc',
        },
      });
    } catch (error) {
      this.logger.error(`Failed to get status_distribution: ${error.message}`);
      throw new InternalRpcException(
        `Failed to get status_distribution: ${error.message}`,
      );
    }
  }

  public async countUserProductivityFactor(
    startDate: Date,
    endDate: Date,
    userIds: string[],
  ) {
    try {
      const baseWhere = {
        userId: { in: userIds },
        timestamp: { gte: startDate, lt: endDate },
      };

      const [created, inProgress, completed] = await Promise.all([
        this.prisma.taskEvent.groupBy({
          by: ['userId'],
          where: {
            ...baseWhere,
            eventType: EventType.CREATED.toString(),
          },
          _count: { userId: true },
        }),
        this.prisma.taskEvent.groupBy({
          by: ['userId'],
          where: {
            ...baseWhere,
            eventType: EventType.STATUS_CHANGED.toString(),
            status: TaskStatus.IN_PROGRESS.toString(),
          },
          _count: { userId: true },
        }),
        this.prisma.taskEvent.groupBy({
          by: ['userId'],
          where: {
            ...baseWhere,
            eventType: EventType.COMPLETED.toString(),
          },
          _count: { userId: true },
        }),
      ]);

      // Create lookup maps for O(1) access
      const createdMap = new Map(
        created.map((item) => [item.userId, item._count.userId]),
      );
      const inProgressMap = new Map(
        inProgress.map((item) => [item.userId, item._count.userId]),
      );
      const completedMap = new Map(
        completed.map((item) => [item.userId, item._count.userId]),
      );

      return userIds.map((userId) => ({
        userId,
        created: createdMap.get(userId) ?? 0,
        inProgress: inProgressMap.get(userId) ?? 0,
        completed: completedMap.get(userId) ?? 0,
      }));
    } catch (error) {
      this.logger.error(
        `Failed to get details of task_event: ${error.message}`,
      );
      throw new InternalRpcException(
        `Failed to get details of task_event: ${error.message}`,
      );
    }
  }

  public async countTaskMetricsFactor(startDate: Date, endDate: Date) {
    try {
      const baseWhere = {
        timestamp: { gte: startDate, lt: endDate },
      };

      const [total, inProgress, review, cancelled, created, completed] =
        await Promise.all([
          this.prisma.taskEvent.count({ where: baseWhere }),
          this.prisma.taskEvent.count({
            where: { ...baseWhere, status: TaskStatus.IN_PROGRESS.toString() },
          }),
          this.prisma.taskEvent.count({
            where: { ...baseWhere, status: TaskStatus.REVIEW.toString() },
          }),
          this.prisma.taskEvent.count({
            where: { ...baseWhere, status: TaskStatus.CANCELLED.toString() },
          }),
          this.prisma.taskEvent.count({
            where: { ...baseWhere, eventType: EventType.CREATED.toString() },
          }),
          this.prisma.taskEvent.count({
            where: { ...baseWhere, eventType: EventType.COMPLETED.toString() },
          }),
        ]);

      return { total, inProgress, review, cancelled, created, completed };
    } catch (error) {
      this.logger.error(
        `Failed to get details of task_event: ${error.message}`,
      );
      throw new InternalRpcException(
        `Failed to get details of task_event: ${error.message}`,
      );
    }
  }

  public async countStatusDistribution(startDate: Date, endDate: Date) {
    try {
      // Use raw query to get the latest event for each task and count by status
      const result = await this.prisma.$queryRaw<
        Array<{ status: string; count: bigint }>
      >`
        SELECT "status", COUNT(*) as count
        FROM (
          SELECT DISTINCT ON ("taskId") "taskId", "status"
          FROM task_events
          WHERE "timestamp" >= ${startDate} AND "timestamp" < ${endDate}
          ORDER BY "taskId", "timestamp" DESC
        ) as latest_events
        GROUP BY "status"
      `;

      const statusCounts = {
        todo: Number(
          result.find((a) => a.status === TaskStatus.TODO.toString())?.count ??
            0,
        ),
        inProgress: Number(
          result.find((a) => a.status === TaskStatus.IN_PROGRESS.toString())
            ?.count ?? 0,
        ),
        review: Number(
          result.find((a) => a.status === TaskStatus.REVIEW.toString())
            ?.count ?? 0,
        ),
        completed: Number(
          result.find((a) => a.status === TaskStatus.DONE.toString())?.count ??
            0,
        ),
        cancelled: Number(
          result.find((a) => a.status === TaskStatus.CANCELLED.toString())
            ?.count ?? 0,
        ),
      };

      return statusCounts;
    } catch (error) {
      this.logger.error(
        `Failed to get details of task_event: ${error.message}`,
      );
      throw new InternalRpcException(
        `Failed to get details of task_event: ${error.message}`,
      );
    }
  }

  public async countPriorityDistribution(startDate: Date, endDate: Date) {
    try {
      // Use raw query to get the latest event for each task and count by priority
      const result = await this.prisma.$queryRaw<
        Array<{ priority: string; count: bigint }>
      >`
        SELECT "priority", COUNT(*) as count
        FROM (
          SELECT DISTINCT ON ("taskId") "taskId", "priority"
          FROM task_events
          WHERE "timestamp" >= ${startDate} AND "timestamp" < ${endDate}
          ORDER BY "taskId", "timestamp" DESC
        ) as latest_events
        GROUP BY "priority"
      `;

      const priorityCounts = {
        low: Number(
          result.find((a) => a.priority === TaskPriority.LOW.toString())
            ?.count ?? 0,
        ),
        medium: Number(
          result.find((a) => a.priority === TaskPriority.MEDIUM.toString())
            ?.count ?? 0,
        ),
        high: Number(
          result.find((a) => a.priority === TaskPriority.HIGH.toString())
            ?.count ?? 0,
        ),

        urgent: Number(
          result.find((a) => a.priority === TaskPriority.URGENT.toString())
            ?.count ?? 0,
        ),
      };

      return priorityCounts;
    } catch (error) {
      this.logger.error(
        `Failed to get details of task_event: ${error.message}`,
      );
      throw new InternalRpcException(
        `Failed to get details of task_event: ${error.message}`,
      );
    }
  }

  public async upsertUserProductivity(
    userId: string,
    date: Date,
    tasksCreated: number,
    tasksCompleted: number,
    tasksInProgress: number,
    tasksOverdue: number,
    totalCompletionTime: number,
    averageCompletionTime: number,
    productivityScore: number,
  ): Promise<void> {
    try {
      await this.prisma.userProductivity.upsert({
        where: {
          userId_date: {
            userId,
            date,
          },
        },
        create: {
          userId,
          date,
          tasksCreated,
          tasksCompleted,
          tasksInProgress,
          tasksOverdue,
          totalCompletionTime,
          averageCompletionTime,
          productivityScore,
        },
        update: {
          tasksCreated,
          tasksCompleted,
          tasksInProgress,
          averageCompletionTime,
          productivityScore,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(`Failed to upsert user_productivity: ${error.message}`);
      throw new InternalRpcException(
        `Failed to upsert user_productivity: ${error.message}`,
      );
    }
  }

  public async upsertTaskMetrics(
    date: Date,
    totalTasks: number,
    tasksCreated: number,
    tasksCompleted: number,
    tasksInProgress: number,
    tasksInReview: number,
    tasksCancelled: number,
    tasksOverdue: number,
    completionRate: number,
    averageCompletionTime: number,
  ): Promise<void> {
    try {
      await this.prisma.taskMetrics.upsert({
        where: {
          date,
        },
        create: {
          date,
          totalTasks,
          tasksCreated,
          tasksCompleted,
          tasksInProgress,
          tasksInReview,
          tasksCancelled,
          tasksOverdue,
          completionRate,
          averageCompletionTime,
        },
        update: {
          totalTasks,
          tasksCreated,
          tasksCompleted,
          tasksInProgress,
          tasksInReview,
          tasksCancelled,
          completionRate,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(`Failed to upsert task_metrics: ${error.message}`);
      throw new InternalRpcException(
        `Failed to upsert task_metrics: ${error.message}`,
      );
    }
  }

  public async upsertPriorityDistribution(
    date: Date,
    low: number,
    medium: number,
    high: number,
    urgent: number,
  ): Promise<void> {
    try {
      await this.prisma.priorityDistribution.upsert({
        where: {
          date,
        },
        create: {
          date,
          low,
          medium,
          high,
          urgent,
        },
        update: {
          low,
          medium,
          high,
          urgent,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to upsert priority_distribution: ${error.message}`,
      );
      throw new InternalRpcException(
        `Failed to upsert priority_distribution: ${error.message}`,
      );
    }
  }

  public async upsertStatusDistribution(
    date: Date,
    todo: number,
    inProgress: number,
    review: number,
    completed: number,
    cancelled: number,
  ): Promise<void> {
    try {
      await this.prisma.statusDistribution.upsert({
        where: {
          date,
        },
        create: {
          date,
          todo,
          inProgress,
          review,
          completed,
          cancelled,
        },
        update: {
          todo,
          inProgress,
          review,
          completed,
          cancelled,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to upsert status_distribution: ${error.message}`,
      );
      throw new InternalRpcException(
        `Failed to upsert status_distribution: ${error.message}`,
      );
    }
  }
}
