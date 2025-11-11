import { TaskPriority, TaskStatus } from '@prisma/client/task-service/index.js';
import {
  BadRequestRpcException,
  NotFoundRpcException,
} from '@repo/grpc/exception';
import {
  CreateTaskRequest,
  GetDashboardDataRequest,
  GetTasksRequest,
  GetUserTasksRequest,
  UpdateTaskRequest,
  UpdateTaskStatusRequest,
} from '@repo/grpc/task';
import { Prisma } from '@prisma/client/task-service/index.js';

export class TaskValidation {
  static ensureTaskFound(task: Prisma.TaskGetPayload<any> | null, id: string) {
    if (!task) {
      throw new NotFoundRpcException(`Task with ID ${id} not found`);
    }
  }

  static ensureValidPriority(priority: string) {
    if (
      priority &&
      !Object.values(TaskPriority).includes(priority as TaskPriority)
    ) {
      return false;
    }
    return true;
  }

  static ensureValidStatus(status: string) {
    if (status && !Object.values(TaskStatus).includes(status as TaskStatus)) {
      return false;
    }
    return true;
  }

  static ensureUpdateStatusRequest(data: UpdateTaskStatusRequest) {
    if (!data.id) {
      throw new BadRequestRpcException('id is required');
    }
    if (!data.status) {
      throw new BadRequestRpcException('status is required');
    }
    if (!this.ensureValidStatus(data.status)) {
      throw new BadRequestRpcException(`status: ${data.status}`);
    }
  }

  static ensureUpdateTaskRequest(data: UpdateTaskRequest) {
    const errors: string[] = [];
    if (!data.userId) {
      errors.push('userId is required');
    }
    if (data.priority && !this.ensureValidPriority(data.priority)) {
      errors.push(`priority: ${data.priority}`);
    }
    if (data.status && !this.ensureValidStatus(data.status)) {
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

  static ensureGetTaskRequest(id: string, userId: string) {
    if (!id) {
      throw new BadRequestRpcException('id is required');
    }
    if (!userId) {
      throw new BadRequestRpcException('userId is required');
    }
  }

  static ensureGetTasksRequest(params: GetTasksRequest) {
    const errors: string[] = [];
    if (params.page < 1) {
      errors.push('page must be a positive integer');
    }
    if (params.limit < 1) {
      errors.push('limit must be a positive integer');
    }
    if (!this.ensureValidPriority(params.priority)) {
      errors.push(`priority: ${params.priority}`);
    }
    if (!this.ensureValidStatus(params.status)) {
      errors.push(`status: ${params.status}`);
    }
    if (errors.length > 0) {
      throw new BadRequestRpcException(`Invalid request: ${errors.join(', ')}`);
    }
    return true;
  }

  static ensureGetUserTasksRequest(params: GetUserTasksRequest) {
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
    if (!this.ensureValidStatus(params.status)) {
      errors.push(`status: ${params.status}`);
    }
    if (errors.length > 0) {
      throw new BadRequestRpcException(`Invalid request: ${errors.join(', ')}`);
    }
    return true;
  }

  static ensureCreateTaskRequest(data: CreateTaskRequest) {
    const errors: string[] = [];
    if (!data.title) {
      errors.push('title is required');
    }
    if (!data.createdBy) {
      errors.push('createdBy is required');
    }
    if (!this.ensureValidPriority(data.priority)) {
      errors.push(`priority: ${data.priority}`);
    }
    if (!this.ensureValidStatus(data.status)) {
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

  static ensureGetDashboardDataRequest(params: GetDashboardDataRequest) {
    if (!params.userId) {
      throw new BadRequestRpcException('userId is required');
    }
    if (params.recentTasksLimit < 1) {
      throw new BadRequestRpcException(
        'recentTasksLimit must be a positive integer',
      );
    }
    return true;
  }
}
