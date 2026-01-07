<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { CheckCircle, XCircle, Loader2 } from 'lucide-svelte';

  let status = $state<'loading' | 'success' | 'error'>('loading');
  let errorMessage = $state('');

  const token = $derived($page.url.searchParams.get('token'));

  onMount(async () => {
    if (!token) {
      status = 'error';
      errorMessage = 'Lien invalide';
      return;
    }

    try {
      const response = await fetch(`/api/auth/verify-email?token=${token}`);
      const data = await response.json();

      if (response.ok && data.success) {
        status = 'success';
        // Redirect to dashboard after 2 seconds
        setTimeout(() => goto('/'), 2000);
      } else {
        status = 'error';
        errorMessage = data.error || 'Lien invalide ou expiré';
      }
    } catch (err) {
      status = 'error';
      errorMessage = 'Une erreur est survenue';
    }
  });
</script>

<svelte:head>
  <title>Vérification email - Noko</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

<div class="verify-page">
  <!-- Dark Background Layer -->
  <div class="hero-background">
    <div class="decorative-elements">
      <div class="glow glow-1"></div>
      <div class="glow glow-2"></div>
      <div class="circle-ring circle-ring-1"></div>
      <div class="circle-ring circle-ring-2"></div>
      <div class="circle-ring circle-ring-3"></div>
      <div class="circle-ring circle-ring-4"></div>
    </div>

    <div class="hero-content">
      <p class="hero-eyebrow">Verification en cours</p>
      <h1 class="hero-tagline">
        Activation de<br />
        <span class="highlight">votre compte</span>
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
      </header>

      <div class="form-content">
        <div class="form-content-inner">
          {#if status === 'loading'}
            <div class="status-icon loading">
              <Loader2 size={48} class="spin" />
            </div>
            <h2 class="form-title">Verification en cours...</h2>
            <p class="form-subtitle">Veuillez patienter quelques instants</p>
          {:else if status === 'success'}
            <div class="status-icon success">
              <CheckCircle size={48} />
            </div>
            <h2 class="form-title">Email verifie !</h2>
            <p class="form-subtitle">
              Votre compte est maintenant actif.<br />
              Redirection vers votre dashboard...
            </p>
          {:else}
            <div class="status-icon error">
              <XCircle size={48} />
            </div>
            <h2 class="form-title">Erreur</h2>
            <p class="form-subtitle">{errorMessage}</p>
            <a href="/register" class="retry-link">
              Réessayer l'inscription
            </a>
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
  .verify-page {
    min-height: 100vh;
    position: relative;
    overflow: hidden;
    font-family: 'Plus Jakarta Sans', var(--font-family);
    letter-spacing: -0.015em;
  }

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

  .circle-ring-1 { width: 800px; height: 800px; }
  .circle-ring-2 { width: 600px; height: 600px; }
  .circle-ring-3 { width: 400px; height: 400px; }
  .circle-ring-4 { width: 200px; height: 200px; }

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

  .form-panel {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 52%;
    min-width: 480px;
    background: #ffffff;
    border-radius: 64px 0 0 64px;
    box-shadow: -28px 0 80px rgba(0, 0, 0, 0.2), -10px 0 30px rgba(0, 0, 0, 0.12);
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

  .form-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .logo { display: flex; align-items: center; text-decoration: none; }
  .logo-img { height: 36px; width: auto; }

  .form-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .form-content-inner {
    width: 100%;
    max-width: 400px;
    text-align: center;
  }

  .status-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto 1.5rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  }

  .status-icon.loading {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  }

  .status-icon.success {
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  }

  .status-icon.error {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  }

  .status-icon :global(.spin) {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .form-title {
    font-size: 2rem;
    font-weight: var(--font-medium);
    color: var(--color-text);
    margin: 0 0 0.75rem;
    letter-spacing: -0.04em;
  }

  .form-subtitle {
    font-size: 1rem;
    color: var(--color-text-secondary);
    margin: 0 0 2rem;
    line-height: 1.6;
  }

  .retry-link {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    background: var(--color-primary);
    color: white;
    font-weight: 500;
    font-size: 0.9375rem;
    text-decoration: none;
    border-radius: 8px;
    transition: background var(--transition-fast);
  }

  .retry-link:hover {
    background: var(--color-primary-hover);
  }

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

  @media (max-width: 1024px) {
    .hero-background { padding-right: 50%; }
    .form-panel { width: 55%; min-width: 420px; }
    .form-panel-inner { padding: 2rem 3rem; }
  }

  @media (max-width: 768px) {
    .hero-background { display: none; }
    .form-panel {
      position: relative;
      width: 100%;
      min-width: unset;
      border-radius: 0;
      box-shadow: none;
    }
    .form-panel-inner { padding: 2rem 1.5rem; max-width: 400px; }
  }
</style>
