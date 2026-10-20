import { chromium } from 'playwright';
import { config } from './config.js';

let context;

async function browser() {
  context ??= await chromium.launchPersistentContext(config.profileDir, { headless: config.headless });
  return context;
}

export async function openLogin() {
  const current = await browser();
  const page = current.pages()[0] || await current.newPage();
  await page.goto('https://www.instagram.com/', { waitUntil: 'domcontentloaded' });
  return page.url();
}

export async function closeBrowser() {
  if (context) {
    await context.close();
    context = undefined;
  }
}

export async function publishCarousel(files, caption) {
  const current = await browser();
  const page = current.pages()[0] || await current.newPage();
  await page.goto('https://www.instagram.com/', { waitUntil: 'domcontentloaded' });
  if (page.url().includes('/accounts/login')) throw new Error('Instagram session is not logged in. Use Open Instagram login first.');
  const create = page.getByRole('link', { name: /create/i });
  if (await create.count() === 0) throw new Error('Instagram create control was not found. The session may not be logged in.');
  await create.click();
  const input = page.locator('input[type="file"]').first();
  await input.setInputFiles(files);
  await page.getByRole('button', { name: /next/i }).first().click();
  await page.getByRole('button', { name: /next/i }).last().click();
  const textbox = page.locator('textarea').first();
  if (await textbox.count() === 0) throw new Error('Instagram caption field was not found.');
  await textbox.fill(caption);
  await page.getByRole('button', { name: /share/i }).click();
  await page.waitForTimeout(7000);
}
