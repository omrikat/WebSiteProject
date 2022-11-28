import { UserDTO, UserRoles } from '../../../../common/entities/UserDTO';
import { IObjectManager } from './IObjectManager';
import { FindOptionsWhere } from 'typeorm';

export interface IUserManager extends IObjectManager {
  findOne(filter: FindOptionsWhere<UserDTO>): Promise<UserDTO>;

  find(filter: FindOptionsWhere<UserDTO>): Promise<UserDTO[]>;

  createUser(user: UserDTO): Promise<UserDTO>;

  deleteUser(id: number): Promise<UserDTO>;

  changeRole(id: number, newRole: UserRoles): Promise<UserDTO>;

}
