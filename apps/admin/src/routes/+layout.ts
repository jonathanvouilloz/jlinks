// Disable SSR for the entire admin app
// This ensures all auth logic runs only on the client
// (Admin dashboards don't need SEO)
export const ssr = false;
