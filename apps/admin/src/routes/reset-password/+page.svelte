<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { Button, Input, Card } from '$lib/components/ui';
  import { CheckCircle, XCircle } from 'lucide-svelte';
  import { api } from '$lib/api';

  // Get token from URL
  const token = $derived($page.url.searchParams.get('token') || '');

  let newPassword = $state('');
  let confirmPassword = $state('');
  let loading = $state(false);
  let success = $state(false);
  let error = $state('');

  const passwordsMatch = $derived(newPassword === confirmPassword);
  const canSubmit = $derived(
    token &&
    newPassword.length >= 8 &&
    passwordsMatch
  );

  async function handleSubmit() {
    if (!canSubmit) return;

    error = '';
    loading = true;

    try {
      await api.auth.resetPassword(token, newPassword);
      success = true;
      // Redirect to login after 3 seconds
      setTimeout(() => goto('/login'), 3000);
    } catch (err: any) {
      error = err.message || 'Lien invalide ou expiré';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Réinitialiser le mot de passe | jLinks</title>
</svelte:head>

<div class="container">
  <div class="form-wrapper">
    <div class="logo">
      <span class="logo-text">jLinks</span>
    </div>

    {#if !token}
      <Card>
        <div class="error-content">
          <XCircle size={48} class="error-icon" />
          <h1>Lien invalide</h1>
          <p>
            Ce lien de réinitialisation est invalide ou a expiré.
          </p>
          <a href="/forgot-password" class="link">
            Demander un nouveau lien
          </a>
        </div>
      </Card>
    {:else if success}
      <Card>
        <div class="success-content">
          <CheckCircle size={48} class="success-icon" />
          <h1>Mot de passe réinitialisé</h1>
          <p>
            Votre mot de passe a été modifié avec succès.
            Vous allez être redirigé vers la page de connexion...
          </p>
          <a href="/login" class="link">
            Se connecter maintenant
          </a>
        </div>
      </Card>
    {:else}
      <Card>
        <h1>Nouveau mot de passe</h1>
        <p class="description">
          Choisissez un nouveau mot de passe sécurisé.
        </p>

        <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <Input
            type="password"
            label="Nouveau mot de passe"
            placeholder="Minimum 8 caractères"
            hint={newPassword.length > 0 && newPassword.length < 8 ? 'Minimum 8 caractères requis' : ''}
            bind:value={newPassword}
          />

          <Input
            type="password"
            label="Confirmer le mot de passe"
            placeholder="Répétez le mot de passe"
            hint={confirmPassword.length > 0 && !passwordsMatch ? 'Les mots de passe ne correspondent pas' : ''}
            bind:value={confirmPassword}
          />

          {#if error}
            <p class="error-message">{error}</p>
          {/if}

          <Button type="submit" disabled={!canSubmit || loading} loading={loading}>
            Réinitialiser le mot de passe
          </Button>
        </form>
      </Card>
    {/if}
  </div>
</div>

<style>
  .container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-lg);
    background-color: var(--color-bg-secondary);
  }

  .form-wrapper {
    width: 100%;
    max-width: 400px;
  }

  .logo {
    text-align: center;
    margin-bottom: var(--space-xl);
  }

  .logo-text {
    font-size: var(--text-3xl);
    font-weight: 700;
    color: var(--color-primary);
  }

  h1 {
    font-size: var(--text-xl);
    font-weight: 600;
    margin: 0 0 var(--space-sm) 0;
    color: var(--color-text);
  }

  .description {
    color: var(--color-text-secondary);
    margin: 0 0 var(--space-lg) 0;
    font-size: var(--text-sm);
  }

  form {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .error-message {
    color: var(--color-error);
    font-size: var(--text-sm);
    margin: 0;
  }

  .success-content,
  .error-content {
    text-align: center;
  }

  .success-content :global(.success-icon) {
    color: var(--color-success);
    margin-bottom: var(--space-md);
  }

  .error-content :global(.error-icon) {
    color: var(--color-error);
    margin-bottom: var(--space-md);
  }

  .success-content p,
  .error-content p {
    color: var(--color-text-secondary);
    margin: var(--space-sm) 0 var(--space-lg) 0;
    line-height: 1.5;
  }

  .link {
    color: var(--color-primary);
    text-decoration: none;
    font-weight: 500;
  }

  .link:hover {
    text-decoration: underline;
  }
</style>
