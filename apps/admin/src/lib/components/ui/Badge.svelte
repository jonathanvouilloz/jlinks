<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'default' | 'success' | 'warning' | 'error' | 'pro';
    size?: 'sm' | 'md';
    class?: string;
    children: Snippet;
  }

  let {
    variant = 'default',
    size = 'sm',
    class: className = '',
    children,
  }: Props = $props();
</script>

<span class="badge badge-{variant} badge-{size} {className}">
  {@render children()}
</span>

<style>
  .badge {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    font-weight: var(--font-medium);
    border-radius: var(--radius-sm);
    white-space: nowrap;
  }

  /* Sizes */
  .badge-sm {
    padding: 2px 8px;
    font-size: var(--text-xs);
  }

  .badge-md {
    padding: 4px 10px;
    font-size: var(--text-sm);
  }

  /* Variants */
  .badge-default {
    background-color: var(--color-bg);
    color: var(--color-text-secondary);
  }

  .badge-success {
    background-color: var(--color-success-light);
    color: var(--color-success-dark);
  }

  .badge-warning {
    background-color: var(--color-warning-light);
    color: var(--color-warning-dark);
  }

  .badge-error {
    background-color: var(--color-error-light);
    color: var(--color-error-dark);
  }

  .badge-pro {
    background-color: var(--color-primary-light);
    color: var(--color-primary-hover);
  }
</style>
