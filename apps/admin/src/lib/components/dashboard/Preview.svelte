<script lang="ts">
  import type { Client, Link, SocialPresetKey } from '@jlinks/shared/types';
  import { SOCIAL_PRESETS } from '@jlinks/shared/social-presets';

  interface Props {
    client: Client | null;
    links: Link[];
  }

  let { client, links }: Props = $props();

  // Calculate text color based on background luminance
  function getTextColorForBackground(bgColor: string): { text: string; muted: string } {
    // Default to light text for gradients/images
    if (!bgColor || !bgColor.startsWith('#')) {
      return { text: '#ffffff', muted: 'rgba(255,255,255,0.7)' };
    }

    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Calculate relative luminance (WCAG formula)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return dark or light text based on background
    if (luminance > 0.5) {
      return { text: '#0f172a', muted: '#64748b' };
    }
    return { text: '#ffffff', muted: 'rgba(255,255,255,0.7)' };
  }

  // Generate preview HTML
  const previewHtml = $derived(generatePreviewHtml(client, links));

  function generatePreviewHtml(client: Client | null, links: Link[]): string {
    if (!client) {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Inter, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: #fafafa;
              color: #64748b;
            }
          </style>
        </head>
        <body>
          <p>Chargement...</p>
        </body>
        </html>
      `;
    }

    const activeLinks = links.filter(l => l.is_active);
    const fontTitle = client.font_title || 'Inter';
    const fontText = client.font_text || 'Inter';
    const primaryColor = client.primary_color || '#00d9a3';
    const bgValue = client.background_value || '#ffffff';
    const bgStyle = client.background_type === 'gradient'
      ? `background: ${bgValue};`
      : client.background_type === 'image'
        ? `background: url(${bgValue}) center/cover no-repeat;`
        : `background: ${bgValue};`;

    // Calculate text colors based on background
    const textColors = client.background_type === 'solid'
      ? getTextColorForBackground(bgValue)
      : { text: '#ffffff', muted: 'rgba(255,255,255,0.7)' };

    const linksHtml = activeLinks.map(link => {
      const preset = link.social_preset ? SOCIAL_PRESETS[link.social_preset as SocialPresetKey] : null;
      // Use primaryColor for 'theme' preset, otherwise use preset color or custom color
      const bgColor = link.social_preset === 'theme'
        ? primaryColor
        : (preset?.bgColor || link.custom_bg_color || primaryColor);
      const textColor = preset?.textColor || link.custom_text_color || '#ffffff';

      return `
        <a href="${link.url}" target="_blank" class="link-btn" style="background: ${bgColor}; color: ${textColor};">
          ${link.title}
        </a>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=${fontTitle.replace(' ', '+')}:wght@400;600&family=${fontText.replace(' ', '+')}:wght@400;500&display=swap" rel="stylesheet">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: '${fontText}', sans-serif;
            min-height: 100vh;
            ${bgStyle}
            padding: 40px 20px;
          }
          .container {
            max-width: 480px;
            margin: 0 auto;
          }
          .profile {
            text-align: center;
            margin-bottom: 32px;
          }
          .profile-image {
            width: 96px;
            height: 96px;
            border-radius: 50%;
            object-fit: cover;
            margin-bottom: 16px;
            border: 3px solid rgba(255,255,255,0.2);
          }
          .profile-name {
            font-family: '${fontTitle}', sans-serif;
            font-size: 24px;
            font-weight: 600;
            color: ${textColors.text};
            margin-bottom: 8px;
          }
          .profile-bio {
            font-size: 14px;
            color: ${textColors.muted};
            line-height: 1.5;
          }
          .links {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
          .link-btn {
            display: block;
            padding: 14px 20px;
            border-radius: 12px;
            text-decoration: none;
            font-weight: 500;
            text-align: center;
            transition: transform 0.15s, box-shadow 0.15s;
          }
          .link-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            font-size: 12px;
            color: ${textColors.muted};
          }
          .footer a {
            color: inherit;
            text-decoration: none;
          }
          .empty-state {
            text-align: center;
            color: ${textColors.muted};
            padding: 40px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="profile">
            ${client.profile_image_url ? `<img src="${client.profile_image_url}" alt="${client.name}" class="profile-image" />` : ''}
            <h1 class="profile-name">${client.name}</h1>
            ${client.bio ? `<p class="profile-bio">${client.bio}</p>` : ''}
          </div>

          <div class="links">
            ${linksHtml || '<div class="empty-state">Aucun lien actif</div>'}
          </div>

          <div class="footer">
            <a href="https://jonlabs.ch">Créé avec jLinks</a>
          </div>
        </div>
      </body>
      </html>
    `;
  }
</script>

<div class="preview-container">
  <div class="preview-header">
    <span class="preview-title">Aperçu</span>
    <span class="preview-badge">Mobile</span>
  </div>
  <div class="preview-frame">
    <iframe
      srcdoc={previewHtml}
      title="Preview"
      sandbox="allow-scripts"
    ></iframe>
  </div>
</div>

<style>
  .preview-container {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .preview-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-3) var(--space-4);
    border-bottom: 1px solid var(--color-border);
    background: var(--color-bg);
  }

  .preview-title {
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    color: var(--color-text);
  }

  .preview-badge {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    padding: var(--space-1) var(--space-2);
    background: var(--color-surface);
    border-radius: var(--radius-full);
  }

  .preview-frame {
    flex: 1;
    display: flex;
    justify-content: center;
    padding: var(--space-4);
    background: #1e293b;
    min-height: 500px;
  }

  .preview-frame iframe {
    width: 375px;
    height: 100%;
    min-height: 600px;
    border: none;
    border-radius: 20px;
    background: white;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  }
</style>
