import { ClientMetadata } from '@repo/common/interfaces';
import { Request } from 'express';

export class AuthLogic {
  public static getClientDetails(req: Request): ClientMetadata {
    const clientMetadata: ClientMetadata = {
      ipAddress:
        (req.headers['x-forwarded-for'] as string) ||
        req.socket.remoteAddress ||
        req.ip,
      userAgent: req.headers['user-agent'],
      deviceId: req.headers['x-device-id'] as string | undefined,
      deviceName: req.headers['x-device-name'] as string | undefined,
    };
    return clientMetadata;
  }
}
