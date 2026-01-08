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
          <img src="/black-logo.webp" alt="Noko" class="logo-img" />
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

            <div class="divider">
              <span>Ou</span>
            </div>

            <a href="/register" class="create-account-link">
              Créer un compte
            </a>
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

  /* Hero Background - Full Width */
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

  /* Decorative Elements */
  .decorative-elements {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .mascot-wrapper {
    position: absolute;
    bottom: -250px;
    right: 38%;
    width: 850px;
    z-index: 1;
    pointer-events: none;
    opacity: 0.8;
  }

  .mascot-img {
    width: 100%;
    height: auto;
    filter: drop-shadow(0 0 60px rgba(255, 107, 91, 0.2));
    transform: rotate(-18deg);
    animation: float-mascot 8s ease-in-out infinite;
  }

  @keyframes float-mascot {
    0%, 100% { transform: translateY(0) rotate(-18deg) scale(1); }
    50% { transform: translateY(-40px) rotate(-12deg) scale(1.03); }
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
    top: calc(20vh + 4rem); /* Descendu pour viser le grand titre */
    left: calc(5% + 1.5rem); /* Décalé légèrement pour être au centre de la 1ère lettre */
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

  /* Form Panel - Overlapping White Card */
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

  .form-panel-inner {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 2.5rem 5rem 0;
    width: 100%;
  }

  /* Form Header */
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

  /* Form Content - Vertically Centered */
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

  .divider {
    display: flex;
    align-items: center;
    text-align: center;
    color: var(--color-text-muted);
    font-size: 0.875rem;
  }

  .divider::before,
  .divider::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid var(--color-border);
  }

  .divider span {
    padding: 0 1rem;
  }

  .create-account-link {
    display: block;
    text-align: center;
    color: var(--color-primary);
    font-weight: 500;
    font-size: 0.9375rem;
    text-decoration: none;
    transition: color var(--transition-fast);
  }

  .create-account-link:hover {
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
      margin: 0 auto;
    }

    .form-title {
      font-size: 1.75rem;
    }

    .login-link {
      display: none;
    }

    .form-footer {
      text-align: center;
      padding: 2rem 1.5rem;
    }
  }
</style>
