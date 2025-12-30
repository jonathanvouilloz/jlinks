<script lang="ts">
  import { Button, Badge } from '$lib/components/ui';
  import { Upload } from 'lucide-svelte';
  import { authStore, clientStore } from '$lib/stores';

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
      <Badge variant="warning">Modifications non publiées</Badge>
    {/if}
  </div>

  <div class="header-right">
    {#if authStore.isClient}
      <Button
        variant="primary"
        onclick={handlePublish}
        disabled={clientStore.publishing || !clientStore.publishStatus?.hasDraftChanges}
        loading={clientStore.publishing}
      >
        <Upload size={16} />
        Publier
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
</style>
