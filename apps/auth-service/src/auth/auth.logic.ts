import { Prisma } from '@prisma/client/auth-service/index.js';
import { UserPayload } from './interfaces/user-payload.interface';
import { $Enums } from '@prisma/client/auth-service/index.js';
export class AuthLogic {
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
