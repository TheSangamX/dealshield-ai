// Zips dist/ into dealshield-extension-v<version>.zip for the Chrome Web Store.
// Run via `npm run package`, which builds first.
import { ZipArchive } from 'archiver';
import { createWriteStream, existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = resolve(root, 'dist');
const manifest = JSON.parse(readFileSync(resolve(dist, 'manifest.json'), 'utf8'));

// The store build must talk to the deployed API, not a dev machine.
const localhostPermission = manifest.host_permissions.find((p) => /localhost|127\.0\.0\.1/.test(p));
if (localhostPermission && !process.argv.includes('--allow-localhost')) {
  console.error(
    `dist/manifest.json still points at ${localhostPermission}.\n` +
      'Set VITE_API_URL to the deployed backend (e.g. in extension/.env.production) and rerun,\n' +
      'or pass --allow-localhost for a local test package.',
  );
  process.exit(1);
}

const outFile = resolve(root, `dealshield-extension-v${manifest.version}.zip`);
if (existsSync(outFile)) console.log(`Overwriting ${outFile}`);

const output = createWriteStream(outFile);
const archive = new ZipArchive({ zlib: { level: 9 } });

output.on('close', () => console.log(`Packaged ${outFile} (${(archive.pointer() / 1024).toFixed(0)} KB)`));
archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);
archive.directory(dist, false);
await archive.finalize();
