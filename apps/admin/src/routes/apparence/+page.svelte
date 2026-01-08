<script lang="ts">
  import * as m from '$lib/paraglide/messages';
  import type { BackgroundType, ButtonStyle, LayoutType } from '@noko/shared/types';
  import { Card, Button, Input } from '$lib/components/ui';
  import { ButtonStyleSelector, ColorPicker, FontPresetSelector, FontSelector, GradientSelector, LayoutSelector, OpacitySlider } from '$lib/components/settings';
  import { Preview } from '$lib/components/dashboard';
  import { authStore, clientStore, linksStore } from '$lib/stores';

  // Get current client data
  const client = $derived(authStore.client);

  // Appearance fields
  let primaryColor = $state('#FF6B5B');
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
      primaryColor = client.primary_color || '#FF6B5B';
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
  <title>{m.appearance_page_title()}</title>
</svelte:head>

<div class="apparence-page" style="--disabled-premium-text: '{m.appearance_disabled_for_premium()}'">
  <div class="apparence-layout">
    <div class="apparence-content">
      <div class="apparence-grid">
        <!-- Appearance Section -->
        <Card class={isPremiumLayout ? 'disabled' : ''}>
          {#snippet header()}
            <h2>{m.appearance_background()}</h2>
          {/snippet}
          <div class="form-section">
            <div class="form-field">
              <label for="bg-type">{m.appearance_background_type()}</label>
              <select id="bg-type" bind:value={backgroundType}>
                <option value="solid">{m.appearance_background_solid()}</option>
                <option value="gradient">{m.appearance_background_gradient()}</option>
                <option value="image">{m.appearance_background_image()}</option>
              </select>
            </div>

            {#if backgroundType === 'solid'}
              <ColorPicker label={m.appearance_background_color()} value={backgroundValue} onchange={(v) => backgroundValue = v} />
            {:else if backgroundType === 'gradient'}
              <GradientSelector value={backgroundValue} onchange={(v) => backgroundValue = v} />
            {:else}
              <Input
                label={m.appearance_background_image_url()}
                bind:value={backgroundValue}
                placeholder="https://example.com/bg.jpg"
              />
            {/if}

            <ColorPicker label={m.appearance_background_outer_color()} value={outerBackgroundColor} onchange={(v) => outerBackgroundColor = v} />
            <p class="color-hint">{m.appearance_background_outer_hint()}</p>

            <Button variant="primary" onclick={saveAppearance} loading={savingAppearance}>
              {m.common_save()}
            </Button>
          </div>
        </Card>

        <!-- Colors & Buttons Section -->
        <Card class={isPremiumLayout ? 'disabled' : ''}>
          {#snippet header()}
            <h2>{m.appearance_buttons()}</h2>
          {/snippet}
          <div class="form-section">
            <ColorPicker label={m.appearance_buttons_color()} value={primaryColor} onchange={(v) => primaryColor = v} />

            <OpacitySlider label={m.appearance_buttons_opacity()} value={buttonOpacity} onchange={(v) => buttonOpacity = v} />

            <ButtonStyleSelector value={buttonStyle} onchange={(v) => buttonStyle = v} />

            <Button variant="primary" onclick={saveAppearance} loading={savingAppearance}>
              {m.common_save()}
            </Button>
          </div>
        </Card>

        <!-- Typography Section -->
        <Card>
          {#snippet header()}
            <h2>{m.appearance_typography()}</h2>
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
                <FontSelector label={m.appearance_typography_title_font()} value={fontTitle} onchange={(v) => fontTitle = v} />
                <FontSelector label={m.appearance_typography_text_font()} value={fontText} onchange={(v) => fontText = v} />
              </div>
            {/if}
            <Button variant="primary" onclick={saveAppearance} loading={savingAppearance}>
              {m.common_save()}
            </Button>
          </div>
        </Card>

        <!-- Layout Section -->
        <Card>
          {#snippet header()}
            <h2>{m.appearance_layout()}</h2>
          {/snippet}
          <div class="form-section">
            <LayoutSelector value={layoutType} onchange={(v) => layoutType = v} />
            <Button variant="primary" onclick={saveAppearance} loading={savingAppearance}>
              {m.common_save()}
            </Button>
          </div>
        </Card>
      </div>
    </div>

    <!-- Preview Panel -->
    <div class="apparence-preview">
      <p class="preview-hint">{m.appearance_preview_hint()}</p>
      <Preview client={previewClient} links={linksStore.links} />
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
    content: var(--disabled-premium-text);
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
