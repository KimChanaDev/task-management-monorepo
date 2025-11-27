import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';

@InputType()
export class UploadFileInput {
  @Field()
  @IsString()
  filename: string;

  @Field()
  @IsString()
  mimeType: string;

  @Field()
  @IsString()
  content: string; // Base64 encoded file content

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  taskId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;
}

@InputType()
export class GetFilesByTaskInput {
  @Field()
  @IsString()
  taskId: string;

  @Field(() => Int, { defaultValue: 1 })
  @IsNumber()
  @Min(1)
  page: number = 1;

  @Field(() => Int, { defaultValue: 10 })
  @IsNumber()
  @Min(1)
  @Max(100)
  limit: number = 10;
}
