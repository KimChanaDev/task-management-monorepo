import { RpcException } from "@nestjs/microservices";
import { status } from "@grpc/grpc-js";

export class UnAuthenticateRpcException extends RpcException {
  constructor(message: string) {
    super({ code: status.UNAUTHENTICATED, message });
  }
}

export class AlreadyExistsRpcException extends RpcException {
  constructor(message: string) {
    super({ code: status.ALREADY_EXISTS, message });
  }
}

export class NotFoundRpcException extends RpcException {
  constructor(message: string) {
    super({ code: status.NOT_FOUND, message });
  }
}
