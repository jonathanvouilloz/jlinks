<script lang="ts">
  interface Props {
    label: string;
    value: string;
    onchange: (value: string) => void;
  }

  let { label, value, onchange }: Props = $props();

  function handleChange(e: Event) {
    const target = e.target as HTMLInputElement;
    onchange(target.value);
  }
</script>

<div class="color-picker">
  <label>{label}</label>
  <div class="color-input-wrapper">
    <input type="color" {value} oninput={handleChange} />
    <input type="text" {value} oninput={handleChange} class="color-text" />
  </div>
</div>

<style>
  .color-picker {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .color-picker label {
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    color: var(--color-text);
  }

  .color-input-wrapper {
    display: flex;
    gap: var(--space-2);
    align-items: center;
  }

  .color-input-wrapper input[type="color"] {
    width: 44px;
    height: 44px;
    padding: 2px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    cursor: pointer;
    background: transparent;
  }

  .color-text {
    flex: 1;
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    font-family: monospace;
    text-transform: uppercase;
  }

  .color-text:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px var(--color-primary-light);
  }
</style>
