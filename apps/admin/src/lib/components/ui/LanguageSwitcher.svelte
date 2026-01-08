<script lang="ts">
  import { page } from '$app/stores';
  import { getLocale } from '$lib/paraglide/runtime';
  import { Globe } from 'lucide-svelte';

  const currentLang = $derived(getLocale());
  const otherLang = $derived(currentLang === 'en' ? 'fr' : 'en');

  // Get the canonical path and switch language prefix
  const switchUrl = $derived(() => {
    const pathname = $page.url.pathname;
    // Remove current locale prefix if present
    const cleanPath = pathname.replace(/^\/(en|fr)/, '') || '/';
    return `/${otherLang}${cleanPath}`;
  });
</script>

<a href={switchUrl()} class="language-switcher" title={otherLang === 'en' ? 'Switch to English' : 'Passer en français'}>
  <Globe size={18} />
  <span>{otherLang.toUpperCase()}</span>
</a>

<style>
  .language-switcher {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.5rem 0.75rem;
    border-radius: var(--radius-md);
    color: var(--color-text-secondary);
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .language-switcher:hover {
    background: var(--color-bg-secondary);
    color: var(--color-text);
  }
</style>
