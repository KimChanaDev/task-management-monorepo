import { $Enums } from '@prisma/client/auth-service/index.js';
export interface UserPayload {
  sub: string;
  email: string;
  username: string;
  role: $Enums.Role;
}
