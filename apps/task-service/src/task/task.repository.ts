import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { InternalRpcException } from '@repo/grpc/exception';
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

  async findTaskById(id: string): Promise<Prisma.TaskGetPayload<any> | null> {
    try {
      const task: Prisma.TaskGetPayload<any> | null =
        await this.prisma.task.findUnique({ where: { id } });
      return task;
    } catch (error) {
      this.logger.error(`Failed to get task ${id}: ${error.message}`);
      throw new InternalRpcException(`Failed to get task: ${error.message}`);
    }
  }

  async findTasksByPage(
    page: number,
    limit: number,
    where: Prisma.TaskWhereInput,
    orderBy: Prisma.Enumerable<Prisma.TaskOrderByWithRelationInput>,
  ): Promise<[Prisma.TaskGetPayload<any>[], number]> {
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
  ): Promise<Prisma.TaskGetPayload<any>> {
    try {
      const updated: Prisma.TaskGetPayload<any> = await this.prisma.task.update(
        {
          where: { id },
          data: updateData,
        },
      );
      return updated;
    } catch (error) {
      this.logger.error(`Failed to update task ${id}: ${error.message}`);
      throw new InternalRpcException(`Failed to update task: ${error.message}`);
    }
  }

  async createTask(
    data: CreateTaskRequest,
  ): Promise<Prisma.TaskGetPayload<any>> {
    try {
      const task: Prisma.TaskGetPayload<any> = await this.prisma.task.create({
        data: {
          title: data.title,
          description: data.description || null,
          priority: (data.priority as TaskPriority) || undefined,
          status: (data.status as TaskStatus) || undefined,
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
          createdBy: data.createdBy,
          assignedTo: data.assignedTo || null,
        },
      });
      return task;
    } catch (error) {
      this.logger.error(`Failed to create task: ${error.message}`);
      throw new InternalRpcException(`Failed to create task: ${error.message}`);
    }
  }
}
