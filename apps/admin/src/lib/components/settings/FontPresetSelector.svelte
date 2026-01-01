<script lang="ts">
  import { FONT_PRESETS, type FontPreset } from '@jlinks/shared/font-presets';

  interface Props {
    value: string | null;
    onchange: (presetId: string | null, fontTitle: string, fontBody: string) => void;
  }

  let { value, onchange }: Props = $props();

  const presets: FontPreset[] = Object.values(FONT_PRESETS);

  // Build Google Fonts URL for all preset fonts (for previews)
  const allFonts = [...new Set(presets.flatMap((p) => [p.fontTitle, p.fontBody]))];
  const previewFontsUrl = `https://fonts.googleapis.com/css2?${allFonts.map((f) => `family=${encodeURIComponent(f)}:wght@400;600;700`).join('&')}&display=swap`;

  function selectPreset(preset: FontPreset) {
    onchange(preset.id, preset.fontTitle, preset.fontBody);
  }

  function selectCustom() {
    onchange(null, 'Inter', 'Inter');
  }
</script>

<svelte:head>
  <link href={previewFontsUrl} rel="stylesheet" />
</svelte:head>

<div class="font-preset-selector">
  <div class="presets-grid">
    {#each presets as preset}
      <button
        type="button"
        class="preset-card"
        class:selected={value === preset.id}
        onclick={() => selectPreset(preset)}
      >
        <div class="preset-preview" style="font-family: '{preset.fontTitle}', sans-serif">
          Aa
        </div>
        <div class="preset-info">
          <span class="preset-name">{preset.name}</span>
          <span class="preset-fonts">{preset.fontTitle}{preset.fontTitle !== preset.fontBody ? ` + ${preset.fontBody}` : ''}</span>
        </div>
      </button>
    {/each}

    <!-- Custom option -->
    <button
      type="button"
      class="preset-card custom"
      class:selected={value === null}
      onclick={selectCustom}
    >
      <div class="preset-preview custom-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      </div>
      <div class="preset-info">
        <span class="preset-name">Custom</span>
        <span class="preset-fonts">Choisir manuellement</span>
      </div>
    </button>
  </div>
</div>

<style>
  .font-preset-selector {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .presets-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-3);
  }

  @media (max-width: 600px) {
    .presets-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .preset-card {
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

  .preset-card:hover {
    border-color: var(--color-primary-light);
    background: var(--color-bg);
  }

  .preset-card.selected {
    border-color: var(--color-primary);
    background: var(--color-primary-light);
  }

  .preset-preview {
    font-size: 2rem;
    font-weight: 600;
    color: var(--color-text);
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .preset-preview.custom-icon {
    color: var(--color-text-secondary);
  }

  .preset-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .preset-name {
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    color: var(--color-text);
  }

  .preset-fonts {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
  }
</style>
