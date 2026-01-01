<script lang="ts">
  import type { ButtonStyle } from '@jlinks/shared/types';

  interface Props {
    value: ButtonStyle;
    onchange: (value: ButtonStyle) => void;
  }

  let { value, onchange }: Props = $props();

  const styles: Array<{ type: ButtonStyle; label: string }> = [
    { type: 'rounded', label: 'Arrondi' },
    { type: 'pill', label: 'Pilule' },
    { type: 'square', label: 'Carré' },
    { type: 'soft', label: 'Doux' },
    { type: 'outline', label: 'Contour' },
  ];
</script>

<div class="button-style-selector">
  <label>Style des boutons</label>
  <div class="style-options">
    {#each styles as style}
      <button
        type="button"
        class="style-option"
        class:selected={value === style.type}
        onclick={() => onchange(style.type)}
      >
        <div class="style-preview style-{style.type}">
          <span>Lien</span>
        </div>
        <span class="style-label">{style.label}</span>
      </button>
    {/each}
  </div>
</div>

<style>
  .button-style-selector {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .button-style-selector label {
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    color: var(--color-text);
  }

  .style-options {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: var(--space-2);
  }

  @media (max-width: 600px) {
    .style-options {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .style-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3);
    border: 2px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .style-option:hover {
    border-color: var(--color-border-hover);
  }

  .style-option.selected {
    border-color: var(--color-primary);
    background: var(--color-primary-light);
  }

  .style-preview {
    width: 100%;
    padding: var(--space-2) var(--space-3);
    background: var(--color-primary);
    color: white;
    font-size: var(--text-xs);
    font-weight: var(--font-medium);
    text-align: center;
    transition: all var(--transition-fast);
  }

  .style-preview.style-rounded {
    border-radius: 8px;
  }

  .style-preview.style-pill {
    border-radius: 50px;
  }

  .style-preview.style-square {
    border-radius: 4px;
  }

  .style-preview.style-soft {
    border-radius: 16px;
  }

  .style-preview.style-outline {
    background: transparent;
    border: 2px solid var(--color-primary);
    color: var(--color-primary);
    border-radius: 8px;
  }

  .style-label {
    font-size: var(--text-xs);
    font-weight: var(--font-medium);
    color: var(--color-text-secondary);
  }

  .style-option.selected .style-label {
    color: var(--color-primary);
  }
</style>
