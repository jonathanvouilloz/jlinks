<script lang="ts">
  import { GRADIENT_PRESETS, findGradientPreset } from '@noko/shared';
  import { Pencil } from 'lucide-svelte';
  import * as m from '$lib/paraglide/messages';

  interface Props {
    value: string;
    onchange: (value: string) => void;
  }

  let { value, onchange }: Props = $props();

  // Determine if current value matches a preset or is custom
  let isCustom = $derived(!findGradientPreset(value));
  let selectedPresetId = $derived(findGradientPreset(value)?.id ?? 'custom');
  let customValue = $state(value);

  // Sync custom value when value changes externally
  $effect(() => {
    if (isCustom) {
      customValue = value;
    }
  });

  function selectPreset(presetId: string) {
    if (presetId === 'custom') {
      // Keep current value or use a default
      onchange(customValue || 'linear-gradient(135deg, #000000 0%, #333333 100%)');
    } else {
      const preset = GRADIENT_PRESETS.find(p => p.id === presetId);
      if (preset) {
        onchange(preset.value);
      }
    }
  }

  function handleCustomInput(e: Event) {
    const target = e.target as HTMLInputElement;
    customValue = target.value;
    onchange(target.value);
  }
</script>

<div class="gradient-selector">
  <label>{m.appearance_gradient_background()}</label>
  <div class="gradient-options">
    {#each GRADIENT_PRESETS as preset}
      <button
        type="button"
        class="gradient-option"
        class:selected={selectedPresetId === preset.id}
        onclick={() => selectPreset(preset.id)}
      >
        <div class="gradient-preview" style="background: {preset.value};"></div>
        <span class="gradient-label">{preset.name}</span>
      </button>
    {/each}
    <button
      type="button"
      class="gradient-option"
      class:selected={selectedPresetId === 'custom'}
      onclick={() => selectPreset('custom')}
    >
      <div class="gradient-preview custom-preview">
        <Pencil size={20} />
      </div>
      <span class="gradient-label">{m.appearance_gradient_custom()}</span>
    </button>
  </div>

  {#if isCustom}
    <div class="custom-input">
      <input
        type="text"
        value={customValue}
        placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        oninput={handleCustomInput}
      />
    </div>
  {/if}
</div>

<style>
  .gradient-selector {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .gradient-selector label {
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    color: var(--color-text);
  }

  .gradient-options {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-2);
  }

  @media (max-width: 500px) {
    .gradient-options {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .gradient-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2);
    border: 2px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .gradient-option:hover {
    border-color: var(--color-border-hover);
    transform: scale(1.02);
  }

  .gradient-option.selected {
    border-color: var(--color-primary);
    background: var(--color-primary-light);
  }

  .gradient-preview {
    width: 100%;
    aspect-ratio: 1;
    border-radius: var(--radius-md);
    transition: all var(--transition-fast);
  }

  .custom-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-bg);
    color: var(--color-text-muted);
    border: 2px dashed var(--color-border);
  }

  .gradient-option.selected .custom-preview {
    color: var(--color-primary);
    border-color: var(--color-primary);
  }

  .gradient-label {
    font-size: var(--text-xs);
    font-weight: var(--font-medium);
    color: var(--color-text-secondary);
    text-align: center;
    line-height: 1.2;
  }

  .gradient-option.selected .gradient-label {
    color: var(--color-primary);
  }

  .custom-input {
    margin-top: var(--space-2);
  }

  .custom-input input {
    width: 100%;
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 10px 12px;
    font-size: var(--text-sm);
    color: var(--color-text);
    font-family: monospace;
    transition:
      border-color var(--transition-fast),
      box-shadow var(--transition-fast);
  }

  .custom-input input:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px var(--color-primary-light);
  }

  .custom-input input::placeholder {
    color: var(--color-text-muted);
  }
</style>
