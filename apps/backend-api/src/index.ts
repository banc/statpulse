import 'dotenv/config';

import { createApp } from './app';
import { env } from './config/env';
import { syncActiveMonitorSchedulers } from './modules/monitors/monitor.service';

const app = createApp();

app.listen(env.port, async () => {
  console.log(`🚀 Backend StatPulse started on port ${env.port}`);
  await syncActiveMonitorSchedulers();
});
