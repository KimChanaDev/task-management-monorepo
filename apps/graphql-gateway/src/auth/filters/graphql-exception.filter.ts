import { Catch, HttpException, HttpStatus } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
@Catch()
export class GraphQLExceptionFilter implements GqlExceptionFilter {
  catch(exception: unknown) {
    console.error('GraphQLExceptionFilter caught exception: ', exception);
    if (exception instanceof GraphQLError) {
      return exception;
    }

    if (exception instanceof HttpException) {
      const response: string | object = (exception as HttpException).getResponse();
      const status = (exception as HttpException).getStatus();
      let message = (exception as HttpException).message;
      let validationErrors: any[] = [];
      let error: string | undefined = undefined;

      // if response is object and has message array (from ValidationPipe)
      if (typeof response === 'object' && response['message']) {
        error = response['error'];
        const responseMessage = response['message'];
        if (Array.isArray(responseMessage)) {
          message = responseMessage.join(', ');
          validationErrors = responseMessage;
        } else {
          message = responseMessage;
        }
      }

      return new GraphQLError(message, {
        extensions: {
          error,
          statusCode: status,
          validationErrors,
        },
      });
    }

    return exception;
  }
}
