import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class TaskAttachmentDto {
  @Field(() => ID)
  id: string;

  @Field()
  filename: string;

  @Field()
  originalName: string;

  @Field()
  mimeType: string;

  @Field()
  size: number;

  @Field()
  url: string;

  @Field({ nullable: true })
  thumbnailUrl?: string;

  @Field()
  createdAt: string;
}

@ObjectType()
export class TaskDto {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field()
  priority: string;

  @Field()
  status: string;

  @Field()
  dueDate: string;

  @Field()
  createdBy: string;

  @Field()
  assignedTo: string;

  @Field()
  createdAt: string;

  @Field()
  updatedAt: string;

  @Field(() => [TaskAttachmentDto], { nullable: true })
  attachments?: TaskAttachmentDto[];
}

@ObjectType()
export class MyTasksDto {
  @Field(() => [TaskDto])
  tasks: TaskDto[];

  @Field()
  total: number;
}

@ObjectType()
export class DashboardDto {
  @Field(() => [TaskDto])
  recentTasks: TaskDto[];
  @Field()
  totalCount: number;
  @Field()
  todoCount: number;
  @Field()
  inProgressCount: number;
  @Field()
  reviewCount: number;
  @Field()
  completedCount: number;
  @Field()
  cancelledCount: number;
}
