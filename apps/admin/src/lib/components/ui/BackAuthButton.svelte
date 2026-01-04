<script lang="ts">
  import Button from './Button.svelte';
  import type { Snippet } from 'svelte';

  let { class: className = '', children, ...props } = $props();
</script>

<Button class="back-auth-btn {className}" {...props}>
  {@render children()}
</Button>

<style>
  :global(.btn.back-auth-btn) {
    height: 56px; /* Match AuthButton default height approx (padding 1rem + line height) */
    width: 56px;
    padding: 0;
    border-radius: 12px;
    background: transparent;
    border: 1px solid var(--color-border);
    color: var(--color-text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--transition-fast);
    flex-shrink: 0;
  }

  :global(.btn.back-auth-btn:hover:not(:disabled)) {
    background: var(--color-surface);
    border-color: var(--color-border-hover);
    color: var(--color-text);
  }

  :global(.btn.back-auth-btn:active:not(:disabled)) {
    transform: translateY(0);
  }
</style>
