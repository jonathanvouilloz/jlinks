// Client data store using Svelte 5 runes

import type { Client, BackgroundType, LayoutType } from '@jlinks/shared/types';
import { api, ApiError } from '$lib/api';
import { toastStore } from './toast.svelte';
import { authStore } from './auth.svelte';

// Store state
let publishStatus = $state<{
  hasDraftChanges: boolean;
  isPublished: boolean;
  lastPublishedAt: string | null;
} | null>(null);
let publishing = $state(false);

// Actions
async function loadPublishStatus(): Promise<void> {
  try {
    publishStatus = await api.publish.getStatus();
  } catch (e) {
    // Silently fail - not critical
    console.error('Failed to load publish status:', e);
  }
}

async function updateProfile(data: {
  name?: string;
  bio?: string;
  meta_title?: string;
  meta_description?: string;
}): Promise<Client | null> {
  try {
    const updatedClient = await api.client.updateMe(data);
    authStore.setClient(updatedClient);
    await loadPublishStatus();
    toastStore.success('Profil mis à jour');
    return updatedClient;
  } catch (e) {
    if (e instanceof ApiError) {
      toastStore.error(e.message);
    } else {
      toastStore.error('Erreur lors de la mise à jour du profil');
    }
    return null;
  }
}

async function updateSettings(data: {
  primary_color?: string;
  secondary_color?: string;
  background_type?: BackgroundType;
  background_value?: string;
  outer_background_color?: string;
  font_preset?: string | null;
  font_title?: string;
  font_text?: string;
  layout_type?: LayoutType;
}): Promise<Client | null> {
  try {
    const updatedClient = await api.client.updateSettings(data);
    authStore.setClient(updatedClient);
    await loadPublishStatus();
    toastStore.success('Paramètres mis à jour');
    return updatedClient;
  } catch (e) {
    if (e instanceof ApiError) {
      toastStore.error(e.message);
    } else {
      toastStore.error('Erreur lors de la mise à jour des paramètres');
    }
    return null;
  }
}

async function updateBranding(data: {
  logo_url?: string;
  profile_image_url?: string;
}): Promise<Client | null> {
  try {
    const updatedClient = await api.client.updateBranding(data);
    authStore.setClient(updatedClient);
    await loadPublishStatus();
    toastStore.success('Branding mis à jour');
    return updatedClient;
  } catch (e) {
    if (e instanceof ApiError) {
      toastStore.error(e.message);
    } else {
      toastStore.error('Erreur lors de la mise à jour du branding');
    }
    return null;
  }
}

async function updateVCard(data: {
  vcard_enabled?: boolean;
  vcard_name?: string;
  vcard_email?: string;
  vcard_phone?: string;
  vcard_company?: string;
  vcard_website?: string;
}): Promise<Client | null> {
  try {
    const updatedClient = await api.client.updateVCard(data);
    authStore.setClient(updatedClient);
    await loadPublishStatus();
    toastStore.success('Carte de contact mise à jour');
    return updatedClient;
  } catch (e) {
    if (e instanceof ApiError) {
      toastStore.error(e.message);
    } else {
      toastStore.error('Erreur lors de la mise à jour de la carte de contact');
    }
    return null;
  }
}

async function publish(): Promise<boolean> {
  publishing = true;
  try {
    const result = await api.publish.trigger();
    await loadPublishStatus();
    if (result.status === 'building') {
      toastStore.info('Publication en cours... (~30-60 secondes)');
    } else {
      toastStore.success('Publication réussie');
    }
    return true;
  } catch (e) {
    if (e instanceof ApiError) {
      toastStore.error(e.message);
    } else {
      toastStore.error('Erreur lors de la publication');
    }
    return false;
  } finally {
    publishing = false;
  }
}

// Export store
export const clientStore = {
  get publishStatus() {
    return publishStatus;
  },
  get publishing() {
    return publishing;
  },
  loadPublishStatus,
  updateProfile,
  updateSettings,
  updateBranding,
  updateVCard,
  publish,
};
