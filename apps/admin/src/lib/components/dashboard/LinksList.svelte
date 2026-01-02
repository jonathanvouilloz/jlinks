<script lang="ts">
  import type { Link } from '@noko/shared/types';
  import { dndzone } from 'svelte-dnd-action';
  import { flip } from 'svelte/animate';
  import LinkCard from './LinkCard.svelte';

  interface Props {
    links: Link[];
    onEdit: (link: Link) => void;
    onDelete: (link: Link) => void;
    onToggle: (link: Link) => void;
    onReorder: (order: Array<{ id: string; sort_order: number }>) => void;
  }

  let { links, onEdit, onDelete, onToggle, onReorder }: Props = $props();

  // Local copy for drag and drop
  let items = $state<Link[]>([]);

  // Sync items with links prop
  $effect(() => {
    items = [...links];
  });

  // Handle drag and drop
  function handleDndConsider(e: CustomEvent<{ items: Link[] }>) {
    items = e.detail.items;
  }

  function handleDndFinalize(e: CustomEvent<{ items: Link[] }>) {
    items = e.detail.items;
    // Create order array with new sort_order values
    const order = items.map((item, index) => ({
      id: item.id,
      sort_order: index,
    }));
    onReorder(order);
  }

  const flipDurationMs = 200;
</script>

<div
  class="links-list"
  role="list"
  aria-label="Liste des liens - Glissez pour réorganiser"
  use:dndzone={{ items, flipDurationMs, dropTargetStyle: {} }}
  onconsider={handleDndConsider}
  onfinalize={handleDndFinalize}
>
  {#each items as link (link.id)}
    <div role="listitem" animate:flip={{ duration: flipDurationMs }}>
      <LinkCard {link} {onEdit} {onDelete} {onToggle} />
    </div>
  {/each}
</div>

<style>
  .links-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
</style>
