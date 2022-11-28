import { ServerThreadingConfig } from '../../config/private/PrivateConfig';
import { ClientOtherConfig } from '../../config/public/ClientConfig';

export interface OtherConfigDTO {
  Server: ServerThreadingConfig;
  Client: ClientOtherConfig;
}
