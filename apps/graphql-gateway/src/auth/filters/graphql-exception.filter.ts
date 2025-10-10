import { Catch, HttpException } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

@Catch(HttpException)
export class GraphQLExceptionFilter implements GqlExceptionFilter {
  catch(exception: HttpException) {
    const response = exception.getResponse();

    let message = exception.message;
    const extensions: any = {
      code: exception.getStatus(),
    };

    // if response is object and has message array (from ValidationPipe)
    if (typeof response === 'object' && response['message']) {
      const responseMessage = response['message'];

      if (Array.isArray(responseMessage)) {
        // Combine validation errors into a single string
        message = responseMessage.join(', ');
        extensions.validationErrors = responseMessage;
      } else {
        message = responseMessage;
      }
    }

    return new GraphQLError(message, {
      extensions,
    });
  }
}
