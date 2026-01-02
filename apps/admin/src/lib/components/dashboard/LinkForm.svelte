<script lang="ts">
  import type { Link, CreateLinkInput, SocialPresetKey } from '@noko/shared/types';
  import { SOCIAL_PRESETS, getSocialPresetKeys, detectSocialPreset } from '@noko/shared/social-presets';
  import { Modal, Input, Button, Toggle } from '$lib/components/ui';
  import { authStore } from '$lib/stores';
  import * as Icons from 'lucide-svelte';

  interface Props {
    open: boolean;
    link?: Link | null;
    onClose: () => void;
    onSave: (data: CreateLinkInput) => void;
  }

  let { open, link = null, onClose, onSave }: Props = $props();

  // Form state
  let title = $state('');
  let url = $state('');
  let description = $state('');
  let socialPreset = $state<SocialPresetKey | null>(null);
  let useCustomStyle = $state(false);
  let customBgColor = $state('#6366F1');
  let customTextColor = $state('#ffffff');
  let saving = $state(false);

  // Get theme color from client
  const themeColor = $derived(authStore.client?.primary_color || '#FF6B5B');

  // Preview colors (computed)
  const previewBgColor = $derived(
    useCustomStyle
      ? customBgColor
      : socialPreset === 'theme'
        ? themeColor
        : socialPreset
          ? SOCIAL_PRESETS[socialPreset].bgColor
          : themeColor
  );
  const previewTextColor = $derived(
    useCustomStyle
      ? customTextColor
      : socialPreset
        ? SOCIAL_PRESETS[socialPreset].textColor
        : '#ffffff'
  );

  // Reset form when modal opens/closes
  $effect(() => {
    if (open) {
      if (link) {
        title = link.title;
        url = link.url;
        description = link.description || '';
        socialPreset = link.social_preset as SocialPresetKey | null;
        useCustomStyle = !link.social_preset && (!!link.custom_bg_color || !!link.custom_text_color);
        customBgColor = link.custom_bg_color || '#6366F1';
        customTextColor = link.custom_text_color || '#ffffff';
      } else {
        title = '';
        url = '';
        description = '';
        socialPreset = null;
        useCustomStyle = false;
        customBgColor = '#6366F1';
        customTextColor = '#ffffff';
      }
    }
  });

  // Auto-detect social preset from URL
  function handleUrlChange() {
    if (!useCustomStyle && !socialPreset) {
      const detected = detectSocialPreset(url);
      if (detected) {
        socialPreset = detected;
      }
    }
  }

  // Get icon component by name
  function getIconComponent(iconName: string) {
    const pascalName = iconName.charAt(0).toUpperCase() + iconName.slice(1).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    return (Icons as Record<string, any>)[pascalName] || Icons.Link;
  }

  async function handleSubmit(e?: Event) {
    e?.preventDefault();

    if (!title.trim() || !url.trim()) return;

    saving = true;
    const data: CreateLinkInput = {
      title: title.trim(),
      url: url.trim(),
      description: description.trim() || undefined,
      social_preset: useCustomStyle ? undefined : socialPreset || undefined,
      custom_bg_color: useCustomStyle ? customBgColor : undefined,
      custom_text_color: useCustomStyle ? customTextColor : undefined,
    };

    onSave(data);
    saving = false;
  }

  function handleFormSubmit() {
    handleSubmit();
  }

  const presetKeys = getSocialPresetKeys();
</script>

<Modal {open} onclose={onClose} title={link ? 'Modifier le lien' : 'Nouveau lien'} size="md">
  <form onsubmit={handleSubmit} class="link-form">
    <Input
      label="Titre"
      bind:value={title}
      placeholder="Mon site web"
      required
    />

    <Input
      label="URL"
      type="url"
      bind:value={url}
      placeholder="https://example.com"
      required
      oninput={handleUrlChange}
    />

    <Input
      label="Description (optionnel)"
      bind:value={description}
      placeholder="Une courte description..."
    />

    <div class="style-section">
      <div class="style-toggle">
        <span class="style-label">Style personnalisé</span>
        <Toggle bind:checked={useCustomStyle} />
      </div>

      {#if useCustomStyle}
        <div class="color-pickers">
          <div class="color-picker">
            <label for="bg-color">Couleur de fond</label>
            <div class="color-input-wrapper">
              <input type="color" id="bg-color" bind:value={customBgColor} />
              <input type="text" bind:value={customBgColor} class="color-text" />
            </div>
          </div>
          <div class="color-picker">
            <label for="text-color">Couleur du texte</label>
            <div class="color-input-wrapper">
              <input type="color" id="text-color" bind:value={customTextColor} />
              <input type="text" bind:value={customTextColor} class="color-text" />
            </div>
          </div>
        </div>
      {:else}
        <div class="preset-grid">
          {#each presetKeys as key}
            {@const preset = SOCIAL_PRESETS[key]}
            {@const IconComponent = getIconComponent(preset.icon)}
            {@const bgColor = key === 'theme' ? themeColor : preset.bgColor}
            <button
              type="button"
              class="preset-btn"
              class:selected={socialPreset === key}
              onclick={() => socialPreset = key}
              style="background: {bgColor}; color: {preset.textColor};"
            >
              <svelte:component this={IconComponent} size={18} />
              <span>{preset.label}</span>
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <div class="preview-section">
      <span class="preview-label">Aperçu</span>
      <div
        class="preview-button"
        style="background: {previewBgColor}; color: {previewTextColor};"
      >
        {title || 'Titre du lien'}
      </div>
    </div>
  </form>

  {#snippet footer()}
    <div class="form-actions">
      <Button variant="secondary" onclick={onClose}>Annuler</Button>
      <Button variant="primary" onclick={handleFormSubmit} loading={saving} disabled={!title.trim() || !url.trim()}>
        {link ? 'Enregistrer' : 'Créer'}
      </Button>
    </div>
  {/snippet}
</Modal>

<style>
  .link-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .style-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .style-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .style-label {
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    color: var(--color-text);
  }

  .color-pickers {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-3);
  }

  .color-picker {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .color-picker label {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
  }

  .color-input-wrapper {
    display: flex;
    gap: var(--space-2);
    align-items: center;
  }

  .color-input-wrapper input[type="color"] {
    width: 40px;
    height: 40px;
    padding: 0;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    cursor: pointer;
  }

  .color-text {
    flex: 1;
    padding: var(--space-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    font-family: monospace;
  }

  .preset-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: var(--space-2);
  }

  .preset-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-2);
    border: 2px solid transparent;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition-fast);
    font-size: var(--text-xs);
  }

  .preset-btn:hover {
    transform: scale(1.05);
  }

  .preset-btn.selected {
    border-color: var(--color-text);
    box-shadow: var(--shadow-md);
  }

  .preview-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .preview-label {
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    color: var(--color-text);
  }

  .preview-button {
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-lg);
    text-align: center;
    font-weight: var(--font-medium);
    transition: all var(--transition-fast);
  }

  .form-actions {
    display: flex;
    gap: var(--space-3);
    justify-content: flex-end;
  }
</style>
