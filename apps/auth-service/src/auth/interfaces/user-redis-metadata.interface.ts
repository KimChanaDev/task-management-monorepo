import { $Enums } from '@prisma/client/auth-service/index.js';
export interface UserRedisMetadata {
  userId: string;
  email: string;
  username: string;
  role: $Enums.Role;
  createdAt: string;
  expiresAt: string;
  tokenFamily: string;
}
