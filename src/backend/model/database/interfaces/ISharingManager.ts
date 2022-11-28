import { SharingDTO } from '../../../../common/entities/SharingDTO';
import { IObjectManager } from './IObjectManager';
import { FindOptionsWhere } from 'typeorm';

export interface ISharingManager extends IObjectManager {
  findOne(filter: FindOptionsWhere<SharingDTO>): Promise<SharingDTO>;

  createSharing(sharing: SharingDTO): Promise<SharingDTO>;

  updateSharing(sharing: SharingDTO, forceUpdate: boolean): Promise<SharingDTO>;

  listAll(): Promise<SharingDTO[]>;

  deleteSharing(sharingKey: string): Promise<void>;
}
