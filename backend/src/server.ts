import { app } from './app.js';
import { db } from './config/database.js';
import { env } from './config/env.js';

const server = app.listen(env.PORT, () => console.log(`API listening on port ${env.PORT}`));

async function shutdown(): Promise<void> {
  server.close(async () => {
    await db.end();
    process.exit(0);
  });
}

process.on('SIGTERM', () => void shutdown());
process.on('SIGINT', () => void shutdown());
