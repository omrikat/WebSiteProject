import {Config} from '../../../../common/config/private/Config';
import {DefaultsJobs} from '../../../../common/entities/job/JobDTO';
import {FileJob} from './FileJob';
import {PhotoProcessing} from '../../fileprocessing/PhotoProcessing';
import {GPXProcessing} from '../../fileprocessing/GPXProcessing';
import {FileDTO} from '../../../../common/entities/FileDTO';
import {Logger} from '../../../Logger';

export class GPXCompressionJob extends FileJob {
  public readonly Name = DefaultsJobs[DefaultsJobs['GPX Compression']];

  constructor() {
    super({noVideo: true, noPhoto: true, noMetaFile: false});
  }

  protected async filterMetaFiles(files: FileDTO[]): Promise<FileDTO[]> {
    return files.filter(file => file.name.toLowerCase().endsWith('.gpx'));
  }

  public get Supported(): boolean {
    return Config.Client.MetaFile.GPXCompressing.enabled === true;
  }

  protected async shouldProcess(fPath: string): Promise<boolean> {
    return !(await GPXProcessing.compressedGPXExist(
      fPath
    ));
  }

  protected async processFile(fPath: string): Promise<void> {
    try {
      await GPXProcessing.compressGPX(fPath);
    } catch (e) {
      Logger.warn('GPXCompressionJob', ' Could not compress gpx at: ' + fPath);
    }
  }
}
