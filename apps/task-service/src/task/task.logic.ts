import { TaskPriority, TaskStatus } from '@prisma/client/task-service/index.js';
import { BadRequestRpcException } from '@repo/grpc/exception';
import {
  CreateTaskRequest,
  GetTasksRequest,
  GetUserTasksRequest,
  Task,
  UpdateTaskRequest,
  UpdateTaskStatusRequest,
} from '@repo/grpc/task';
import { TaskModel } from './interfaces/task.interfaces';

export class TaskLogic {
  static formatTask(task: TaskModel): Task {
    return {
      id: task.id,
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? task.dueDate.toISOString() : '',
      createdBy: task.createdBy,
      assignedTo: task.assignedTo || '',
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    } as Task;
  }

  static validatePriority(priority: string) {
    if (
      priority &&
      !Object.values(TaskPriority).includes(priority as TaskPriority)
    ) {
      return false;
    }
    return true;
  }

  static validateStatus(status: string) {
    if (status && !Object.values(TaskStatus).includes(status as TaskStatus)) {
      return false;
    }
    return true;
  }

  static validateUpdateStatusRequest(data: UpdateTaskStatusRequest) {
    if (!data.id) {
      throw new BadRequestRpcException('id is required');
    }
    if (!data.status) {
      throw new BadRequestRpcException('status is required');
    }
    if (!this.validateStatus(data.status)) {
      throw new BadRequestRpcException(`status: ${data.status}`);
    }
  }

  static validateUpdateTaskRequest(data: UpdateTaskRequest) {
    const errors: string[] = [];
    if (data.priority && !this.validatePriority(data.priority)) {
      errors.push(`priority: ${data.priority}`);
    }
    if (data.status && !this.validateStatus(data.status)) {
      errors.push(`status: ${data.status}`);
    }
    if (data.dueDate) {
      const due = new Date(data.dueDate as any);
      if (isNaN(due.getTime())) {
        errors.push(`dueDate incorrect format`);
      }
    }
    if (errors.length > 0) {
      throw new BadRequestRpcException(`Invalid request: ${errors.join(', ')}`);
    }
  }
  static validateGetTaskRequest(id: string) {
    if (!id) {
      throw new BadRequestRpcException('id is required');
    }
  }
  static validateGetTasksRequest(params: GetTasksRequest) {
    const errors: string[] = [];
    if (params.page < 1) {
      errors.push('page must be a positive integer');
    }
    if (params.limit < 1) {
      errors.push('limit must be a positive integer');
    }
    if (!this.validatePriority(params.priority)) {
      errors.push(`priority: ${params.priority}`);
    }
    if (!this.validateStatus(params.status)) {
      errors.push(`status: ${params.status}`);
    }
    if (errors.length > 0) {
      throw new BadRequestRpcException(`Invalid request: ${errors.join(', ')}`);
    }
    return true;
  }

  static validateGetUserTasksRequest(params: GetUserTasksRequest) {
    const errors: string[] = [];
    if (!params.userId) {
      errors.push('userId is required');
    }
    if (params.page < 1) {
      errors.push('page must be a positive integer');
    }
    if (params.limit < 1) {
      errors.push('limit must be a positive integer');
    }
    if (!this.validateStatus(params.status)) {
      errors.push(`status: ${params.status}`);
    }
    if (errors.length > 0) {
      throw new BadRequestRpcException(`Invalid request: ${errors.join(', ')}`);
    }
    return true;
  }

  static validateCreateTaskRequest(data: CreateTaskRequest) {
    const errors: string[] = [];
    if (!data.title) {
      errors.push('title is required');
    }
    if (!data.createdBy) {
      errors.push('createdBy is required');
    }
    if (!this.validatePriority(data.priority)) {
      errors.push(`priority: ${data.priority}`);
    }
    if (!this.validateStatus(data.status)) {
      errors.push(`status: ${data.status}`);
    }
    if (data.dueDate) {
      const due = new Date(data.dueDate as any);
      if (isNaN(due.getTime())) {
        errors.push(`dueDate incorrect format`);
      }
    }
    if (errors.length > 0) {
      throw new BadRequestRpcException(`Invalid request: ${errors.join(', ')}`);
    }
    return true;
  }
}
