import { Request } from 'express';
import { Users } from 'src/modules/users/users.entity';

export interface RequestWithUser extends Request {
  user: Users;
}
