import { MediaDTO, MediaDTOUtils } from './MediaDTO';
import { FileDTO } from './FileDTO';
import { PhotoDTO, PreviewPhotoDTO } from './PhotoDTO';
import { Utils } from '../Utils';

export interface DirectoryPathDTO {
  name: string;
  path: string;
}



export interface DirectoryBaseDTO<S extends FileDTO = MediaDTO>
  extends DirectoryPathDTO {
  id: number;
  name: string;
  path: string;
  lastModified: number;
  lastScanned: number;
  isPartial?: boolean;
  parent: DirectoryBaseDTO<S>;
  mediaCount: number;

  directories?: DirectoryBaseDTO<S>[];
  media?: S[];
  metaFile?: FileDTO[];
  preview?: PreviewPhotoDTO;
  validPreview?: boolean; // does not go to the client side
}

export interface ParentDirectoryDTO<S extends FileDTO = MediaDTO>
  extends DirectoryBaseDTO<S> {
  id: number;
  name: string;
  path: string;
  lastModified: number;
  lastScanned: number;
  isPartial?: boolean;
  parent: ParentDirectoryDTO<S>;
  mediaCount: number;
  directories: SubDirectoryDTO<S>[];
  media: S[];
  metaFile: FileDTO[];
}

export interface SubDirectoryDTO<S extends FileDTO = MediaDTO>
  extends DirectoryBaseDTO<S> {
  id: number;
  name: string;
  path: string;
  lastModified: number;
  lastScanned: number;
  isPartial?: boolean;
  parent: ParentDirectoryDTO<S>;
  mediaCount: number;
  preview: PreviewPhotoDTO;
  validPreview?: boolean; // does not go to the client side
}

export const DirectoryDTOUtils = {
  addReferences: (dir: DirectoryBaseDTO): void => {
    dir.media.forEach((media: MediaDTO) => {
      media.directory = dir;
    });

    if (dir.metaFile) {
      dir.metaFile.forEach((file: FileDTO) => {
        file.directory = dir;
      });
    }

    if (dir.directories) {
      dir.directories.forEach((directory) => {
        DirectoryDTOUtils.addReferences(directory);
        directory.parent = dir;
      });
    }
  },

  removeReferences: (dir: DirectoryBaseDTO): DirectoryBaseDTO => {
    if (dir.preview) {
      dir.preview.directory = {
        path: dir.preview.directory.path,
        name: dir.preview.directory.name,
      } as DirectoryPathDTO;

      // make sure that it is not a same object as one of the photo in the media[]
      // as the next foreach would remove the directory
      dir.preview = Utils.clone(dir.preview);
    }

    if (dir.media) {
      dir.media.forEach((media: MediaDTO) => {
        media.directory = null;
      });
    }

    if (dir.metaFile) {
      dir.metaFile.forEach((file: FileDTO) => {
        file.directory = null;
      });
    }
    if (dir.directories) {
      dir.directories.forEach((directory) => {
        DirectoryDTOUtils.removeReferences(directory);
        directory.parent = null;
      });
    }

    delete dir.validPreview; // should not go to the client side;

    return dir;
  },
};
