import { z } from 'zod';
import * as m from '$lib/paraglide/messages';

// ============================================
// AUTH SCHEMAS
// ============================================

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Function to get the register base schema with translated messages
export function getRegisterBaseSchema() {
  return z.object({
    email: z.string().email(m.error_email_invalid()),
    password: z.string().min(8, m.error_password_min()),
    confirmPassword: z.string().min(1, m.error_confirm_password_required()),
    slug: z.string()
      .min(3, m.error_slug_min())
      .max(50, m.error_slug_max())
      .regex(/^[a-z0-9-]+$/, m.error_slug_format()),
    socialLinks: z.array(z.object({
      url: z.string().url(m.error_url_invalid()),
      title: z.string().min(1, m.error_title_required()),
      socialPreset: z.enum([
        'instagram', 'youtube', 'linkedin', 'x',
        'tiktok', 'facebook', 'github', 'email', 'whatsapp', 'theme'
      ]).optional(),
    })).max(5).optional(),
  });
}

// Static version for backward compatibility
export const registerBaseSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caracteres'),
  confirmPassword: z.string().min(1, 'Confirmez le mot de passe'),
  slug: z.string()
    .min(3, 'Minimum 3 caracteres')
    .max(50, 'Maximum 50 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Uniquement lettres minuscules, chiffres et tirets'),
  socialLinks: z.array(z.object({
    url: z.string().url('URL invalide'),
    title: z.string().min(1, 'Titre requis'),
    socialPreset: z.enum([
      'instagram', 'youtube', 'linkedin', 'x',
      'tiktok', 'facebook', 'github', 'email', 'whatsapp', 'theme'
    ]).optional(),
  })).max(5).optional(),
});

// Function to get register schema with translated messages
export function getRegisterSchema() {
  return getRegisterBaseSchema().refine((data) => data.password === data.confirmPassword, {
    message: m.auth_register_error_passwords_mismatch(),
    path: ['confirmPassword'],
  });
}

export const registerSchema = registerBaseSchema.refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

// Function to get server schema with translated messages
export function getRegisterServerSchema() {
  return z.object({
    email: z.string().email(m.error_email_invalid()),
    password: z.string().min(8, m.error_password_min()),
    slug: z.string()
      .min(3, m.error_slug_min())
      .max(50, m.error_slug_max())
      .regex(/^[a-z0-9-]+$/, m.error_slug_format()),
    socialLinks: z.array(z.object({
      url: z.string().url(m.error_url_invalid()),
      title: z.string().min(1, m.error_title_required()),
      socialPreset: z.enum([
        'instagram', 'youtube', 'linkedin', 'x',
        'tiktok', 'facebook', 'github', 'email', 'whatsapp', 'theme'
      ]).optional(),
    })).max(5).optional(),
  });
}

// Schema for server validation (without confirmPassword) - static version for backward compatibility
export const registerServerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caracteres'),
  slug: z.string()
    .min(3, 'Minimum 3 caracteres')
    .max(50, 'Maximum 50 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Uniquement lettres minuscules, chiffres et tirets'),
  socialLinks: z.array(z.object({
    url: z.string().url('URL invalide'),
    title: z.string().min(1, 'Titre requis'),
    socialPreset: z.enum([
      'instagram', 'youtube', 'linkedin', 'x',
      'tiktok', 'facebook', 'github', 'email', 'whatsapp', 'theme'
    ]).optional(),
  })).max(5).optional(),
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
  button_style: z.enum(['rounded', 'pill', 'square', 'soft', 'outline', 'outline-icon']).optional(),
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
  profile_image_size: z.number().min(60).max(200).optional(),
  profile_image_shape: z.enum(['round', 'rounded', 'square']).optional(),
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
