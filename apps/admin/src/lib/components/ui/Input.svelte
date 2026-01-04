<script lang="ts">
  import { Eye, EyeOff } from 'lucide-svelte';

  interface Props {
    type?: 'text' | 'email' | 'password' | 'url' | 'tel' | 'number';
    value?: string;
    placeholder?: string;
    label?: string;
    hint?: string;
    error?: string;
    disabled?: boolean;
    required?: boolean;
    name?: string;
    id?: string;
    class?: string;
    showPasswordToggle?: boolean;
    oninput?: (e: Event) => void;
    onchange?: (e: Event) => void;
  }

  let {
    type = 'text',
    value = $bindable(''),
    placeholder = '',
    label = '',
    hint = '',
    error = '',
    disabled = false,
    required = false,
    name = '',
    id = '',
    class: className = '',
    showPasswordToggle = false,
    oninput,
    onchange,
  }: Props = $props();

  const inputId = id || name || crypto.randomUUID();
  let showPassword = $state(false);

  const actualType = $derived(
    type === 'password' && showPasswordToggle && showPassword ? 'text' : type
  );
</script>

<div class="input-wrapper {className}">
  {#if label}
    <label for={inputId} class="label">
      {label}
      {#if required}<span class="required">*</span>{/if}
    </label>
  {/if}

  <div class="input-container" class:has-toggle={type === 'password' && showPasswordToggle}>
    <input
      type={actualType}
      id={inputId}
      {name}
      bind:value
      {placeholder}
      {disabled}
      {required}
      class="input"
      class:error
      {oninput}
      {onchange}
    />
    {#if type === 'password' && showPasswordToggle}
      <button
        type="button"
        class="password-toggle"
        onclick={() => (showPassword = !showPassword)}
        tabindex="-1"
        aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
      >
        {#if showPassword}
          <EyeOff size={18} />
        {:else}
          <Eye size={18} />
        {/if}
      </button>
    {/if}
  </div>

  {#if error}
    <p class="error-text">{error}</p>
  {:else if hint}
    <p class="hint-text">{hint}</p>
  {/if}
</div>

<style>
  .input-wrapper {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .input-container {
    position: relative;
    display: flex;
    align-items: center;
  }

  .input-container.has-toggle .input {
    padding-right: 44px;
  }

  .password-toggle {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    padding: 4px;
    cursor: pointer;
    color: var(--color-text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color var(--transition-fast);
  }

  .password-toggle:hover {
    color: var(--color-text-secondary);
  }

  .label {
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    color: var(--color-text);
  }

  .required {
    color: var(--color-error);
    margin-left: 2px;
  }

  .input {
    background-color: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 10px 12px;
    font-size: var(--text-sm);
    color: var(--color-text);
    transition:
      border-color var(--transition-fast),
      box-shadow var(--transition-fast);
    width: 100%;
  }

  .input:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px var(--color-primary-light);
  }

  .input::placeholder {
    color: var(--color-text-muted);
  }

  .input:disabled {
    background-color: var(--color-bg);
    cursor: not-allowed;
    opacity: 0.7;
  }

  .input.error {
    border-color: var(--color-error);
  }

  .input.error:focus {
    box-shadow: 0 0 0 3px var(--color-error-light);
  }

  .hint-text {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    margin: 0;
  }

  .error-text {
    font-size: var(--text-xs);
    color: var(--color-error);
    margin: 0;
  }
</style>
