#!/usr/bin/env node
import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, cpSync, existsSync, rmSync } from 'fs';
import { join } from 'path';

const OUTPUT_DIR = '.vercel/output';
const FUNC_DIR = join(OUTPUT_DIR, 'functions/api.func');

console.log('🔨 Building for Vercel...');

// Clean output directory
if (existsSync(OUTPUT_DIR)) {
  rmSync(OUTPUT_DIR, { recursive: true });
}

// Create directories
mkdirSync(FUNC_DIR, { recursive: true });

// Run tsup to bundle the code
console.log('📦 Bundling with tsup...');
execSync('npx tsup', { stdio: 'inherit' });

// Create .vc-config.json for the function
const vcConfig = {
  runtime: 'nodejs18.x',
  handler: 'index.js',
  launcherType: 'Nodejs',
  shouldAddHelpers: false,
  supportsResponseStreaming: true,
};
writeFileSync(join(FUNC_DIR, '.vc-config.json'), JSON.stringify(vcConfig, null, 2));

// Create package.json for the function (with dependencies)
const funcPackage = {
  type: 'module',
  dependencies: {
    'hono': '^4.11.3',
    '@hono/node-server': '^1.19.7',
    '@hono/zod-validator': '^0.7.6',
    '@libsql/client': '^0.15.15',
    'drizzle-orm': '^0.31.1',
    'better-auth': '^1.4.10',
    'qrcode': '^1.5.4',
    'resend': '^6.6.0',
    'zod': '^4.3.4',
  },
};
writeFileSync(join(FUNC_DIR, 'package.json'), JSON.stringify(funcPackage, null, 2));

// Install dependencies in the function directory
console.log('📥 Installing dependencies...');
execSync('npm install --omit=dev --legacy-peer-deps', { cwd: FUNC_DIR, stdio: 'inherit' });

// Create config.json for the output
const config = {
  version: 3,
  routes: [
    { src: '/(.*)', dest: '/api' },
  ],
  overrides: {},
};
writeFileSync(join(OUTPUT_DIR, 'config.json'), JSON.stringify(config, null, 2));

console.log('✅ Build complete!');
