import {Injectable} from '@angular/core';
import {NetworkService} from '../../model/network/network.service';
import {ContentWrapper} from '../../../../common/entities/ConentWrapper';
import {
  ParentDirectoryDTO,
  SubDirectoryDTO,
} from '../../../../common/entities/DirectoryDTO';
import {GalleryCacheService} from './cache.gallery.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {Config} from '../../../../common/config/public/Config';
import {ShareService} from './share.service';
import {NavigationService} from '../../model/navigation.service';
import {QueryParams} from '../../../../common/QueryParams';
import {SearchQueryDTO} from '../../../../common/entities/SearchQueryDTO';
import {ErrorCodes} from '../../../../common/entities/Error';
import {map} from 'rxjs/operators';
import {MediaDTO} from '../../../../common/entities/MediaDTO';
import {FileDTO} from '../../../../common/entities/FileDTO';

@Injectable()
export class ContentService {
  public content: BehaviorSubject<ContentWrapperWithError>;
  public directoryContent: Observable<DirectoryContent>;
  lastRequest: { directory: string } = {
    directory: null,
  };
  private lastDirectory: ParentDirectoryDTO;
  private searchId: any;
  private ongoingSearch: SearchQueryDTO = null;

  constructor(
    private networkService: NetworkService,
    private galleryCacheService: GalleryCacheService,
    private shareService: ShareService,
    private navigationService: NavigationService
  ) {
    this.content = new BehaviorSubject<ContentWrapperWithError>(
      new ContentWrapperWithError()
    );
    this.directoryContent = this.content.pipe(
      map((c) => (c.directory ? c.directory : c.searchResult))
    );
  }

  setContent(content: ContentWrapperWithError): void {
    this.content.next(content);
  }

  public async loadDirectory(directoryName: string): Promise<void> {

    // load from cache
    const cw = this.galleryCacheService.getDirectory(directoryName);

    ContentWrapper.unpack(cw);
    this.setContent(cw);
    this.lastRequest.directory = directoryName;

    // prepare server request
    const params: { [key: string]: any } = {};
    if (Config.Client.Sharing.enabled === true) {
      if (this.shareService.isSharing()) {
        params[QueryParams.gallery.sharingKey_query] =
          this.shareService.getSharingKey();
      }
    }

    if (
      cw.directory &&
      cw.directory.lastModified &&
      cw.directory.lastScanned &&
      !cw.directory.isPartial
    ) {
      params[QueryParams.gallery.knownLastModified] =
        cw.directory.lastModified;
      params[QueryParams.gallery.knownLastScanned] =
        cw.directory.lastScanned;
    }

    try {
      const cw = await this.networkService.getJson<ContentWrapperWithError>(
        '/gallery/content/' + encodeURIComponent(directoryName),
        params
      );

      if (!cw || cw.notModified === true) {
        return;
      }

      this.galleryCacheService.setDirectory(cw); // save it before adding references

      if (this.lastRequest.directory !== directoryName) {
        return;
      }

      ContentWrapper.unpack(cw);

      this.lastDirectory = cw.directory;
      this.setContent(cw);
    } catch (e) {
      console.error(e);
      this.navigationService.toGallery().catch(console.error);
    }
  }

  public async search(query: SearchQueryDTO): Promise<void> {
    if (this.searchId != null) {
      clearTimeout(this.searchId);
    }

    this.ongoingSearch = query;

    this.setContent(new ContentWrapperWithError());
    let cw = this.galleryCacheService.getSearch(query);
    if (!cw || cw.searchResult == null) {
      try {
        cw = await this.networkService.getJson<ContentWrapperWithError>('/search/' + query);
        this.galleryCacheService.setSearch(cw);
      } catch (e) {
        if (e.code === ErrorCodes.LocationLookUp_ERROR) {
          cw.error = 'Cannot find location: ' + e.message;
        } else {
          throw e;
        }
      }
    }

    if (this.ongoingSearch !== query) {
      return;
    }

    ContentWrapper.unpack(cw);
    this.setContent(cw);
  }

  isSearchResult(): boolean {
    return !!this.content.value.searchResult;
  }
}

export class ContentWrapperWithError extends ContentWrapper {
  public error?: string;
}

export interface DirectoryContent {
  directories: SubDirectoryDTO[];
  media: MediaDTO[];
  metaFile: FileDTO[];
}
