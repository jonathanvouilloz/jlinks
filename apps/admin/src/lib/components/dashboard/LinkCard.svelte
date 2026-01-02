<script lang="ts">
  import type { Link, SocialPresetKey } from '@jlinks/shared/types';
  import { SOCIAL_PRESETS } from '@jlinks/shared/social-presets';
  import { Toggle, Button } from '$lib/components/ui';
  import { GripVertical, Pencil, Trash2, ExternalLink } from 'lucide-svelte';
  import * as Icons from 'lucide-svelte';
  import SimpleIcon from '$lib/components/icons/SimpleIcon.svelte';

  interface Props {
    link: Link;
    onEdit: (link: Link) => void;
    onDelete: (link: Link) => void;
    onToggle: (link: Link) => void;
  }

  let { link, onEdit, onDelete, onToggle }: Props = $props();

  // Get icon component by name (for Lucide icons)
  function getLucideIconComponent(iconName: string | null) {
    if (!iconName) return null;
    const pascalName = iconName.charAt(0).toUpperCase() + iconName.slice(1).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    return (Icons as Record<string, any>)[pascalName] || null;
  }

  // Get preset info
  const preset = $derived(link.social_preset ? SOCIAL_PRESETS[link.social_preset as SocialPresetKey] : null);

  // Get display icon info
  const iconName = $derived(preset?.icon || link.icon || 'link');
  const iconSource = $derived(preset?.iconSource || 'lucide');
  const LucideIconComponent = $derived(iconSource === 'lucide' ? getLucideIconComponent(iconName) : null);

  // Get display colors
  const bgColor = $derived(preset?.bgColor || link.custom_bg_color || 'var(--color-primary)');
  const textColor = $derived(preset?.textColor || link.custom_text_color || '#ffffff');
</script>

<div class="link-card" class:inactive={!link.is_active}>
  <div class="drag-handle">
    <GripVertical size={20} />
  </div>

  <div class="link-preview" style="background: {bgColor}; color: {textColor};">
    {#if iconSource === 'simple-icons'}
      <SimpleIcon name={iconName as 'instagram' | 'youtube' | 'x' | 'facebook' | 'github' | 'tiktok' | 'whatsapp'} size={16} />
    {:else if LucideIconComponent}
      <svelte:component this={LucideIconComponent} size={16} />
    {/if}
  </div>

  <div class="link-info">
    <span class="link-title">{link.title}</span>
    <a href={link.url} target="_blank" rel="noopener" class="link-url">
      {link.url}
      <ExternalLink size={12} />
    </a>
  </div>

  <div class="link-actions">
    <Toggle checked={link.is_active} onchange={() => onToggle(link)} />
    <Button variant="ghost" size="sm" onclick={() => onEdit(link)} aria-label="Modifier {link.title}">
      <Pencil size={16} aria-hidden="true" />
    </Button>
    <Button variant="ghost" size="sm" onclick={() => onDelete(link)} aria-label="Supprimer {link.title}">
      <Trash2 size={16} aria-hidden="true" />
    </Button>
  </div>
</div>

<style>
  .link-card {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    transition: all var(--transition-fast);
  }

  .link-card:hover {
    border-color: var(--color-border-hover);
    box-shadow: var(--shadow-sm);
  }

  .link-card.inactive {
    opacity: 0.6;
  }

  .drag-handle {
    cursor: grab;
    color: var(--color-text-muted);
    padding: var(--space-1);
  }

  .drag-handle:hover {
    color: var(--color-text-secondary);
  }

  .link-preview {
    width: 36px;
    height: 36px;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .link-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .link-title {
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    color: var(--color-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .link-url {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: var(--space-1);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .link-url:hover {
    color: var(--color-primary);
  }

  .link-actions {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }
</style>
