<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { AuthButton, AuthInput } from '$lib/components/ui';
  import { Lock, CheckCircle, XCircle, ArrowLeft } from 'lucide-svelte';
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

  async function handleSubmit(e: Event) {
    e.preventDefault();
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
  <title>Reinitialiser le mot de passe | Noko</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

<div class="reset-page">
  <!-- Dark Background Layer -->
  <div class="hero-background">
    <div class="decorative-elements">
      <div class="glow glow-1"></div>
      <div class="glow glow-2"></div>
      <div class="circle-ring circle-ring-1"></div>
      <div class="circle-ring circle-ring-2"></div>
      <div class="circle-ring circle-ring-3"></div>
    </div>
    <div class="hero-content">
      <p class="hero-eyebrow">Nouveau mot de passe</p>
      <h1 class="hero-tagline">
        Un nouveau<br />
        <span class="highlight">depart securise</span>
      </h1>
    </div>
  </div>

  <!-- White Form Panel -->
  <div class="form-panel">
    <div class="form-panel-inner">
      <header class="form-header">
        <a href="/" class="logo">
          <img src="/logonono.webp" alt="Nokolink" class="logo-img" />
        </a>
        <a href="/forgot-password" class="login-link">
          <span>Redemander un lien</span>
        </a>
      </header>

      <div class="form-content">
        <div class="form-content-inner">
          
          {#if !token}
            <div class="error-state">
              <XCircle />
              <h2>Lien invalide</h2>
              <p>Ce lien de reinitialisation est invalide ou a expire.</p>
              <a href="/forgot-password" class="action-link">Demander un nouveau lien</a>
            </div>
          {:else if success}
            <div class="success-state">
              <CheckCircle />
              <h2>Mot de passe reinitialise</h2>
              <p>Votre mot de passe a ete modifie avec succes.</p>
              <p class="redirect-hint">Redirection vers la connexion...</p>
              <div class="form-options" style="justify-content: center; margin-top: 1.5rem;">
                 <a href="/login" class="action-link">Se connecter maintenant</a>
              </div>
            </div>
          {:else}
            <h2 class="form-title">Nouveau mot de passe</h2>
            <p class="form-subtitle">Choisissez un nouveau mot de passe securise</p>
            
            <form onsubmit={handleSubmit} class="login-form">
              {#if error}
                <div class="error-message">
                  <span class="error-icon">!</span>
                  {error}
                </div>
              {/if}

              <div class="input-group">
                <AuthInput
                  type="password"
                  bind:value={newPassword}
                  placeholder="Nouveau mot de passe"
                  showPasswordToggle
                  disabled={loading}
                />
              </div>

              <div class="input-group">
                <AuthInput
                  type="password"
                  bind:value={confirmPassword}
                  placeholder="Confirmer le mot de passe"
                  showPasswordToggle
                  disabled={loading}
                />
              </div>

              <!-- Validation hints -->
              {#if newPassword.length > 0 && newPassword.length < 8}
                <p class="hint-message">Minimum 8 caracteres requis</p>
              {/if}

              {#if confirmPassword.length > 0 && !passwordsMatch}
                <p class="hint-message error">Les mots de passe ne correspondent pas</p>
              {/if}

              <AuthButton type="submit" {loading} disabled={!canSubmit || loading}>
                <Lock size={18} />
                <span>Reinitialiser le mot de passe</span>
              </AuthButton>
            </form>
          {/if}
        </div>
      </div>
    </div>
    <footer class="form-footer">
      <p>&copy; 2025 Noko. Tous droits reserves.</p>
    </footer>
  </div>
</div>

<style>
  /* Base Layout */
  .reset-page {
    min-height: 100vh;
    position: relative;
    overflow: hidden;
    font-family: 'Plus Jakarta Sans', var(--font-family);
    letter-spacing: -0.015em;
  }

  /* Hero Background */
  .hero-background {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, #16162a 0%, #1a1a2e 50%, #252547 100%);
    display: flex;
    align-items: center;
    padding-left: 5%;
    padding-right: 55%;
  }

  /* Decorative Elements */
  .decorative-elements {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .glow {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.4;
  }

  .glow-1 {
    width: 400px;
    height: 400px;
    background: var(--color-primary);
    top: 10%;
    left: 5%;
    opacity: 0.15;
  }

  .glow-2 {
    width: 300px;
    height: 300px;
    background: #8b5cf6;
    bottom: 20%;
    left: 25%;
    opacity: 0.1;
  }

  .circle-ring {
    position: absolute;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.08);
    top: 50%;
    left: 22%;
    transform: translate(-50%, -50%);
  }

  .circle-ring-1 {
    width: 500px;
    height: 500px;
  }

  .circle-ring-2 {
    width: 380px;
    height: 380px;
  }

  .circle-ring-3 {
    width: 260px;
    height: 260px;
  }

  /* Hero Content */
  .hero-content {
    position: relative;
    z-index: 1;
    max-width: 500px;
  }

  .hero-eyebrow {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin: 0 0 1.5rem;
    font-weight: 500;
  }

  .hero-tagline {
    font-size: clamp(2.5rem, 5vw, 3.5rem);
    font-weight: var(--font-medium);
    color: #ffffff;
    line-height: 1.1;
    margin: 0;
    letter-spacing: -0.04em;
  }

  .hero-tagline .highlight {
    background: linear-gradient(135deg, var(--color-primary) 0%, #ff8a7a 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* Form Panel */
  .form-panel {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 52%;
    min-width: 480px;
    background: #ffffff;
    border-radius: 64px 0 0 64px;
    box-shadow:
      -28px 0 80px rgba(0, 0, 0, 0.2),
      -10px 0 30px rgba(0, 0, 0, 0.12);
    z-index: 10;
    display: flex;
    flex-direction: column;
  }

  /* Form Content */
  .form-panel-inner {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 2.5rem 5rem 0;
    width: 100%;
  }

  .form-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .logo {
    display: flex;
    align-items: center;
    text-decoration: none;
  }

  .logo-img {
    height: 36px;
    width: auto;
  }

  .login-link {
    display: flex;
    align-items: center;
    height: 36px;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text-secondary);
    text-decoration: none;
    transition: all var(--transition-fast);
  }

  .login-link:hover {
    color: var(--color-primary);
  }

  .form-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .form-content-inner {
    width: 100%;
    max-width: 400px;
  }

  .form-title {
    font-size: 2rem;
    font-weight: var(--font-medium);
    color: var(--color-text);
    margin: 0 0 0.5rem;
    letter-spacing: -0.04em;
  }

  .form-subtitle {
    font-size: 1rem;
    color: var(--color-text-secondary);
    margin: 0 0 2rem;
  }

  /* Form Styles */
  .login-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .input-group {
    position: relative;
  }

  /* Error Message */
  .error-message {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
    border: 1px solid #fecaca;
    border-radius: 12px;
    color: #b91c1c;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .error-icon {
    width: 20px;
    height: 20px;
    background: #ef4444;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 0.75rem;
    font-weight: 700;
    flex-shrink: 0;
  }

  /* Hints */
  .hint-message {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    margin: 0;
  }

  .hint-message.error {
    color: #ef4444;
  }

  /* States */
  .error-state, .success-state {
    text-align: center;
  }

  .error-state :global(svg) {
    width: 64px;
    height: 64px;
    color: #ef4444;
    margin-bottom: 1.5rem;
  }

  .success-state :global(svg) {
    width: 64px;
    height: 64px;
    color: #22c55e;
    margin-bottom: 1.5rem;
  }

  .success-state h2, .error-state h2 {
    font-size: 1.75rem;
    font-weight: 500;
    color: var(--color-text);
    margin: 0 0 0.75rem;
  }

  .success-state p, .error-state p {
    color: var(--color-text-secondary);
    margin: 0 0 1.5rem;
    line-height: 1.6;
  }

  .action-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--color-primary);
    text-decoration: none;
    font-weight: 500;
    margin-top: 1rem;
  }

  .action-link:hover {
    text-decoration: underline;
  }

  .redirect-hint {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    font-style: italic;
  }

  /* Footer */
  .form-footer {
    padding: 2rem 5rem;
    width: 100%;
    text-align: right;
    margin-top: auto;
  }

  .form-footer p {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    margin: 0;
  }

  /* Responsive */
  @media (max-width: 1024px) {
    .hero-background {
      padding-right: 50%;
    }

    .form-panel {
      width: 55%;
      min-width: 420px;
    }

    .form-panel-inner {
      padding: 2rem 3rem;
    }
  }

  @media (max-width: 768px) {
    .hero-background {
      display: none;
    }

    .form-panel {
      position: relative;
      width: 100%;
      min-width: unset;
      border-radius: 0;
      box-shadow: none;
    }

    .form-panel-inner {
      padding: 2rem 1.5rem;
      max-width: 400px;
    }

    .form-title {
      font-size: 1.75rem;
    }
  }
</style>