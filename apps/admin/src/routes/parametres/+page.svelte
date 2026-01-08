<script lang="ts">
  import * as m from '$lib/paraglide/messages';
  import { Card, Button, Input, Modal } from '$lib/components/ui';
  import { Settings, Lock, Trash2, AlertTriangle } from 'lucide-svelte';
  import { authStore } from '$lib/stores';
  import { api } from '$lib/api';
  import { goto } from '$app/navigation';
  import { toastStore } from '$lib/stores/toast.svelte';

  // Get current user
  const user = $derived(authStore.user);

  // Password change fields
  let currentPassword = $state('');
  let newPassword = $state('');
  let confirmPassword = $state('');
  let savingPassword = $state(false);
  let passwordError = $state('');

  // Delete account
  let showDeleteModal = $state(false);
  let deletePassword = $state('');
  let deleting = $state(false);
  let deleteError = $state('');

  // Validate password match
  const passwordsMatch = $derived(newPassword === confirmPassword);
  const canChangePassword = $derived(
    currentPassword.length > 0 &&
    newPassword.length >= 8 &&
    passwordsMatch
  );

  async function handleChangePassword() {
    if (!canChangePassword) return;

    passwordError = '';
    savingPassword = true;

    try {
      const success = await authStore.changePassword(currentPassword, newPassword);
      if (success) {
        currentPassword = '';
        newPassword = '';
        confirmPassword = '';
        toastStore.success(m.toast_success_password_changed());
      }
    } catch (err: any) {
      passwordError = err.message || m.settings_password_error_generic();
    } finally {
      savingPassword = false;
    }
  }

  async function handleDeleteAccount() {
    if (!deletePassword) return;

    deleteError = '';
    deleting = true;

    try {
      await api.auth.deleteAccount(deletePassword);
      toastStore.success(m.toast_success_account_deleted());
      await authStore.logout();
      goto('/login');
    } catch (err: any) {
      deleteError = err.message || m.toast_error_password_incorrect();
      deleting = false;
    }
  }

  function closeDeleteModal() {
    showDeleteModal = false;
    deletePassword = '';
    deleteError = '';
  }
</script>

<svelte:head>
  <title>{m.settings_page_title()}</title>
</svelte:head>

<div class="page">
  <header class="page-header">
    <h1><Settings size={24} /> {m.settings_title()}</h1>
  </header>

  <div class="content">
    <!-- Account Info -->
    <Card>
      {#snippet header()}
        <h2>{m.settings_account_info()}</h2>
      {/snippet}

      <div class="info-grid">
        <div class="info-item">
          <span class="label">{m.settings_account_email()}</span>
          <span class="value">{user?.email || '-'}</span>
        </div>
        <div class="info-item">
          <span class="label">{m.settings_account_role()}</span>
          <span class="value">{user?.role === 'super_admin' ? m.settings_account_role_super_admin() : m.settings_account_role_client()}</span>
        </div>
      </div>
    </Card>

    <!-- Change Password -->
    <Card>
      {#snippet header()}
        <h2><Lock size={18} /> {m.settings_change_password()}</h2>
      {/snippet}

      <form class="password-form" onsubmit={(e) => { e.preventDefault(); handleChangePassword(); }}>
        <Input
          type="password"
          label={m.settings_current_password()}
          placeholder={m.settings_current_password_placeholder()}
          bind:value={currentPassword}
        />

        <Input
          type="password"
          label={m.settings_new_password()}
          placeholder={m.settings_new_password_placeholder()}
          hint={newPassword.length > 0 && newPassword.length < 8 ? m.settings_password_hint_min() : ''}
          bind:value={newPassword}
        />

        <Input
          type="password"
          label={m.settings_confirm_password()}
          placeholder={m.settings_confirm_password_placeholder()}
          hint={confirmPassword.length > 0 && !passwordsMatch ? m.settings_password_hint_mismatch() : ''}
          bind:value={confirmPassword}
        />

        {#if passwordError}
          <p class="error-message">{passwordError}</p>
        {/if}

        <div class="form-actions">
          <Button
            type="submit"
            disabled={!canChangePassword || savingPassword}
            loading={savingPassword}
          >
            {m.common_save()}
          </Button>
        </div>
      </form>
    </Card>

    <!-- Danger Zone -->
    <Card class="danger-card">
      {#snippet header()}
        <h2><AlertTriangle size={18} /> {m.settings_danger_zone()}</h2>
      {/snippet}

      <div class="danger-zone">
        <div class="danger-info">
          <h3>{m.settings_delete_account()}</h3>
          <p>
            {m.settings_delete_account_text()}
          </p>
        </div>
        <Button variant="danger" onclick={() => showDeleteModal = true}>
          <Trash2 size={16} />
          {m.settings_delete_account_button()}
        </Button>
      </div>
    </Card>
  </div>
</div>

<!-- Delete Confirmation Modal -->
<Modal
  open={showDeleteModal}
  title={m.settings_delete_modal_title()}
  onclose={closeDeleteModal}
>
  <div class="delete-modal-content">
    <p class="warning-text">
      <AlertTriangle size={20} />
      {m.settings_delete_modal_warning()}
    </p>

    <p>{m.settings_delete_modal_confirm()}</p>

    <Input
      type="password"
      placeholder={m.settings_delete_modal_password_placeholder()}
      bind:value={deletePassword}
    />

    {#if deleteError}
      <p class="error-message">{deleteError}</p>
    {/if}
  </div>

  {#snippet footer()}
    <div class="modal-actions">
      <Button variant="secondary" onclick={closeDeleteModal}>
        {m.common_cancel()}
      </Button>
      <Button
        variant="danger"
        onclick={handleDeleteAccount}
        disabled={!deletePassword || deleting}
        loading={deleting}
      >
        {m.settings_delete_modal_button()}
      </Button>
    </div>
  {/snippet}
</Modal>

<style>
  .page {
    padding: var(--space-lg);
    max-width: 600px;
  }

  .page-header {
    margin-bottom: var(--space-xl);
  }

  .page-header h1 {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    font-size: var(--text-2xl);
    font-weight: 600;
    color: var(--color-text);
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }

  h2 {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    font-size: var(--text-lg);
    font-weight: 600;
    margin: 0;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-md);
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .info-item .label {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
  }

  .info-item .value {
    font-weight: 500;
    color: var(--color-text);
  }

  .password-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: var(--space-sm);
  }

  .error-message {
    color: var(--color-error);
    font-size: var(--text-sm);
    margin: 0;
  }

  .danger-zone {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .danger-info h3 {
    font-size: var(--text-base);
    font-weight: 600;
    margin: 0 0 var(--space-xs) 0;
    color: var(--color-text);
  }

  .danger-info p {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
    margin: 0;
    line-height: 1.5;
  }

  :global(.danger-card) {
    border-color: var(--color-error) !important;
  }

  .delete-modal-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .warning-text {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    color: var(--color-error);
    font-weight: 500;
    margin: 0;
  }

  .modal-actions {
    display: flex;
    gap: var(--space-sm);
    justify-content: flex-end;
  }
</style>
