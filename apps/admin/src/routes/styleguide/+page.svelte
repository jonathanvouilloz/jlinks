<script lang="ts">
  import { Button, Input, Card, Badge, Toggle, Modal, Toast } from '$lib/components/ui';
  import { Home, Settings, Plus, Trash2, Edit, Check, X, Mail, Link } from 'lucide-svelte';

  // Demo states
  let toggleChecked = $state(false);
  let modalOpen = $state(false);
  let toastVisible = $state(false);
  let toastVariant: 'success' | 'error' | 'warning' | 'info' = $state('success');
  let inputValue = $state('');
</script>

<svelte:head>
  <title>Styleguide | Noko</title>
</svelte:head>

<div class="styleguide">
  <header class="styleguide-header">
    <h1>Noko Styleguide</h1>
    <p class="text-secondary">Component library and design tokens</p>
  </header>

  <!-- Colors -->
  <section class="section">
    <h2>Colors</h2>

    <div class="subsection">
      <h3>Primary</h3>
      <div class="color-grid">
        <div class="color-swatch">
          <div class="swatch" style="background: var(--color-primary)"></div>
          <span>Primary</span>
          <code>#FF6B5B</code>
        </div>
        <div class="color-swatch">
          <div class="swatch" style="background: var(--color-primary-hover)"></div>
          <span>Primary Hover</span>
          <code>#E85A4F</code>
        </div>
        <div class="color-swatch">
          <div class="swatch" style="background: var(--color-primary-light)"></div>
          <span>Primary Light</span>
          <code>#E6FBF5</code>
        </div>
      </div>
    </div>

    <div class="subsection">
      <h3>Semantic</h3>
      <div class="color-grid">
        <div class="color-swatch">
          <div class="swatch" style="background: var(--color-success)"></div>
          <span>Success</span>
          <code>#10B981</code>
        </div>
        <div class="color-swatch">
          <div class="swatch" style="background: var(--color-warning)"></div>
          <span>Warning</span>
          <code>#F59E0B</code>
        </div>
        <div class="color-swatch">
          <div class="swatch" style="background: var(--color-error)"></div>
          <span>Error</span>
          <code>#EF4444</code>
        </div>
      </div>
    </div>

    <div class="subsection">
      <h3>Text</h3>
      <div class="color-grid">
        <div class="color-swatch">
          <div class="swatch" style="background: var(--color-text)"></div>
          <span>Text</span>
          <code>#0F172A</code>
        </div>
        <div class="color-swatch">
          <div class="swatch" style="background: var(--color-text-secondary)"></div>
          <span>Secondary</span>
          <code>#64748B</code>
        </div>
        <div class="color-swatch">
          <div class="swatch" style="background: var(--color-text-muted)"></div>
          <span>Muted</span>
          <code>#94A3B8</code>
        </div>
      </div>
    </div>
  </section>

  <!-- Typography -->
  <section class="section">
    <h2>Typography</h2>
    <div class="typography-samples">
      <p style="font-size: var(--text-xl); font-weight: var(--font-semibold)">
        Page Title (24px / 600)
      </p>
      <p style="font-size: var(--text-lg); font-weight: var(--font-semibold)">
        Section Title (18px / 600)
      </p>
      <p style="font-size: var(--text-sm); font-weight: var(--font-medium)">Label (14px / 500)</p>
      <p style="font-size: var(--text-sm)">Body text (14px / 400)</p>
      <p style="font-size: var(--text-xs); color: var(--color-text-muted)">
        Small / Hint text (12px / 400)
      </p>
    </div>
  </section>

  <!-- Buttons -->
  <section class="section">
    <h2>Buttons</h2>

    <div class="subsection">
      <h3>Variants</h3>
      <div class="component-row">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
      </div>
    </div>

    <div class="subsection">
      <h3>Sizes</h3>
      <div class="component-row">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </div>
    </div>

    <div class="subsection">
      <h3>With Icons</h3>
      <div class="component-row">
        <Button variant="primary"><Plus size={16} /> Add Link</Button>
        <Button variant="secondary"><Edit size={16} /> Edit</Button>
        <Button variant="danger"><Trash2 size={16} /> Delete</Button>
      </div>
    </div>

    <div class="subsection">
      <h3>States</h3>
      <div class="component-row">
        <Button disabled>Disabled</Button>
        <Button loading>Loading</Button>
      </div>
    </div>
  </section>

  <!-- Inputs -->
  <section class="section">
    <h2>Inputs</h2>
    <div class="input-grid">
      <Input label="Default Input" placeholder="Enter text..." bind:value={inputValue} />
      <Input label="With Hint" placeholder="Enter email..." hint="We'll never share your email" />
      <Input label="With Error" placeholder="Enter URL..." error="Invalid URL format" />
      <Input label="Disabled" placeholder="Can't edit this" disabled />
      <Input label="Required Field" placeholder="Required..." required />
      <Input label="Password" type="password" placeholder="Enter password..." />
    </div>
  </section>

  <!-- Cards -->
  <section class="section">
    <h2>Cards</h2>
    <div class="card-grid">
      <Card>
        {#snippet header()}
          <h3>Card with Header</h3>
          <Badge variant="success">Published</Badge>
        {/snippet}
        <p>This is the card body content. Cards are used to group related content.</p>
      </Card>

      <Card variant="hover">
        <p><strong>Hover Card</strong></p>
        <p class="text-secondary">Hover over me to see the effect.</p>
      </Card>

      <Card padding="lg">
        {#snippet header()}
          <h3>Card with Footer</h3>
        {/snippet}
        <p>This card has a footer with actions.</p>
        {#snippet footer()}
          <Button variant="secondary" size="sm">Cancel</Button>
          <Button variant="primary" size="sm">Save</Button>
        {/snippet}
      </Card>
    </div>
  </section>

  <!-- Badges -->
  <section class="section">
    <h2>Badges</h2>
    <div class="component-row">
      <Badge>Default</Badge>
      <Badge variant="success">Published</Badge>
      <Badge variant="warning">Draft</Badge>
      <Badge variant="error">Error</Badge>
      <Badge variant="pro">Pro</Badge>
    </div>
  </section>

  <!-- Toggle -->
  <section class="section">
    <h2>Toggle</h2>
    <div class="component-row">
      <Toggle bind:checked={toggleChecked} label="Enable feature" />
      <span class="text-secondary">Value: {toggleChecked ? 'ON' : 'OFF'}</span>
    </div>
  </section>

  <!-- Modal -->
  <section class="section">
    <h2>Modal</h2>
    <Button onclick={() => (modalOpen = true)}>Open Modal</Button>

    <Modal bind:open={modalOpen} title="Example Modal">
      <p>This is the modal content. You can put any content here.</p>
      <div class="mt-4">
        <Input label="Name" placeholder="Enter your name" />
      </div>
      {#snippet footer()}
        <Button variant="secondary" onclick={() => (modalOpen = false)}>Cancel</Button>
        <Button variant="primary" onclick={() => (modalOpen = false)}>Save</Button>
      {/snippet}
    </Modal>
  </section>

  <!-- Toast -->
  <section class="section">
    <h2>Toast</h2>
    <div class="component-row">
      <Button
        variant="primary"
        onclick={() => {
          toastVariant = 'success';
          toastVisible = true;
        }}>Success Toast</Button
      >
      <Button
        variant="secondary"
        onclick={() => {
          toastVariant = 'error';
          toastVisible = true;
        }}>Error Toast</Button
      >
      <Button
        variant="secondary"
        onclick={() => {
          toastVariant = 'warning';
          toastVisible = true;
        }}>Warning Toast</Button
      >
      <Button
        variant="secondary"
        onclick={() => {
          toastVariant = 'info';
          toastVisible = true;
        }}>Info Toast</Button
      >
    </div>

    <Toast
      bind:visible={toastVisible}
      variant={toastVariant}
      message="This is a {toastVariant} message!"
    />
  </section>

  <!-- Spacing -->
  <section class="section">
    <h2>Spacing Scale</h2>
    <div class="spacing-demo">
      {#each [1, 2, 3, 4, 6, 8, 12] as size}
        <div class="spacing-item">
          <div class="spacing-bar" style="width: calc(var(--space-{size}) * 4)"></div>
          <code>--space-{size}</code>
          <span class="text-muted">{size * 4}px</span>
        </div>
      {/each}
    </div>
  </section>

  <!-- Icons -->
  <section class="section">
    <h2>Icons (Lucide)</h2>
    <p class="text-secondary mb-4">Using lucide-svelte for consistent iconography.</p>
    <div class="icon-grid">
      <div class="icon-item">
        <Home size={24} />
        <span>Home</span>
      </div>
      <div class="icon-item">
        <Settings size={24} />
        <span>Settings</span>
      </div>
      <div class="icon-item">
        <Plus size={24} />
        <span>Plus</span>
      </div>
      <div class="icon-item">
        <Edit size={24} />
        <span>Edit</span>
      </div>
      <div class="icon-item">
        <Trash2 size={24} />
        <span>Trash</span>
      </div>
      <div class="icon-item">
        <Check size={24} />
        <span>Check</span>
      </div>
      <div class="icon-item">
        <X size={24} />
        <span>Close</span>
      </div>
      <div class="icon-item">
        <Mail size={24} />
        <span>Mail</span>
      </div>
      <div class="icon-item">
        <Link size={24} />
        <span>Link</span>
      </div>
    </div>
  </section>
</div>

<style>
  .styleguide {
    max-width: 1000px;
    margin: 0 auto;
    padding: var(--space-8);
  }

  .styleguide-header {
    margin-bottom: var(--space-12);
    padding-bottom: var(--space-6);
    border-bottom: 1px solid var(--color-border);
  }

  .styleguide-header h1 {
    font-size: var(--text-2xl);
    margin-bottom: var(--space-2);
  }

  .section {
    margin-bottom: var(--space-12);
  }

  .section h2 {
    font-size: var(--text-xl);
    margin-bottom: var(--space-6);
    padding-bottom: var(--space-2);
    border-bottom: 1px solid var(--color-border);
  }

  .subsection {
    margin-bottom: var(--space-6);
  }

  .subsection h3 {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
    margin-bottom: var(--space-3);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .component-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3);
  }

  .color-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: var(--space-4);
  }

  .color-swatch {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .swatch {
    width: 100%;
    height: 60px;
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
  }

  .color-swatch span {
    font-size: var(--text-sm);
  }

  .color-swatch code {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
  }

  .typography-samples {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .typography-samples p {
    margin: 0;
  }

  .input-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--space-4);
  }

  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: var(--space-4);
  }

  .spacing-demo {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .spacing-item {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .spacing-bar {
    height: 24px;
    background: var(--color-primary);
    border-radius: var(--radius-sm);
    min-width: 4px;
  }

  .icon-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: var(--space-4);
  }

  .icon-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3);
    border-radius: var(--radius-md);
    color: var(--color-text-secondary);
  }

  .icon-item:hover {
    background: var(--color-sidebar-hover);
    color: var(--color-text);
  }

  .icon-item span {
    font-size: var(--text-xs);
  }

  .text-secondary {
    color: var(--color-text-secondary);
  }

  .text-muted {
    color: var(--color-text-muted);
  }

  .mt-4 {
    margin-top: var(--space-4);
  }

  .mb-4 {
    margin-bottom: var(--space-4);
  }
</style>
