import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { ProtoPackage } from '@repo/grpc/package';
import {
  AssignTaskRequest,
  CreateTaskRequest,
  DeleteTaskRequest,
  DeleteTaskResponse,
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
import { GrpcCall } from '@repo/grpc/grpc-call';

@Injectable()
export class TaskService implements OnModuleInit {
  private taskService: TaskServiceClient;

  constructor(@Inject(ProtoPackage.TASK) private client: ClientGrpc) {}

  onModuleInit() {
    this.taskService =
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
      return firstValueFrom(this.taskService.createTask(request));
    });
  }

  async getTask(taskId: string): Promise<TaskResponse> {
    const request: GetTaskRequest = { id: taskId };
    const result: TaskResponse = await GrpcCall.callByHandlerException(() => {
      return firstValueFrom(this.taskService.getTask(request));
    });
    return result;
  }

  async updateTask(input: UpdateTaskInput): Promise<TaskResponse> {
    const request: UpdateTaskRequest = {
      id: input.id,
      title: input.title || '',
      description: input.description || '',
      status: input.status?.toString() || '',
      priority: input.priority?.toString() || '',
      dueDate: input.dueDate || '',
      assignedTo: input.assignedTo || '',
    };
    const result: TaskResponse = await GrpcCall.callByHandlerException(() => {
      return firstValueFrom(this.taskService.updateTask(request));
    });
    return result;
  }

  async deleteTask(taskId: string): Promise<string> {
    const request: DeleteTaskRequest = { id: taskId };
    const result: DeleteTaskResponse = await GrpcCall.callByHandlerException(
      () => {
        return firstValueFrom(this.taskService.deleteTask(request));
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
      return firstValueFrom(this.taskService.getTasks(request));
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
    };
    return await GrpcCall.callByHandlerException(() => {
      return firstValueFrom(this.taskService.getUserTasks(request));
    });
  }

  async assignTask(taskId: string, assignedTo: string): Promise<TaskResponse> {
    return await GrpcCall.callByHandlerException(() => {
      return firstValueFrom(
        this.taskService.assignTask({
          id: taskId,
          assignedTo,
        } as AssignTaskRequest),
      );
    });
  }
}
