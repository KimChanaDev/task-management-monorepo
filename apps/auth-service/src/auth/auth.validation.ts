import {
  AlreadyExistsRpcException,
  UnAuthenticateRpcException,
} from '@repo/grpc/exception';

export class AuthValidation {
  public static ensureValidCredential(credential: any) {
    if (!credential) {
      throw new UnAuthenticateRpcException('Invalid credentials');
    }
  }
  public static ensureCredentialNotExpired(expiresAt: Date) {
    if (expiresAt < new Date()) {
      throw new UnAuthenticateRpcException('Credential has been expired');
    }
  }
  public static ensureUserFound(user: any) {
    if (!user) {
      throw new UnAuthenticateRpcException('User not found');
    }
  }
  public static ensureUserNotExists(user: any) {
    if (user) {
      throw new AlreadyExistsRpcException('Email or username already exists');
    }
  }
  public static ensureTokenNotRevoked(isRevoked: boolean) {
    if (isRevoked) {
      throw new UnAuthenticateRpcException(
        'Token has been revoked. Possible token reuse detected.',
      );
    }
  }
}
