// Client types
export interface Client {
  id: string;
  slug: string;
  name: string;

  // Branding
  logo_url: string | null;
  profile_image_url: string | null;
  profile_image_size: number;
  profile_image_shape: ProfileImageShape;

  // Colors
  primary_color: string;
  secondary_color: string;
  button_opacity: number; // 0-100
  background_type: BackgroundType;
  background_value: string;
  outer_background_color: string;

  // Typography
  font_preset: string | null;
  font_title: string;
  font_text: string;

  // Layout
  layout_type: LayoutType;
  button_style: ButtonStyle;

  // Meta
  bio: string | null;
  meta_title: string | null;
  meta_description: string | null;

  // Status
  is_published: boolean;
  has_draft_changes: boolean;

  // vCard
  vcard_enabled: boolean;
  vcard_name: string | null;
  vcard_email: string | null;
  vcard_phone: string | null;
  vcard_company: string | null;
  vcard_website: string | null;

  // Plan
  plan: PlanType;
  plan_expires_at: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface ClientSettings {
  primary_color?: string;
  secondary_color?: string;
  button_opacity?: number; // 0-100
  background_type?: BackgroundType;
  background_value?: string;
  outer_background_color?: string;
  font_preset?: string | null;
  font_title?: string;
  font_text?: string;
  layout_type?: LayoutType;
  button_style?: ButtonStyle;
  bio?: string;
  meta_title?: string;
  meta_description?: string;
}

// Link types
export interface Link {
  id: string;
  client_id: string;

  // Content
  title: string;
  url: string;
  description: string | null;

  // Appearance
  icon: string | null;
  thumbnail_url: string | null;

  // Social preset
  social_preset: SocialPresetKey | null;

  // Custom styling
  custom_bg_color: string | null;
  custom_text_color: string | null;

  // State
  is_active: boolean;
  sort_order: number;
  is_draft: boolean;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface CreateLinkInput {
  title: string;
  url: string;
  description?: string;
  icon?: string;
  thumbnail_url?: string;
  social_preset?: SocialPresetKey;
  custom_bg_color?: string;
  custom_text_color?: string;
}

export interface UpdateLinkInput extends Partial<CreateLinkInput> {
  is_active?: boolean;
}

export interface ReorderLinksInput {
  order: Array<{ id: string; sort_order: number }>;
}

// User types
export interface User {
  id: string;
  email: string;
  client_id: string | null;
  role: UserRole;
  created_at: string;
}

export type UserRole = 'client' | 'super_admin';

// Session type
export interface Session {
  user: User;
  client: Client | null;
}

// Enums
export type BackgroundType = 'solid' | 'gradient' | 'image';
export type LayoutType = 'list' | 'cards' | 'grid' | 'premium';
export type ButtonStyle = 'rounded' | 'pill' | 'square' | 'soft' | 'outline' | 'outline-icon';
export type PlanType = 'free' | 'pro';
export type ProfileImageShape = 'round' | 'rounded' | 'square';

// Social preset keys
export type SocialPresetKey =
  | 'theme'
  | 'instagram'
  | 'youtube'
  | 'linkedin'
  | 'x'
  | 'tiktok'
  | 'facebook'
  | 'github'
  | 'email'
  | 'whatsapp';

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  status: number;
  message: string;
  code?: string;
}

// Publish types
export interface PublishStatus {
  hasDraftChanges: boolean;
  isPublished: boolean;
  lastPublishedAt: string | null;
}

export interface PublishResponse {
  status: 'building' | 'done' | 'error';
  message: string;
}

// vCard types
export interface VCardData {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  website?: string;
}

// Analytics types (future)
export interface LinkClick {
  id: string;
  link_id: string;
  clicked_at: string;
  referrer: string | null;
  user_agent: string | null;
  country: string | null;
}

export interface PageView {
  id: string;
  client_id: string;
  viewed_at: string;
  referrer: string | null;
  user_agent: string | null;
  country: string | null;
}
