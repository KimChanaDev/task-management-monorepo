import { ObjectType, Field, ID } from '@nestjs/graphql';

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
}

@ObjectType()
export class MyTasksDto {
  @Field(() => [TaskDto])
  tasks: TaskDto[];

  @Field()
  total: number;
}
