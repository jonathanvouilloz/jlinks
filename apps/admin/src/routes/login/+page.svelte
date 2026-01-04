<script lang="ts">
  import { goto } from '$app/navigation';
  import { Button, AuthButton, AuthInput } from '$lib/components/ui';
  import { authStore } from '$lib/stores';
  import { LogIn, UserPlus } from 'lucide-svelte';

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
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

<div class="login-page">
  <!-- Dark Background Layer -->
  <div class="hero-background">
    <!-- Decorative Elements -->
    <div class="decorative-elements">
      <div class="glow glow-1"></div>
      <div class="glow glow-2"></div>
      <div class="circle-ring circle-ring-1"></div>
      <div class="circle-ring circle-ring-2"></div>
      <div class="circle-ring circle-ring-3"></div>
    </div>

    <!-- Hero Content -->
    <div class="hero-content">
      <p class="hero-eyebrow">La plateforme de liens personnalisee</p>
      <h1 class="hero-tagline">
        Tous vos liens<br />
        <span class="highlight">en un seul endroit</span>
      </h1>
    </div>
  </div>

  <!-- White Form Panel (Overlapping) -->
  <div class="form-panel">
    <div class="form-panel-inner">
      <!-- Header -->
      <header class="form-header">
        <a href="/" class="logo">
          <img src="/logonono.webp" alt="Nokolink" class="logo-img" />
        </a>
        <a href="/register" class="login-link">
          <span>Pas encore de compte ? S'inscrire</span>
        </a>
      </header>

      <!-- Form Content (Centered) -->
      <div class="form-content">
        <div class="form-content-inner">
          <h2 class="form-title">Connexion</h2>
          <p class="form-subtitle">Accedez a votre espace Noko</p>

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

            <div class="input-group">
              <AuthInput
                type="password"
                bind:value={password}
                placeholder="Mot de passe"
                required
                disabled={loading}
                showPasswordToggle
              />
            </div>

            <div class="form-options">
              <a href="/forgot-password" class="forgot-link">
                Mot de passe oublie ?
              </a>
            </div>

            <AuthButton type="submit" {loading} disabled={loading}>
              <LogIn size={18} />
              <span>Se connecter</span>
            </AuthButton>
          </form>
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <footer class="form-footer">
      <p>&copy; 2025 Noko. Tous droits reserves.</p>
    </footer>
  </div>
</div>

<style>
  /* Base Layout */
  .login-page {
    min-height: 100vh;
    position: relative;
    overflow: hidden;
    font-family: 'Plus Jakarta Sans', var(--font-family);
    letter-spacing: -0.015em;
  }
/* ... */
  .hero-tagline {
    font-size: clamp(2.5rem, 5vw, 3.5rem);
    font-weight: var(--font-medium);
    color: #ffffff;
    line-height: 1.1;
    margin: 0;
    letter-spacing: -0.04em;
  }
/* ... */
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

  /* Login Form */
  .login-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .input-group {
    position: relative;
  }

  .input-group :global(.input-wrapper) {
    margin: 0;
  }

  .input-group :global(.input::placeholder) {
    color: var(--color-text-muted);
  }

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

  .form-options {
    display: flex;
    justify-content: flex-end;
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

  /* Form Footer */
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

  /* Responsive Design */
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
