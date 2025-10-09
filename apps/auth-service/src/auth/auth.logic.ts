import { Prisma } from '@prisma/client/auth-service/index.js';
import { UserPayload } from './interfaces/user-payload.interface';
import { $Enums } from '@prisma/client/auth-service/index.js';
export class AuthLogic {
  public static parseExpiresIn(expiresIn: string): number {
    const units: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
      M: 30 * 24 * 60 * 60 * 1000,
      y: 365 * 24 * 60 * 60 * 1000,
    };

    const match = expiresIn.match(/^(\d+)([smhdMy])$/);
    if (!match) {
      throw new Error(
        'Invalid expiresIn format. Use formats like: 30d, 24h, 1M, 1y',
      );
    }

    const [, value, unit] = match;
    return parseInt(value, 10) * units[unit];
  }

  public static userWhereUniqueId(id: string): Prisma.UserWhereUniqueInput {
    return { id, isActive: true } as Prisma.UserWhereUniqueInput;
  }
  public static userWhereUniqueEmail(
    email: string,
  ): Prisma.UserWhereUniqueInput {
    return { email, isActive: true } as Prisma.UserWhereUniqueInput;
  }
  public static userWhereEmailOrUsername(
    email: string,
    username: string,
  ): Prisma.UserWhereInput {
    const where: Prisma.UserWhereInput = {
      OR: [
        { email, isActive: true },
        { username, isActive: true },
      ],
    };
    return where;
  }

  public static userSelect(): Prisma.UserSelect {
    return {
      id: true,
      email: true,
      username: true,
      role: true,
      password: true,
      createdAt: true,
    } as Prisma.UserSelect;
  }
  public static userSelectWithoutPassword(): Prisma.UserSelect {
    return {
      id: true,
      email: true,
      username: true,
      role: true,
      createdAt: true,
    } as Prisma.UserSelect;
  }
  public static createUserPayload(
    id: string,
    email: string,
    username: string,
    role: $Enums.Role,
  ): UserPayload {
    const payload: UserPayload = {
      sub: id,
      email,
      username,
      role,
    };
    return payload;
  }
}
