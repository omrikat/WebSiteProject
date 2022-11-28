/* eslint-disable @typescript-eslint/ban-ts-comment */
import {DirectoryBaseDTO, DirectoryPathDTO, ParentDirectoryDTO} from './DirectoryDTO';
import {SearchResultDTO} from './SearchResultDTO';
import {Utils} from '../Utils';
import {MediaDTO, MediaDTOUtils} from './MediaDTO';
import {FileDTO} from './FileDTO';
import {VideoDTO} from './VideoDTO';
import {PhotoDTO} from './PhotoDTO';


export class ContentWrapper {
  private map: {
    faces: string[],
    keywords: string[],
    lens: string[],
    camera: string[],
    directories: DirectoryPathDTO[]
  };
  private reverseMap: {
    faces: Map<string, number>,
    keywords: Map<string, number>,
    lens: Map<string, number>,
    camera: Map<string, number>,
    directories: Map<string, number>
  };
  public directory: ParentDirectoryDTO;
  public searchResult: SearchResultDTO;
  public notModified: boolean;

  constructor(
    directory: ParentDirectoryDTO = null,
    searchResult: SearchResultDTO = null,
    notModified?: boolean
  ) {
    if (directory) {
      this.directory = directory;
    }
    if (searchResult) {
      this.searchResult = searchResult;
    }
    if (notModified) {
      this.notModified = notModified;
    }
  }


  private static mapify(cw: ContentWrapper, media: FileDTO, isSearchResult: boolean, isPhoto: boolean, isVideo: boolean): void {
    if (isSearchResult) {
      const k = JSON.stringify(media.directory);
      if (!cw.reverseMap.directories.has(k)) {
        cw.reverseMap.directories.set(k, cw.map.directories.length);
        cw.map.directories.push(media.directory);
      }
      // @ts-ignore
      media.d = cw.reverseMap.directories.get(k);
      delete media.directory;
    }

    if ((media as MediaDTO).metadata) {
      // @ts-ignore
      (media as MediaDTO).metadata.s = [(media as MediaDTO).metadata.size.width, (media as MediaDTO).metadata.size.height];
      delete (media as MediaDTO).metadata.size;
    }
    if (isPhoto) {
      if ((media as PhotoDTO).metadata.faces) {
        for (let i = 0; i < (media as PhotoDTO).metadata.faces.length; ++i) {
          const name = (media as PhotoDTO).metadata.faces[i].name;
          if (!cw.reverseMap.faces.has(name)) {
            cw.reverseMap.faces.set(name, cw.map.faces.length);
            cw.map.faces.push(name);
          }
          // @ts-ignore
          (media as PhotoDTO).metadata.faces[i].n = cw.reverseMap.faces.get(name);
          delete (media as PhotoDTO).metadata.faces[i].name;
        }

      }

      if ((media as PhotoDTO).metadata.keywords) {
        for (let i = 0; i < (media as PhotoDTO).metadata.keywords.length; ++i) {
          const k = (media as PhotoDTO).metadata.keywords[i];
          if (!cw.reverseMap.keywords.has(k)) {
            cw.reverseMap.keywords.set(k, cw.map.keywords.length);
            cw.map.keywords.push(k);
          }
          // @ts-ignore
          (media as PhotoDTO).metadata.keywords[i] = cw.reverseMap.keywords.get(k);
        }
      }
      const mapifyOne = <T>(map: string[], reverseMap: Map<string, number>,
                            obj: T, key: keyof T, mappedKey: string) => {

        // @ts-ignore
        const k: string = obj[key];

        if (!reverseMap.has(k)) {
          reverseMap.set(k, map.length);
          map.push(k);
        }
        // @ts-ignore
        obj[mappedKey] = reverseMap.get(k);
        delete obj[key];
      };
      if ((media as PhotoDTO).metadata.cameraData) {
        if ((media as PhotoDTO).metadata.cameraData.lens) {
          mapifyOne(cw.map.lens, cw.reverseMap.lens,
            (media as PhotoDTO).metadata.cameraData, 'lens', 'l');
        }
        if ((media as PhotoDTO).metadata.cameraData.make) {
          mapifyOne(cw.map.camera, cw.reverseMap.camera,
            (media as PhotoDTO).metadata.cameraData, 'make', 'm');
        }
        if ((media as PhotoDTO).metadata.cameraData.model) {
          mapifyOne(cw.map.camera, cw.reverseMap.camera,
            (media as PhotoDTO).metadata.cameraData, 'model', 'ml');
        }

        // @ts-ignore
        (media as PhotoDTO).metadata.c = (media as PhotoDTO).metadata.cameraData;
        delete (media as PhotoDTO).metadata.cameraData;
      }
      if ((media as PhotoDTO).metadata.positionData) {
        if ((media as PhotoDTO).metadata.positionData.country) {
          mapifyOne(cw.map.keywords, cw.reverseMap.keywords,
            (media as PhotoDTO).metadata.positionData, 'country', 'c');
        }
        if ((media as PhotoDTO).metadata.positionData.city) {
          mapifyOne(cw.map.keywords, cw.reverseMap.keywords,
            (media as PhotoDTO).metadata.positionData, 'city', 'cy');
        }
        if ((media as PhotoDTO).metadata.positionData.state) {
          mapifyOne(cw.map.keywords, cw.reverseMap.keywords,
            (media as PhotoDTO).metadata.positionData, 'state', 's');
        }

        if ((media as PhotoDTO).metadata.positionData.GPSData) {
          // @ts-ignore
          (media as PhotoDTO).metadata.positionData.g = [(media as PhotoDTO).metadata.positionData.GPSData.latitude, (media as PhotoDTO).metadata.positionData.GPSData.longitude];
          delete (media as PhotoDTO).metadata.positionData.GPSData;
        }
        // @ts-ignore
        (media as PhotoDTO).metadata.p = (media as PhotoDTO).metadata.positionData;
        delete (media as PhotoDTO).metadata.positionData;
      }
    }

  }

  private static packMedia(cw: ContentWrapper, media: MediaDTO[], isSearchResult: boolean): void {

    // clean up media
    for (let i = 0; i < media.length; ++i) {
      const m = media[i];
      delete m.id;

      if (m.directory) {
        if (isSearchResult) {
          // keep the directory for search result
          delete (m.directory as DirectoryBaseDTO).id;
        } else {
          // for gallery listing, photos belong to one directory,
          // this can be deleted as the directory know its child
          delete m.directory;
        }
      }

      if (MediaDTOUtils.isPhoto(m)) {
        delete (m as VideoDTO).metadata.bitRate;
        delete (m as VideoDTO).metadata.duration;

        // compress faces
        if ((m as PhotoDTO).metadata.faces) {
          for (let j = 0; j < (m as PhotoDTO).metadata.faces.length; ++j) {
            const f = (m as PhotoDTO).metadata.faces[j];
            // @ts-ignore
            f['b'] = [f.box.top, f.box.left, f.box.height, f.box.width];
            delete f.box;
          }
        }
        ContentWrapper.mapify(cw, m, isSearchResult, true, false);
      } else if (MediaDTOUtils.isVideo(m)) {
        delete (m as PhotoDTO).metadata.rating;
        delete (m as PhotoDTO).metadata.caption;
        delete (m as PhotoDTO).metadata.cameraData;
        delete (m as PhotoDTO).metadata.keywords;
        delete (m as PhotoDTO).metadata.faces;
        delete (m as PhotoDTO).metadata.positionData;
        ContentWrapper.mapify(cw, m, isSearchResult, false, true);
      }
      Utils.removeNullOrEmptyObj(m);
    }
  }

  private static packDirectory(cw: ContentWrapper, dir: DirectoryBaseDTO | SearchResultDTO, isSearchResult = false): void {
    if ((dir as DirectoryBaseDTO).preview) {
      (dir as DirectoryBaseDTO).preview.directory = {
        path: (dir as DirectoryBaseDTO).preview.directory.path,
        name: (dir as DirectoryBaseDTO).preview.directory.name,
      } as DirectoryPathDTO;

      // make sure that it is not a same object as one of the photo in the media[]
      // as the next foreach would remove the directory
      (dir as DirectoryBaseDTO).preview = Utils.clone((dir as DirectoryBaseDTO).preview);
    }

    if (dir.media) {
      ContentWrapper.packMedia(cw, dir.media, isSearchResult);
    }

    if (dir.metaFile) {
      for (let i = 0; i < dir.metaFile.length; ++i) {
        if (isSearchResult) {
          delete (dir.metaFile[i].directory as DirectoryBaseDTO).id;
        } else {
          delete dir.metaFile[i].directory;
        }
        delete dir.metaFile[i].id;
        ContentWrapper.mapify(cw, dir.metaFile[i], isSearchResult, false, false);
      }
    }
    if (dir.directories) {
      for (let i = 0; i < dir.directories.length; ++i) {
        ContentWrapper.packDirectory(cw, dir.directories[i]);
        delete dir.directories[i].parent;
      }
    }

    delete (dir as DirectoryBaseDTO).validPreview; // should not go to the client side;
  }

  private static deMapify(cw: ContentWrapper, media: FileDTO, isSearchResult: boolean, isPhoto: boolean, isVideo: boolean): void {

    const deMapifyOne = <T>(map: any[],
                            obj: T, key: keyof T, mappedKey: string) => {
      // @ts-ignore
      obj[key] = map[obj[mappedKey]];
      // @ts-ignore
      delete obj[mappedKey];
    };
    if (isSearchResult) {
      deMapifyOne(cw.map.directories, media, 'directory', 'd');
    }

    if ((media as MediaDTO).metadata) {
      (media as MediaDTO).metadata.size = {
        // @ts-ignore
        width: (media as MediaDTO).metadata.s[0],
        // @ts-ignore
        height: (media as MediaDTO).metadata.s[1],
      };
      // @ts-ignore
      delete (media as MediaDTO).metadata.s;
    }
    if (isPhoto) {
      if ((media as PhotoDTO).metadata.faces) {
        for (let i = 0; i < (media as PhotoDTO).metadata.faces.length; ++i) {
          // @ts-ignore
          (media as PhotoDTO).metadata.faces[i].name = cw.map.faces[(media as PhotoDTO).metadata.faces[i].n];
          // @ts-ignore
          delete (media as PhotoDTO).metadata.faces[i].n;
        }

      }

      if ((media as PhotoDTO).metadata.keywords) {
        for (let i = 0; i < (media as PhotoDTO).metadata.keywords.length; ++i) {
          // @ts-ignore
          (media as PhotoDTO).metadata.keywords[i] = cw.map.keywords[(media as PhotoDTO).metadata.keywords[i]];
        }
      }

      // @ts-ignore
      if ((media as PhotoDTO).metadata.c) {
        // @ts-ignore
        (media as PhotoDTO).metadata.cameraData = (media as PhotoDTO).metadata.c;
        // @ts-ignore
        delete (media as PhotoDTO).metadata.c;

        // @ts-ignore
        if (typeof (media as PhotoDTO).metadata.cameraData.l !== 'undefined') {
          deMapifyOne(cw.map.lens,
            (media as PhotoDTO).metadata.cameraData, 'lens', 'l');
        }
        // @ts-ignore
        if (typeof (media as PhotoDTO).metadata.cameraData.m !== 'undefined') {
          deMapifyOne(cw.map.camera,
            (media as PhotoDTO).metadata.cameraData, 'make', 'm');
        }
        // @ts-ignore
        if (typeof (media as PhotoDTO).metadata.cameraData.ml !== 'undefined') {
          deMapifyOne(cw.map.camera,
            (media as PhotoDTO).metadata.cameraData, 'model', 'ml');
        }

      }
      // @ts-ignore
      if ((media as PhotoDTO).metadata.p) {
        // @ts-ignore
        (media as PhotoDTO).metadata.positionData = (media as PhotoDTO).metadata.p;
        // @ts-ignore
        delete (media as PhotoDTO).metadata.p;
        // @ts-ignore
        if (typeof (media as PhotoDTO).metadata.positionData.c !== 'undefined') {
          deMapifyOne(cw.map.keywords,
            (media as PhotoDTO).metadata.positionData, 'country', 'c');
        }
        // @ts-ignore
        if (typeof (media as PhotoDTO).metadata.positionData.cy !== 'undefined') {
          deMapifyOne(cw.map.keywords,
            (media as PhotoDTO).metadata.positionData, 'city', 'cy');
        }
        // @ts-ignore
        if (typeof (media as PhotoDTO).metadata.positionData.s !== 'undefined') {
          deMapifyOne(cw.map.keywords,
            (media as PhotoDTO).metadata.positionData, 'state', 's');
        }

        // @ts-ignore
        if ((media as PhotoDTO).metadata.positionData['g']) {
          (media as PhotoDTO).metadata.positionData.GPSData =
            {
              // @ts-ignore
              latitude: (media as PhotoDTO).metadata.positionData['g'][0],
              // @ts-ignore
              longitude: (media as PhotoDTO).metadata.positionData['g'][1]
            };
          // @ts-ignore
          delete (media as PhotoDTO).metadata.positionData['g'];
        }
      }
    }

  }

  private static unPackMedia(cw: ContentWrapper, dir: DirectoryBaseDTO, media: MediaDTO[], isSearchResult: boolean): void {
// clean up media
    for (let i = 0; i < media.length; ++i) {
      const m = media[i];
      if (MediaDTOUtils.isPhoto(m)) {
        // compress faces
        if ((m as PhotoDTO).metadata.faces) {
          for (let j = 0; j < (m as PhotoDTO).metadata.faces.length; ++j) {
            const f = (m as PhotoDTO).metadata.faces[j];
            // @ts-ignore
            const boxArr = f.b;
            f.box = {
              top: boxArr[0],
              left: boxArr[1],
              height: boxArr[2],
              width: boxArr[3],
            };
            // @ts-ignore
            delete f.b;
          }
        }
        ContentWrapper.deMapify(cw, m, isSearchResult, true, false);
      } else if (MediaDTOUtils.isVideo(m)) {
        ContentWrapper.deMapify(cw, m, isSearchResult, false, true);
      }
      if (!isSearchResult) {
        m.directory = dir;
      }
    }
  }

  private static unPackDirectory(cw: ContentWrapper, dir: DirectoryBaseDTO | SearchResultDTO, isSearchResult = false): void {
    if (dir.media) {
      ContentWrapper.unPackMedia(cw, dir as DirectoryBaseDTO, dir.media, isSearchResult);
    }

    if (dir.metaFile) {
      for (let i = 0; i < dir.metaFile.length; ++i) {
        if (!isSearchResult) {
          dir.metaFile[i].directory = dir as DirectoryBaseDTO;
        }
        ContentWrapper.deMapify(cw, dir.metaFile[i], isSearchResult, false, false);
      }
    }
    if (dir.directories) {
      for (let i = 0; i < dir.directories.length; ++i) {
        ContentWrapper.unPackDirectory(cw, dir.directories[i]);
        if (!isSearchResult) {
          dir.directories[i].parent = dir as DirectoryBaseDTO;
        }
      }
    }

  }

  static pack(cw: ContentWrapper): ContentWrapper {

    // init CW for packing
    cw.map = {
      faces: [], keywords: [], lens: [],
      camera: [], directories: []
    };
    cw.reverseMap = {
      faces: new Map(), keywords: new Map(),
      lens: new Map(), camera: new Map(), directories: new Map()
    };

    if (cw.directory) {
      ContentWrapper.packDirectory(cw, cw.directory);
    } else if (cw.searchResult) {
      ContentWrapper.packDirectory(cw, cw.searchResult, true);
    }

    // remove empty maps
    for (const k in cw.map) {
      // @ts-ignore
      if (cw.map[k].length === 0) {
        // @ts-ignore
        delete cw.map[k];
      }
    }

    delete cw.reverseMap;
    return cw;

  }

  static unpack(cw: ContentWrapper): ContentWrapper {
    if (!cw || cw.notModified) {
      return cw;
    }
    if (cw.directory) {
      ContentWrapper.unPackDirectory(cw, cw.directory);
    } else if (cw.searchResult) {
      ContentWrapper.unPackDirectory(cw, cw.searchResult, true);
    }
    delete cw.map;
    return cw;
  }
}
