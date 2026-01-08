// Client data store using Svelte 5 runes

import type { Client, BackgroundType, LayoutType, ButtonStyle, ProfileImageShape } from '@noko/shared/types';
import { api, ApiError } from '$lib/api';
import { toastStore } from './toast.svelte';
import { authStore } from './auth.svelte';
import * as m from '$lib/paraglide/messages';

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
    toastStore.success(m.toast_success_profile_updated());
    return updatedClient;
  } catch (e) {
    if (e instanceof ApiError) {
      toastStore.error(e.message);
    } else {
      toastStore.error(m.toast_error_profile_update());
    }
    return null;
  }
}

async function updateSettings(data: {
  primary_color?: string;
  secondary_color?: string;
  button_opacity?: number;
  background_type?: BackgroundType;
  background_value?: string;
  outer_background_color?: string;
  font_preset?: string | null;
  font_title?: string;
  font_text?: string;
  layout_type?: LayoutType;
  button_style?: ButtonStyle;
}): Promise<Client | null> {
  try {
    const updatedClient = await api.client.updateSettings(data);
    authStore.setClient(updatedClient);
    await loadPublishStatus();
    toastStore.success(m.toast_success_settings_updated());
    return updatedClient;
  } catch (e) {
    if (e instanceof ApiError) {
      toastStore.error(e.message);
    } else {
      toastStore.error(m.toast_error_settings_update());
    }
    return null;
  }
}

async function updateBranding(data: {
  logo_url?: string;
  profile_image_url?: string;
  profile_image_size?: number;
  profile_image_shape?: ProfileImageShape;
}): Promise<Client | null> {
  try {
    const updatedClient = await api.client.updateBranding(data);
    authStore.setClient(updatedClient);
    await loadPublishStatus();
    toastStore.success(m.toast_success_branding_updated());
    return updatedClient;
  } catch (e) {
    if (e instanceof ApiError) {
      toastStore.error(e.message);
    } else {
      toastStore.error(m.toast_error_branding_update());
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
    toastStore.success(m.toast_success_vcard_updated());
    return updatedClient;
  } catch (e) {
    if (e instanceof ApiError) {
      toastStore.error(e.message);
    } else {
      toastStore.error(m.toast_error_vcard_update());
    }
    return null;
  }
}

async function publish(): Promise<boolean> {
  publishing = true;
  try {
    await api.publish.trigger();
    await loadPublishStatus();
    toastStore.success(m.toast_success_published());
    return true;
  } catch (e) {
    if (e instanceof ApiError) {
      toastStore.error(e.message);
    } else {
      toastStore.error(m.toast_error_publish());
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
