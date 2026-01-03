// Vercel serverless function entry point
import { app } from './app';

// Export the fetch handler for Vercel
export default app.fetch;
