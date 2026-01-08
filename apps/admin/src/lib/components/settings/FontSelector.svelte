<script lang="ts">
  import * as m from '$lib/paraglide/messages';

  interface Props {
    label: string;
    value: string;
    onchange: (value: string) => void;
  }

  let { label, value, onchange }: Props = $props();

  const GOOGLE_FONTS = [
    'Inter',
    'Roboto',
    'Open Sans',
    'Lato',
    'Montserrat',
    'Poppins',
    'Raleway',
    'Playfair Display',
    'Merriweather',
    'Source Sans Pro',
    'Ubuntu',
    'Nunito',
    'Work Sans',
    'Oswald',
    'Quicksand'
  ];

  function handleChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    onchange(target.value);
  }
</script>

<svelte:head>
  <link href="https://fonts.googleapis.com/css2?family={value.replace(' ', '+')}&display=swap" rel="stylesheet">
</svelte:head>

<div class="font-selector">
  <label for="font-{label}">{label}</label>
  <select id="font-{label}" {value} onchange={handleChange}>
    {#each GOOGLE_FONTS as font}
      <option value={font} style="font-family: {font}">{font}</option>
    {/each}
  </select>
  <p class="font-preview" style="font-family: '{value}', sans-serif">
    {m.appearance_font_preview()}
  </p>
</div>

<style>
  .font-selector {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .font-selector label {
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    color: var(--color-text);
  }

  .font-selector select {
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    background: var(--color-surface);
    cursor: pointer;
  }

  .font-selector select:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px var(--color-primary-light);
  }

  .font-preview {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
    margin: 0;
    padding: var(--space-2);
    background: var(--color-bg);
    border-radius: var(--radius-md);
  }
</style>
