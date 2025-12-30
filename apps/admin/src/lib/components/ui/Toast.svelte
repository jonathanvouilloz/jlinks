<script lang="ts">
  import { CheckCircle, AlertCircle, X, Info } from 'lucide-svelte';

  interface Props {
    message?: string;
    variant?: 'success' | 'error' | 'warning' | 'info';
    visible?: boolean;
    duration?: number;
    class?: string;
    onclose?: () => void;
  }

  let {
    message = '',
    variant = 'info',
    visible = $bindable(false),
    duration = 5000,
    class: className = '',
    onclose,
  }: Props = $props();

  let timeout: ReturnType<typeof setTimeout>;

  $effect(() => {
    if (visible && duration > 0) {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        visible = false;
        onclose?.();
      }, duration);
    }

    return () => clearTimeout(timeout);
  });

  function handleClose() {
    visible = false;
    onclose?.();
  }

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertCircle,
    info: Info,
  };
</script>

{#if visible}
  <div class="toast toast-{variant} {className}" role="alert">
    <svelte:component this={icons[variant]} size={20} />
    <span class="toast-message">{message}</span>
    <button class="toast-close" onclick={handleClose} aria-label="Close">
      <X size={16} />
    </button>
  </div>
{/if}

<style>
  .toast {
    position: fixed;
    bottom: var(--space-6);
    right: var(--space-6);
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
    z-index: var(--z-toast);
    animation: slideIn var(--transition-slow);
    max-width: 400px;
  }

  .toast-success {
    background-color: var(--color-success);
    color: white;
  }

  .toast-error {
    background-color: var(--color-error);
    color: white;
  }

  .toast-warning {
    background-color: var(--color-warning);
    color: white;
  }

  .toast-info {
    background-color: var(--color-text);
    color: white;
  }

  .toast-message {
    flex: 1;
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
  }

  .toast-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: var(--radius-sm);
    color: inherit;
    opacity: 0.8;
    transition: opacity var(--transition-fast);
  }

  .toast-close:hover {
    opacity: 1;
  }

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
</style>
