<script lang="ts">
  import { Camera, Trash2, Loader2 } from 'lucide-svelte';
  import * as m from '$lib/paraglide/messages';

  interface Props {
    imageUrl?: string | null;
    onUpload: (url: string) => void;
    onRemove: () => void;
    size?: number;
    shape?: 'round' | 'square';
  }

  let {
    imageUrl = null,
    onUpload,
    onRemove,
    size = 96,
    shape = 'round',
  }: Props = $props();

  let uploading = $state(false);
  let error = $state<string | null>(null);
  let fileInput: HTMLInputElement;

  async function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    error = null;
    uploading = true;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      onUpload(result.url);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Upload failed';
    } finally {
      uploading = false;
      // Reset input
      if (fileInput) fileInput.value = '';
    }
  }

  async function handleRemove() {
    error = null;
    uploading = true;

    try {
      const response = await fetch('/api/upload', {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Delete failed');
      }

      onRemove();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Delete failed';
    } finally {
      uploading = false;
    }
  }

  function triggerFileInput() {
    fileInput?.click();
  }
</script>

<div class="image-upload" style="--size: {size}px;">
  <div class="image-container" class:round={shape === 'round'} class:square={shape === 'square'}>
    {#if imageUrl}
      <img src={imageUrl} alt="Profile" class="preview-image" />
      <div class="image-overlay">
        <button type="button" class="overlay-btn change" onclick={triggerFileInput} disabled={uploading}>
          <Camera size={20} />
        </button>
        <button type="button" class="overlay-btn remove" onclick={handleRemove} disabled={uploading}>
          <Trash2 size={20} />
        </button>
      </div>
    {:else}
      <button type="button" class="upload-placeholder" onclick={triggerFileInput} disabled={uploading}>
        {#if uploading}
          <Loader2 size={24} class="spinner" />
        {:else}
          <Camera size={24} />
          <span>{m.image_upload_add?.() ?? 'Add photo'}</span>
        {/if}
      </button>
    {/if}

    {#if uploading && imageUrl}
      <div class="loading-overlay">
        <Loader2 size={24} class="spinner" />
      </div>
    {/if}
  </div>

  <input
    bind:this={fileInput}
    type="file"
    accept="image/jpeg,image/png,image/webp,image/gif"
    onchange={handleFileSelect}
    hidden
  />

  {#if error}
    <p class="error-message">{error}</p>
  {/if}
</div>

<style>
  .image-upload {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
  }

  .image-container {
    position: relative;
    width: var(--size);
    height: var(--size);
    overflow: hidden;
    background: var(--color-bg);
    border: 2px dashed var(--color-border);
  }

  .image-container.round {
    border-radius: 50%;
  }

  .image-container.square {
    border-radius: var(--radius-lg);
  }

  .preview-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .image-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    background: rgba(0, 0, 0, 0.5);
    opacity: 0;
    transition: opacity var(--transition-fast);
  }

  .image-container:hover .image-overlay {
    opacity: 1;
  }

  .overlay-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    transition: transform var(--transition-fast), background var(--transition-fast);
  }

  .overlay-btn:hover:not(:disabled) {
    transform: scale(1.1);
  }

  .overlay-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .overlay-btn.change {
    background: var(--color-primary);
    color: white;
  }

  .overlay-btn.remove {
    background: var(--color-error);
    color: white;
  }

  .upload-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    background: transparent;
    border: none;
    color: var(--color-text-muted);
    cursor: pointer;
    font-size: var(--text-xs);
    transition: all var(--transition-fast);
  }

  .upload-placeholder:hover:not(:disabled) {
    color: var(--color-primary);
    border-color: var(--color-primary);
  }

  .upload-placeholder:disabled {
    cursor: not-allowed;
  }

  .loading-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.8);
  }

  :global(.spinner) {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .error-message {
    font-size: var(--text-xs);
    color: var(--color-error);
    margin: 0;
    text-align: center;
  }
</style>
