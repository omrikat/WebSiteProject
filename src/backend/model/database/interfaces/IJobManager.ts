import { JobProgressDTO } from '../../../../common/entities/job/JobProgressDTO';
import { JobDTO } from '../../../../common/entities/job/JobDTO';
import { IObjectManager } from './IObjectManager';

export interface IJobManager extends IObjectManager {
  run(
    jobId: string,
    config: unknown,
    soloRun: boolean,
    allowParallelRun: boolean
  ): Promise<void>;

  stop(jobId: string): void;

  getProgresses(): { [key: string]: JobProgressDTO };

  getAvailableJobs(): JobDTO[];

  stopSchedules(): void;

  runSchedules(): void;
}
