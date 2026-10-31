import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));

// Adds the backend's origin (VITE_API_URL) to host_permissions in dist/manifest.json,
// so switching between localhost and the deployed API needs no manifest edits.
function manifestApiPermission(apiUrl) {
  return {
    name: 'manifest-api-permission',
    apply: 'build',
    closeBundle() {
      const file = resolve(root, 'dist/manifest.json');
      const manifest = JSON.parse(readFileSync(file, 'utf8'));
      manifest.host_permissions = [...new Set([...manifest.host_permissions, `${new URL(apiUrl).origin}/*`])];
      writeFileSync(file, `${JSON.stringify(manifest, null, 2)}\n`);
    },
  };
}

// The extension is built in two passes (see "build" in package.json):
//   default mode   → popup page + background service worker (ES modules)
//   "content" mode → content script as one self-contained IIFE, because
//                    MV3 content scripts cannot load ES module chunks.
export default defineConfig(({ mode }) => {
  if (mode === 'content') {
    return {
      plugins: [react()],
      // Library mode does not replace process.env.NODE_ENV, which React needs.
      define: { 'process.env.NODE_ENV': JSON.stringify('production') },
      build: {
        outDir: 'dist',
        emptyOutDir: false,
        copyPublicDir: false,
        lib: {
          entry: resolve(root, 'src/content/index.jsx'),
          name: 'DealShieldContent',
          formats: ['iife'],
          fileName: () => 'content.js',
        },
      },
    };
  }

  const apiUrl = loadEnv(mode, root, 'VITE_').VITE_API_URL || 'http://localhost:3000';

  return {
    plugins: [react(), manifestApiPermission(apiUrl)],
    build: {
      outDir: 'dist',
      emptyOutDir: false,
      rollupOptions: {
        input: {
          popup: resolve(root, 'src/popup/index.html'),
          background: resolve(root, 'src/background/service-worker.js'),
        },
        output: {
          // manifest.json points at a fixed background.js path.
          entryFileNames: (chunk) =>
            chunk.name === 'background' ? 'background.js' : 'assets/[name]-[hash].js',
        },
      },
    },
  };
});
