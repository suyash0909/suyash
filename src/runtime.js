import fs from 'node:fs/promises';
import { config } from './config.js';

const stateFile = `${config.dataDir}/runtime.json`;
const defaults = { enabled: process.env.AUTOMATION_ENABLED !== 'false', lastRun: null, lastError: null };

export async function getRuntime() {
  try { return { ...defaults, ...JSON.parse(await fs.readFile(stateFile, 'utf8')) }; }
  catch (error) {
    if (error.code !== 'ENOENT') throw error;
    await fs.mkdir(config.dataDir, { recursive: true });
    await fs.writeFile(stateFile, JSON.stringify(defaults, null, 2));
    return defaults;
  }
}

export async function saveRuntime(patch) {
  await fs.mkdir(config.dataDir, { recursive: true });
  const next = { ...(await getRuntime()), ...patch };
  await fs.writeFile(stateFile, JSON.stringify(next, null, 2));
  return next;
}
