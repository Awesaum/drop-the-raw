import { existsSync, mkdirSync, cpSync } from 'node:fs';
import { resolve } from 'node:path';

console.log('▶ Executing drop-the-raw build pipeline...');

const publicDir = resolve(process.cwd(), 'public');
const distDir = resolve(process.cwd(), 'dist');
const srcDir = resolve(process.cwd(), 'src');

// Ensure dist output directory exists
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

// Copy public assets if present
if (existsSync(publicDir)) {
  console.log('  Copying public assets to dist/...');
  cpSync(publicDir, distDir, { recursive: true });
}

// If src exists, ensure assets/code are compiled or staged
if (existsSync(srcDir)) {
  console.log('  Staging src/ modules for packaging...');
  cpSync(srcDir, resolve(distDir, 'src'), { recursive: true });
}

console.log('✔ Build completed successfully with zero errors.');
