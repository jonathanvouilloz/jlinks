<script lang="ts">
  import Button from './Button.svelte';
  import type { Snippet } from 'svelte';

  let { class: className = '', children, ...props } = $props();
</script>

<Button class="auth-btn {className}" {...props}>
  {@render children()}
</Button>

<style>
  :global(.btn.auth-btn) {
    width: 100%;
    padding: 1rem 1.5rem;
    font-size: 1rem;
    font-weight: 600;
    border-radius: 12px;
    background: linear-gradient(135deg, var(--color-primary) 0%, #ff8a7a 100%);
    box-shadow: 0 4px 14px rgba(255, 107, 91, 0.35);
    transition: all var(--transition-fast);
    margin-top: 0.5rem;
    border: none;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
  }

  :global(.btn.auth-btn:hover:not(:disabled)) {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(255, 107, 91, 0.4);
    opacity: 0.95;
  }

  :global(.btn.auth-btn:active:not(:disabled)) {
    transform: translateY(0);
  }
</style>
