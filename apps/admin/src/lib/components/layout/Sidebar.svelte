<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { Link, Palette, FileText, Users, LogOut, Settings } from 'lucide-svelte';
  import { authStore } from '$lib/stores';

  // Check if current path matches
  function isActive(path: string): boolean {
    return $page.url.pathname === path;
  }

  async function handleLogout() {
    await authStore.logout();
    goto('/login');
  }
</script>

<aside class="sidebar">
  <div class="sidebar-header">
    <a href="/" class="logo">
      <img src="/white-logo.webp" alt="Nokolink" class="logo-image" />
    </a>
  </div>

  <nav class="sidebar-nav">
    <ul class="nav-list">
      <li>
        <a href="/" class="nav-link" class:active={isActive('/')} aria-current={isActive('/') ? 'page' : undefined}>
          <Link size={20} aria-hidden="true" />
          <span>Liens</span>
        </a>
      </li>
      <li>
        <a href="/apparence" class="nav-link" class:active={isActive('/apparence')} aria-current={isActive('/apparence') ? 'page' : undefined}>
          <Palette size={20} aria-hidden="true" />
          <span>Apparence</span>
        </a>
      </li>
      <li>
        <a href="/contenu" class="nav-link" class:active={isActive('/contenu')} aria-current={isActive('/contenu') ? 'page' : undefined}>
          <FileText size={20} aria-hidden="true" />
          <span>Contenu</span>
        </a>
      </li>
      <li>
        <a href="/parametres" class="nav-link" class:active={isActive('/parametres')} aria-current={isActive('/parametres') ? 'page' : undefined}>
          <Settings size={20} aria-hidden="true" />
          <span>Paramètres</span>
        </a>
      </li>
    </ul>

    {#if authStore.isSuperAdmin}
      <div class="nav-section">
        <span class="nav-section-title">Administration</span>
        <ul class="nav-list">
          <li>
            <a href="/admin/clients" class="nav-link" class:active={isActive('/admin/clients')} aria-current={isActive('/admin/clients') ? 'page' : undefined}>
              <Users size={20} aria-hidden="true" />
              <span>Clients</span>
            </a>
          </li>
        </ul>
      </div>
    {/if}
  </nav>

  <div class="sidebar-footer">
    <div class="user-info">
      <span class="user-email">{authStore.user?.email ?? ''}</span>
      {#if authStore.isSuperAdmin}
        <span class="user-role">Super Admin</span>
      {/if}
    </div>
    <button class="logout-btn" onclick={handleLogout}>
      <LogOut size={18} />
      <span>Déconnexion</span>
    </button>
  </div>
</aside>

<style>
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: var(--sidebar-width);
    height: 100vh;
    background: var(--color-sidebar-bg);
    border-right: 1px solid var(--color-sidebar-border);
    display: flex;
    flex-direction: column;
    z-index: var(--z-sticky);
  }

  .sidebar-header {
    height: var(--header-height);
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid var(--color-sidebar-border);
  }

  .logo {
    text-decoration: none;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .logo-image {
    height: 32px;
    width: auto;
  }

  .sidebar-nav {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-4) 0;
  }

  .nav-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .nav-link {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    color: var(--color-sidebar-text-secondary);
    text-decoration: none;
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    transition: all var(--transition-fast);
  }

  .nav-link:hover {
    background: var(--color-sidebar-hover);
    color: var(--color-sidebar-text);
  }

  .nav-link.active {
    background: var(--color-sidebar-active);
    color: var(--color-primary);
  }

  .nav-section {
    margin-top: var(--space-4);
    padding-top: var(--space-4);
    border-top: 1px solid var(--color-sidebar-border);
  }

  .nav-section-title {
    display: block;
    padding: 0 var(--space-4) var(--space-2);
    font-size: var(--text-xs);
    font-weight: var(--font-semibold);
    color: var(--color-sidebar-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .sidebar-footer {
    padding: var(--space-4);
    border-top: 1px solid var(--color-sidebar-border);
  }

  .user-info {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    margin-bottom: var(--space-3);
  }

  .user-email {
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    color: var(--color-sidebar-text);
    word-break: break-all;
  }

  .user-role {
    font-size: var(--text-xs);
    color: var(--color-primary);
    font-weight: var(--font-medium);
  }

  .logout-btn {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    width: 100%;
    padding: var(--space-2) var(--space-3);
    background: transparent;
    border: 1px solid var(--color-sidebar-border);
    border-radius: var(--radius-md);
    color: var(--color-sidebar-text-secondary);
    font-size: var(--text-sm);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .logout-btn:hover {
    background: var(--color-sidebar-hover);
    border-color: rgba(255, 255, 255, 0.2);
    color: var(--color-sidebar-text);
  }
</style>
