import { Role } from '../enums/role.enum';

export interface AuthUser {
  id: number;
  email: string;
  role: Role;
}
