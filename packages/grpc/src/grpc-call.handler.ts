import { status } from "@grpc/grpc-js";
import { HttpStatus } from "@nestjs/common";
import { GraphQLError } from "graphql";
export class GrpcCall {
  public static async callByHandlerException<T>(
    operation: () => Promise<T>
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const grpcError = this.parseGrpcError(error);
      const httpStatus = this.grpcStatusToHttpStatus(grpcError.code);
      throw new GraphQLError(grpcError.details, {
        extensions: {
          error: grpcError.graphqlCodeName,
          statusCode: httpStatus,
          grpcCode: grpcError.code,
        },
      });
    }
  }
  private static parseGrpcError(error: any): {
    code: number;
    message: string;
    details: any;
    graphqlCodeName: string;
  } {
    // case error is object that have code, message, details
    if (typeof error === "object" && error !== null) {
      const code = typeof error.code === "number" ? error.code : status.UNKNOWN;
      const message =
        typeof error.message === "string"
          ? error.message
          : "Unknown gRPC error";
      const details = error.details || null;

      return {
        code,
        message,
        details,
        graphqlCodeName: this.grpcCodeToGraphQLName(code),
      };
    }

    if (typeof error === "string") {
      try {
        const parsed = JSON.parse(error);
        return this.parseGrpcError(parsed);
      } catch {
        return {
          code: status.UNKNOWN,
          message: error,
          details: null,
          graphqlCodeName: "INTERNAL_SERVER_ERROR",
        };
      }
    }

    return {
      code: status.UNKNOWN,
      message: "Unknown error from microservice",
      details: null,
      graphqlCodeName: "INTERNAL_SERVER_ERROR",
    };
  }

  private static grpcCodeToGraphQLName(grpcCode: any): string {
    switch (grpcCode) {
      case status.INVALID_ARGUMENT:
        return "BAD_USER_INPUT";
      case status.NOT_FOUND:
        return "NOT_FOUND";
      case status.ALREADY_EXISTS:
        return "CONFLICT";
      case status.PERMISSION_DENIED:
        return "FORBIDDEN";
      case status.UNAUTHENTICATED:
        return "UNAUTHENTICATED";
      case status.FAILED_PRECONDITION:
        return "BAD_REQUEST";
      case status.UNAVAILABLE:
        return "SERVICE_UNAVAILABLE";
      default:
        return "INTERNAL_SERVER_ERROR";
    }
  }

  private static grpcStatusToHttpStatus(grpcCode: any): number {
    switch (grpcCode) {
      case status.OK:
        return HttpStatus.OK;
      case status.CANCELLED:
        return HttpStatus.REQUEST_TIMEOUT;
      case status.INVALID_ARGUMENT:
        return HttpStatus.BAD_REQUEST;
      case status.DEADLINE_EXCEEDED:
        return HttpStatus.REQUEST_TIMEOUT;
      case status.NOT_FOUND:
        return HttpStatus.NOT_FOUND;
      case status.ALREADY_EXISTS:
        return HttpStatus.CONFLICT;
      case status.PERMISSION_DENIED:
        return HttpStatus.FORBIDDEN;
      case status.UNAUTHENTICATED:
        return HttpStatus.UNAUTHORIZED;
      case status.RESOURCE_EXHAUSTED:
        return HttpStatus.TOO_MANY_REQUESTS;
      case status.FAILED_PRECONDITION:
        return HttpStatus.PRECONDITION_FAILED;
      case status.ABORTED:
        return HttpStatus.CONFLICT;
      case status.OUT_OF_RANGE:
        return HttpStatus.BAD_REQUEST;
      case status.UNIMPLEMENTED:
        return HttpStatus.NOT_IMPLEMENTED;
      case status.INTERNAL:
        return HttpStatus.INTERNAL_SERVER_ERROR;
      case status.UNAVAILABLE:
        return HttpStatus.SERVICE_UNAVAILABLE;
      case status.DATA_LOSS:
        return HttpStatus.INTERNAL_SERVER_ERROR;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }
}
