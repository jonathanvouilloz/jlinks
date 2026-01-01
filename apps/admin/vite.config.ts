import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { searchForWorkspaceRoot } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    fs: {
      allow: [
        // Allow serving files from the monorepo root (includes packages/)
        searchForWorkspaceRoot(process.cwd()),
      ],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
