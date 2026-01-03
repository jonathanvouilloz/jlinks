import { app } from './app';

const PORT = process.env.PORT || 3000;

// Start server (for local development with Bun)
app.listen(PORT);

console.log(`
  Noko API is running!

  Local:   http://localhost:${PORT}
  Health:  http://localhost:${PORT}/health

  Press Ctrl+C to stop
`);

export type { App } from './app';
