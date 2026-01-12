import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { put, del } from '@vercel/blob';
import { db, clients } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { getSession, requireClient } from '$lib/server/auth/session';
import { env } from '$env/dynamic/private';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export const POST: RequestHandler = async (event) => {
  const sessionData = await getSession(event);
  const authError = requireClient(sessionData);
  if (authError) return authError;

  const client = sessionData.client!;

  try {
    const formData = await event.request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return json({ error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF' }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return json({ error: 'File too large. Maximum size: 5MB' }, { status: 400 });
    }

    // Delete old image if exists
    if (client.profile_image_url && client.profile_image_url.includes('vercel-storage.com')) {
      try {
        await del(client.profile_image_url, { token: env.BLOB_READ_WRITE_TOKEN });
      } catch (e) {
        // Ignore deletion errors for old files
        console.warn('Failed to delete old image:', e);
      }
    }

    // Generate unique filename (always .webp since client compresses to WebP)
    const filename = `profiles/${client.id}/${Date.now()}.webp`;

    // Upload to Vercel Blob (always WebP from client compression)
    const blob = await put(filename, file, {
      access: 'public',
      contentType: 'image/webp',
      token: env.BLOB_READ_WRITE_TOKEN,
    });

    // Update client profile_image_url
    const [updated] = await db
      .update(clients)
      .set({
        profile_image_url: blob.url,
        has_draft_changes: true,
        updated_at: new Date().toISOString(),
      })
      .where(eq(clients.id, client.id))
      .returning();

    return json({
      success: true,
      url: blob.url,
      client: updated,
    });
  } catch (error) {
    console.error('Upload error:', error);
    const message = error instanceof Error ? error.message : 'Upload failed';
    return json({ error: message }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async (event) => {
  const sessionData = await getSession(event);
  const authError = requireClient(sessionData);
  if (authError) return authError;

  const client = sessionData.client!;

  try {
    // Delete from Vercel Blob if URL is from Vercel storage
    if (client.profile_image_url && client.profile_image_url.includes('vercel-storage.com')) {
      await del(client.profile_image_url, { token: env.BLOB_READ_WRITE_TOKEN });
    }

    // Clear profile_image_url in database
    const [updated] = await db
      .update(clients)
      .set({
        profile_image_url: null,
        has_draft_changes: true,
        updated_at: new Date().toISOString(),
      })
      .where(eq(clients.id, client.id))
      .returning();

    return json({
      success: true,
      client: updated,
    });
  } catch (error) {
    console.error('Delete error:', error);
    return json({ error: 'Delete failed' }, { status: 500 });
  }
};
