<script lang="ts">
  import type { BackgroundType, ButtonStyle, LayoutType } from '@jlinks/shared/types';
  import { Card, Button, Input } from '$lib/components/ui';
  import { ButtonStyleSelector, ColorPicker, FontPresetSelector, FontSelector, LayoutSelector, OpacitySlider } from '$lib/components/settings';
  import { Preview } from '$lib/components/dashboard';
  import { authStore, clientStore, linksStore } from '$lib/stores';

  // Get current client data
  const client = $derived(authStore.client);

  // Appearance fields
  let primaryColor = $state('#00d9a3');
  let buttonOpacity = $state(100);
  let backgroundType = $state<BackgroundType>('solid');
  let backgroundValue = $state('#ffffff');
  let outerBackgroundColor = $state('#f5f5f5');

  // Typography
  let fontPreset = $state<string | null>(null);
  let fontTitle = $state('Inter');
  let fontText = $state('Inter');

  // Layout
  let layoutType = $state<LayoutType>('list');
  let buttonStyle = $state<ButtonStyle>('rounded');

  // Detect Premium layout to disable irrelevant settings
  const isPremiumLayout = $derived(layoutType === 'premium');

  // Saving state
  let savingAppearance = $state(false);

  // Preview mode toggle
  let previewMode = $state<'current' | 'preview'>('preview');

  // Preview client combining form values for real-time preview
  const previewClient = $derived(client ? {
    ...client,
    primary_color: primaryColor,
    button_opacity: buttonOpacity,
    background_type: backgroundType,
    background_value: backgroundValue,
    outer_background_color: outerBackgroundColor,
    font_preset: fontPreset,
    font_title: fontTitle,
    font_text: fontText,
    layout_type: layoutType,
    button_style: buttonStyle,
  } : null);

  // Initialize form values from client
  $effect(() => {
    if (client) {
      primaryColor = client.primary_color || '#00d9a3';
      buttonOpacity = client.button_opacity ?? 100;
      backgroundType = client.background_type || 'solid';
      backgroundValue = client.background_value || '#ffffff';
      outerBackgroundColor = client.outer_background_color || '#f5f5f5';
      fontPreset = client.font_preset;
      fontTitle = client.font_title || 'Inter';
      fontText = client.font_text || 'Inter';
      layoutType = client.layout_type || 'list';
      buttonStyle = client.button_style || 'rounded';
    }
  });

  // Save handler
  async function saveAppearance() {
    savingAppearance = true;
    await clientStore.updateSettings({
      primary_color: primaryColor,
      button_opacity: buttonOpacity,
      background_type: backgroundType,
      background_value: backgroundValue,
      outer_background_color: outerBackgroundColor,
      font_preset: fontPreset,
      font_title: fontTitle,
      font_text: fontText,
      layout_type: layoutType,
      button_style: buttonStyle,
    });
    savingAppearance = false;
  }
</script>

<svelte:head>
  <title>Apparence | jLinks Admin</title>
</svelte:head>

<div class="apparence-page">
  <div class="apparence-layout">
    <div class="apparence-content">
      <div class="apparence-grid">
        <!-- Appearance Section -->
        <Card class={isPremiumLayout ? 'disabled' : ''}>
          {#snippet header()}
            <h2>Fond</h2>
          {/snippet}
          <div class="form-section">
            <div class="form-field">
              <label for="bg-type">Type d'arrière-plan</label>
              <select id="bg-type" bind:value={backgroundType}>
                <option value="solid">Couleur unie</option>
                <option value="gradient">Dégradé</option>
                <option value="image">Image</option>
              </select>
            </div>

            {#if backgroundType === 'solid'}
              <ColorPicker label="Couleur de fond" value={backgroundValue} onchange={(v) => backgroundValue = v} />
            {:else}
              <Input
                label={backgroundType === 'gradient' ? 'Dégradé CSS' : 'URL de l\'image'}
                bind:value={backgroundValue}
                placeholder={backgroundType === 'gradient' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'https://example.com/bg.jpg'}
              />
            {/if}

            <ColorPicker label="Couleur de fond (desktop)" value={outerBackgroundColor} onchange={(v) => outerBackgroundColor = v} />
            <p class="color-hint">Visible uniquement sur desktop, derrière la carte.</p>

            <Button variant="primary" onclick={saveAppearance} loading={savingAppearance}>
              Enregistrer
            </Button>
          </div>
        </Card>

        <!-- Colors & Buttons Section -->
        <Card class={isPremiumLayout ? 'disabled' : ''}>
          {#snippet header()}
            <h2>Boutons</h2>
          {/snippet}
          <div class="form-section">
            <ColorPicker label="Couleur des boutons (par défaut)" value={primaryColor} onchange={(v) => primaryColor = v} />

            <OpacitySlider label="Opacité des boutons" value={buttonOpacity} onchange={(v) => buttonOpacity = v} />

            <ButtonStyleSelector value={buttonStyle} onchange={(v) => buttonStyle = v} />

            <Button variant="primary" onclick={saveAppearance} loading={savingAppearance}>
              Enregistrer
            </Button>
          </div>
        </Card>

        <!-- Typography Section -->
        <Card>
          {#snippet header()}
            <h2>Typographie</h2>
          {/snippet}
          <div class="form-section">
            <FontPresetSelector
              value={fontPreset}
              onchange={(preset, title, body) => {
                fontPreset = preset;
                fontTitle = title;
                fontText = body;
              }}
            />
            {#if fontPreset === null}
              <div class="custom-fonts">
                <FontSelector label="Police des titres" value={fontTitle} onchange={(v) => fontTitle = v} />
                <FontSelector label="Police du texte" value={fontText} onchange={(v) => fontText = v} />
              </div>
            {/if}
            <Button variant="primary" onclick={saveAppearance} loading={savingAppearance}>
              Enregistrer
            </Button>
          </div>
        </Card>

        <!-- Layout Section -->
        <Card>
          {#snippet header()}
            <h2>Mise en page</h2>
          {/snippet}
          <div class="form-section">
            <LayoutSelector value={layoutType} onchange={(v) => layoutType = v} />
            <Button variant="primary" onclick={saveAppearance} loading={savingAppearance}>
              Enregistrer
            </Button>
          </div>
        </Card>
      </div>
    </div>

    <!-- Preview Panel -->
    <div class="apparence-preview">
      <div class="preview-mode-toggle">
        <button
          type="button"
          class="toggle-btn"
          class:active={previewMode === 'current'}
          onclick={() => { previewMode = 'current'; }}
        >
          Publié
        </button>
        <button
          type="button"
          class="toggle-btn"
          class:active={previewMode === 'preview'}
          onclick={() => { previewMode = 'preview'; }}
        >
          Brouillon
        </button>
      </div>
      {#if previewMode === 'preview'}
        <p class="preview-hint">Modifie les champs ci-contre pour voir l'aperçu en temps réel</p>
      {/if}
      {#key previewMode}
        <Preview client={previewMode === 'current' ? authStore.client : previewClient} links={linksStore.links} />
      {/key}
    </div>
  </div>
</div>

<style>
  .apparence-page {
    height: 100%;
  }

  .apparence-layout {
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: var(--space-6);
    height: calc(100vh - var(--header-height) - var(--space-12));
  }

  .apparence-content {
    overflow-y: auto;
    padding-right: var(--space-2);
  }

  .apparence-preview {
    position: sticky;
    top: 0;
    height: fit-content;
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .preview-mode-toggle {
    display: flex;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-1);
  }

  .toggle-btn {
    flex: 1;
    padding: var(--space-2) var(--space-3);
    border: none;
    background: transparent;
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .toggle-btn:hover {
    color: var(--color-text);
  }

  .toggle-btn.active {
    background: var(--color-primary);
    color: white;
  }

  .preview-hint {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    text-align: center;
    margin: 0;
    padding: var(--space-2);
    background: var(--color-surface);
    border-radius: var(--radius-md);
  }

  .apparence-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-6);
  }

  @media (max-width: 1200px) {
    .apparence-layout {
      grid-template-columns: 1fr;
    }

    .apparence-preview {
      display: none;
    }
  }

  @media (max-width: 900px) {
    .apparence-grid {
      grid-template-columns: 1fr;
    }
  }

  .form-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .form-field {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .form-field label {
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    color: var(--color-text);
  }

  .form-field select {
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    font-family: inherit;
    background: var(--color-surface);
  }

  .form-field select:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px var(--color-primary-light);
  }

  .custom-fonts {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    padding-top: var(--space-4);
    border-top: 1px solid var(--color-border);
  }

  .color-hint {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    margin: calc(-1 * var(--space-2)) 0 0;
  }

  /* Disabled state for Premium layout */
  :global(.card.disabled) {
    opacity: 0.5;
    pointer-events: none;
    position: relative;
  }

  :global(.card.disabled)::after {
    content: 'Non disponible avec Premium';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: var(--color-surface);
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    white-space: nowrap;
    box-shadow: var(--shadow-md);
    pointer-events: none;
  }
</style>
