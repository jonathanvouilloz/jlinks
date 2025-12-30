<script lang="ts">
  import { Toast } from '$lib/components/ui';
  import { toastStore } from '$lib/stores';
</script>

<div class="toast-container">
  {#each toastStore.toasts as toast (toast.id)}
    <Toast
      message={toast.message}
      variant={toast.variant}
      visible={true}
      onclose={() => toastStore.dismiss(toast.id)}
    />
  {/each}
</div>

<style>
  .toast-container {
    position: fixed;
    top: var(--space-4);
    right: var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    z-index: var(--z-toast);
    max-width: 400px;
  }
</style>
