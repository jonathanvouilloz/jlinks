<script lang="ts">
  import type { LayoutType } from '@jlinks/shared/types';
  import { List, LayoutGrid, Grid3X3, Sparkles } from 'lucide-svelte';

  interface Props {
    value: LayoutType;
    onchange: (value: LayoutType) => void;
  }

  let { value, onchange }: Props = $props();

  const layouts: Array<{ type: LayoutType; label: string; icon: typeof List; disabled?: boolean }> = [
    { type: 'list', label: 'Liste', icon: List },
    { type: 'cards', label: 'Cartes', icon: LayoutGrid, disabled: true },
    { type: 'grid', label: 'Grille', icon: Grid3X3, disabled: true },
    { type: 'premium', label: 'Premium', icon: Sparkles },
  ];
</script>

<div class="layout-selector">
  <label>Layout de la page</label>
  <div class="layout-options">
    {#each layouts as layout}
      <button
        type="button"
        class="layout-option"
        class:selected={value === layout.type}
        class:disabled={layout.disabled}
        disabled={layout.disabled}
        onclick={() => !layout.disabled && onchange(layout.type)}
      >
        <svelte:component this={layout.icon} size={24} />
        <span>{layout.label}</span>
        {#if layout.disabled}
          <span class="coming-soon">Bientôt</span>
        {/if}
      </button>
    {/each}
  </div>
</div>

<style>
  .layout-selector {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .layout-selector label {
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    color: var(--color-text);
  }

  .layout-options {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-3);
  }

  @media (max-width: 500px) {
    .layout-options {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .layout-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-4);
    border: 2px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    cursor: pointer;
    transition: all var(--transition-fast);
    color: var(--color-text-secondary);
  }

  .layout-option:hover {
    border-color: var(--color-border-hover);
    color: var(--color-text);
  }

  .layout-option.selected {
    border-color: var(--color-primary);
    background: var(--color-primary-light);
    color: var(--color-primary);
  }

  .layout-option span {
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
  }

  .layout-option.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  .layout-option.disabled:hover {
    border-color: var(--color-border);
    color: var(--color-text-secondary);
  }

  .coming-soon {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    font-weight: var(--font-normal);
  }
</style>
