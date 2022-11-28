import {SearchManager} from '../../../../../src/backend/model/database/sql/SearchManager';
import {DBTestHelper} from '../../../DBTestHelper';
import {SearchQueryDTO, SearchQueryTypes, TextSearch} from '../../../../../src/common/entities/SearchQueryDTO';
import {IndexingManager} from '../../../../../src/backend/model/database/sql/IndexingManager';
import {DirectoryBaseDTO, ParentDirectoryDTO, SubDirectoryDTO} from '../../../../../src/common/entities/DirectoryDTO';
import {TestHelper} from '../../../../TestHelper';
import {ObjectManagers} from '../../../../../src/backend/model/ObjectManagers';
import {GalleryManager} from '../../../../../src/backend/model/database/sql/GalleryManager';
import {Connection} from 'typeorm';
import {PhotoDTO} from '../../../../../src/common/entities/PhotoDTO';
import {VideoDTO} from '../../../../../src/common/entities/VideoDTO';
import {FileDTO} from '../../../../../src/common/entities/FileDTO';
import {PreviewManager} from '../../../../../src/backend/model/database/sql/PreviewManager';
import {Config} from '../../../../../src/common/config/private/Config';
import {SortingMethods} from '../../../../../src/common/entities/SortingMethods';
import {Utils} from '../../../../../src/common/Utils';
import {SQLConnection} from '../../../../../src/backend/model/database/sql/SQLConnection';
import {DirectoryEntity} from '../../../../../src/backend/model/database/sql/enitites/DirectoryEntity';

const deepEqualInAnyOrder = require('deep-equal-in-any-order');
const chai = require('chai');

chai.use(deepEqualInAnyOrder);
const {expect} = chai;

// to help WebStorm to handle the test cases
declare let describe: any;
declare const after: any;
declare const before: any;
const tmpDescribe = describe;
describe = DBTestHelper.describe(); // fake it os IDE plays nicely (recognize the test)


class IndexingManagerTest extends IndexingManager {

  public async saveToDB(scannedDirectory: ParentDirectoryDTO): Promise<void> {
    return super.saveToDB(scannedDirectory);
  }
}

class SearchManagerTest extends SearchManager {

  public flattenSameOfQueries(query: SearchQueryDTO): SearchQueryDTO {
    return super.flattenSameOfQueries(query);
  }

}

class GalleryManagerTest extends GalleryManager {

  public async selectParentDir(connection: Connection, directoryName: string, directoryParent: string): Promise<ParentDirectoryDTO> {
    return super.selectParentDir(connection, directoryName, directoryParent);
  }

  public async fillParentDir(connection: Connection, dir: ParentDirectoryDTO): Promise<void> {
    return super.fillParentDir(connection, dir);
  }
}

describe('PreviewManager', (sqlHelper: DBTestHelper) => {
  describe = tmpDescribe;
  /**
   * dir
   * |-> subDir
   *     |- pFaceLess
   *     |- v
   *     |- p
   *     |- p2
   *     |- gpx
   * |-> subDir2
   *     |- p4
   */

  let dir: ParentDirectoryDTO;
  let subDir: SubDirectoryDTO;
  let subDir2: SubDirectoryDTO;
  let v: VideoDTO;
  let p: PhotoDTO;
  let p2: PhotoDTO;
  let pFaceLess: PhotoDTO;
  let p4: PhotoDTO;
  let gpx: FileDTO;


  const setUpTestGallery = async (): Promise<void> => {
    const directory: ParentDirectoryDTO = TestHelper.getDirectoryEntry();
    subDir = TestHelper.getDirectoryEntry(directory, 'The Phantom Menace');
    subDir2 = TestHelper.getDirectoryEntry(directory, 'Return of the Jedi');
    p = TestHelper.getPhotoEntry1(subDir);
    p.metadata.rating = 4;
    p.metadata.creationDate = 10000;
    p2 = TestHelper.getPhotoEntry2(subDir);
    p2.metadata.rating = 4;
    p2.metadata.creationDate = 20000;
    v = TestHelper.getVideoEntry1(subDir);
    v.metadata.creationDate = 500;
    gpx = TestHelper.getRandomizedGPXEntry(subDir);
    const pFaceLessTmp = TestHelper.getPhotoEntry3(subDir);
    pFaceLessTmp.metadata.rating = 0;
    pFaceLessTmp.metadata.creationDate = 400000;
    delete pFaceLessTmp.metadata.faces;
    p4 = TestHelper.getPhotoEntry4(subDir2);
    p4.metadata.rating = 5;
    p4.metadata.creationDate = 100;

    dir = await DBTestHelper.persistTestDir(directory);

    subDir = dir.directories[0];
    subDir2 = dir.directories[1];
    p = (subDir.media.filter(m => m.name === p.name)[0] as any);
    p2 = (subDir.media.filter(m => m.name === p2.name)[0] as any);
    gpx = (subDir.metaFile[0] as any);
    v = (subDir.media.filter(m => m.name === v.name)[0] as any);
    pFaceLess = (subDir.media.filter(m => m.name === pFaceLessTmp.name)[0] as any);
    p4 = (subDir2.media[0] as any);
  };

  const setUpSqlDB = async () => {
    await sqlHelper.initDB();
    await setUpTestGallery();
    await ObjectManagers.InitSQLManagers();
  };


  before(async () => {
    await setUpSqlDB();
  });


  const previewifyMedia = <T extends FileDTO | PhotoDTO>(m: T): T => {
    const tmpDir: DirectoryBaseDTO = m.directory as DirectoryBaseDTO;
    const tmpM = tmpDir.media;
    const tmpD = tmpDir.directories;
    const tmpP = tmpDir.preview;
    const tmpMT = tmpDir.metaFile;
    delete tmpDir.directories;
    delete tmpDir.media;
    delete tmpDir.preview;
    delete tmpDir.validPreview;
    delete tmpDir.metaFile;
    const ret = Utils.clone(m);
    delete (ret.directory as DirectoryBaseDTO).id;
    delete (ret.directory as DirectoryBaseDTO).lastScanned;
    delete (ret.directory as DirectoryBaseDTO).lastModified;
    delete (ret.directory as DirectoryBaseDTO).mediaCount;
    delete (ret as PhotoDTO).metadata;
    tmpDir.directories = tmpD;
    tmpDir.media = tmpM;
    tmpDir.preview = tmpP;
    tmpDir.metaFile = tmpMT;
    return ret;
  };


  after(async () => {
    await sqlHelper.clearDB();
  });

  afterEach(() => {
    Config.Server.Preview.SearchQuery = null;
    Config.Server.Preview.Sorting = [SortingMethods.descRating, SortingMethods.descDate];
  });


  it('should list directories without preview', async () => {
    const pm = new PreviewManager();
    const partialDir = (d: DirectoryBaseDTO) => {
      return {id: d.id, name: d.name, path: d.path};
    };
    expect(await pm.getPartialDirsWithoutPreviews()).to.deep.equalInAnyOrder([partialDir(dir)]);
    const conn = await SQLConnection.getConnection();

    await conn.createQueryBuilder()
      .update(DirectoryEntity).set({validPreview: false}).execute();

    expect(await pm.getPartialDirsWithoutPreviews()).to.deep.equalInAnyOrder([dir, subDir, subDir2].map(d => partialDir(d)));
  });

  it('should sort directory preview', async () => {
    const pm = new PreviewManager();
    Config.Server.Preview.Sorting = [SortingMethods.descRating, SortingMethods.descDate];
    expect(Utils.clone(await pm.setAndGetPreviewForDirectory(subDir))).to.deep.equalInAnyOrder(previewifyMedia(p2));
    Config.Server.Preview.Sorting = [SortingMethods.descDate];
    expect(Utils.clone(await pm.setAndGetPreviewForDirectory(subDir))).to.deep.equalInAnyOrder(previewifyMedia(pFaceLess));
    Config.Server.Preview.Sorting = [SortingMethods.descRating];
    expect(Utils.clone(await pm.setAndGetPreviewForDirectory(dir))).to.deep.equalInAnyOrder(previewifyMedia(p4));
    Config.Server.Preview.Sorting = [SortingMethods.descName];
    expect(Utils.clone(await pm.setAndGetPreviewForDirectory(dir))).to.deep.equalInAnyOrder(previewifyMedia(v));
  });

  it('should get preview for directory', async () => {
    const pm = new PreviewManager();

    Config.Server.Preview.SearchQuery = {type: SearchQueryTypes.any_text, text: 'Boba'} as TextSearch;
    expect(Utils.clone(await pm.setAndGetPreviewForDirectory(subDir))).to.deep.equalInAnyOrder(previewifyMedia(p));
    Config.Server.Preview.SearchQuery = {type: SearchQueryTypes.any_text, text: 'Derem'} as TextSearch;
    expect(Utils.clone(await pm.setAndGetPreviewForDirectory(subDir))).to.deep.equalInAnyOrder(previewifyMedia(p2));
    expect(Utils.clone(await pm.setAndGetPreviewForDirectory(dir))).to.deep.equalInAnyOrder(previewifyMedia(p2));
    expect(Utils.clone(await pm.setAndGetPreviewForDirectory(subDir2))).to.deep.equalInAnyOrder(previewifyMedia(p4));

  });

  it('should get preview for saved search', async () => {
    const pm = new PreviewManager();
    Config.Server.Preview.SearchQuery = null;
    expect(Utils.clone(await pm.getAlbumPreview({
      searchQuery: {
        type: SearchQueryTypes.any_text,
        text: 'sw'
      } as TextSearch
    }))).to.deep.equalInAnyOrder(previewifyMedia(p4));
    Config.Server.Preview.SearchQuery = {type: SearchQueryTypes.any_text, text: 'Boba'} as TextSearch;
    expect(Utils.clone(await pm.getAlbumPreview({
      searchQuery: {
        type: SearchQueryTypes.any_text,
        text: 'sw'
      } as TextSearch
    }))).to.deep.equalInAnyOrder(previewifyMedia(p));
    Config.Server.Preview.SearchQuery = {type: SearchQueryTypes.any_text, text: 'Derem'} as TextSearch;
    expect(Utils.clone(await pm.getAlbumPreview({
      searchQuery: {
        type: SearchQueryTypes.any_text,
        text: 'sw'
      } as TextSearch
    }))).to.deep.equalInAnyOrder(previewifyMedia(p2));
    // Having a preview search query that does not return valid result
    Config.Server.Preview.SearchQuery = {type: SearchQueryTypes.any_text, text: 'wont find it'} as TextSearch;
    expect(Utils.clone(await pm.getAlbumPreview({
      searchQuery: {
        type: SearchQueryTypes.any_text,
        text: 'Derem'
      } as TextSearch
    }))).to.deep.equalInAnyOrder(previewifyMedia(p2));
    // having a saved search that does not have any image
    Config.Server.Preview.SearchQuery = {type: SearchQueryTypes.any_text, text: 'Derem'} as TextSearch;
    expect(Utils.clone(await pm.getAlbumPreview({
      searchQuery: {
        type: SearchQueryTypes.any_text,
        text: 'wont find it'
      } as TextSearch
    }))).to.deep.equal(null);
  });

  it('should invalidate and update preview', async () => {
    const gm = new GalleryManagerTest();
    const pm = new PreviewManager();
    const conn = await SQLConnection.getConnection();

    const selectDir = async () => {
      return await conn.getRepository(DirectoryEntity).findOne({
        where: {id: subDir.id},
        join: {
          alias: 'dir',
          leftJoinAndSelect: {preview: 'dir.preview'}
        }
      });
    };


    let subdir = await selectDir();

    expect(subdir.validPreview).to.equal(true);
    expect(subdir.preview.id).to.equal(p2.id);

    // new version should invalidate
    await pm.onNewDataVersion(subDir as ParentDirectoryDTO);
    subdir = await selectDir();
    expect(subdir.validPreview).to.equal(false);
    // during invalidation, we do not remove the previous preview (it's good to show at least some photo)
    expect(subdir.preview.id).to.equal(p2.id);

    await conn.createQueryBuilder()
      .update(DirectoryEntity)
      .set({validPreview: false, preview: null}).execute();
    expect((await selectDir()).preview).to.equal(null);

    const res = await gm.selectParentDir(conn, dir.name, dir.path);
    await gm.fillParentDir(conn, res);
    subdir = await selectDir();
    expect(subdir.validPreview).to.equal(true);
    expect(subdir.preview.id).to.equal(p2.id);

  });

});
