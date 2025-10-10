import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { GqlContext } from 'src/interfaces/gql-context.interface';

export const CurrentUser = createParamDecorator(
  (data: unknown, executionContext: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(executionContext);
    const context: GqlContext = ctx.getContext();
    return context.req.user;
  },
);
