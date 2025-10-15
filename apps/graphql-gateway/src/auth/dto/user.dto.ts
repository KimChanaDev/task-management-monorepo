import { Optional } from '@nestjs/common';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class UserDto {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field()
  username: string;

  @Field()
  role: string;

  @Field({ nullable: true })
  @Optional()
  createdAt?: string;
}

@ObjectType()
export class MessageDto {
  @Field()
  message: string;
}
