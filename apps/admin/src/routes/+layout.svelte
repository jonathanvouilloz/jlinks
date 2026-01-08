<script lang="ts">
  import '../styles/global.css';
  import type { Snippet } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { setLocale, locales } from '$lib/paraglide/runtime';
  import { Sidebar, Header, ToastContainer } from '$lib/components/layout';
  import { authStore, clientStore, linksStore } from '$lib/stores';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();

  // Pages that don't require authentication
  const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/check-email', '/styleguide'];

  // Check if current path is public (removing locale prefix first)
  function isPublicPath(path: string): boolean {
    const cleanPath = path.replace(/^\/(en|fr)/, '') || '/';
    return publicPaths.some((p) => cleanPath.startsWith(p));
  }

  // Check if current path requires super admin
  function requiresSuperAdmin(path: string): boolean {
    return path.includes('/admin');
  }

  // Page titles based on route
  function getPageTitle(path: string): string {
    const cleanPath = path.replace(/^\/(en|fr)/, '') || '/';
    if (cleanPath === '/' || cleanPath === '') return 'Liens';
    if (cleanPath.startsWith('/apparence')) return 'Apparence';
    if (cleanPath.startsWith('/contenu')) return 'Contenu';
    if (cleanPath.startsWith('/admin/clients')) return 'Gestion des clients';
    return 'Noko';
  }

  // Reactive page title
  let pageTitle = $derived(getPageTitle($page.url.pathname));
  let showLayout = $derived(!isPublicPath($page.url.pathname) && authStore.isAuthenticated);

  // Track if we've initialized
  let hasInitialized = $state(false);

  // Set language from URL on every navigation
  $effect(() => {
    if (!browser) return;

    const pathname = $page.url.pathname;
    const langMatch = pathname.match(/^\/(en|fr)/);
    const lang = langMatch ? langMatch[1] : 'en';
    if (locales.includes(lang as any)) {
      setLocale(lang as 'en' | 'fr');
    }
  });

  // Track if links have been loaded for current user
  let linksLoadedForUser = $state<string | null>(null);

  // Initialize auth on mount (client-side only)
  $effect(() => {
    if (!browser || hasInitialized) return;
    hasInitialized = true;

    (async () => {
      try {
        await authStore.init();
      } catch (e) {
        console.error('[Layout] authStore.init() failed:', e);
      }

      const currentPath = $page.url.pathname;
      const langPrefix = currentPath.match(/^\/(en|fr)/)?.[0] || '/en';

      // Redirect logic after auth init
      if (!authStore.isAuthenticated && !isPublicPath(currentPath)) {
        goto(`${langPrefix}/login`);
        return;
      }

      if (authStore.isAuthenticated && isPublicPath(currentPath) && currentPath.includes('/login')) {
        goto(`${langPrefix}/`);
        return;
      }

      if (requiresSuperAdmin(currentPath) && !authStore.isSuperAdmin) {
        goto(`${langPrefix}/`);
        return;
      }
    })();
  });

  // Load links when user changes (login/logout) or on initial auth
  $effect(() => {
    if (!browser) return;

    const userId = authStore.user?.id;

    // If user logged out, reset tracking
    if (!userId) {
      linksLoadedForUser = null;
      return;
    }

    // If user is authenticated and client, and we haven't loaded for this user yet
    if (authStore.isAuthenticated && authStore.isClient && linksLoadedForUser !== userId) {
      linksLoadedForUser = userId;
      Promise.all([
        clientStore.loadPublishStatus(),
        linksStore.loadLinks()
      ]);
    }
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
