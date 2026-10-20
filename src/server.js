import express from 'express';
import { config } from './config.js';
import { createContent } from './content.js';
import { renderCarousel } from './render.js';
import { getRuntime, saveRuntime } from './runtime.js';
import { closeBrowser, openLogin, publishCarousel } from './instagram.js';

const app = express();
app.use(express.json());
let publishInProgress = false;

const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

function authorized(req, res, next) {
  if (!config.dashboardToken) return res.status(503).send('Set DASHBOARD_TOKEN before exposing the dashboard.');
  const token = req.query.token || req.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (token !== config.dashboardToken) return res.status(401).send('Unauthorized');
  next();
}

async function runPublish() {
  if (publishInProgress) throw new Error('A publish operation is already in progress.');
  const runtime = await getRuntime();
  if (!runtime.enabled) throw new Error('Automation is stopped.');
  publishInProgress = true;
  try {
    const content = await createContent({ slideCount: config.slideCount });
    const carousel = await renderCarousel(content);
    await publishCarousel(carousel.files, carousel.caption);
    await saveRuntime({ lastRun: new Date().toISOString(), lastError: null, lastTopic: content.topic });
    return { topic: content.topic, folder: carousel.folder };
  } finally {
    publishInProgress = false;
  }
}

app.get('/health', (_req, res) => res.json({ ok: true, service: 'zavrik-instagram-automation' }));

app.get('/', authorized, async (req, res) => {
  const runtime = await getRuntime();
  const token = encodeURIComponent(req.query.token || '');
  const action = runtime.enabled ? 'stop' : 'start';
  res.type('html').send(`<main style="font:16px system-ui;max-width:720px;margin:50px auto"><h1>Zavrik automation</h1>
    <p>Daily carousel publisher — <strong>Decide urself</strong></p><p>Status: <b>${runtime.enabled ? 'RUNNING' : 'STOPPED'}</b></p>
    <p>Last run: ${escapeHtml(runtime.lastRun || 'Never')}<br>Last topic: ${escapeHtml(runtime.lastTopic || 'None')}<br>Error: ${escapeHtml(runtime.lastError || 'None')}</p>
    <form method="post" action="/control/${action}?token=${token}"><button>${runtime.enabled ? 'Stop automation' : 'Start automation'}</button></form>
    <p><a href="/control/login?token=${token}">Open Instagram login</a></p>
    <form method="post" action="/control/run?token=${token}"><button>Run now</button></form></main>`);
});

app.post('/control/:action', authorized, async (req, res) => {
  if (!['start', 'stop'].includes(req.params.action)) return res.status(400).send('Invalid action');
  await saveRuntime({ enabled: req.params.action === 'start' });
  res.redirect(`/?token=${encodeURIComponent(req.query.token || '')}`);
});

app.get('/control/login', authorized, async (req, res) => {
  try {
    await openLogin();
    res.send(`Browser opened. Complete Instagram login, then close it. <a href="/?token=${encodeURIComponent(req.query.token || '')}">Back</a>`);
  }
  catch (error) { res.status(500).send(error.message); }
});

app.post('/control/run', authorized, async (_req, res) => {
  try { res.json(await runPublish()); }
  catch (error) { await saveRuntime({ lastError: error.message }); res.status(500).json({ error: error.message }); }
});

app.listen(config.port, config.host, () => console.log(`Zavrik automation listening on ${config.host}:${config.port}`));

setInterval(async () => {
  const now = new Intl.DateTimeFormat('en-GB', { timeZone: config.timezone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date());
  if (now !== config.postingTime) return;
  const runtime = await getRuntime();
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: config.timezone }).format(new Date());
  if (!runtime.enabled || runtime.lastRun?.slice(0, 10) === today) return;
  try { await runPublish(); } catch (error) { await saveRuntime({ lastError: error.message }); console.error(error); }
}, 60_000);

const shutdown = async (signal) => {
  console.log(`${signal}: shutting down`);
  await closeBrowser();
  process.exit(0);
};
process.once('SIGTERM', () => shutdown('SIGTERM'));
process.once('SIGINT', () => shutdown('SIGINT'));
