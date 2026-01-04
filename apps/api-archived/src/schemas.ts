import { z } from 'zod';

// ============================================
// AUTH SCHEMAS
// ============================================

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8),
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1),
});

// ============================================
// CLIENT SCHEMAS
// ============================================

export const clientIdParamSchema = z.object({
  id: z.string(),
});

export const createClientSchema = z.object({
  slug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8),
});

export const updateClientSchema = z.object({
  slug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/).optional(),
  name: z.string().min(1).max(100).optional(),
  plan: z.enum(['free', 'pro']).optional(),
});

export const updateClientMeSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  meta_title: z.string().max(60).optional(),
  meta_description: z.string().max(160).optional(),
});

export const updateClientSettingsSchema = z.object({
  primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  secondary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  button_opacity: z.number().min(0).max(100).optional(),
  background_type: z.enum(['solid', 'gradient', 'image']).optional(),
  background_value: z.string().optional(),
  outer_background_color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  font_preset: z.union([z.string(), z.null()]).optional(),
  font_title: z.string().optional(),
  font_text: z.string().optional(),
  layout_type: z.enum(['list', 'cards', 'grid', 'premium']).optional(),
  button_style: z.enum(['rounded', 'pill', 'square', 'soft', 'outline']).optional(),
});

export const updateVcardSchema = z.object({
  vcard_enabled: z.boolean().optional(),
  vcard_name: z.string().optional(),
  vcard_email: z.string().optional(),
  vcard_phone: z.string().optional(),
  vcard_company: z.string().optional(),
  vcard_website: z.string().optional(),
});

export const updateBrandingSchema = z.object({
  logo_url: z.union([z.string().regex(/^https?:\/\/.+/), z.literal('')]).optional(),
  profile_image_url: z.union([z.string().regex(/^https?:\/\/.+/), z.literal('')]).optional(),
});

// ============================================
// LINK SCHEMAS
// ============================================

export const linkIdParamSchema = z.object({
  id: z.string(),
});

export const createLinkSchema = z.object({
  title: z.string().min(1).max(100),
  url: z.string().min(1),
  description: z.string().max(200).optional(),
  icon: z.string().optional(),
  thumbnail_url: z.string().optional(),
  social_preset: z.string().optional(),
  custom_bg_color: z.string().optional(),
  custom_text_color: z.string().optional(),
});

export const updateLinkSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  url: z.string().min(1).optional(),
  description: z.string().max(200).optional(),
  icon: z.string().optional(),
  thumbnail_url: z.string().optional(),
  social_preset: z.string().optional(),
  custom_bg_color: z.string().optional(),
  custom_text_color: z.string().optional(),
  is_active: z.boolean().optional(),
});

export const reorderLinksSchema = z.object({
  order: z.array(
    z.object({
      id: z.string(),
      sort_order: z.number(),
    })
  ),
});

// ============================================
// PUBLIC SCHEMAS
// ============================================

export const slugParamSchema = z.object({
  slug: z.string(),
});

// ============================================
// QRCODE SCHEMAS
// ============================================

export const qrcodeParamSchema = z.object({
  format: z.string(),
});

export const qrcodeQuerySchema = z.object({
  size: z.string().optional(),
  preview: z.string().optional(),
});
