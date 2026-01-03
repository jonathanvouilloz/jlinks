import { app } from '../src/app';

// Vercel serverless function handler
// Elysia's fetch handler is compatible with Web standard Request/Response
export default app.fetch;
