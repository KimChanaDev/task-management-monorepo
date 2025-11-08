import { Controller } from '@nestjs/common';
import { TaskService } from './task.service';
import {
  AssignTaskRequest,
  CreateTaskRequest,
  DeleteTaskRequest,
  GetTaskRequest,
  GetTasksRequest,
  GetUserTasksRequest,
  TaskResponse,
  TaskServiceController,
  TaskServiceControllerMethods,
  TasksResponse,
  UpdateTaskRequest,
  UpdateTaskStatusRequest,
  GetDashboardDataRequest,
  GetDashboardDataResponse,
} from '@repo/grpc/task';

@Controller()
@TaskServiceControllerMethods()
export class TaskController implements TaskServiceController {
  constructor(private readonly taskService: TaskService) {}

  async createTask(data: CreateTaskRequest): Promise<TaskResponse> {
    return await this.taskService.createTask(data);
  }

  async getTask(data: GetTaskRequest): Promise<TaskResponse> {
    return await this.taskService.getTask(data.id, data.userId);
  }

  async getTasks(data: GetTasksRequest): Promise<TasksResponse> {
    return await this.taskService.getTasks(data);
  }

  async updateTask(data: UpdateTaskRequest): Promise<TaskResponse> {
    return await this.taskService.updateTask(data);
  }

  async deleteTask(data: DeleteTaskRequest) {
    return this.taskService.deleteTask(data.id, data.userId);
  }

  async assignTask(data: AssignTaskRequest) {
    return this.taskService.assignTask(data);
  }

  async updateTaskStatus(data: UpdateTaskStatusRequest) {
    return this.taskService.updateTaskStatus(data);
  }

  async getUserTasks(data: GetUserTasksRequest) {
    return this.taskService.getUserTasks(data);
  }

  async getDashboardData(
    data: GetDashboardDataRequest,
  ): Promise<GetDashboardDataResponse> {
    return this.taskService.getDashboardData(data);
  }
}
