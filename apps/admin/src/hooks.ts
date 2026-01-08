import type { Reroute } from '@sveltejs/kit';

// Simple reroute to handle /en/* and /fr/* prefixes
// Maps /en/login -> /login, /fr/dashboard -> /dashboard, etc.
export const reroute: Reroute = ({ url }) => {
  const pathname = url.pathname;

  // Check if path starts with /en or /fr
  const match = pathname.match(/^\/(en|fr)(\/.*)?$/);
  if (match) {
    // Return the path without the locale prefix (or '/' if at root)
    return match[2] || '/';
  }

  return pathname;
};
