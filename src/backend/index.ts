import * as cluster from 'cluster';
import {Server} from './server';
import {Worker} from './model/threading/Worker';

if ((cluster as any).isMaster) {
  new Server();
} else {
  Worker.process();
}
