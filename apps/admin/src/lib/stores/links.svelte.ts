// Links store using Svelte 5 runes

import type { Link, CreateLinkInput, UpdateLinkInput } from '@noko/shared/types';
import { api, ApiError } from '$lib/api';
import { toastStore } from './toast.svelte';

// Store state
let links = $state<Link[]>([]);
let loading = $state(false);

// Actions
async function loadLinks(): Promise<void> {
  loading = true;
  try {
    links = await api.links.list();
  } catch (e) {
    if (e instanceof ApiError) {
      toastStore.error(e.message);
    } else {
      toastStore.error('Erreur de chargement des liens');
    }
  } finally {
    loading = false;
  }
}

async function createLink(data: CreateLinkInput): Promise<Link | null> {
  try {
    const newLink = await api.links.create(data);
    links = [...links, newLink];
    toastStore.success('Lien créé');
    return newLink;
  } catch (e) {
    if (e instanceof ApiError) {
      toastStore.error(e.message);
    } else {
      toastStore.error('Erreur lors de la création du lien');
    }
    return null;
  }
}

async function updateLink(id: string, data: UpdateLinkInput): Promise<Link | null> {
  try {
    const updatedLink = await api.links.update(id, data);
    links = links.map((l) => (l.id === id ? updatedLink : l));
    toastStore.success('Lien mis à jour');
    return updatedLink;
  } catch (e) {
    if (e instanceof ApiError) {
      toastStore.error(e.message);
    } else {
      toastStore.error('Erreur lors de la mise à jour du lien');
    }
    return null;
  }
}

async function deleteLink(id: string): Promise<boolean> {
  try {
    await api.links.delete(id);
    links = links.filter((l) => l.id !== id);
    toastStore.success('Lien supprimé');
    return true;
  } catch (e) {
    if (e instanceof ApiError) {
      toastStore.error(e.message);
    } else {
      toastStore.error('Erreur lors de la suppression du lien');
    }
    return false;
  }
}

async function reorderLinks(order: Array<{ id: string; sort_order: number }>): Promise<boolean> {
  // Optimistic update
  const previousLinks = [...links];
  links = links.slice().sort((a, b) => {
    const aOrder = order.find((o) => o.id === a.id)?.sort_order ?? a.sort_order;
    const bOrder = order.find((o) => o.id === b.id)?.sort_order ?? b.sort_order;
    return aOrder - bOrder;
  });

  try {
    await api.links.reorder(order);
    return true;
  } catch (e) {
    // Rollback on error
    links = previousLinks;
    if (e instanceof ApiError) {
      toastStore.error(e.message);
    } else {
      toastStore.error('Erreur lors du réordonnancement');
    }
    return false;
  }
}

async function toggleLink(id: string): Promise<Link | null> {
  // Optimistic update
  const previousLinks = [...links];
  links = links.map((l) => (l.id === id ? { ...l, is_active: !l.is_active } : l));

  try {
    const updatedLink = await api.links.toggle(id);
    links = links.map((l) => (l.id === id ? updatedLink : l));
    return updatedLink;
  } catch (e) {
    // Rollback on error
    links = previousLinks;
    if (e instanceof ApiError) {
      toastStore.error(e.message);
    } else {
      toastStore.error('Erreur lors du changement de statut');
    }
    return null;
  }
}

// Set links directly (for initial load from layout)
function setLinks(newLinks: Link[]): void {
  links = newLinks;
}

// Export store
export const linksStore = {
  get links() {
    return links;
  },
  get loading() {
    return loading;
  },
  loadLinks,
  createLink,
  updateLink,
  deleteLink,
  reorderLinks,
  toggleLink,
  setLinks,
};
