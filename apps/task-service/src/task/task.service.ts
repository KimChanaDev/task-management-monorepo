import { Injectable, Logger } from '@nestjs/common';
import {
  TaskStatus,
  TaskPriority,
  Prisma,
} from '@prisma/client/task-service/index.js';
import {
  AssignTaskRequest,
  CreateTaskRequest,
  DeleteTaskResponse,
  GetTasksRequest,
  GetUserTasksRequest,
  TaskResponse,
  TasksResponse,
  UpdateTaskRequest,
  UpdateTaskStatusRequest,
  GetDashboardDataRequest,
  GetDashboardDataResponse,
} from '@repo/grpc/task';
import { TaskLogic } from './task.logic';
import { TaskRepository } from './task.repository';
import { AuthExternalService } from './external-services/auth.external-service';
import { TaskValidation } from './task.validation';
import { PulsarService } from '../events/services/pulsar.service';
import {
  TaskCreatedEvent,
  TaskUpdatedEvent,
  TaskDeletedEvent,
} from '@repo/pulsar/types';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly authExternalService: AuthExternalService,
    private readonly pulsarService: PulsarService,
  ) {}

  async createTask(data: CreateTaskRequest): Promise<TaskResponse> {
    this.logger.log(`Creating task: ${data.title}`);
    TaskValidation.ensureCreateTaskRequest(data);
    await this.authExternalService.validateUserExists(data.createdBy);
    if (data.assignedTo) {
      await this.authExternalService.validateUserExists(data.assignedTo);
    }
    const task: Prisma.TaskGetPayload<any> =
      await this.taskRepository.createTask(data);
    try {
      const event: TaskCreatedEvent = TaskLogic.mapCreateTaskEvent(
        task,
        data.createdBy,
      );
      await this.pulsarService.publishTaskEvent(event);
    } catch (error) {
      this.logger.error('Failed to publish TaskCreated event', error);
    }
    return { task: TaskLogic.formatTask(task) } as TaskResponse;
  }

  async getTask(id: string, userId: string): Promise<TaskResponse> {
    this.logger.log(`Getting task: ${id}`);
    TaskValidation.ensureGetTaskRequest(id, userId);
    await this.authExternalService.validateUserExists(userId);
    const task: Prisma.TaskGetPayload<any> | null =
      await this.taskRepository.findTaskById(id);
    return {
      task: task ? TaskLogic.formatTask(task) : undefined,
    } as TaskResponse;
  }

  async getTasks(params: GetTasksRequest): Promise<TasksResponse> {
    TaskValidation.ensureGetTasksRequest(params);
    const { page = 1, limit = 10, status, priority } = params;
    const where: Prisma.TaskWhereInput = {
      isDeleted: false,
    };
    if (status) where.status = status as TaskStatus;
    if (priority) where.priority = priority as TaskPriority;
    const [tasks, total] = await this.taskRepository.findTasksByPage(
      page,
      limit,
      where,
      { createdAt: 'desc' },
    );
    return {
      tasks: tasks.map((task) => TaskLogic.formatTask(task)),
      total,
      page,
      limit,
    } as TasksResponse;
  }

  async updateTask(data: UpdateTaskRequest): Promise<TaskResponse> {
    this.logger.log(`Updating task: ${data.id}`);
    TaskValidation.ensureUpdateTaskRequest(data);
    await this.authExternalService.validateUserExists(data.userId);
    const task: Prisma.TaskGetPayload<any> | null =
      await this.taskRepository.findTaskById(data.id, data.userId);
    TaskValidation.ensureTaskFound(task, data.id);
    if (data.assignedTo) {
      await this.authExternalService.validateUserExists(data.assignedTo);
    }
    const before = TaskLogic.mapTaskUpdateDetailsObject(task!);
    const updateData: Prisma.TaskUpdateInput = {
      title: data.title,
      description: data.description || null,
      priority: data.priority as TaskPriority,
      status: data.status as TaskStatus,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      assignedTo: data.assignedTo || null,
    };
    const updated = await this.taskRepository.updateTask(data.id, updateData);
    try {
      const after = TaskLogic.mapTaskUpdateDetailsObject(updated);
      const updatedFields: string[] = Object.keys(before).filter(
        (key) => before[key] !== after[key],
      );
      const event: TaskUpdatedEvent = TaskLogic.mapUpdateTaskEvent(
        data.id,
        data.userId,
        before,
        after,
        updatedFields,
      );
      await this.pulsarService.publishTaskEvent(event);
    } catch (error) {
      this.logger.error('Failed to publish TaskUpdated event', error);
    }

    return { task: TaskLogic.formatTask(updated) } as TaskResponse;
  }

  async deleteTask(id: string, userId: string): Promise<DeleteTaskResponse> {
    this.logger.log(`Deleting task: ${id}`);
    const createByMe = true;
    const task: Prisma.TaskGetPayload<any> | null =
      await this.taskRepository.findTaskById(id, userId, createByMe);
    TaskValidation.ensureTaskFound(task, id);
    await this.taskRepository.deleteTaskById(id);
    try {
      const event: TaskDeletedEvent = TaskLogic.mapDeleteTaskEvent(
        task!,
        userId,
      );
      await this.pulsarService.publishTaskEvent(event);
    } catch (error) {
      this.logger.error('Failed to publish TaskDeleted event', error);
    }
    return { message: 'Task deleted successfully' } as DeleteTaskResponse;
  }

  async assignTask(data: AssignTaskRequest): Promise<TaskResponse> {
    this.logger.log(`Assigning task: ${data.id} to user: ${data.assignedTo}`);
    const task: Prisma.TaskGetPayload<any> | null =
      await this.taskRepository.findTaskById(data.id);
    TaskValidation.ensureTaskFound(task, data.id);
    await this.authExternalService.validateUserExists(data.assignedTo);
    const updateData: Prisma.TaskUpdateInput = { assignedTo: data.assignedTo };
    const updated = await this.taskRepository.updateTask(data.id, updateData);
    return { task: TaskLogic.formatTask(updated) };
  }

  async updateTaskStatus(data: UpdateTaskStatusRequest): Promise<TaskResponse> {
    this.logger.log(`Updating task status: ${data.id} to ${data.status}`);
    TaskValidation.ensureUpdateStatusRequest(data);
    const task: Prisma.TaskGetPayload<any> | null =
      await this.taskRepository.findTaskById(data.id);
    TaskValidation.ensureTaskFound(task, data.id);
    const updateData: Prisma.TaskUpdateInput = {
      status: data.status as TaskStatus,
    };
    const updated = await this.taskRepository.updateTask(data.id, updateData);
    return { task: TaskLogic.formatTask(updated) };
  }

  async getUserTasks(params: GetUserTasksRequest): Promise<TasksResponse> {
    TaskValidation.ensureGetUserTasksRequest(params);
    const { userId, page = 1, limit = 10, status, priority, search } = params;
    await this.authExternalService.validateUserExists(userId);
    // Build AND conditions array
    const andConditions: Prisma.TaskWhereInput[] = [
      {
        OR: [{ createdBy: userId }, { assignedTo: userId }],
      },
      { isDeleted: false },
    ];

    if (status) {
      andConditions.push({ status: status as TaskStatus });
    }

    if (priority) {
      andConditions.push({ priority: priority as TaskPriority });
    }

    if (search) {
      andConditions.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    const where: Prisma.TaskWhereInput = {
      AND: andConditions,
    };

    const [tasks, total] = await this.taskRepository.findTasksByPage(
      page,
      limit,
      where,
      { createdAt: 'desc' },
    );
    return {
      tasks: tasks.map((task) => TaskLogic.formatTask(task)),
      total,
      page,
      limit,
    };
  }

  async getDashboardData(
    data: GetDashboardDataRequest,
  ): Promise<GetDashboardDataResponse> {
    TaskValidation.ensureGetDashboardDataRequest(data);
    const { userId, recentTasksLimit } = data;
    await this.authExternalService.validateUserExists(userId);
    const stats = await this.taskRepository.findRecentTasksAndStat(
      userId,
      recentTasksLimit,
    );
    return {
      recentTasks: stats.recentTasks.map((task) => TaskLogic.formatTask(task)),
      totalCount: stats.total,
      todoCount: stats.todoCount,
      inProgressCount: stats.inProgressCount,
      reviewCount: stats.reviewCount,
      completedCount: stats.completedCount,
      cancelledCount: stats.cancelledCount,
    } as GetDashboardDataResponse;
  }
}
