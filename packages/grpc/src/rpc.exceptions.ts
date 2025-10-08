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

export class InternalRpcException extends RpcException {
  constructor(message: string) {
    super({ code: status.INTERNAL, message });
  }
}

export class BadRequestRpcException extends RpcException {
  constructor(message: string) {
    super({ code: status.INVALID_ARGUMENT, message });
  }
}

export class ServiceUnavailableRpcException extends RpcException {
  constructor(message: string) {
    super({ code: status.UNAVAILABLE, message });
  }
}

export class DeadlineExceededRpcException extends RpcException {
  constructor(message: string) {
    super({ code: status.DEADLINE_EXCEEDED, message });
  }
}

export class ConflictRpcException extends RpcException {
  constructor(message: string) {
    super({ code: status.ABORTED, message });
  }
}

export class FailedPreconditionRpcException extends RpcException {
  constructor(message: string) {
    super({ code: status.FAILED_PRECONDITION, message });
  }
}

export class PermissionDeniedRpcException extends RpcException {
  constructor(message: string) {
    super({ code: status.PERMISSION_DENIED, message });
  }
}

export class ResourceExhaustedRpcException extends RpcException {
  constructor(message: string) {
    super({ code: status.RESOURCE_EXHAUSTED, message });
  }
}

export class UnimplementedRpcException extends RpcException {
  constructor(message: string) {
    super({ code: status.UNIMPLEMENTED, message });
  }
}

export class OutOfRangeRpcException extends RpcException {
  constructor(message: string) {
    super({ code: status.OUT_OF_RANGE, message });
  }
}

export class DataLossRpcException extends RpcException {
  constructor(message: string) {
    super({ code: status.DATA_LOSS, message });
  }
}

export class UnknownRpcException extends RpcException {
  constructor(message: string) {
    super({ code: status.UNKNOWN, message });
  }
}

export class CancelledRpcException extends RpcException {
  constructor(message: string) {
    super({ code: status.CANCELLED, message });
  }
}
