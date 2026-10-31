// Renders the store-assets/*.html frames to PNGs in store-assets/out/ with headless Chrome.
// Run from the repo root: node store-assets/capture.mjs   (set CHROME_PATH if Chrome isn't in the default place)
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const dir = fileURLToPath(new URL('.', import.meta.url));
const outDir = resolve(dir, 'out');
mkdirSync(outDir, { recursive: true });

const chrome =
  process.env.CHROME_PATH ??
  [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
  ].find(existsSync);
if (!chrome) throw new Error('Chrome not found; set CHROME_PATH.');

const FRAMES = [
  ['screenshot-1-analyze', 1280, 800],
  ['screenshot-2-strategies', 1280, 800],
  ['screenshot-3-insert', 1280, 800],
  ['screenshot-4-factcheck', 1280, 800],
  ['promo-small-440x280', 440, 280],
  ['promo-marquee-1400x560', 1400, 560],
];

for (const [name, width, height] of FRAMES) {
  const out = resolve(outDir, `${name}.png`);
  execFileSync(chrome, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    `--window-size=${width},${height}`,
    '--virtual-time-budget=4000', // let web fonts load
    `--screenshot=${out}`,
    pathToFileURL(resolve(dir, `${name}.html`)).href,
  ], { stdio: 'ignore' });
  console.log(`${name}.png (${width}×${height})`);
}
