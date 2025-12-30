<script lang="ts">
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
    oninput,
    onchange,
  }: Props = $props();

  const inputId = id || name || crypto.randomUUID();
</script>

<div class="input-wrapper {className}">
  {#if label}
    <label for={inputId} class="label">
      {label}
      {#if required}<span class="required">*</span>{/if}
    </label>
  {/if}

  <input
    {type}
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
