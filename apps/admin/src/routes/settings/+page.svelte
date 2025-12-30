<script lang="ts">
  import type { BackgroundType, LayoutType } from '@jlinks/shared/types';
  import { Card, Button, Input, Toggle } from '$lib/components/ui';
  import { ColorPicker, FontSelector, LayoutSelector } from '$lib/components/settings';
  import { Download, QrCode, UserPlus } from 'lucide-svelte';
  import { authStore, clientStore } from '$lib/stores';
  import { api } from '$lib/api';

  // Get current client data
  const client = $derived(authStore.client);

  // Profile fields
  let name = $state('');
  let bio = $state('');
  let metaTitle = $state('');
  let metaDescription = $state('');

  // Branding fields
  let logoUrl = $state('');
  let profileImageUrl = $state('');

  // Appearance fields
  let primaryColor = $state('#00d9a3');
  let secondaryColor = $state('#ffffff');
  let backgroundType = $state<BackgroundType>('solid');
  let backgroundValue = $state('#ffffff');

  // Typography
  let fontTitle = $state('Inter');
  let fontText = $state('Inter');

  // Layout
  let layoutType = $state<LayoutType>('list');

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
  let savingAppearance = $state(false);
  let savingVCard = $state(false);

  // Initialize form values from client
  $effect(() => {
    if (client) {
      name = client.name || '';
      bio = client.bio || '';
      metaTitle = client.meta_title || '';
      metaDescription = client.meta_description || '';
      logoUrl = client.logo_url || '';
      profileImageUrl = client.profile_image_url || '';
      primaryColor = client.primary_color || '#00d9a3';
      secondaryColor = client.secondary_color || '#ffffff';
      backgroundType = client.background_type || 'solid';
      backgroundValue = client.background_value || '#ffffff';
      fontTitle = client.font_title || 'Inter';
      fontText = client.font_text || 'Inter';
      layoutType = client.layout_type || 'list';
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
    await clientStore.updateProfile({
      name,
      bio: bio || undefined,
      meta_title: metaTitle || undefined,
      meta_description: metaDescription || undefined,
    });
    savingProfile = false;
  }

  async function saveBranding() {
    savingBranding = true;
    await clientStore.updateBranding({
      logo_url: logoUrl || undefined,
      profile_image_url: profileImageUrl || undefined,
    });
    savingBranding = false;
  }

  async function saveAppearance() {
    savingAppearance = true;
    await clientStore.updateSettings({
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      background_type: backgroundType,
      background_value: backgroundValue,
      font_title: fontTitle,
      font_text: fontText,
      layout_type: layoutType,
    });
    savingAppearance = false;
  }

  async function saveVCard() {
    savingVCard = true;
    await clientStore.updateVCard({
      vcard_enabled: vcardEnabled,
      vcard_name: vcardName || undefined,
      vcard_email: vcardEmail || undefined,
      vcard_phone: vcardPhone || undefined,
      vcard_company: vcardCompany || undefined,
      vcard_website: vcardWebsite || undefined,
    });
    savingVCard = false;
  }
</script>

<svelte:head>
  <title>Paramètres | jLinks Admin</title>
</svelte:head>

<div class="settings-page">
  <div class="settings-grid">
    <!-- Profile Section -->
    <Card>
      {#snippet header()}
        <h2>Profil</h2>
      {/snippet}
      <div class="form-section">
        <Input
          label="Nom"
          bind:value={name}
          placeholder="Votre nom ou celui de votre entreprise"
        />
        <div class="form-field">
          <label for="bio">Bio</label>
          <textarea
            id="bio"
            bind:value={bio}
            placeholder="Une courte description..."
            rows="3"
            maxlength="500"
          ></textarea>
          <span class="char-count">{bio.length}/500</span>
        </div>
        <Input
          label="Meta Title"
          bind:value={metaTitle}
          placeholder="Titre pour les moteurs de recherche"
          hint="Max 60 caractères"
        />
        <Input
          label="Meta Description"
          bind:value={metaDescription}
          placeholder="Description pour les moteurs de recherche"
          hint="Max 160 caractères"
        />
        <Button variant="primary" onclick={saveProfile} loading={savingProfile}>
          Enregistrer
        </Button>
      </div>
    </Card>

    <!-- Branding Section -->
    <Card>
      {#snippet header()}
        <h2>Branding</h2>
      {/snippet}
      <div class="form-section">
        <Input
          label="URL du logo"
          bind:value={logoUrl}
          placeholder="https://example.com/logo.png"
          hint="URL d'une image pour votre logo"
        />
        <Input
          label="URL de la photo de profil"
          bind:value={profileImageUrl}
          placeholder="https://example.com/profile.jpg"
          hint="URL d'une image carrée pour votre profil"
        />
        {#if logoUrl || profileImageUrl}
          <div class="image-previews">
            {#if logoUrl}
              <div class="image-preview">
                <span>Logo</span>
                <img src={logoUrl} alt="Logo preview" />
              </div>
            {/if}
            {#if profileImageUrl}
              <div class="image-preview">
                <span>Profil</span>
                <img src={profileImageUrl} alt="Profile preview" class="profile" />
              </div>
            {/if}
          </div>
        {/if}
        <Button variant="primary" onclick={saveBranding} loading={savingBranding}>
          Enregistrer
        </Button>
      </div>
    </Card>

    <!-- Appearance Section -->
    <Card>
      {#snippet header()}
        <h2>Apparence</h2>
      {/snippet}
      <div class="form-section">
        <div class="color-row">
          <ColorPicker label="Couleur primaire" value={primaryColor} onchange={(v) => primaryColor = v} />
          <ColorPicker label="Couleur secondaire" value={secondaryColor} onchange={(v) => secondaryColor = v} />
        </div>

        <div class="form-field">
          <label for="bg-type">Type d'arrière-plan</label>
          <select id="bg-type" bind:value={backgroundType}>
            <option value="solid">Couleur unie</option>
            <option value="gradient">Dégradé</option>
            <option value="image">Image</option>
          </select>
        </div>

        <Input
          label={backgroundType === 'solid' ? 'Couleur' : backgroundType === 'gradient' ? 'Dégradé CSS' : 'URL de l\'image'}
          bind:value={backgroundValue}
          placeholder={backgroundType === 'solid' ? '#ffffff' : backgroundType === 'gradient' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'https://example.com/bg.jpg'}
        />

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
        <FontSelector label="Police des titres" value={fontTitle} onchange={(v) => fontTitle = v} />
        <FontSelector label="Police du texte" value={fontText} onchange={(v) => fontText = v} />
        <Button variant="primary" onclick={saveAppearance} loading={savingAppearance}>
          Enregistrer
        </Button>
      </div>
    </Card>

    <!-- Layout Section -->
    <Card>
      {#snippet header()}
        <h2>Layout</h2>
      {/snippet}
      <div class="form-section">
        <LayoutSelector value={layoutType} onchange={(v) => layoutType = v} />
        <Button variant="primary" onclick={saveAppearance} loading={savingAppearance}>
          Enregistrer
        </Button>
      </div>
    </Card>

    <!-- QR Code Section -->
    <Card>
      {#snippet header()}
        <h2><QrCode size={20} /> QR Code</h2>
      {/snippet}
      <div class="form-section">
        <p class="section-description">
          Télécharge ton QR code pour tes cartes de visite, flyers, affiches...
        </p>
        <div class="qr-preview">
          <img src={api.qrcode.getPreviewUrl()} alt="QR Code" />
        </div>
        <div class="download-buttons">
          <a href={api.qrcode.getDownloadUrl('png')} download class="download-btn">
            <Download size={16} />
            PNG (impression)
          </a>
          <a href={api.qrcode.getDownloadUrl('svg')} download class="download-btn">
            <Download size={16} />
            SVG (web)
          </a>
        </div>
      </div>
    </Card>

    <!-- vCard Section -->
    <Card>
      {#snippet header()}
        <h2><UserPlus size={20} /> Carte de contact</h2>
      {/snippet}
      <div class="form-section">
        <div class="toggle-row">
          <div>
            <span class="toggle-label">Activer le bouton "Ajouter aux contacts"</span>
            <p class="toggle-description">Les visiteurs pourront t'ajouter à leurs contacts en un tap.</p>
          </div>
          <Toggle bind:checked={vcardEnabled} />
        </div>

        {#if vcardEnabled}
          <div class="vcard-fields">
            <Input
              label="Nom complet"
              bind:value={vcardName}
              placeholder={name || 'Votre nom'}
            />
            <Input
              label="Email"
              type="email"
              bind:value={vcardEmail}
              placeholder="contact@example.com"
            />
            <Input
              label="Téléphone"
              type="tel"
              bind:value={vcardPhone}
              placeholder="+41 79 123 45 67"
            />
            <Input
              label="Entreprise"
              bind:value={vcardCompany}
              placeholder="Nom de l'entreprise"
            />
            <Input
              label="Site web"
              bind:value={vcardWebsite}
              placeholder="https://..."
            />
          </div>
        {/if}

        <Button variant="primary" onclick={saveVCard} loading={savingVCard}>
          Enregistrer
        </Button>
      </div>
    </Card>
  </div>
</div>

<style>
  .settings-page {
    max-width: 1000px;
  }

  .settings-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-6);
  }

  @media (max-width: 900px) {
    .settings-grid {
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

  .form-field textarea,
  .form-field select {
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    font-family: inherit;
    resize: vertical;
    background: var(--color-surface);
  }

  .form-field textarea:focus,
  .form-field select:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px var(--color-primary-light);
  }

  .char-count {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    text-align: right;
  }

  .color-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-4);
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
</style>
