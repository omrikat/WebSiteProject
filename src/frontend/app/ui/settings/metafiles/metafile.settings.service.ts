import {Injectable} from '@angular/core';
import {NetworkService} from '../../../model/network/network.service';
import {SettingsService} from '../settings.service';
import {AbstractSettingsService} from '../_abstract/abstract.settings.service';
import {ClientMetaFileConfig} from '../../../../../common/config/public/ClientConfig';
import {ServerMetaFileConfig} from '../../../../../common/config/private/PrivateConfig';

@Injectable()
export class MetaFileSettingsService extends AbstractSettingsService<{
  server: ServerMetaFileConfig;
  client: ClientMetaFileConfig;
}> {
  constructor(
    private networkService: NetworkService,
    settingsService: SettingsService
  ) {
    super(settingsService);
  }

  public isSupported(): boolean {
    return this.settingsService.settings.value.Client.Map.enabled === true;
  }

  showInSimplifiedMode(): boolean {
    return false;
  }

  public updateSettings(settings: {
    server: ServerMetaFileConfig;
    client: ClientMetaFileConfig;
  }): Promise<void> {
    return this.networkService.putJson('/settings/metafile', {settings});
  }
}
