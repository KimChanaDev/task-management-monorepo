import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { startOfDay } from 'date-fns';

export interface TaskEventData {
  taskId: string;
  userId: string;
  eventType: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
  metadata?: any;
}

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Record a task event for analytics
   */
  async recordTaskEvent(data: TaskEventData): Promise<void> {
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

      this.logger.log(
        `📊 Recorded ${data.eventType} event for task ${data.taskId}`,
      );
    } catch (error) {
      this.logger.error('Failed to record task event:', error);
      throw error;
    }
  }

  /**
   * Update user productivity metrics for a specific date
   */
  async updateUserProductivity(userId: string, date: Date): Promise<void> {
    try {
      const startDate = startOfDay(date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);

      // Get events for the user on this date
      const events = await this.prisma.taskEvent.findMany({
        where: {
          userId,
          timestamp: {
            gte: startDate,
            lt: endDate,
          },
        },
      });

      const tasksCreated = events.filter(
        (e) => e.eventType === 'CREATED',
      ).length;
      const tasksCompleted = events.filter(
        (e) => e.eventType === 'COMPLETED',
      ).length;
      const tasksInProgress = events.filter(
        (e) => e.eventType === 'STATUS_CHANGED' && e.status === 'IN_PROGRESS',
      ).length;

      // Calculate productivity score (0-100)
      const productivityScore = this.calculateProductivityScore(
        tasksCreated,
        tasksCompleted,
        tasksInProgress,
      );

      // Calculate average completion time (simplified - would need task creation/completion timestamps)
      const averageCompletionTime = 0; // TODO: Implement proper calculation

      await this.prisma.userProductivity.upsert({
        where: {
          userId_date: {
            userId,
            date: startDate,
          },
        },
        create: {
          userId,
          date: startDate,
          tasksCreated,
          tasksCompleted,
          tasksInProgress,
          tasksOverdue: 0,
          totalCompletionTime: 0,
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

      this.logger.log(`📈 Updated productivity metrics for user ${userId}`);
    } catch (error) {
      this.logger.error('Failed to update user productivity:', error);
    }
  }

  /**
   * Update daily task metrics
   */
  async updateTaskMetrics(date: Date): Promise<void> {
    try {
      const startDate = startOfDay(date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);

      const events = await this.prisma.taskEvent.findMany({
        where: {
          timestamp: {
            gte: startDate,
            lt: endDate,
          },
        },
      });

      const tasksCreated = events.filter(
        (e) => e.eventType === 'CREATED',
      ).length;
      const tasksCompleted = events.filter(
        (e) => e.eventType === 'COMPLETED',
      ).length;
      const tasksInProgress = events.filter(
        (e) => e.status === 'IN_PROGRESS',
      ).length;
      const tasksInReview = events.filter((e) => e.status === 'REVIEW').length;
      const tasksCancelled = events.filter(
        (e) => e.status === 'CANCELLED',
      ).length;

      const completionRate =
        tasksCreated > 0 ? (tasksCompleted / tasksCreated) * 100 : 0;

      await this.prisma.taskMetrics.upsert({
        where: {
          date: startDate,
        },
        create: {
          date: startDate,
          totalTasks: events.length,
          tasksCreated,
          tasksCompleted,
          tasksInProgress,
          tasksInReview,
          tasksCancelled,
          tasksOverdue: 0,
          completionRate,
          averageCompletionTime: 0,
        },
        update: {
          totalTasks: events.length,
          tasksCreated,
          tasksCompleted,
          tasksInProgress,
          tasksInReview,
          tasksCancelled,
          completionRate,
          timestamp: new Date(),
        },
      });

      this.logger.log(`📊 Updated task metrics for ${startDate.toISOString()}`);
    } catch (error) {
      this.logger.error('Failed to update task metrics:', error);
    }
  }

  /**
   * Update priority distribution
   */
  async updatePriorityDistribution(date: Date): Promise<void> {
    try {
      const startDate = startOfDay(date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);

      const events = await this.prisma.taskEvent.findMany({
        where: {
          timestamp: {
            gte: startDate,
            lt: endDate,
          },
          priority: {
            not: null,
          },
        },
      });

      const low = events.filter((e) => e.priority === 'LOW').length;
      const medium = events.filter((e) => e.priority === 'MEDIUM').length;
      const high = events.filter((e) => e.priority === 'HIGH').length;
      const urgent = events.filter((e) => e.priority === 'URGENT').length;

      await this.prisma.priorityDistribution.upsert({
        where: {
          date: startDate,
        },
        create: {
          date: startDate,
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

      this.logger.log(
        `📊 Updated priority distribution for ${startDate.toISOString()}`,
      );
    } catch (error) {
      this.logger.error('Failed to update priority distribution:', error);
    }
  }

  /**
   * Update status distribution
   */
  async updateStatusDistribution(date: Date): Promise<void> {
    try {
      const startDate = startOfDay(date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);

      const events = await this.prisma.taskEvent.findMany({
        where: {
          timestamp: {
            gte: startDate,
            lt: endDate,
          },
          status: {
            not: null,
          },
        },
      });

      const todo = events.filter((e) => e.status === 'TODO').length;
      const inProgress = events.filter(
        (e) => e.status === 'IN_PROGRESS',
      ).length;
      const review = events.filter((e) => e.status === 'REVIEW').length;
      const completed = events.filter((e) => e.status === 'COMPLETED').length;
      const cancelled = events.filter((e) => e.status === 'CANCELLED').length;

      await this.prisma.statusDistribution.upsert({
        where: {
          date: startDate,
        },
        create: {
          date: startDate,
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

      this.logger.log(
        `📊 Updated status distribution for ${startDate.toISOString()}`,
      );
    } catch (error) {
      this.logger.error('Failed to update status distribution:', error);
    }
  }

  /**
   * Update team analytics
   */
  async updateTeamAnalytics(
    teamId: string,
    date: Date,
    activeUserIds: Set<string>,
  ): Promise<void> {
    try {
      const startDate = startOfDay(date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);

      const events = await this.prisma.taskEvent.findMany({
        where: {
          timestamp: {
            gte: startDate,
            lt: endDate,
          },
        },
      });

      const totalTasksCreated = events.filter(
        (e) => e.eventType === 'CREATED',
      ).length;
      const totalTasksCompleted = events.filter(
        (e) => e.eventType === 'COMPLETED',
      ).length;

      // Calculate team productivity score (simplified)
      const teamProductivityScore =
        totalTasksCreated > 0
          ? (totalTasksCompleted / totalTasksCreated) * 100
          : 0;

      // Calculate collaboration score (based on task assignments)
      const assignmentEvents = events.filter((e) => e.eventType === 'ASSIGNED');
      const collaborationScore = Math.min(
        (assignmentEvents.length / Math.max(totalTasksCreated, 1)) * 100,
        100,
      );

      await this.prisma.teamAnalytics.upsert({
        where: {
          teamId_date: {
            teamId,
            date: startDate,
          },
        },
        create: {
          teamId,
          date: startDate,
          activeUsers: activeUserIds.size,
          totalTasksCreated,
          totalTasksCompleted,
          teamProductivityScore,
          collaborationScore,
        },
        update: {
          activeUsers: activeUserIds.size,
          totalTasksCreated,
          totalTasksCompleted,
          teamProductivityScore,
          collaborationScore,
          timestamp: new Date(),
        },
      });

      this.logger.log(`👥 Updated team analytics for team ${teamId}`);
    } catch (error) {
      this.logger.error('Failed to update team analytics:', error);
    }
  }

  /**
   * Calculate productivity score (0-100)
   */
  private calculateProductivityScore(
    tasksCreated: number,
    tasksCompleted: number,
    tasksInProgress: number,
  ): number {
    if (tasksCreated === 0) return 0;

    const completionRate = (tasksCompleted / tasksCreated) * 100;
    const activityBonus = Math.min(tasksInProgress * 5, 20);

    return Math.min(completionRate + activityBonus, 100);
  }
}
