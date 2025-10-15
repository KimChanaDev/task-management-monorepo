import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskDto } from './dto/task.dto';
import {
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilterInput,
  MyTaskFilterInput,
} from './dto/task.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TaskResponse, TasksResponse } from '@repo/grpc/task';
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
    @Args('id', { type: () => ID }) id: string,
  ): Promise<TaskDto | null> {
    const result: TaskResponse = await this.taskService.getTask(id);
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

  @Query(() => [TaskDto])
  @UseGuards(GqlAuthGuard)
  async myTasks(
    @CurrentUser() user: TokenPayload,
    @Args('filter', { nullable: true }) filter?: MyTaskFilterInput,
  ): Promise<TaskDto[]> {
    const result: TasksResponse = await this.taskService.listMyTasks(
      user.sub,
      filter,
    );
    return result.tasks as TaskDto[];
  }

  @Mutation(() => TaskDto)
  @UseGuards(GqlAuthGuard)
  async updateTask(@Args('input') input: UpdateTaskInput): Promise<TaskDto> {
    const result = await this.taskService.updateTask(input);
    return result.task as TaskDto;
  }

  @Mutation(() => String)
  @UseGuards(GqlAuthGuard)
  async deleteTask(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<string> {
    const message: string = await this.taskService.deleteTask(id);
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
}
