<script lang="ts">
  interface Props {
    label: string;
    value: number;
    onchange: (value: number) => void;
  }

  let { label, value, onchange }: Props = $props();

  function handleChange(e: Event) {
    const target = e.target as HTMLInputElement;
    onchange(parseInt(target.value, 10));
  }
</script>

<div class="opacity-slider">
  <div class="slider-header">
    <label>{label}</label>
    <span class="value-display">{value}%</span>
  </div>
  <input
    type="range"
    min="0"
    max="100"
    {value}
    oninput={handleChange}
  />
</div>

<style>
  .opacity-slider {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .slider-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .opacity-slider label {
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    color: var(--color-text);
  }

  .value-display {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    font-family: monospace;
  }

  input[type="range"] {
    width: 100%;
    height: 8px;
    border-radius: var(--radius-full);
    background: var(--color-border);
    appearance: none;
    cursor: pointer;
  }

  input[type="range"]::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--color-primary);
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  input[type="range"]::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--color-primary);
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  input[type="range"]:focus {
    outline: none;
  }

  input[type="range"]:focus::-webkit-slider-thumb {
    box-shadow: 0 0 0 3px var(--color-primary-light);
  }
</style>
