<script lang="ts">
  import { Button, Input, Card } from '$lib/components/ui';
  import { ArrowLeft, CheckCircle } from 'lucide-svelte';
  import { api } from '$lib/api';

  let email = $state('');
  let loading = $state(false);
  let sent = $state(false);
  let error = $state('');

  async function handleSubmit() {
    if (!email) return;

    error = '';
    loading = true;

    try {
      await api.auth.forgotPassword(email);
      sent = true;
    } catch (err: any) {
      error = err.message || 'Une erreur est survenue';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Mot de passe oublié | jLinks</title>
</svelte:head>

<div class="container">
  <div class="form-wrapper">
    <div class="logo">
      <span class="logo-text">jLinks</span>
    </div>

    {#if sent}
      <Card>
        <div class="success-content">
          <CheckCircle size={48} class="success-icon" />
          <h1>Email envoyé</h1>
          <p>
            Si un compte existe avec l'adresse <strong>{email}</strong>,
            vous recevrez un email avec un lien pour réinitialiser votre mot de passe.
          </p>
          <p class="hint">
            Vérifiez également vos spams si vous ne voyez pas l'email dans votre boîte de réception.
          </p>
          <a href="/login" class="back-link">
            <ArrowLeft size={16} />
            Retour à la connexion
          </a>
        </div>
      </Card>
    {:else}
      <Card>
        <h1>Mot de passe oublié</h1>
        <p class="description">
          Entrez votre adresse email pour recevoir un lien de réinitialisation.
        </p>

        <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <Input
            type="email"
            label="Email"
            placeholder="votre@email.com"
            bind:value={email}
            required
          />

          {#if error}
            <p class="error-message">{error}</p>
          {/if}

          <Button type="submit" disabled={!email || loading} loading={loading}>
            Envoyer le lien
          </Button>
        </form>

        <a href="/login" class="back-link">
          <ArrowLeft size={16} />
          Retour à la connexion
        </a>
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

  .back-link {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    color: var(--color-text-secondary);
    text-decoration: none;
    font-size: var(--text-sm);
    margin-top: var(--space-lg);
    transition: color 0.2s;
  }

  .back-link:hover {
    color: var(--color-primary);
  }

  .success-content {
    text-align: center;
  }

  .success-content :global(.success-icon) {
    color: var(--color-success);
    margin-bottom: var(--space-md);
  }

  .success-content p {
    color: var(--color-text-secondary);
    margin: var(--space-sm) 0;
    line-height: 1.5;
  }

  .success-content .hint {
    font-size: var(--text-sm);
    color: var(--color-text-tertiary);
  }

  .success-content .back-link {
    justify-content: center;
  }
</style>
