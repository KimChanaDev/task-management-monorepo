import { $Enums } from '@prisma/client/auth-service/index.js';
export interface ValidatedUserModel {
  id: string;
  email: string;
  username: string;
  role: $Enums.Role;
  createdAt: string;
}
