<script lang="ts">
  import * as m from '$lib/paraglide/messages';
  import type { ProfileImageShape } from '@noko/shared/types';
  import { Card, Button, Input, Toggle, ImageUpload } from '$lib/components/ui';
  import { Preview } from '$lib/components/dashboard';
  import { Download, QrCode, UserPlus } from 'lucide-svelte';
  import { authStore, clientStore, linksStore } from '$lib/stores';
  import { api } from '$lib/api';

  // Get current client data
  const client = $derived(authStore.client);

  // Profile fields
  let firstName = $state('');
  let lastName = $state('');
  let bio = $state('');

  // Computed display name for preview
  const displayName = $derived([firstName, lastName].filter(Boolean).join(' ') || '');
  let metaTitle = $state('');
  let metaDescription = $state('');

  // Branding fields
  let logoUrl = $state('');
  let profileImageUrl = $state('');
  let profileImageSize = $state(96);
  let profileImageShape = $state<ProfileImageShape>('round');

  // vCard fields
  let vcardEnabled = $state(false);
  let vcardName = $state('');
  let vcardEmail = $state('');
  let vcardPhone = $state('');
  let vcardCompany = $state('');
  let vcardWebsite = $state('');

  // Saving states
  let savingProfile = $state(false);
  let savingBranding = $state(false);
  let savingVCard = $state(false);

  // Image upload handlers
  function handleImageUpload(url: string) {
    profileImageUrl = url;
  }

  function handleImageRemove() {
    profileImageUrl = '';
  }


  // Preview client combining form values for real-time preview
  const previewClient = $derived(client ? {
    ...client,
    name: displayName,
    first_name: firstName || null,
    last_name: lastName || null,
    bio,
    logo_url: logoUrl || null,
    profile_image_url: profileImageUrl || null,
    profile_image_size: profileImageSize,
    profile_image_shape: profileImageShape,
  } : null);

  // Initialize form values from client
  $effect(() => {
    if (client) {
      firstName = client.first_name || '';
      lastName = client.last_name || '';
      bio = client.bio || '';
      metaTitle = client.meta_title || '';
      metaDescription = client.meta_description || '';
      logoUrl = client.logo_url || '';
      profileImageUrl = client.profile_image_url || '';
      profileImageSize = client.profile_image_size ?? 96;
      profileImageShape = client.profile_image_shape ?? 'round';
      vcardEnabled = client.vcard_enabled || false;
      vcardName = client.vcard_name || '';
      vcardEmail = client.vcard_email || '';
      vcardPhone = client.vcard_phone || '';
      vcardCompany = client.vcard_company || '';
      vcardWebsite = client.vcard_website || '';
    }
  });

  // Save handlers
  async function saveProfile() {
    savingProfile = true;
    try {
      await clientStore.updateProfile({
        first_name: firstName || undefined,
        last_name: lastName || undefined,
        bio: bio || undefined,
        meta_title: metaTitle || undefined,
        meta_description: metaDescription || undefined,
      });
    } finally {
      savingProfile = false;
    }
  }

  async function saveBranding() {
    savingBranding = true;
    try {
      await clientStore.updateBranding({
        logo_url: logoUrl || undefined,
        profile_image_url: profileImageUrl || undefined,
        profile_image_size: profileImageSize,
        profile_image_shape: profileImageShape,
      });
    } finally {
      savingBranding = false;
    }
  }

  async function saveVCard() {
    savingVCard = true;
    try {
      await clientStore.updateVCard({
        vcard_enabled: vcardEnabled,
        vcard_name: vcardName || undefined,
        vcard_email: vcardEmail || undefined,
        vcard_phone: vcardPhone || undefined,
        vcard_company: vcardCompany || undefined,
        vcard_website: vcardWebsite || undefined,
      });
    } finally {
      savingVCard = false;
    }
  }
</script>

<svelte:head>
  <title>{m.content_page_title()}</title>
</svelte:head>

<div class="contenu-page">
  <div class="contenu-layout">
    <div class="contenu-content">
      <div class="contenu-grid">
        <!-- Profile Section -->
        <Card>
          {#snippet header()}
            <h2>{m.content_profile()}</h2>
          {/snippet}
          <div class="form-section">
            <div class="name-row">
              <Input
                label={m.content_profile_first_name_label()}
                bind:value={firstName}
                placeholder={m.content_profile_first_name_placeholder()}
              />
              <Input
                label={m.content_profile_last_name_label()}
                bind:value={lastName}
                placeholder={m.content_profile_last_name_placeholder()}
              />
            </div>
            <div class="form-field">
              <label for="bio">{m.content_profile_bio_label()}</label>
              <textarea
                id="bio"
                bind:value={bio}
                placeholder={m.content_profile_bio_placeholder()}
                rows="3"
                maxlength="500"
              ></textarea>
              <span class="char-count">{m.content_profile_char_count({ count: bio.length })}</span>
            </div>
            <Button variant="primary" onclick={saveProfile} loading={savingProfile}>
              {m.common_save()}
            </Button>
          </div>
        </Card>

        <!-- SEO Section -->
        <Card>
          {#snippet header()}
            <h2>{m.content_seo()}</h2>
          {/snippet}
          <div class="form-section">
            <Input
              label={m.content_seo_meta_title_label()}
              bind:value={metaTitle}
              placeholder={m.content_seo_meta_title_placeholder()}
              hint={m.content_seo_meta_title_hint()}
            />
            <Input
              label={m.content_seo_meta_description_label()}
              bind:value={metaDescription}
              placeholder={m.content_seo_meta_description_placeholder()}
              hint={m.content_seo_meta_description_hint()}
            />
            <Button variant="primary" onclick={saveProfile} loading={savingProfile}>
              {m.common_save()}
            </Button>
          </div>
        </Card>

        <!-- Branding Section -->
        <Card>
          {#snippet header()}
            <h2>{m.content_images()}</h2>
          {/snippet}
          <div class="form-section">
            <!-- Profile Photo Upload -->
            <div class="form-field">
              <label>{m.content_profile_photo_label()}</label>
              <div class="photo-upload-row">
                <ImageUpload
                  imageUrl={profileImageUrl}
                  onUpload={handleImageUpload}
                  onRemove={handleImageRemove}
                  size={96}
                  shape={profileImageShape === 'round' ? 'round' : 'square'}
                />
                <p class="photo-hint">{m.content_profile_photo_hint()}</p>
              </div>
            </div>

            <Input
              label={m.content_logo_url_label()}
              bind:value={logoUrl}
              placeholder={m.content_logo_url_placeholder()}
              hint={m.content_logo_url_hint()}
            />

            <!-- Profile Image Size Slider -->
            <div class="form-field">
              <label for="profile-size">{m.content_profile_size_label({ size: profileImageSize })}</label>
              <input
                type="range"
                id="profile-size"
                min="60"
                max="200"
                step="5"
                bind:value={profileImageSize}
                class="size-slider"
              />
            </div>

            <!-- Profile Image Shape Selector -->
            <div class="form-field">
              <label>{m.content_profile_shape_label()}</label>
              <div class="shape-selector">
                <button
                  type="button"
                  class="shape-option"
                  class:selected={profileImageShape === 'round'}
                  onclick={() => profileImageShape = 'round'}
                >
                  <div class="shape-preview round"></div>
                  <span>{m.content_profile_shape_round()}</span>
                </button>
                <button
                  type="button"
                  class="shape-option"
                  class:selected={profileImageShape === 'rounded'}
                  onclick={() => profileImageShape = 'rounded'}
                >
                  <div class="shape-preview rounded"></div>
                  <span>{m.content_profile_shape_rounded()}</span>
                </button>
                <button
                  type="button"
                  class="shape-option"
                  class:selected={profileImageShape === 'square'}
                  onclick={() => profileImageShape = 'square'}
                >
                  <div class="shape-preview square"></div>
                  <span>{m.content_profile_shape_square()}</span>
                </button>
              </div>
            </div>

            {#if logoUrl}
              <div class="image-previews">
                <div class="image-preview">
                  <span>{m.content_image_preview_logo()}</span>
                  <img src={logoUrl} alt="Logo preview" />
                </div>
              </div>
            {/if}
            <Button variant="primary" onclick={saveBranding} loading={savingBranding}>
              {m.common_save()}
            </Button>
          </div>
        </Card>

        <!-- QR Code Section -->
        <Card>
          {#snippet header()}
            <h2><QrCode size={20} /> {m.content_qrcode()}</h2>
          {/snippet}
          <div class="form-section">
            <p class="section-description">
              {m.content_qrcode_description()}
            </p>
            <div class="qr-preview">
              <img src={api.qrcode.getPreviewUrl()} alt="QR Code" />
            </div>
            <div class="download-buttons">
              <a href={api.qrcode.getDownloadUrl('png')} download class="download-btn">
                <Download size={16} />
                {m.content_qrcode_download_png()}
              </a>
              <a href={api.qrcode.getDownloadUrl('svg')} download class="download-btn">
                <Download size={16} />
                {m.content_qrcode_download_svg()}
              </a>
            </div>
          </div>
        </Card>

        <!-- vCard Section -->
        <Card>
          {#snippet header()}
            <h2><UserPlus size={20} /> {m.content_vcard()}</h2>
          {/snippet}
          <div class="form-section">
            <div class="toggle-row">
              <div>
                <span class="toggle-label">{m.content_vcard_enable()}</span>
                <p class="toggle-description">{m.content_vcard_enable_description()}</p>
              </div>
              <Toggle bind:checked={vcardEnabled} />
            </div>

            {#if vcardEnabled}
              <div class="vcard-fields">
                <Input
                  label={m.content_vcard_fullname()}
                  bind:value={vcardName}
                  placeholder={displayName || m.content_profile_first_name_placeholder()}
                />
                <Input
                  label={m.content_vcard_email()}
                  type="email"
                  bind:value={vcardEmail}
                  placeholder="contact@example.com"
                />
                <Input
                  label={m.content_vcard_phone()}
                  type="tel"
                  bind:value={vcardPhone}
                  placeholder="+41 79 123 45 67"
                />
                <Input
                  label={m.content_vcard_company()}
                  bind:value={vcardCompany}
                  placeholder={m.content_vcard_company_placeholder()}
                />
                <Input
                  label={m.content_vcard_website()}
                  bind:value={vcardWebsite}
                  placeholder="https://..."
                />
              </div>
            {/if}

            <Button variant="primary" onclick={saveVCard} loading={savingVCard}>
              {m.common_save()}
            </Button>
          </div>
        </Card>
      </div>
    </div>

    <!-- Preview Panel -->
    <div class="contenu-preview">
      <p class="preview-hint">{m.content_preview_hint()}</p>
      <Preview client={previewClient} links={linksStore.links} />
    </div>
  </div>
</div>

<style>
  .contenu-page {
    height: 100%;
  }

  .contenu-layout {
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: var(--space-6);
    height: calc(100vh - var(--header-height) - var(--space-12));
  }

  .contenu-content {
    overflow-y: auto;
    padding-right: var(--space-2);
  }

  .contenu-preview {
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

  .contenu-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-6);
  }

  @media (max-width: 1200px) {
    .contenu-layout {
      grid-template-columns: 1fr;
    }

    .contenu-preview {
      display: none;
    }
  }

  @media (max-width: 900px) {
    .contenu-grid {
      grid-template-columns: 1fr;
    }
  }

  .form-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .name-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-4);
  }

  @media (max-width: 500px) {
    .name-row {
      grid-template-columns: 1fr;
    }
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

  .form-field textarea {
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    font-family: inherit;
    resize: vertical;
    background: var(--color-surface);
  }

  .form-field textarea:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px var(--color-primary-light);
  }

  .char-count {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    text-align: right;
  }

  .photo-upload-row {
    display: flex;
    align-items: center;
    gap: var(--space-4);
  }

  .photo-hint {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    margin: 0;
  }

  .section-description {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
    margin: 0;
  }

  .image-previews {
    display: flex;
    gap: var(--space-4);
  }

  .image-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
  }

  .image-preview span {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
  }

  .image-preview img {
    max-width: 80px;
    max-height: 80px;
    object-fit: contain;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
  }

  .image-preview img.profile {
    border-radius: 50%;
  }

  .qr-preview {
    display: flex;
    justify-content: center;
    padding: var(--space-4);
    background: white;
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border);
  }

  .qr-preview img {
    width: 180px;
    height: 180px;
  }

  .download-buttons {
    display: flex;
    gap: var(--space-3);
  }

  .download-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-text);
    text-decoration: none;
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    transition: all var(--transition-fast);
  }

  .download-btn:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }

  .toggle-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-4);
  }

  .toggle-label {
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    color: var(--color-text);
  }

  .toggle-description {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    margin: var(--space-1) 0 0;
  }

  .vcard-fields {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding-top: var(--space-3);
    border-top: 1px solid var(--color-border);
  }

  /* Size Slider */
  .size-slider {
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: var(--color-border);
    outline: none;
    cursor: pointer;
    -webkit-appearance: none;
    appearance: none;
  }

  .size-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--color-primary);
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .size-slider::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--color-primary);
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  /* Shape Selector */
  .shape-selector {
    display: flex;
    gap: var(--space-3);
  }

  .shape-option {
    flex: 1;
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

  .shape-option:hover {
    border-color: var(--color-border-hover);
  }

  .shape-option.selected {
    border-color: var(--color-primary);
    background: var(--color-primary-light);
  }

  .shape-preview {
    width: 40px;
    height: 40px;
    background: var(--color-primary);
  }

  .shape-preview.round {
    border-radius: 50%;
  }

  .shape-preview.rounded {
    border-radius: 8px;
  }

  .shape-preview.square {
    border-radius: 2px;
  }

  .shape-option span {
    font-size: var(--text-xs);
    font-weight: var(--font-medium);
    color: var(--color-text-secondary);
  }

  .shape-option.selected span {
    color: var(--color-primary);
  }
</style>
