import { Queue } from 'bullmq';
import { env } from '../../config/env';

export const monitorQueue = new Queue('monitor-tasks', {
  connection: { url: env.redisUrl },
});
