import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { TaskService } from './task.service';
import { DashboardDto, MyTasksDto, TaskDto } from './dto/task.dto';
import {
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilterInput,
  MyTaskFilterInput,
} from './dto/task.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  GetDashboardDataResponse,
  TaskResponse,
  TasksResponse,
} from '@repo/grpc/task';
import { type TokenPayload } from '@repo/grpc/auth';
import { FileService } from '../file/file.service';
import { ListFilesResponse } from '@repo/grpc/file';
import { GrpcUtils } from '@repo/grpc/utils';

@Resolver(() => TaskDto)
export class TaskResolver {
  constructor(
    private readonly taskService: TaskService,
    private readonly fileService: FileService,
  ) {}

  @Mutation(() => TaskDto)
  @UseGuards(GqlAuthGuard)
  async createTask(
    @Args('input') input: CreateTaskInput,
    @CurrentUser() user: TokenPayload,
  ): Promise<TaskDto> {
    const result: TaskResponse = await this.taskService.createTask(
      input,
      user.sub,
    );
    if (input.attachments && input.attachments.length > 0) {
      for (const file of input.attachments) {
        await this.fileService.uploadFile(
          { ...file, taskId: result.task?.id },
          user.sub,
        );
      }
    }
    return result.task as TaskDto;
  }

  @Query(() => TaskDto, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async task(
    @CurrentUser() user: TokenPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<TaskDto | null> {
    const result: TaskResponse = await this.taskService.getTask(id, user.sub);
    const files: ListFilesResponse = await this.fileService.getFilesByTask({
      taskId: id,
      page: 1,
      limit: 5,
    });
    const response = result.task ? ({ ...result.task } as TaskDto) : null;
    if (response && files.files && files.files.length > 0) {
      response.attachments = files.files.map((file) => ({
        id: file.id,
        filename: file.filename,
        originalName: file.originalName,
        mimeType: file.mimeType,
        size: GrpcUtils.toNumber(file.size),
        url: file.url,
        thumbnailUrl: file.thumbnailUrl,
        createdAt: file.createdAt,
      }));
    }
    return response;
  }

  @Query(() => [TaskDto])
  @UseGuards(GqlAuthGuard)
  async tasks(
    @Args('filter', { nullable: true }) filter?: TaskFilterInput,
  ): Promise<TaskDto[]> {
    const result: TasksResponse = await this.taskService.listTasks(filter);
    return result.tasks as TaskDto[];
  }

  @Query(() => MyTasksDto)
  @UseGuards(GqlAuthGuard)
  async myTasks(
    @CurrentUser() user: TokenPayload,
    @Args('filter', { nullable: true }) filter?: MyTaskFilterInput,
  ): Promise<MyTasksDto> {
    const result: TasksResponse = await this.taskService.listMyTasks(
      user.sub,
      filter,
    );
    return {
      tasks: (result.tasks ?? []) as TaskDto[],
      total: result.total,
    } as MyTasksDto;
  }

  @Mutation(() => TaskDto)
  @UseGuards(GqlAuthGuard)
  async updateTask(
    @CurrentUser() user: TokenPayload,
    @Args('input') input: UpdateTaskInput,
  ): Promise<TaskDto> {
    const result = await this.taskService.updateTask(input, user.sub);
    if (input.newAttachments && input.newAttachments.length > 0) {
      for (const file of input.newAttachments) {
        await this.fileService.uploadFile(
          { ...file, taskId: result.task?.id },
          user.sub,
        );
      }
    }
    if (input.removedAttachmentIds && input.removedAttachmentIds.length > 0) {
      for (const fileId of input.removedAttachmentIds) {
        await this.fileService.deleteFile(fileId, user.sub);
      }
    }
    return result.task as TaskDto;
  }

  @Mutation(() => String)
  @UseGuards(GqlAuthGuard)
  async deleteTask(
    @CurrentUser() user: TokenPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<string> {
    const message: string = await this.taskService.deleteTask(id, user.sub);
    return message;
  }

  @Mutation(() => TaskDto)
  @UseGuards(GqlAuthGuard)
  async assignTask(
    @Args('id', { type: () => ID }) id: string,
    @Args('assignedTo') assignedTo: string,
  ): Promise<TaskDto> {
    const result: TaskResponse = await this.taskService.assignTask(
      id,
      assignedTo,
    );
    return result.task as TaskDto;
  }

  @Query(() => DashboardDto)
  @UseGuards(GqlAuthGuard)
  async dashboard(
    @CurrentUser() user: TokenPayload,
    @Args('limit', { type: () => Int }) limit: number,
  ): Promise<DashboardDto> {
    const result: GetDashboardDataResponse = await this.taskService.dashboard(
      user.sub,
      limit,
    );
    return {
      recentTasks: (result.recentTasks ?? []) as TaskDto[],
      totalCount: result.totalCount,
      todoCount: result.todoCount,
      inProgressCount: result.inProgressCount,
      reviewCount: result.reviewCount,
      completedCount: result.completedCount,
      cancelledCount: result.cancelledCount,
    } as DashboardDto;
  }
}
