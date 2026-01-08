<script lang="ts">
  import { AuthButton, AuthInput } from '$lib/components/ui';
  import { Mail, CheckCircle, ArrowLeft } from 'lucide-svelte';
  import { api } from '$lib/api';

  let email = $state('');
  let loading = $state(false);
  let sent = $state(false);
  let error = $state('');

  async function handleSubmit(e: Event) {
    e.preventDefault();
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
  <title>Mot de passe oublie | Noko</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

<div class="forgot-page">
  <!-- Dark Background Layer -->
  <div class="hero-background">
    <div class="decorative-elements">
      <div class="mascot-wrapper">
        <img src="/good.png" alt="" class="mascot-img" />
      </div>
      <div class="glow glow-1"></div>
      <div class="glow glow-2"></div>
      <div class="circle-ring circle-ring-1"></div>
      <div class="circle-ring circle-ring-2"></div>
      <div class="circle-ring circle-ring-3"></div>
      <div class="circle-ring circle-ring-4"></div>
    </div>
    <div class="hero-content">
      <p class="hero-eyebrow">Recuperation de compte</p>
      <h1 class="hero-tagline">
        Recuperez votre<br />
        <span class="highlight">acces en un clic</span>
      </h1>
    </div>
  </div>

  <!-- White Form Panel -->
  <div class="form-panel">
    <div class="form-panel-inner">
      <header class="form-header">
        <a href="/" class="logo">
          <img src="/black-logo.webp" alt="Noko" class="logo-img" />
        </a>
        <a href="/" class="back-link">← Retour</a>
        <a href="/login" class="login-link">
          <span>Retour a la connexion</span>
        </a>
      </header>

      <div class="form-content">
        <div class="form-content-inner">
          <!-- ÉTAT FORMULAIRE -->
          {#if !sent}
            <h2 class="form-title">Mot de passe oublie</h2>
            <p class="form-subtitle">Entrez votre email pour recevoir un lien de reinitialisation</p>
            <form onsubmit={handleSubmit} class="login-form">
              {#if error}
                <div class="error-message">
                  <span class="error-icon">!</span>
                  {error}
                </div>
              {/if}

              <div class="input-group">
                <AuthInput
                  type="email"
                  bind:value={email}
                  placeholder="votre@email.com"
                  required
                  disabled={loading}
                />
              </div>

              <AuthButton type="submit" {loading} disabled={!email || loading}>
                <Mail size={18} />
                <span>Envoyer le lien</span>
              </AuthButton>
            </form>
          {:else}
            <!-- ÉTAT SUCCÈS -->
            <div class="success-state">
              <div class="success-icon-wrapper">
                <CheckCircle />
              </div>
              <h2>Email envoye</h2>
              <p>Si un compte existe avec l'adresse <strong>{email}</strong>, vous recevrez un email avec un lien pour reinitialiser votre mot de passe.</p>
              <p class="hint">Verifiez egalement vos spams si vous ne voyez pas l'email dans votre boite de reception.</p>
              
              <div class="success-actions">
                <a href="/login" class="button-link">
                  <AuthButton type="button">
                    <span>Retour a la connexion</span>
                  </AuthButton>
                </a>
              </div>
            </div>
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
  .forgot-page {
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
    align-items: flex-start;
    padding-top: 20vh;
    padding-left: 5%;
    padding-right: 55%;
  }

  /* Decorative Elements - identiques à login */
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
    top: calc(20vh + 4rem);
    left: calc(5% + 1.5rem);
    transform: translate(-50%, -50%);
    z-index: 0;
  }

  .circle-ring-1 {
    width: 800px;
    height: 800px;
  }

  .circle-ring-2 {
    width: 600px;
    height: 600px;
  }

  .circle-ring-3 {
    width: 400px;
    height: 400px;
  }

  .circle-ring-4 {
    width: 200px;
    height: 200px;
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
    background: var(--color-bg);
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

  .back-link {
    display: none;
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    text-decoration: none;
    transition: color var(--transition-fast);
  }

  .back-link:hover {
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

  /* Login Form Styles Reuse */
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

  /* Success State */
  .success-state {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .success-icon-wrapper {
    width: 80px;
    height: 80px;
    background: #f0fdf4;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 2rem;
  }

  .success-icon-wrapper :global(svg) {
    width: 40px;
    height: 40px;
    color: #22c55e;
  }

  .success-state h2 {
    font-size: 2rem;
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 1rem;
    letter-spacing: -0.02em;
  }

  .success-state p {
    font-size: 1rem;
    color: var(--color-text-secondary);
    margin: 0 0 1rem;
    line-height: 1.6;
    max-width: 320px;
  }

  .success-state .hint {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    font-style: italic;
  }

  .success-actions {
    margin-top: 2.5rem;
    width: 100%;
  }

  .button-link {
    text-decoration: none;
    display: block;
    width: 100%;
  }

  .forgot-link {
    font-size: 0.875rem;
    color: var(--color-primary);
    text-decoration: none;
    font-weight: 500;
    transition: color var(--transition-fast);
  }

  .forgot-link:hover {
    color: var(--color-primary-hover);
    text-decoration: underline;
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

  /* Responsive - identique à login */
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
      margin: 0 auto;
    }

    .form-title {
      font-size: 1.75rem;
    }

    .login-link {
      display: none;
    }

    .back-link {
      display: block;
    }

    .form-footer {
      text-align: center;
      padding: 2rem 1.5rem;
    }
  }
</style>