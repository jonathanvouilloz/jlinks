<script lang="ts">
  import Input from './Input.svelte';
  
  let { class: className = '', value = $bindable(), ...props } = $props();
</script>

<Input class="auth-input {className}" bind:value {...props} />

<style>
  :global(.auth-input .input) {
    padding: 1rem 1.25rem;
    font-size: 1rem;
    border-radius: 12px;
    border: 1.5px solid var(--color-border);
    background: #fafafa;
    transition: all 0.2s;
  }

  :global(.auth-input .input:focus) {
    background: #ffffff;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 4px rgba(255, 107, 91, 0.1);
  }
</style>