import { Injectable } from '@angular/core';
import { NetworkService } from '../../../model/network/network.service';
import { SettingsService } from '../settings.service';
import { AbstractSettingsService } from '../_abstract/abstract.settings.service';
import { DatabaseType } from '../../../../../common/config/private/PrivateConfig';
import { ClientSearchConfig } from '../../../../../common/config/public/ClientConfig';

@Injectable()
export class RandomPhotoSettingsService extends AbstractSettingsService<ClientSearchConfig> {
  constructor(
    private networkService: NetworkService,
    settingsService: SettingsService
  ) {
    super(settingsService);
  }

  public showInSimplifiedMode(): boolean {
    return false;
  }

  public isSupported(): boolean {
    return (
      this.settingsService.settings.value.Server.Database.type !==
      DatabaseType.memory
    );
  }

  public updateSettings(settings: ClientSearchConfig): Promise<void> {
    return this.networkService.putJson('/settings/randomPhoto', { settings });
  }
}
