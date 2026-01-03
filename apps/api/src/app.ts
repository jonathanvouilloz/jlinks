import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authMiddleware, type AuthVariables } from './middleware/auth';
import { authRoutes } from './routes/auth';
import { clientRoutes } from './routes/clients';
import { linkRoutes } from './routes/links';
import { publishRoutes } from './routes/publish';
import { publicRoutes } from './routes/public';
import { qrcodeRoutes } from './routes/qrcode';
import { vcardRoutes } from './routes/vcard';

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
  : ['http://localhost:5173', 'http://localhost:4321'];

// Create app with typed variables
export const app = new Hono<{ Variables: AuthVariables }>();

// CORS configuration
app.use(
  '*',
  cors({
    origin: ALLOWED_ORIGINS,
    credentials: true,
  })
);

// Auth middleware for all routes
app.use('*', authMiddleware);

// Health check
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// API routes
app.route('/auth', authRoutes);
app.route('/clients', clientRoutes);
app.route('/links', linkRoutes);
app.route('/publish', publishRoutes);
app.route('/public', publicRoutes);
app.route('/qrcode', qrcodeRoutes);
app.route('/vcard', vcardRoutes);

// Error handling
app.onError((err, c) => {
  console.error(`[ERROR]`, err);
  return c.json({ error: 'Internal server error' }, 500);
});

// 404 handler
app.notFound((c) => c.json({ error: 'Not found' }, 404));

export type App = typeof app;
