import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { ProtoPackage } from '@repo/grpc/package';
import {
  AssignTaskRequest,
  CreateTaskRequest,
  DeleteTaskRequest,
  DeleteTaskResponse,
  GetDashboardDataRequest,
  GetDashboardDataResponse,
  GetTaskRequest,
  GetTasksRequest,
  GetUserTasksRequest,
  TASK_SERVICE_NAME,
  TaskResponse,
  TaskServiceClient,
  TasksResponse,
  UpdateTaskRequest,
} from '@repo/grpc/task';
import { firstValueFrom } from 'rxjs';
import {
  CreateTaskInput,
  MyTaskFilterInput,
  TaskFilterInput,
  UpdateTaskInput,
} from './dto/task.input';
import { GrpcCall } from '../utilities/grpc-call.handler';

@Injectable()
export class TaskService implements OnModuleInit {
  private taskGrpcService: TaskServiceClient;

  constructor(@Inject(ProtoPackage.TASK) private client: ClientGrpc) {}

  onModuleInit() {
    this.taskGrpcService =
      this.client.getService<TaskServiceClient>(TASK_SERVICE_NAME);
  }

  async createTask(
    input: CreateTaskInput,
    userId: string,
  ): Promise<TaskResponse> {
    const request: CreateTaskRequest = {
      title: input.title,
      description: input.description || '',
      status: input.status?.toString() || '',
      priority: input.priority?.toString() || '',
      dueDate: input.dueDate || '',
      createdBy: userId,
      assignedTo: input.assignedTo || '',
    };
    return await GrpcCall.callByHandlerException(() => {
      return firstValueFrom(this.taskGrpcService.createTask(request));
    });
  }

  async getTask(taskId: string, userId: string): Promise<TaskResponse> {
    const request: GetTaskRequest = { id: taskId, userId };
    const result: TaskResponse = await GrpcCall.callByHandlerException(() => {
      return firstValueFrom(this.taskGrpcService.getTask(request));
    });
    return result;
  }

  async updateTask(
    input: UpdateTaskInput,
    userId: string,
  ): Promise<TaskResponse> {
    const request: UpdateTaskRequest = {
      id: input.id,
      title: input.title || '',
      description: input.description || '',
      status: input.status?.toString() || '',
      priority: input.priority?.toString() || '',
      dueDate: input.dueDate || '',
      assignedTo: input.assignedTo || '',
      userId,
    };
    const result: TaskResponse = await GrpcCall.callByHandlerException(() => {
      return firstValueFrom(this.taskGrpcService.updateTask(request));
    });
    return result;
  }

  async deleteTask(taskId: string, userId: string): Promise<string> {
    const request: DeleteTaskRequest = { id: taskId, userId };
    const result: DeleteTaskResponse = await GrpcCall.callByHandlerException(
      () => {
        return firstValueFrom(this.taskGrpcService.deleteTask(request));
      },
    );
    return result.message;
  }

  async listTasks(filter?: TaskFilterInput): Promise<TasksResponse> {
    const request: GetTasksRequest = {
      page: filter?.page || 0,
      limit: filter?.limit || 0,
      status: filter?.status?.toString() || '',
      priority: filter?.priority?.toString() || '',
    };
    return await GrpcCall.callByHandlerException(() => {
      return firstValueFrom(this.taskGrpcService.getTasks(request));
    });
  }

  async listMyTasks(
    userId: string,
    filter?: MyTaskFilterInput,
  ): Promise<TasksResponse> {
    const request: GetUserTasksRequest = {
      userId,
      page: filter?.page || 0,
      limit: filter?.limit || 0,
      status: filter?.status?.toString() || '',
      priority: filter?.priority?.toString() || '',
      search: filter?.search || '',
    };
    return await GrpcCall.callByHandlerException(() => {
      return firstValueFrom(this.taskGrpcService.getUserTasks(request));
    });
  }

  async assignTask(taskId: string, assignedTo: string): Promise<TaskResponse> {
    return await GrpcCall.callByHandlerException(() => {
      return firstValueFrom(
        this.taskGrpcService.assignTask({
          id: taskId,
          assignedTo,
        } as AssignTaskRequest),
      );
    });
  }

  async dashboard(
    userId: string,
    limit: number,
  ): Promise<GetDashboardDataResponse> {
    return await GrpcCall.callByHandlerException(() => {
      return firstValueFrom(
        this.taskGrpcService.getDashboardData({
          userId,
          recentTasksLimit: limit,
        } as GetDashboardDataRequest),
      );
    });
  }
}
