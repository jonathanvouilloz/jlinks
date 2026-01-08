<script lang="ts">
  import * as m from '$lib/paraglide/messages';
  import type { Client, PlanType } from '@noko/shared/types';
  import { onMount } from 'svelte';
  import { Card, Button, Badge, Input, Modal } from '$lib/components/ui';
  import { Plus, Pencil, Trash2, ExternalLink, CheckCircle, Clock } from 'lucide-svelte';
  import { api, ApiError } from '$lib/api';
  import { toastStore } from '$lib/stores';
  import { PUBLIC_SITE_URL } from '$env/static/public';

  // State
  let clients = $state<Client[]>([]);
  let loading = $state(true);

  // Create modal
  let showCreateModal = $state(false);
  let createSlug = $state('');
  let createName = $state('');
  let createEmail = $state('');
  let createPassword = $state('');
  let creating = $state(false);

  // Edit modal
  let showEditModal = $state(false);
  let editingClient = $state<Client | null>(null);
  let editSlug = $state('');
  let editName = $state('');
  let editPlan = $state<PlanType>('free');
  let editing = $state(false);

  // Delete modal
  let showDeleteModal = $state(false);
  let deletingClient = $state<Client | null>(null);
  let deleting = $state(false);

  // Load clients
  async function loadClients() {
    loading = true;
    try {
      clients = await api.admin.listClients();
    } catch (e) {
      if (e instanceof ApiError) {
        toastStore.error(e.message);
      } else {
        toastStore.error(m.admin_clients_error_loading());
      }
    } finally {
      loading = false;
    }
  }

  onMount(loadClients);

  // Create client
  function openCreateModal() {
    createSlug = '';
    createName = '';
    createEmail = '';
    createPassword = '';
    showCreateModal = true;
  }

  async function handleCreate(e: Event) {
    e.preventDefault();
    if (!createSlug || !createName || !createEmail || !createPassword) return;

    creating = true;
    try {
      await api.admin.createClient({
        slug: createSlug,
        name: createName,
        email: createEmail,
        password: createPassword,
      });
      toastStore.success(m.toast_success_client_created());
      showCreateModal = false;
      await loadClients();
    } catch (e) {
      if (e instanceof ApiError) {
        toastStore.error(e.message);
      } else {
        toastStore.error(m.admin_clients_error_creating());
      }
    } finally {
      creating = false;
    }
  }

  // Edit client
  function openEditModal(client: Client) {
    editingClient = client;
    editSlug = client.slug;
    editName = client.name;
    editPlan = client.plan;
    showEditModal = true;
  }

  async function handleEdit(e: Event) {
    e.preventDefault();
    if (!editingClient || !editSlug || !editName) return;

    editing = true;
    try {
      await api.admin.updateClient(editingClient.id, {
        slug: editSlug,
        name: editName,
        plan: editPlan,
      });
      toastStore.success(m.toast_success_client_updated());
      showEditModal = false;
      editingClient = null;
      await loadClients();
    } catch (e) {
      if (e instanceof ApiError) {
        toastStore.error(e.message);
      } else {
        toastStore.error(m.admin_clients_error_updating());
      }
    } finally {
      editing = false;
    }
  }

  // Delete client
  function openDeleteModal(client: Client) {
    deletingClient = client;
    showDeleteModal = true;
  }

  async function handleDelete() {
    if (!deletingClient) return;

    deleting = true;
    try {
      await api.admin.deleteClient(deletingClient.id);
      toastStore.success(m.toast_success_client_deleted());
      showDeleteModal = false;
      deletingClient = null;
      await loadClients();
    } catch (e) {
      if (e instanceof ApiError) {
        toastStore.error(e.message);
      } else {
        toastStore.error(m.admin_clients_error_deleting());
      }
    } finally {
      deleting = false;
    }
  }

  // Slug validation
  function validateSlug(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
  }
</script>

<svelte:head>
  <title>{m.admin_clients_page_title()}</title>
</svelte:head>

<div class="admin-page">
  <div class="page-header">
    <h2>{m.admin_clients_title()}</h2>
    <Button variant="primary" onclick={openCreateModal}>
      <Plus size={16} />
      {m.admin_clients_new()}
    </Button>
  </div>

  {#if loading}
    <Card>
      <div class="loading">{m.admin_clients_loading()}</div>
    </Card>
  {:else if clients.length === 0}
    <Card>
      <div class="empty-state">
        <p>{m.admin_clients_empty()}</p>
        <Button variant="primary" onclick={openCreateModal}>
          {m.admin_clients_create_first()}
        </Button>
      </div>
    </Card>
  {:else}
    <div class="clients-table-wrapper">
      <table class="clients-table">
        <thead>
          <tr>
            <th scope="col">{m.admin_clients_table_name()}</th>
            <th scope="col">{m.admin_clients_table_slug()}</th>
            <th scope="col">{m.admin_clients_table_plan()}</th>
            <th scope="col">{m.admin_clients_table_status()}</th>
            <th scope="col">{m.admin_clients_table_created()}</th>
            <th scope="col">{m.admin_clients_table_actions()}</th>
          </tr>
        </thead>
        <tbody>
          {#each clients as client}
            <tr>
              <td class="client-name">
                {client.name}
              </td>
              <td class="client-slug">
                <a href="{PUBLIC_SITE_URL}/{client.slug}" target="_blank" rel="noopener">
                  /{client.slug}
                  <ExternalLink size={12} />
                </a>
              </td>
              <td>
                <Badge variant={client.plan === 'pro' ? 'pro' : 'default'}>
                  {client.plan.toUpperCase()}
                </Badge>
              </td>
              <td>
                {#if client.is_published}
                  <Badge variant="success">
                    <CheckCircle size={12} />
                    {m.admin_clients_status_published()}
                  </Badge>
                {:else}
                  <Badge variant="warning">
                    <Clock size={12} />
                    {m.admin_clients_status_draft()}
                  </Badge>
                {/if}
              </td>
              <td class="client-date">
                {new Date(client.created_at).toLocaleDateString('fr-CH')}
              </td>
              <td class="client-actions">
                <Button variant="ghost" size="sm" onclick={() => openEditModal(client)}>
                  <Pencil size={16} />
                </Button>
                <Button variant="ghost" size="sm" onclick={() => openDeleteModal(client)}>
                  <Trash2 size={16} />
                </Button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<!-- Create Modal -->
<Modal open={showCreateModal} onclose={() => showCreateModal = false} title={m.admin_clients_create_modal_title()} size="md">
  <form onsubmit={handleCreate} class="client-form">
    <Input
      label={m.admin_clients_create_slug_label()}
      bind:value={createSlug}
      placeholder={m.admin_clients_create_slug_placeholder()}
      required
      hint={m.admin_clients_create_slug_hint()}
      oninput={() => createSlug = validateSlug(createSlug)}
    />
    <Input
      label={m.admin_clients_create_name_label()}
      bind:value={createName}
      placeholder={m.admin_clients_create_name_placeholder()}
      required
    />
    <Input
      label={m.admin_clients_create_email_label()}
      type="email"
      bind:value={createEmail}
      placeholder={m.admin_clients_create_email_placeholder()}
      required
      hint={m.admin_clients_create_email_hint()}
    />
    <Input
      label={m.admin_clients_create_password_label()}
      type="password"
      bind:value={createPassword}
      placeholder={m.admin_clients_create_password_placeholder()}
      required
      hint={m.admin_clients_create_password_hint()}
    />
  </form>

  {#snippet footer()}
    <div class="modal-actions">
      <Button variant="secondary" onclick={() => showCreateModal = false}>{m.common_cancel()}</Button>
      <Button variant="primary" onclick={() => handleCreate(new Event('click'))} loading={creating} disabled={!createSlug || !createName || !createEmail || !createPassword}>
        {m.common_create()}
      </Button>
    </div>
  {/snippet}
</Modal>

<!-- Edit Modal -->
<Modal open={showEditModal} onclose={() => showEditModal = false} title={m.admin_clients_edit_modal_title()} size="md">
  <form onsubmit={handleEdit} class="client-form">
    <Input
      label={m.admin_clients_create_slug_label()}
      bind:value={editSlug}
      placeholder={m.admin_clients_create_slug_placeholder()}
      required
      oninput={() => editSlug = validateSlug(editSlug)}
    />
    <Input
      label={m.admin_clients_create_name_label()}
      bind:value={editName}
      placeholder={m.admin_clients_create_name_placeholder()}
      required
    />
    <div class="form-field">
      <label for="edit-plan">{m.admin_clients_edit_plan_label()}</label>
      <select id="edit-plan" bind:value={editPlan}>
        <option value="free">Free</option>
        <option value="pro">Pro</option>
      </select>
    </div>
  </form>

  {#snippet footer()}
    <div class="modal-actions">
      <Button variant="secondary" onclick={() => showEditModal = false}>{m.common_cancel()}</Button>
      <Button variant="primary" onclick={() => handleEdit(new Event('click'))} loading={editing} disabled={!editSlug || !editName}>
        {m.common_save()}
      </Button>
    </div>
  {/snippet}
</Modal>

<!-- Delete Modal -->
<Modal open={showDeleteModal} onclose={() => showDeleteModal = false} title={m.admin_clients_delete_modal_title()} size="sm">
  <p>{@html m.admin_clients_delete_modal_confirm({ name: deletingClient?.name ?? '' })}</p>
  <p class="text-danger">{m.admin_clients_delete_modal_warning()}</p>

  {#snippet footer()}
    <div class="modal-actions">
      <Button variant="secondary" onclick={() => showDeleteModal = false}>{m.common_cancel()}</Button>
      <Button variant="danger" onclick={handleDelete} loading={deleting}>
        {m.common_delete()}
      </Button>
    </div>
  {/snippet}
</Modal>

<style>
  .admin-page {
    max-width: 1200px;
  }

  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-6);
  }

  .page-header h2 {
    font-size: var(--text-xl);
    font-weight: var(--font-semibold);
    margin: 0;
  }

  .loading,
  .empty-state {
    text-align: center;
    padding: var(--space-8);
    color: var(--color-text-secondary);
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4);
  }

  .clients-table-wrapper {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }

  .clients-table {
    width: 100%;
    border-collapse: collapse;
  }

  .clients-table th,
  .clients-table td {
    padding: var(--space-3) var(--space-4);
    text-align: left;
    border-bottom: 1px solid var(--color-border);
  }

  .clients-table th {
    font-size: var(--text-xs);
    font-weight: var(--font-semibold);
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background: var(--color-bg);
  }

  .clients-table tbody tr:hover {
    background: var(--color-bg);
  }

  .clients-table tbody tr:last-child td {
    border-bottom: none;
  }

  .client-name {
    font-weight: var(--font-medium);
  }

  .client-slug a {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    color: var(--color-text-secondary);
    text-decoration: none;
    font-family: monospace;
    font-size: var(--text-sm);
  }

  .client-slug a:hover {
    color: var(--color-primary);
  }

  .client-date {
    color: var(--color-text-secondary);
    font-size: var(--text-sm);
  }

  .client-actions {
    display: flex;
    gap: var(--space-1);
  }

  .client-form {
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
    background: var(--color-surface);
  }

  .modal-actions {
    display: flex;
    gap: var(--space-3);
    justify-content: flex-end;
  }

  .text-danger {
    color: var(--color-error);
    font-size: var(--text-sm);
    margin-top: var(--space-2);
  }
</style>
