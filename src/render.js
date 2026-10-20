import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { config } from './config.js';

const esc = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const wrap = (text, max = 28) => {
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    if ((line + ' ' + word).trim().length > max && line) {
      lines.push(line);
      line = word;
    } else line = (line + ' ' + word).trim();
  }
  if (line) lines.push(line);
  return lines.slice(0, 7);
};

export async function renderCarousel(content) {
  await fs.mkdir(config.generatedDir, { recursive: true });
  const folder = path.join(config.generatedDir, new Date().toISOString().replaceAll(':', '-'));
  await fs.mkdir(folder);
  const files = [];
  for (let index = 0; index < content.slides.length; index += 1) {
    const slide = content.slides[index];
    const heading = wrap(slide.heading, 22);
    const body = wrap(slide.body, 38);
    const text = [
      ...heading.map((line, i) => `<text x="110" y="${250 + i * 76}" class="heading">${esc(line)}</text>`),
      ...body.map((line, i) => `<text x="110" y="${650 + i * 42}" class="body">${esc(line)}</text>`)
    ].join('');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
      <rect width="1080" height="1080" fill="#fbf5ed"/><circle cx="920" cy="80" r="260" fill="#e8d8c3"/>
      <circle cx="960" cy="1000" r="220" fill="#203864"/><rect x="110" y="110" width="120" height="9" rx="4" fill="#b08d57"/>
      <text x="110" y="165" class="brand">ZAVRIK</text><text x="900" y="165" text-anchor="end" class="count">${index + 1}/${content.slides.length}</text>
      ${text}<text x="110" y="970" class="tagline">Decide urself</text>
      <style>.brand,.tagline{font:600 30px Arial;letter-spacing:5px;fill:#203864}.count{font:500 24px Arial;fill:#203864}.heading{font:700 58px Arial;fill:#203864}.body{font:400 31px Arial;fill:#3f4652}</style>
    </svg>`;
    const file = path.join(folder, `${String(index + 1).padStart(2, '0')}.png`);
    await sharp(Buffer.from(svg)).png().toFile(file);
    files.push(file);
  }
  await fs.writeFile(path.join(folder, 'caption.txt'), content.caption);
  return { folder, files, caption: content.caption };
}
