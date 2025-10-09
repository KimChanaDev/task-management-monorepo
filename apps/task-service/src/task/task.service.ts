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
} from '@repo/grpc/task';
import { TaskLogic } from './task.logic';
import { TaskRepository } from './task.repository';
import { AuthExternalService } from './external-services/auth.external-service';
import { TaskValidation } from './task.validation';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly authExternalService: AuthExternalService,
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
    return { task: TaskLogic.formatTask(task) } as TaskResponse;
  }

  async getTask(id: string): Promise<TaskResponse> {
    this.logger.log(`Getting task: ${id}`);
    TaskValidation.ensureGetTaskRequest(id);
    const task: Prisma.TaskGetPayload<any> | null =
      await this.taskRepository.findTaskById(id);
    TaskValidation.ensureTaskFound(task, id);
    return { task: TaskLogic.formatTask(task!) } as TaskResponse;
  }

  async getTasks(params: GetTasksRequest): Promise<TasksResponse> {
    TaskValidation.ensureGetTasksRequest(params);
    const { page = 1, limit = 10, status, priority } = params;
    const where: Prisma.TaskWhereInput = {};
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
    const task: Prisma.TaskGetPayload<any> | null =
      await this.taskRepository.findTaskById(data.id);
    TaskValidation.ensureTaskFound(task, data.id);
    if (data.assignedTo) {
      await this.authExternalService.validateUserExists(data.assignedTo);
    }
    const updateData: Prisma.TaskUpdateInput = {
      title: data.title,
      description: data.description,
      priority: data.priority as TaskPriority,
      status: data.status as TaskStatus,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      assignedTo: data.assignedTo,
    };
    const updated = await this.taskRepository.updateTask(data.id, updateData);
    return { task: TaskLogic.formatTask(updated) } as TaskResponse;
  }

  async deleteTask(id: string): Promise<DeleteTaskResponse> {
    this.logger.log(`Deleting task: ${id}`);
    const task: Prisma.TaskGetPayload<any> | null =
      await this.taskRepository.findTaskById(id);
    TaskValidation.ensureTaskFound(task, id);
    await this.taskRepository.deleteTaskById(id);
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
    const { userId, page = 1, limit = 10, status } = params;
    await this.authExternalService.validateUserExists(userId);
    const where: Prisma.TaskWhereInput = {
      OR: [{ createdBy: userId }, { assignedTo: userId }],
    };
    if (status) where.status = status as TaskStatus;

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
}
