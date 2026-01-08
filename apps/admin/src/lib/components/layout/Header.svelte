<script lang="ts">
  import { PUBLIC_SITE_URL } from '$env/static/public';
  import { Button, Badge, LanguageSwitcher } from '$lib/components/ui';
  import { Upload, ExternalLink } from 'lucide-svelte';
  import { authStore, clientStore } from '$lib/stores';
  import * as m from '$lib/paraglide/messages';

  interface Props {
    title?: string;
  }

  let { title = 'Dashboard' }: Props = $props();

  async function handlePublish() {
    await clientStore.publish();
  }
</script>

<header class="header">
  <div class="header-left">
    <h1 class="header-title">{title}</h1>
    {#if clientStore.publishStatus?.hasDraftChanges}
      <Badge variant="warning">{m.dashboard_unpublished_changes()}</Badge>
    {/if}
  </div>

  <div class="header-right">
    <LanguageSwitcher />
    {#if authStore.isClient && authStore.client?.slug}
      {@const cacheBuster = clientStore.publishStatus?.lastPublishedAt ? `?v=${new Date(clientStore.publishStatus.lastPublishedAt).getTime()}` : ''}
      <a
        href="{PUBLIC_SITE_URL}/{authStore.client.slug}{cacheBuster}"
        target="_blank"
        rel="noopener noreferrer"
        class="live-link"
      >
        <ExternalLink size={16} />
        {m.nav_view_page()}
      </a>
      <Button
        variant="primary"
        onclick={handlePublish}
        disabled={clientStore.publishing || !clientStore.publishStatus?.hasDraftChanges}
        loading={clientStore.publishing}
      >
        <Upload size={16} />
        {m.common_publish()}
      </Button>
    {/if}
  </div>
</header>

<style>
  .header {
    height: var(--header-height);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 var(--space-6);
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .header-title {
    font-size: var(--text-xl);
    font-weight: var(--font-semibold);
    color: var(--color-text);
    margin: 0;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .live-link {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-text);
    text-decoration: none;
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    transition: all var(--transition-fast);
  }

  .live-link:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }
</style>
