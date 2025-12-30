<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'default' | 'hover';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    class?: string;
    children: Snippet;
    header?: Snippet;
    footer?: Snippet;
  }

  let {
    variant = 'default',
    padding = 'md',
    class: className = '',
    children,
    header,
    footer,
  }: Props = $props();
</script>

<div class="card card-{variant} padding-{padding} {className}">
  {#if header}
    <div class="card-header">
      {@render header()}
    </div>
  {/if}

  <div class="card-body">
    {@render children()}
  </div>

  {#if footer}
    <div class="card-footer">
      {@render footer()}
    </div>
  {/if}
</div>

<style>
  .card {
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
  }

  .card-hover {
    transition:
      border-color var(--transition-fast),
      box-shadow var(--transition-fast);
  }

  .card-hover:hover {
    border-color: var(--color-border-hover);
    box-shadow: var(--shadow-sm);
  }

  /* Padding variants */
  .padding-none .card-body {
    padding: 0;
  }

  .padding-sm .card-body {
    padding: var(--space-3);
  }

  .padding-md .card-body {
    padding: var(--space-4);
  }

  .padding-lg .card-body {
    padding: var(--space-6);
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-4);
    border-bottom: 1px solid var(--color-border);
  }

  .card-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--space-2);
    padding: var(--space-4);
    border-top: 1px solid var(--color-border);
    background-color: var(--color-bg);
    border-radius: 0 0 var(--radius-lg) var(--radius-lg);
  }
</style>
