import 'dotenv/config';
import path from 'node:path';

const root = process.cwd();

export const config = {
  port: Number(process.env.PORT || 3000),
  host: process.env.HOST || '0.0.0.0',
  dashboardToken: process.env.DASHBOARD_TOKEN || '',
  timezone: process.env.TIMEZONE || 'Asia/Kolkata',
  postingTime: process.env.POSTING_TIME || '10:00',
  slideCount: Math.min(10, Math.max(6, Number(process.env.SLIDE_COUNT || 8))),
  headless: process.env.HEADLESS === 'true',
  profileDir: path.resolve(root, process.env.INSTAGRAM_PROFILE_DIR || './data/browser-profile'),
  dataDir: path.resolve(root, 'data'),
  generatedDir: path.resolve(root, 'data/generated'),
  openAiBaseUrl: process.env.OPENAI_BASE_URL || '',
  openAiKey: process.env.OPENAI_API_KEY || '',
  openAiModel: process.env.OPENAI_MODEL || ''
};

if (!Number.isInteger(config.port) || config.port < 1 || config.port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535.');
}

if (!/^\d{2}:\d{2}$/.test(config.postingTime)) {
  throw new Error('POSTING_TIME must use 24-hour HH:MM format.');
}

if (config.dashboardToken && config.dashboardToken.length < 16) {
  throw new Error('DASHBOARD_TOKEN must contain at least 16 characters.');
}
