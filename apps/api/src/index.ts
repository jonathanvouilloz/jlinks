import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { authRoutes } from './routes/auth';
import { clientRoutes } from './routes/clients';
import { linkRoutes } from './routes/links';
import { publishRoutes } from './routes/publish';
import { publicRoutes } from './routes/public';
import { qrcodeRoutes } from './routes/qrcode';
import { vcardRoutes } from './routes/vcard';

const PORT = process.env.PORT || 3000;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:5173',
  'http://localhost:4321',
];

const app = new Elysia()
  // CORS configuration
  .use(
    cors({
      origin: ALLOWED_ORIGINS,
      credentials: true,
    })
  )

  // Health check
  .get('/health', () => ({ status: 'ok', timestamp: new Date().toISOString() }))

  // API routes
  .use(authRoutes)
  .use(clientRoutes)
  .use(linkRoutes)
  .use(publishRoutes)
  .use(publicRoutes)
  .use(qrcodeRoutes)
  .use(vcardRoutes)

  // Error handling
  .onError(({ code, error, set }) => {
    console.error(`[${code}]`, error);

    if (code === 'NOT_FOUND') {
      set.status = 404;
      return { error: 'Not found' };
    }

    if (code === 'VALIDATION') {
      set.status = 400;
      return { error: 'Validation error', details: error.message };
    }

    set.status = 500;
    return { error: 'Internal server error' };
  })

  // Start server
  .listen(PORT);

console.log(`
  🚀 jLinks API is running!

  Local:   http://localhost:${PORT}
  Health:  http://localhost:${PORT}/health

  Press Ctrl+C to stop
`);

export type App = typeof app;
