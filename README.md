# Zavrik Instagram Automation

Self-hosted Node.js application for creating and publishing daily Instagram carousels for Zavrik.

The app:

- Generates a 6–10 slide carousel in English/Hinglish from a curated automation topic bank.
- Renders warm, light visuals with royal accent colors and the `Zavrik` / `Decide urself` brand.
- Publishes through a persistent Playwright browser session (no Instagram password is stored by the app).
- Provides a web dashboard, manual run controls, a daily scheduler, and an emergency stop switch.
- Can optionally use an OpenAI-compatible endpoint for richer copy while retaining a local fallback.

## Run locally or on your own host

Requirements: Node.js 20+ and a Chromium-compatible environment.

```bash
npm install
npx playwright install chromium
cp .env.example .env
npm start
```

Open `http://localhost:3000`. On the first run, click **Open Instagram login**, sign in in the opened browser, and close the browser when the Instagram home page is visible. The authenticated profile is persisted in `data/browser-profile`.

For a server, put the app behind HTTPS and set a strong `DASHBOARD_TOKEN`. The dashboard accepts the token as `?token=...` or via the `Authorization: Bearer ...` header.

The renderer writes PNG files because Instagram does not accept SVG carousel uploads. A VPS is recommended: standard shared hosting usually cannot install or keep a persistent Chromium profile. Set `HEADLESS=false` only while completing the first login on a machine with a display; use `HEADLESS=true` afterward on a server with a persistent profile.

## Hostinger/VPS deployment

1. Push the repository including `package.json` and `package-lock.json`; never commit `.env` or `data/`.
2. Use Node.js 20 or newer and run `npm ci`.
3. Install the browser once with `npx playwright install --with-deps chromium`.
4. Create `.env` from `.env.example`, set a new random dashboard token, and keep `AUTOMATION_ENABLED=false` until login is verified.
5. Start with `npm start` (or a process manager such as `pm2`), expose the app through HTTPS, and use `/health` for the host health check.

The dashboard is intentionally protected by a token and the publishing operation is locked so two scheduled/manual jobs cannot run simultaneously. The stop button disables both scheduled and manual publishing.

## Configuration

See [.env.example](.env.example). `POSTING_TIME` uses 24-hour time in `TIMEZONE`. Set `AUTOMATION_ENABLED=false` to stop scheduled and manual publishing. The dashboard stop button changes this setting at runtime and writes `data/runtime.json`.

Browser automation depends on Instagram's UI and may need selector updates if Instagram changes. Use an Instagram Business account and comply with Meta's terms and rate limits. Never commit `.env`, browser profiles, or generated media.
