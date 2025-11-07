import { InputType, Field, registerEnumType } from '@nestjs/graphql';
import { IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { TaskPriority } from '../../enums/task-priority.enum';
import { TaskStatus } from '../../enums/task-status.enum';

registerEnumType(TaskPriority, {
  name: 'TaskPriority',
});

registerEnumType(TaskStatus, {
  name: 'TaskStatus',
});

@InputType()
export class CreateTaskInput {
  @Field()
  @IsString()
  title: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => TaskStatus, { nullable: true })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @Field(() => TaskPriority, { nullable: true })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  dueDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  assignedTo?: string;
}

@InputType()
export class UpdateTaskInput {
  @Field()
  @IsString()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => TaskStatus, { nullable: true })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @Field(() => TaskPriority, { nullable: true })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  dueDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  assignedTo?: string;
}

@InputType()
export class TaskFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  page: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  limit: number;

  @Field(() => TaskStatus, { nullable: true })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @Field(() => TaskPriority, { nullable: true })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;
}

@InputType()
export class MyTaskFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  page: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  limit: number;

  @Field(() => TaskStatus, { nullable: true })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @Field(() => TaskPriority, { nullable: true })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;
}
