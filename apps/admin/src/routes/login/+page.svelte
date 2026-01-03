<script lang="ts">
  import { goto } from '$app/navigation';
  import { Button, Input, Card } from '$lib/components/ui';
  import { authStore } from '$lib/stores';

  let email = $state('');
  let password = $state('');
  let loading = $state(false);
  let error = $state('');

  async function handleSubmit(e: Event) {
    e.preventDefault();
    error = '';

    if (!email || !password) {
      error = 'Veuillez remplir tous les champs';
      return;
    }

    loading = true;
    const success = await authStore.login(email, password);
    loading = false;

    if (success) {
      goto('/');
    }
  }
</script>

<svelte:head>
  <title>Connexion - Noko</title>
</svelte:head>

<div class="login-page">
  <div class="login-container">
    <div class="login-header">
      <h1 class="login-logo">Noko</h1>
      <p class="login-subtitle">Connectez-vous à votre espace</p>
    </div>

    <Card>
      <form onsubmit={handleSubmit} class="login-form">
        {#if error}
          <div class="error-message">{error}</div>
        {/if}

        <Input
          label="Email"
          type="email"
          bind:value={email}
          placeholder="votre@email.com"
          required
          disabled={loading}
        />

        <Input
          label="Mot de passe"
          type="password"
          bind:value={password}
          placeholder="••••••••"
          required
          disabled={loading}
        />

        <Button type="submit" variant="primary" {loading} disabled={loading} class="login-button">
          Se connecter
        </Button>

        <a href="/forgot-password" class="forgot-password-link">
          Mot de passe oublié ?
        </a>
      </form>
    </Card>

    <p class="login-footer">
      Powered by <a href="#" target="_blank" rel="noopener">Jon Labs</a>
    </p>
  </div>
</div>

<style>
  .login-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-bg);
    padding: var(--space-4);
  }

  .login-container {
    width: 100%;
    max-width: 400px;
  }

  .login-header {
    text-align: center;
    margin-bottom: var(--space-6);
  }

  .login-logo {
    font-size: var(--text-2xl);
    font-weight: var(--font-bold);
    color: var(--color-primary);
    margin: 0 0 var(--space-2);
  }

  .login-subtitle {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
    margin: 0;
  }

  .login-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .error-message {
    padding: var(--space-3);
    background: var(--color-error-light);
    border: 1px solid var(--color-error);
    border-radius: var(--radius-md);
    color: var(--color-error-dark);
    font-size: var(--text-sm);
  }

  .login-form :global(.login-button) {
    width: 100%;
    margin-top: var(--space-2);
  }

  .login-footer {
    text-align: center;
    margin-top: var(--space-6);
    font-size: var(--text-xs);
    color: var(--color-text-muted);
  }

  .login-footer a {
    color: var(--color-primary);
    text-decoration: none;
  }

  .login-footer a:hover {
    text-decoration: underline;
  }

  .forgot-password-link {
    text-align: center;
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
    text-decoration: none;
    transition: color 0.2s;
  }

  .forgot-password-link:hover {
    color: var(--color-primary);
  }
</style>
