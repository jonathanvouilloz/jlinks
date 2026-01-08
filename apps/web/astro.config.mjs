import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'server',
  adapter: vercel({
    isr: {
      expiration: 60,
      bypassToken: process.env.ISR_BYPASS_TOKEN,
    },
  }),
  // Only set site if defined (avoids Invalid URL error in dev)
  ...(process.env.PUBLIC_SITE_URL && { site: process.env.PUBLIC_SITE_URL }),
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
