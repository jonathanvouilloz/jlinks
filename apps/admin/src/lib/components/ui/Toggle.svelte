<script lang="ts">
  interface Props {
    checked?: boolean;
    disabled?: boolean;
    label?: string;
    id?: string;
    class?: string;
    onchange?: (checked: boolean) => void;
  }

  let {
    checked = $bindable(false),
    disabled = false,
    label = '',
    id = '',
    class: className = '',
    onchange,
  }: Props = $props();

  const toggleId = id || crypto.randomUUID();

  function handleChange() {
    if (!disabled) {
      checked = !checked;
      onchange?.(checked);
    }
  }
</script>

<div class="toggle-wrapper {className}">
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    id={toggleId}
    class="toggle"
    class:active={checked}
    {disabled}
    onclick={handleChange}
  >
    <span class="toggle-knob"></span>
  </button>

  {#if label}
    <label for={toggleId} class="toggle-label">{label}</label>
  {/if}
</div>

<style>
  .toggle-wrapper {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
  }

  .toggle {
    position: relative;
    width: 44px;
    height: 24px;
    background-color: var(--color-border);
    border-radius: var(--radius-full);
    border: none;
    cursor: pointer;
    transition: background-color var(--transition-fast);
    padding: 0;
  }

  .toggle:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .toggle.active {
    background-color: var(--color-primary);
  }

  .toggle-knob {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    background-color: white;
    border-radius: 50%;
    transition: transform var(--transition-fast);
    box-shadow: var(--shadow-sm);
  }

  .toggle.active .toggle-knob {
    transform: translateX(20px);
  }

  .toggle-label {
    font-size: var(--text-sm);
    color: var(--color-text);
    cursor: pointer;
    user-select: none;
  }
</style>
