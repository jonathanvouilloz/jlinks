// Authentication store using Svelte 5 runes

import type { User, Client } from '@jlinks/shared/types';
import { api, ApiError } from '$lib/api';
import { toastStore } from './toast.svelte';

// Store state
let user = $state<User | null>(null);
let client = $state<Client | null>(null);
let loading = $state(true);
let initialized = $state(false);

// Derived states
const isAuthenticated = $derived(user !== null);
const isSuperAdmin = $derived(user?.role === 'super_admin');
const isClient = $derived(user?.role === 'client' && client !== null);

// Actions
async function init(): Promise<void> {
  console.log('[Auth] init() called, initialized:', initialized);
  if (initialized) return;

  loading = true;
  console.log('[Auth] Calling api.auth.getSession()...');
  try {
    const session = await api.auth.getSession();
    console.log('[Auth] Session received:', session);
    user = session.user;
    client = session.client;
  } catch (e) {
    console.error('[Auth] getSession() failed:', e);
    // Not authenticated - this is expected
    user = null;
    client = null;
  } finally {
    loading = false;
    initialized = true;
    console.log('[Auth] init() completed, loading:', loading);
  }
}

async function login(email: string, password: string): Promise<boolean> {
  loading = true;
  try {
    const result = await api.auth.signIn(email, password);
    user = result.user;
    client = result.client;
    toastStore.success('Connexion réussie');
    return true;
  } catch (e) {
    if (e instanceof ApiError) {
      toastStore.error(e.message);
    } else {
      toastStore.error('Erreur de connexion');
    }
    return false;
  } finally {
    loading = false;
  }
}

async function logout(): Promise<void> {
  loading = true;
  try {
    await api.auth.signOut();
    user = null;
    client = null;
    toastStore.success('Déconnexion réussie');
  } catch (e) {
    if (e instanceof ApiError) {
      toastStore.error(e.message);
    } else {
      toastStore.error('Erreur de déconnexion');
    }
  } finally {
    loading = false;
  }
}

async function changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
  try {
    await api.auth.changePassword(currentPassword, newPassword);
    toastStore.success('Mot de passe modifié');
    return true;
  } catch (e) {
    if (e instanceof ApiError) {
      toastStore.error(e.message);
    } else {
      toastStore.error('Erreur lors du changement de mot de passe');
    }
    return false;
  }
}

// Update client data (after settings change, etc.)
function setClient(newClient: Client): void {
  client = newClient;
}

// Export store
export const authStore = {
  get user() {
    return user;
  },
  get client() {
    return client;
  },
  get loading() {
    return loading;
  },
  get initialized() {
    return initialized;
  },
  get isAuthenticated() {
    return isAuthenticated;
  },
  get isSuperAdmin() {
    return isSuperAdmin;
  },
  get isClient() {
    return isClient;
  },
  init,
  login,
  logout,
  changePassword,
  setClient,
};
