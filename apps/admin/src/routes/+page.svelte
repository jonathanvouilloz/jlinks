<script lang="ts">
  import type { Link, CreateLinkInput, UpdateLinkInput } from '@jlinks/shared/types';
  import { Button, Card, Modal } from '$lib/components/ui';
  import { LinksList, LinkForm, Preview } from '$lib/components/dashboard';
  import { Plus, AlertCircle } from 'lucide-svelte';
  import { authStore, linksStore } from '$lib/stores';

  // Modal state
  let showLinkForm = $state(false);
  let editingLink = $state<Link | null>(null);
  let showDeleteConfirm = $state(false);
  let deletingLink = $state<Link | null>(null);

  // Handlers
  function handleAddLink() {
    editingLink = null;
    showLinkForm = true;
  }

  function handleEditLink(link: Link) {
    editingLink = link;
    showLinkForm = true;
  }

  function handleCloseForm() {
    showLinkForm = false;
    editingLink = null;
  }

  async function handleSaveLink(data: CreateLinkInput) {
    if (editingLink) {
      await linksStore.updateLink(editingLink.id, data as UpdateLinkInput);
    } else {
      await linksStore.createLink(data);
    }
    handleCloseForm();
  }

  function handleDeleteClick(link: Link) {
    deletingLink = link;
    showDeleteConfirm = true;
  }

  async function handleConfirmDelete() {
    if (deletingLink) {
      await linksStore.deleteLink(deletingLink.id);
    }
    showDeleteConfirm = false;
    deletingLink = null;
  }

  function handleCancelDelete() {
    showDeleteConfirm = false;
    deletingLink = null;
  }

  async function handleToggleLink(link: Link) {
    await linksStore.toggleLink(link.id);
  }

  async function handleReorderLinks(order: Array<{ id: string; sort_order: number }>) {
    await linksStore.reorderLinks(order);
  }
</script>

<svelte:head>
  <title>Dashboard | jLinks Admin</title>
</svelte:head>

<div class="dashboard">
  {#if authStore.isClient}
    <div class="dashboard-split">
      <!-- Left: Links Management -->
      <div class="links-panel">
        <div class="panel-header">
          <h2>Mes liens</h2>
          <Button variant="primary" size="sm" onclick={handleAddLink}>
            <Plus size={16} />
            Ajouter
          </Button>
        </div>

        {#if linksStore.loading}
          <div class="loading">Chargement...</div>
        {:else if linksStore.links.length === 0}
          <Card>
            <div class="empty-state">
              <Plus size={32} />
              <p>Aucun lien pour le moment</p>
              <Button variant="primary" onclick={handleAddLink}>
                Créer mon premier lien
              </Button>
            </div>
          </Card>
        {:else}
          <LinksList
            links={linksStore.links}
            onEdit={handleEditLink}
            onDelete={handleDeleteClick}
            onToggle={handleToggleLink}
            onReorder={handleReorderLinks}
          />
        {/if}
      </div>

      <!-- Right: Preview -->
      <div class="preview-panel">
        <Preview client={authStore.client} links={linksStore.links} />
      </div>
    </div>
  {:else if authStore.isSuperAdmin}
    <Card>
      <div class="admin-notice">
        <AlertCircle size={24} />
        <div>
          <h3>Compte Super Admin</h3>
          <p>Vous êtes connecté en tant que super-admin. Accédez à la gestion des clients pour gérer les pages des clients.</p>
          <Button variant="primary" onclick={() => window.location.href = '/admin/clients'}>
            Gérer les clients
          </Button>
        </div>
      </div>
    </Card>
  {:else}
    <Card>
      <div class="loading">Chargement...</div>
    </Card>
  {/if}
</div>

<!-- Link Form Modal -->
<LinkForm
  open={showLinkForm}
  link={editingLink}
  onClose={handleCloseForm}
  onSave={handleSaveLink}
/>

<!-- Delete Confirmation Modal -->
<Modal open={showDeleteConfirm} onclose={handleCancelDelete} title="Supprimer le lien" size="sm">
  <p>Êtes-vous sûr de vouloir supprimer le lien "{deletingLink?.title}" ?</p>
  <p class="text-muted">Cette action est irréversible.</p>

  {#snippet footer()}
    <div class="modal-actions">
      <Button variant="secondary" onclick={handleCancelDelete}>Annuler</Button>
      <Button variant="danger" onclick={handleConfirmDelete}>Supprimer</Button>
    </div>
  {/snippet}
</Modal>

<style>
  .dashboard {
    height: 100%;
  }

  .dashboard-split {
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: var(--space-6);
    height: calc(100vh - var(--header-height) - var(--space-12));
  }

  .links-panel {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    overflow: hidden;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .panel-header h2 {
    font-size: var(--text-lg);
    font-weight: var(--font-semibold);
    color: var(--color-text);
    margin: 0;
  }

  .preview-panel {
    height: 100%;
  }

  .loading {
    text-align: center;
    padding: var(--space-8);
    color: var(--color-text-secondary);
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-8);
    text-align: center;
    color: var(--color-text-secondary);
  }

  .admin-notice {
    display: flex;
    gap: var(--space-4);
    align-items: flex-start;
  }

  .admin-notice h3 {
    margin: 0 0 var(--space-2);
    font-size: var(--text-lg);
  }

  .admin-notice p {
    margin: 0 0 var(--space-4);
    color: var(--color-text-secondary);
  }

  .text-muted {
    color: var(--color-text-muted);
    font-size: var(--text-sm);
    margin-top: var(--space-2);
  }

  .modal-actions {
    display: flex;
    gap: var(--space-3);
    justify-content: flex-end;
  }

  @media (max-width: 1024px) {
    .dashboard-split {
      grid-template-columns: 1fr;
    }

    .preview-panel {
      display: none;
    }
  }
</style>
