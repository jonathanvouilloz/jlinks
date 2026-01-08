<script lang="ts">
  import type { ButtonStyle } from '@noko/shared/types';
  import { Link } from 'lucide-svelte';
  import * as m from '$lib/paraglide/messages';

  interface Props {
    value: ButtonStyle;
    onchange: (value: ButtonStyle) => void;
  }

  let { value, onchange }: Props = $props();

  // Map style types to their translation functions
  const styleLabels: Record<ButtonStyle, () => string> = {
    'rounded': m.appearance_button_style_rounded,
    'pill': m.appearance_button_style_pill,
    'square': m.appearance_button_style_square,
    'soft': m.appearance_button_style_soft,
    'outline': m.appearance_button_style_outline,
    'outline-icon': m.appearance_button_style_outline_icon,
  };

  const styles: ButtonStyle[] = ['rounded', 'pill', 'square', 'soft', 'outline', 'outline-icon'];
</script>

<div class="button-style-selector">
  <label>{m.appearance_buttons_style()}</label>
  <div class="style-options">
    {#each styles as style}
      <button
        type="button"
        class="style-option"
        class:selected={value === style}
        onclick={() => onchange(style)}
      >
        <div class="style-preview style-{style}">
          {#if style === 'outline-icon'}
            <Link size={12} />
          {/if}
          <span>{m.common_link()}</span>
        </div>
        <span class="style-label">{styleLabels[style]()}</span>
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
    grid-template-columns: repeat(6, 1fr);
    gap: var(--space-2);
  }

  @media (max-width: 700px) {
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

  .style-preview.style-outline-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
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
