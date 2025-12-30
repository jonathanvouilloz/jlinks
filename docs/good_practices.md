# jLinks Development Best Practices

This document outlines the coding standards and best practices for the jLinks project to ensure clean, maintainable, and production-ready code.

---

## Project Structure

### Monorepo Organization

```
jlinks/
├── apps/           # Deployable applications
│   ├── api/        # Backend API (Elysia)
│   ├── admin/      # Admin UI (SvelteKit)
│   └── web/        # Public pages (Astro)
├── packages/       # Shared code
│   └── shared/     # Types, utilities, constants
└── docs/           # Documentation
```

### Separation of Concerns

- **apps/api**: Only backend logic, no frontend code
- **apps/admin**: Only admin UI, API calls via fetch
- **apps/web**: Only public pages, static generation
- **packages/shared**: Code used by 2+ apps

---

## Naming Conventions

### Files & Folders

| Type | Convention | Example |
|------|------------|---------|
| Folders | kebab-case | `link-card/` |
| Svelte components | PascalCase | `LinkCard.svelte` |
| TypeScript files | kebab-case | `api-client.ts` |
| CSS files | kebab-case | `variables.css` |
| Route folders (SvelteKit) | kebab-case | `routes/settings/` |

### Code

| Type | Convention | Example |
|------|------------|---------|
| Variables | camelCase | `const userName = 'John'` |
| Functions | camelCase | `function getUserById()` |
| Constants | UPPER_SNAKE_CASE | `const MAX_LINKS = 6` |
| Types/Interfaces | PascalCase | `interface UserProfile` |
| CSS variables | --prefix-name | `--color-primary` |
| Svelte stores | camelCase | `export const userStore` |

### API Routes

| Method | Naming | Example |
|--------|--------|---------|
| GET (list) | plural noun | `GET /clients` |
| GET (single) | singular + id | `GET /clients/:id` |
| POST | plural noun | `POST /clients` |
| PUT | singular + id | `PUT /clients/:id` |
| DELETE | singular + id | `DELETE /clients/:id` |

---

## Code Patterns

### Svelte Components

```svelte
<!-- Component structure order -->
<script lang="ts">
  // 1. Imports
  import { onMount } from 'svelte';
  import Button from '$lib/components/ui/Button.svelte';

  // 2. Props (with types)
  export let title: string;
  export let disabled = false;

  // 3. Local state
  let isLoading = false;

  // 4. Reactive statements
  $: isValid = title.length > 0;

  // 5. Lifecycle
  onMount(() => {
    // ...
  });

  // 6. Functions
  function handleClick() {
    // ...
  }
</script>

<!-- Template -->
<div class="component">
  <h2>{title}</h2>
  <Button on:click={handleClick} {disabled}>
    Click me
  </Button>
</div>

<!-- Styles (scoped) -->
<style>
  .component {
    /* styles */
  }
</style>
```

### Component Export Pattern

```typescript
// apps/admin/src/lib/components/ui/index.ts
export { default as Button } from './Button.svelte';
export { default as Input } from './Input.svelte';
export { default as Card } from './Card.svelte';
export { default as Badge } from './Badge.svelte';
export { default as Toggle } from './Toggle.svelte';
export { default as Modal } from './Modal.svelte';
export { default as Toast } from './Toast.svelte';
```

Usage:
```svelte
<script>
  import { Button, Input, Card } from '$lib/components/ui';
</script>
```

### API Routes (Elysia)

```typescript
// apps/api/src/routes/clients.ts
import { Elysia, t } from 'elysia';
import { db } from '../db';
import { clients } from '../db/schema';
import { authMiddleware } from '../middleware/auth';

export const clientRoutes = new Elysia({ prefix: '/clients' })
  .use(authMiddleware)

  // List all (super-admin only)
  .get('/', async ({ user, error }) => {
    if (user.role !== 'super_admin') {
      return error(403, 'Forbidden');
    }
    return db.select().from(clients);
  })

  // Get own client
  .get('/me', async ({ user }) => {
    return db.query.clients.findFirst({
      where: eq(clients.id, user.clientId)
    });
  })

  // Update own client
  .put('/me', async ({ user, body, error }) => {
    // Validate & update
  }, {
    body: t.Object({
      name: t.Optional(t.String()),
      bio: t.Optional(t.String()),
    })
  });
```

### Database Queries (Drizzle)

```typescript
// Use query builder for reads
const client = await db.query.clients.findFirst({
  where: eq(clients.slug, slug),
  with: {
    links: {
      where: eq(links.is_active, true),
      orderBy: [asc(links.sort_order)]
    }
  }
});

// Use transactions for multi-table operations
await db.transaction(async (tx) => {
  const newClient = await tx.insert(clients).values({...}).returning();
  await tx.insert(users).values({
    clientId: newClient[0].id,
    ...
  });
});
```

---

## State Management

### Svelte Stores

```typescript
// apps/admin/src/lib/stores/auth.ts
import { writable, derived } from 'svelte/store';
import type { User } from '@jlinks/shared';

// Writable store for user data
export const user = writable<User | null>(null);

// Derived store for computed values
export const isAuthenticated = derived(user, ($user) => $user !== null);
export const isSuperAdmin = derived(user, ($user) => $user?.role === 'super_admin');
```

### API State Pattern

```typescript
// Generic API state
interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Usage in component
let state: ApiState<Client> = {
  data: null,
  loading: true,
  error: null
};

async function fetchClient() {
  state.loading = true;
  state.error = null;

  try {
    state.data = await api.get('/clients/me');
  } catch (e) {
    state.error = e.message;
  } finally {
    state.loading = false;
  }
}
```

---

## Error Handling

### API Error Responses

```typescript
// Consistent error format
interface ApiError {
  status: number;
  message: string;
  code?: string;
}

// In Elysia routes
.get('/:id', async ({ params, error }) => {
  const client = await db.query.clients.findFirst({
    where: eq(clients.id, params.id)
  });

  if (!client) {
    return error(404, 'Client not found');
  }

  return client;
})
```

### Frontend Error Handling

```svelte
<script>
  import { toast } from '$lib/stores/toast';

  async function saveClient() {
    try {
      await api.put('/clients/me', data);
      toast.success('Changes saved');
    } catch (e) {
      toast.error(e.message || 'Failed to save');
    }
  }
</script>
```

---

## Security

### Input Validation

```typescript
// Always validate on the server
.post('/', async ({ body, error }) => {
  // Use Elysia's type validation
}, {
  body: t.Object({
    slug: t.String({ minLength: 3, maxLength: 50, pattern: '^[a-z0-9-]+$' }),
    name: t.String({ minLength: 1, maxLength: 100 }),
    email: t.String({ format: 'email' }),
  })
})
```

### Authorization

```typescript
// Check ownership for all client-scoped routes
.put('/links/:id', async ({ user, params, body, error }) => {
  const link = await db.query.links.findFirst({
    where: eq(links.id, params.id)
  });

  // Verify ownership
  if (link?.client_id !== user.clientId) {
    return error(403, 'Forbidden');
  }

  // Proceed with update
})
```

### SQL Injection Prevention

```typescript
// Always use parameterized queries (Drizzle handles this)
// GOOD
const client = await db.query.clients.findFirst({
  where: eq(clients.slug, userInput)
});

// BAD - Never do this
// const result = await db.execute(`SELECT * FROM clients WHERE slug = '${userInput}'`);
```

---

## Performance

### Lazy Loading

```svelte
<!-- Lazy load heavy components -->
{#await import('$lib/components/HeavyComponent.svelte') then { default: Component }}
  <Component />
{/await}
```

### Image Optimization

```typescript
// Validate and limit upload size
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

if (file.size > MAX_SIZE) {
  return error(400, 'File too large');
}

// Validate MIME type
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
if (!ALLOWED_TYPES.includes(file.type)) {
  return error(400, 'Invalid file type');
}
```

### Caching

```typescript
// API cache headers for public routes
.get('/public/clients/:slug', async ({ params, set }) => {
  set.headers['Cache-Control'] = 'public, max-age=60, stale-while-revalidate=300';

  return db.query.clients.findFirst({
    where: eq(clients.slug, params.slug)
  });
})
```

---

## Git Workflow

### Commit Messages

Follow Conventional Commits:

```
feat: add QR code generation
fix: correct link reordering bug
docs: update API documentation
style: format CSS variables
refactor: extract auth middleware
test: add client CRUD tests
chore: update dependencies
```

### Branch Naming

```
feature/qr-code-generation
fix/link-reorder-bug
docs/api-documentation
refactor/auth-middleware
```

### Pull Request Template

```markdown
## Summary
Brief description of changes

## Changes
- Change 1
- Change 2

## Testing
- [ ] Manual testing completed
- [ ] No console errors
- [ ] Responsive design verified

## Screenshots
(if applicable)
```

---

## Code Organization Tips

### Keep Files Small
- Components: < 200 lines
- Functions: < 50 lines
- Files: < 300 lines

### Single Responsibility
- Each component does one thing
- Each function does one thing
- Each file has one purpose

### Avoid Deep Nesting
```typescript
// BAD
if (user) {
  if (user.role === 'admin') {
    if (user.isActive) {
      // do something
    }
  }
}

// GOOD
if (!user) return;
if (user.role !== 'admin') return;
if (!user.isActive) return;
// do something
```

### Use Early Returns
```typescript
// BAD
function process(data) {
  if (data) {
    // 50 lines of code
  }
}

// GOOD
function process(data) {
  if (!data) return null;
  // 50 lines of code
}
```

---

## Environment Variables

### Naming

```bash
# Public (exposed to client)
PUBLIC_API_URL=https://api.links.jonlabs.ch

# Private (server only)
DATABASE_URL=file:/data/jlinks.db
BETTER_AUTH_SECRET=xxx
VERCEL_DEPLOY_HOOK=xxx
```

### Loading

```typescript
// Validate required env vars at startup
const requiredEnvVars = [
  'DATABASE_URL',
  'BETTER_AUTH_SECRET',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}
```

---

## Documentation

### Code Comments

```typescript
// Only comment "why", not "what"

// BAD
// Increment counter by 1
counter++;

// GOOD
// Rate limiter requires a delay to prevent API abuse
await delay(100);
```

### JSDoc for Public APIs

```typescript
/**
 * Generates a vCard string from contact data
 * @param data - Contact information
 * @returns VCard 3.0 formatted string
 */
export function generateVCard(data: VCardData): string {
  // ...
}
```
