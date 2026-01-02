<script lang="ts">
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
        toastStore.success('Mot de passe modifié avec succès');
      }
    } catch (err: any) {
      passwordError = err.message || 'Erreur lors du changement de mot de passe';
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
      toastStore.success('Compte supprimé');
      await authStore.logout();
      goto('/login');
    } catch (err: any) {
      deleteError = err.message || 'Mot de passe incorrect';
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
  <title>Paramètres | jLinks Admin</title>
</svelte:head>

<div class="page">
  <header class="page-header">
    <h1><Settings size={24} /> Paramètres</h1>
  </header>

  <div class="content">
    <!-- Account Info -->
    <Card>
      {#snippet header()}
        <h2>Informations du compte</h2>
      {/snippet}

      <div class="info-grid">
        <div class="info-item">
          <span class="label">Email</span>
          <span class="value">{user?.email || '-'}</span>
        </div>
        <div class="info-item">
          <span class="label">Rôle</span>
          <span class="value">{user?.role === 'super_admin' ? 'Super Admin' : 'Client'}</span>
        </div>
      </div>
    </Card>

    <!-- Change Password -->
    <Card>
      {#snippet header()}
        <h2><Lock size={18} /> Modifier le mot de passe</h2>
      {/snippet}

      <form class="password-form" onsubmit={(e) => { e.preventDefault(); handleChangePassword(); }}>
        <Input
          type="password"
          label="Mot de passe actuel"
          placeholder="Entrez votre mot de passe actuel"
          bind:value={currentPassword}
        />

        <Input
          type="password"
          label="Nouveau mot de passe"
          placeholder="Minimum 8 caractères"
          hint={newPassword.length > 0 && newPassword.length < 8 ? 'Minimum 8 caractères requis' : ''}
          bind:value={newPassword}
        />

        <Input
          type="password"
          label="Confirmer le nouveau mot de passe"
          placeholder="Répétez le nouveau mot de passe"
          hint={confirmPassword.length > 0 && !passwordsMatch ? 'Les mots de passe ne correspondent pas' : ''}
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
            Enregistrer
          </Button>
        </div>
      </form>
    </Card>

    <!-- Danger Zone -->
    <Card class="danger-card">
      {#snippet header()}
        <h2><AlertTriangle size={18} /> Zone dangereuse</h2>
      {/snippet}

      <div class="danger-zone">
        <div class="danger-info">
          <h3>Supprimer le compte</h3>
          <p>
            Cette action est irréversible. Toutes vos données seront définitivement supprimées,
            y compris votre page de liens et tous les liens associés.
          </p>
        </div>
        <Button variant="danger" onclick={() => showDeleteModal = true}>
          <Trash2 size={16} />
          Supprimer mon compte
        </Button>
      </div>
    </Card>
  </div>
</div>

<!-- Delete Confirmation Modal -->
<Modal
  open={showDeleteModal}
  title="Supprimer votre compte"
  onclose={closeDeleteModal}
>
  <div class="delete-modal-content">
    <p class="warning-text">
      <AlertTriangle size={20} />
      Cette action est définitive et ne peut pas être annulée.
    </p>

    <p>Pour confirmer la suppression, entrez votre mot de passe :</p>

    <Input
      type="password"
      placeholder="Votre mot de passe"
      bind:value={deletePassword}
    />

    {#if deleteError}
      <p class="error-message">{deleteError}</p>
    {/if}
  </div>

  {#snippet footer()}
    <div class="modal-actions">
      <Button variant="secondary" onclick={closeDeleteModal}>
        Annuler
      </Button>
      <Button
        variant="danger"
        onclick={handleDeleteAccount}
        disabled={!deletePassword || deleting}
        loading={deleting}
      >
        Supprimer définitivement
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
