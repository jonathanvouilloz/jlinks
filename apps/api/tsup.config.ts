import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/vercel.ts' },
  format: ['esm'],
  target: 'node18',
  outDir: 'api',
  clean: true,
  splitting: false,
  sourcemap: false,
  // Bundle @noko/shared since it's a workspace package not available on npm
  // Keep other dependencies external (they'll be installed by Vercel)
  noExternal: ['@noko/shared'],
  external: [
    'hono',
    'hono/cors',
    'hono/cookie',
    'hono/vercel',
    '@hono/node-server',
    '@hono/zod-validator',
    '@libsql/client',
    'drizzle-orm',
    'drizzle-orm/libsql',
    'better-auth',
    'qrcode',
    'resend',
    'zod',
  ],
});
