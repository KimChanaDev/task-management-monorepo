/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { startOfDay, endOfDay, parseISO, format } from 'date-fns';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserProductivity(
    userId: string,
    startDate: string,
    endDate: string,
    granularity: string,
  ) {
    const start = startOfDay(parseISO(startDate));
    const end = endOfDay(parseISO(endDate));

    const productivityData = await this.prisma.userProductivity.findMany({
      where: {
        userId,
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    const data = productivityData.map((item) => ({
      date: format(item.date, 'yyyy-MM-dd'),
      tasksCreated: item.tasksCreated,
      tasksCompleted: item.tasksCompleted,
      tasksInProgress: item.tasksInProgress,
      tasksOverdue: item.tasksOverdue,
      averageCompletionTime: item.averageCompletionTime || 0,
      productivityScore: item.productivityScore || 0,
    }));

    // Calculate summary
    const summary = {
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

    return { data, summary };
  }

  async getTaskMetrics(
    startDate: string,
    endDate: string,
    granularity: string,
  ) {
    const start = startOfDay(parseISO(startDate));
    const end = endOfDay(parseISO(endDate));

    const metricsData = await this.prisma.taskMetrics.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    const data = metricsData.map((item) => ({
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

    const summary = {
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

    return { data, summary };
  }

  async getTeamAnalytics(
    teamId: string,
    startDate: string,
    endDate: string,
    granularity: string,
  ) {
    const start = startOfDay(parseISO(startDate));
    const end = endOfDay(parseISO(endDate));

    const teamData = await this.prisma.teamAnalytics.findMany({
      where: {
        teamId,
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    const data = teamData.map((item) => ({
      date: format(item.date, 'yyyy-MM-dd'),
      activeUsers: item.activeUsers,
      totalTasksCreated: item.totalTasksCreated,
      totalTasksCompleted: item.totalTasksCompleted,
      teamProductivityScore: item.teamProductivityScore || 0,
      collaborationScore: item.collaborationScore || 0,
    }));

    const summary = {
      totalActiveUsers: Math.max(...data.map((d) => d.activeUsers), 0),
      totalTasks: data.reduce((sum, d) => sum + d.totalTasksCreated, 0),
      totalCompleted: data.reduce((sum, d) => sum + d.totalTasksCompleted, 0),
      averageProductivityScore:
        data.reduce((sum, d) => sum + d.teamProductivityScore, 0) /
          data.length || 0,
      averageCollaborationScore:
        data.reduce((sum, d) => sum + d.collaborationScore, 0) / data.length ||
        0,
    };

    return { data, summary };
  }

  async getTrendAnalysis(
    userId: string | undefined,
    metric: string,
    startDate: string,
    endDate: string,
  ) {
    const start = startOfDay(parseISO(startDate));
    const end = endOfDay(parseISO(endDate));

    let data: { date: string; value: number }[] = [];

    if (userId) {
      const productivityData = await this.prisma.userProductivity.findMany({
        where: {
          userId,
          date: {
            gte: start,
            lte: end,
          },
        },
        orderBy: {
          date: 'asc',
        },
      });

      data = productivityData.map((item) => {
        let value = 0;
        switch (metric) {
          case 'PRODUCTIVITY':
            value = item.productivityScore || 0;
            break;
          case 'COMPLETION_RATE':
            value =
              item.tasksCreated > 0
                ? (item.tasksCompleted / item.tasksCreated) * 100
                : 0;
            break;
          case 'COMPLETION_TIME':
            value = item.averageCompletionTime || 0;
            break;
        }
        return {
          date: format(item.date, 'yyyy-MM-dd'),
          value,
        };
      });
    } else {
      const metricsData = await this.prisma.taskMetrics.findMany({
        where: {
          date: {
            gte: start,
            lte: end,
          },
        },
        orderBy: {
          date: 'asc',
        },
      });

      data = metricsData.map((item) => ({
        date: format(item.date, 'yyyy-MM-dd'),
        value: item.completionRate || 0,
      }));
    }

    // Calculate trend
    const values = data.map((d) => d.value);
    const average = values.reduce((sum, v) => sum + v, 0) / values.length || 0;
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    const firstAvg =
      firstHalf.reduce((sum, v) => sum + v, 0) / firstHalf.length || 0;
    const secondAvg =
      secondHalf.reduce((sum, v) => sum + v, 0) / secondHalf.length || 0;

    let trend = 'STABLE';
    let changePercentage = 0;

    if (firstAvg > 0) {
      changePercentage = ((secondAvg - firstAvg) / firstAvg) * 100;
      if (changePercentage > 5) trend = 'INCREASING';
      else if (changePercentage < -5) trend = 'DECREASING';
    }

    return { data, trend, changePercentage, average };
  }

  async getPriorityDistribution(startDate: string, endDate: string) {
    const start = startOfDay(parseISO(startDate));
    const end = endOfDay(parseISO(endDate));

    const distributionData = await this.prisma.priorityDistribution.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    const data = distributionData.map((item) => ({
      date: format(item.date, 'yyyy-MM-dd'),
      low: item.low,
      medium: item.medium,
      high: item.high,
      urgent: item.urgent,
    }));

    const summary = {
      totalLow: data.reduce((sum, d) => sum + d.low, 0),
      totalMedium: data.reduce((sum, d) => sum + d.medium, 0),
      totalHigh: data.reduce((sum, d) => sum + d.high, 0),
      totalUrgent: data.reduce((sum, d) => sum + d.urgent, 0),
    };

    return { data, summary };
  }

  async getStatusDistribution(startDate: string, endDate: string) {
    const start = startOfDay(parseISO(startDate));
    const end = endOfDay(parseISO(endDate));

    const distributionData = await this.prisma.statusDistribution.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    const data = distributionData.map((item) => ({
      date: format(item.date, 'yyyy-MM-dd'),
      todo: item.todo,
      inProgress: item.inProgress,
      review: item.review,
      completed: item.completed,
      cancelled: item.cancelled,
    }));

    const summary = {
      totalTodo: data.reduce((sum, d) => sum + d.todo, 0),
      totalInProgress: data.reduce((sum, d) => sum + d.inProgress, 0),
      totalReview: data.reduce((sum, d) => sum + d.review, 0),
      totalCompleted: data.reduce((sum, d) => sum + d.completed, 0),
      totalCancelled: data.reduce((sum, d) => sum + d.cancelled, 0),
    };

    return { data, summary };
  }

  async getUserActivityHeatmap(
    userId: string,
    startDate: string,
    endDate: string,
  ) {
    const start = startOfDay(parseISO(startDate));
    const end = endOfDay(parseISO(endDate));

    const events = await this.prisma.taskEvent.findMany({
      where: {
        userId,
        timestamp: {
          gte: start,
          lte: end,
        },
      },
    });

    // Group by date and hour
    const heatmapMap = new Map<string, number>();
    events.forEach((event) => {
      const date = format(event.timestamp, 'yyyy-MM-dd');
      const hour = event.timestamp.getHours();
      const key = `${date}-${hour}`;
      heatmapMap.set(key, (heatmapMap.get(key) || 0) + 1);
    });

    const data = Array.from(heatmapMap.entries()).map(([key, count]) => {
      const [date, hour] = key.split('-');
      return {
        date,
        hour: parseInt(hour),
        activityCount: count,
      };
    });

    // Calculate peak hour and day
    const hourCounts = new Map<number, number>();
    data.forEach((d) => {
      hourCounts.set(d.hour, (hourCounts.get(d.hour) || 0) + d.activityCount);
    });

    const peakHour =
      Array.from(hourCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 0;
    const peakDay = 0; // Could be calculated based on day of week

    return {
      data,
      totalActivities: events.length,
      peakHour,
      peakDay,
    };
  }

  async getProductivityComparison(
    userIds: string[],
    startDate: string,
    endDate: string,
  ) {
    const start = startOfDay(parseISO(startDate));
    const end = endOfDay(parseISO(endDate));

    const users = await Promise.all(
      userIds.map(async (userId) => {
        const productivityData = await this.prisma.userProductivity.findMany({
          where: {
            userId,
            date: {
              gte: start,
              lte: end,
            },
          },
        });

        const tasksCompleted = productivityData.reduce(
          (sum, d) => sum + d.tasksCompleted,
          0,
        );
        const tasksCreated = productivityData.reduce(
          (sum, d) => sum + d.tasksCreated,
          0,
        );
        const productivityScore =
          productivityData.reduce(
            (sum, d) => sum + (d.productivityScore || 0),
            0,
          ) / (productivityData.length || 1);
        const completionRate =
          tasksCreated > 0 ? (tasksCompleted / tasksCreated) * 100 : 0;
        const averageCompletionTime =
          productivityData.reduce(
            (sum, d) => sum + (d.averageCompletionTime || 0),
            0,
          ) / (productivityData.length || 1);

        return {
          userId,
          tasksCompleted,
          productivityScore,
          completionRate,
          averageCompletionTime,
        };
      }),
    );

    const topPerformer =
      users.sort((a, b) => b.productivityScore - a.productivityScore)[0]
        ?.userId || '';
    const averageProductivityScore =
      users.reduce((sum, u) => sum + u.productivityScore, 0) / users.length ||
      0;

    return { users, topPerformer, averageProductivityScore };
  }
}
