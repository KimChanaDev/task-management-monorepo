import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { TaskModel } from './interfaces/task.interfaces';
import {
  InternalRpcException,
  NotFoundRpcException,
} from '@repo/grpc/exception';
import { CreateTaskRequest } from '@repo/grpc/task';
import {
  TaskPriority,
  TaskStatus,
  Prisma,
} from '@prisma/client/task-service/index.js';

@Injectable()
export class TaskRepository {
  private readonly logger = new Logger(TaskRepository.name);
  constructor(private readonly prisma: PrismaService) {}

  async findTaskById(id: string): Promise<TaskModel> {
    let task: TaskModel | null;
    try {
      task = await this.prisma.task.findUnique({ where: { id } });
    } catch (error) {
      this.logger.error(`Failed to get task ${id}: ${error.message}`);
      throw new InternalRpcException(`Failed to get task: ${error.message}`);
    }
    if (!task) {
      throw new NotFoundRpcException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async findTasksByPage(
    page: number,
    limit: number,
    where: Prisma.TaskWhereInput,
    orderBy: Prisma.Enumerable<Prisma.TaskOrderByWithRelationInput>,
  ): Promise<[TaskModel[], number]> {
    const skip = (page - 1) * limit;
    try {
      return await Promise.all([
        this.prisma.task.findMany({
          where,
          skip,
          take: limit,
          orderBy,
        }),
        this.prisma.task.count({ where }),
      ]);
    } catch (error) {
      this.logger.error(`Failed to get tasks: ${error.message}`);
      throw new InternalRpcException(`Failed to get tasks: ${error.message}`);
    }
  }

  async deleteTaskById(id: string): Promise<void> {
    try {
      await this.prisma.task.delete({ where: { id } });
    } catch (error) {
      this.logger.error(`Failed to delete task ${id}: ${error.message}`);
      throw new InternalRpcException(`Failed to delete task: ${error.message}`);
    }
  }

  async updateTask(
    id: string,
    updateData: Prisma.TaskUpdateInput,
  ): Promise<TaskModel> {
    let updated: TaskModel;
    try {
      updated = await this.prisma.task.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      this.logger.error(`Failed to update task ${id}: ${error.message}`);
      throw new InternalRpcException(`Failed to update task: ${error.message}`);
    }
    return updated;
  }

  async createTask(data: CreateTaskRequest): Promise<TaskModel> {
    let task: TaskModel;
    try {
      task = await this.prisma.task.create({
        data: {
          title: data.title,
          description: data.description,
          priority: data.priority as TaskPriority,
          status: data.status as TaskStatus,
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
          createdBy: data.createdBy,
          assignedTo: data.assignedTo || null,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to create task: ${error.message}`);
      throw new InternalRpcException(`Failed to create task: ${error.message}`);
    }
    return task;
  }
}
