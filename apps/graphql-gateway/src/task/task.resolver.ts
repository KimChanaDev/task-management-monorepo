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

@Resolver()
export class TaskResolver {
  constructor(private readonly taskService: TaskService) {}

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
    return result.task as TaskDto;
  }

  @Query(() => TaskDto, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async task(
    @CurrentUser() user: TokenPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<TaskDto | null> {
    const result: TaskResponse = await this.taskService.getTask(id, user.sub);
    return result.task ? ({ ...result.task } as TaskDto) : null;
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
      tasks: result.tasks as TaskDto[],
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
    return result as DashboardDto;
  }
}
