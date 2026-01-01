<script lang="ts">
  import '../styles/global.css';
  import type { Snippet } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { Sidebar, Header, ToastContainer } from '$lib/components/layout';
  import { authStore, clientStore, linksStore } from '$lib/stores';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();

  // Pages that don't require authentication
  const publicPaths = ['/login', '/styleguide'];

  // Check if current path is public
  function isPublicPath(path: string): boolean {
    return publicPaths.some((p) => path.startsWith(p));
  }

  // Check if current path requires super admin
  function requiresSuperAdmin(path: string): boolean {
    return path.startsWith('/admin');
  }

  // Page titles based on route
  function getPageTitle(path: string): string {
    if (path === '/') return 'Dashboard';
    if (path === '/settings') return 'Paramètres';
    if (path === '/admin/clients') return 'Gestion des clients';
    return 'jLinks';
  }

  // Reactive page title
  let pageTitle = $derived(getPageTitle($page.url.pathname));
  let showLayout = $derived(!isPublicPath($page.url.pathname) && authStore.isAuthenticated);

  // Track if we've initialized
  let hasInitialized = $state(false);

  // Initialize auth on mount (client-side only)
  $effect(() => {
    if (!browser || hasInitialized) return;
    hasInitialized = true;

    console.log('[Layout] $effect running - initializing auth');

    (async () => {
      try {
        await authStore.init();
        console.log('[Layout] authStore.init() completed, loading:', authStore.loading, 'isAuthenticated:', authStore.isAuthenticated);
      } catch (e) {
        console.error('[Layout] authStore.init() failed:', e);
      }

      const currentPath = $page.url.pathname;

      // Redirect logic after auth init
      if (!authStore.isAuthenticated && !isPublicPath(currentPath)) {
        goto('/login');
        return;
      }

      if (authStore.isAuthenticated && currentPath === '/login') {
        goto('/');
        return;
      }

      if (requiresSuperAdmin(currentPath) && !authStore.isSuperAdmin) {
        goto('/');
        return;
      }

      // Load initial data for authenticated users
      if (authStore.isAuthenticated && authStore.isClient) {
        await Promise.all([
          clientStore.loadPublishStatus(),
          linksStore.loadLinks()
        ]);
      }
    })();
  });
</script>

<ToastContainer />

{#if authStore.loading && !isPublicPath($page.url.pathname)}
  <div class="loading-screen">
    <div class="loading-spinner"></div>
  </div>
{:else if showLayout}
  <div class="app-layout">
    <Sidebar />
    <div class="main-wrapper">
      <Header title={pageTitle} />
      <main class="main-content">
        {@render children()}
      </main>
    </div>
  </div>
{:else}
  {@render children()}
{/if}

<style>
  .app-layout {
    display: flex;
    min-height: 100vh;
  }

  .main-wrapper {
    flex: 1;
    margin-left: var(--sidebar-width);
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .main-content {
    flex: 1;
    padding: var(--space-6);
    background: var(--color-bg);
    overflow-y: auto;
  }

  .loading-screen {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: var(--color-bg);
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--color-border);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
