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

  // Convert hex to rgba with opacity
  function hexToRgba(hex: string, alpha: number): string {
    if (!hex || !hex.startsWith('#')) return hex;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha / 100})`;
  }

  // SVG icons for social presets
  function getIconSvg(iconName: string, size: number = 24): string {
    const icons: Record<string, string> = {
      instagram: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`,
      youtube: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>`,
      linkedin: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>`,
      twitter: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z"></path><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path></svg>`,
      music: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>`,
      facebook: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>`,
      github: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>`,
      mail: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`,
      'message-circle': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>`,
      palette: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5"></circle><circle cx="17.5" cy="10.5" r=".5"></circle><circle cx="8.5" cy="7.5" r=".5"></circle><circle cx="6.5" cy="12.5" r=".5"></circle><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z"></path></svg>`,
      globe: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`,
      link: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`,
    };
    return icons[iconName] || icons['link'];
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

    // Route to layout-specific generators
    switch (client.layout_type) {
      case 'premium':
        return generatePremiumHtml(client, activeLinks, fontTitle, fontText, primaryColor);
      case 'cards':
        return generateCardsHtml(client, activeLinks, fontTitle, fontText, primaryColor);
      case 'grid':
        return generateGridHtml(client, activeLinks, fontTitle, fontText, primaryColor);
    }

    // Default: list layout
    const bgValue = client.background_value || '#ffffff';
    const bgStyle = client.background_type === 'gradient'
      ? `background: ${bgValue};`
      : client.background_type === 'image'
        ? `background: url('${bgValue}') center/cover no-repeat;`
        : `background: ${bgValue};`;

    // Calculate text colors based on background
    const textColors = client.background_type === 'solid'
      ? getTextColorForBackground(bgValue)
      : { text: '#ffffff', muted: 'rgba(255,255,255,0.7)' };

    const buttonOpacity = client.button_opacity ?? 100;
    const linksHtml = activeLinks.map(link => {
      const preset = link.social_preset ? SOCIAL_PRESETS[link.social_preset as SocialPresetKey] : null;
      // Use primaryColor for 'theme' preset, otherwise use preset color or custom color
      const bgColor = link.social_preset === 'theme'
        ? primaryColor
        : (preset?.bgColor || link.custom_bg_color || primaryColor);
      const bgStyle = buttonOpacity < 100 && bgColor.startsWith('#') ? hexToRgba(bgColor, buttonOpacity) : bgColor;
      const textColor = preset?.textColor || link.custom_text_color || '#ffffff';

      return `
        <a href="${link.url}" target="_blank" class="link-btn" style="background: ${bgStyle}; color: ${textColor};">
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
          .vcard-button {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            border-radius: 2rem;
            font-size: 0.875rem;
            font-weight: 500;
            border: 1px solid currentColor;
            opacity: 0.8;
            margin: 2rem auto 0;
            color: ${textColors.muted};
            text-decoration: none;
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

          ${client.vcard_enabled ? `
            <a href="#" class="vcard-button" onclick="return false;">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/>
                <line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
              Ajouter aux contacts
            </a>
          ` : ''}

          <div class="footer">
            <a href="https://jonlabs.ch">Créé avec jLinks</a>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  function generatePremiumHtml(client: Client, links: Link[], fontTitle: string, fontText: string, primaryColor: string): string {
    const buttonOpacity = client.button_opacity ?? 100;
    const linksHtml = links.map(link => {
      const preset = link.social_preset && link.social_preset !== 'theme'
        ? SOCIAL_PRESETS[link.social_preset as SocialPresetKey]
        : null;
      const iconBgColor = link.social_preset === 'theme'
        ? primaryColor
        : (preset?.bgColor || link.custom_bg_color || primaryColor);
      const iconBgStyle = buttonOpacity < 100 && iconBgColor.startsWith('#') ? hexToRgba(iconBgColor, buttonOpacity) : iconBgColor;

      return `
        <a href="${link.url}" target="_blank" class="premium-link-card">
          <span class="premium-link-icon" style="background: ${iconBgStyle};">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </span>
          <div class="premium-link-content">
            <span class="premium-link-title">${link.title}</span>
            ${link.description ? `<span class="premium-link-description">${link.description}</span>` : ''}
          </div>
          <span class="premium-link-arrow">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </span>
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
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: '${fontText}', sans-serif;
            min-height: 100vh;
            background: #0A0A0A;
            display: flex;
            justify-content: center;
            padding: 24px 12px;
          }
          .premium-glass {
            max-width: 100%;
            width: 100%;
            background: #141414;
            border-radius: 20px;
            padding: 24px 16px;
            border: 1px solid #1F1F1F;
          }
          .profile {
            text-align: center;
            margin-bottom: 24px;
          }
          .profile-image {
            width: 96px;
            height: 96px;
            border-radius: 50%;
            object-fit: cover;
            margin-bottom: 12px;
            border: 3px solid rgba(255,255,255,0.15);
          }
          .profile-name {
            font-family: '${fontTitle}', sans-serif;
            font-size: 22px;
            font-weight: 600;
            color: #ffffff;
            margin-bottom: 8px;
          }
          .profile-bio {
            font-size: 13px;
            color: rgba(255, 255, 255, 0.65);
            line-height: 1.5;
          }
          .premium-links {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          .premium-link-card {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 6px;
            background: #2A2A2A;
            border-radius: 12px;
            text-decoration: none;
            transition: background 0.2s;
          }
          .premium-link-card:hover {
            background: #3C3C3C;
          }
          .premium-link-icon {
            width: 38px;
            height: 38px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            color: #ffffff;
          }
          .premium-link-icon svg {
            width: 20px;
            height: 20px;
          }
          .premium-link-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 2px;
            min-width: 0;
          }
          .premium-link-title {
            font-weight: 500;
            font-size: 14px;
            color: #ffffff;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .premium-link-description {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.5);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .premium-link-arrow {
            color: #636363;
            flex-shrink: 0;
          }
          .footer {
            text-align: center;
            margin-top: 24px;
            font-size: 11px;
            color: rgba(255, 255, 255, 0.4);
          }
          .footer a {
            color: rgba(255, 255, 255, 0.4);
            text-decoration: none;
          }
          .empty-state {
            text-align: center;
            color: rgba(255, 255, 255, 0.5);
            padding: 32px;
          }
          .vcard-wrapper {
            text-align: center;
            margin-top: 1.5rem;
          }
          .vcard-button {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            background: transparent;
            border: none;
            color: #636363;
            font-size: 0.75rem;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="premium-glass">
          <div class="profile">
            ${client.profile_image_url ? `<img src="${client.profile_image_url}" alt="${client.name}" class="profile-image" />` : ''}
            <h1 class="profile-name">${client.name}</h1>
            ${client.bio ? `<p class="profile-bio">${client.bio}</p>` : ''}
          </div>
          <div class="premium-links">
            ${linksHtml || '<div class="empty-state">Aucun lien actif</div>'}
          </div>
          ${client.vcard_enabled ? `
            <div class="vcard-wrapper">
              <a href="#" class="vcard-button" onclick="return false;">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <line x1="19" y1="8" x2="19" y2="14"/>
                  <line x1="22" y1="11" x2="16" y2="11"/>
                </svg>
                Ajouter aux contacts
              </a>
            </div>
          ` : ''}
          <div class="footer">
            <a href="https://jonlabs.ch">Créé avec jLinks</a>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  function generateCardsHtml(client: Client, links: Link[], fontTitle: string, fontText: string, primaryColor: string): string {
    const bgValue = client.background_value || '#ffffff';
    const pageBgStyle = client.background_type === 'gradient'
      ? `background: ${bgValue};`
      : client.background_type === 'image'
        ? `background: url('${bgValue}') center/cover no-repeat;`
        : `background: ${bgValue};`;

    const textColors = client.background_type === 'solid'
      ? getTextColorForBackground(bgValue)
      : { text: '#ffffff', muted: 'rgba(255,255,255,0.7)' };

    const buttonOpacity = client.button_opacity ?? 100;
    const linksHtml = links.map(link => {
      const preset = link.social_preset ? SOCIAL_PRESETS[link.social_preset as SocialPresetKey] : null;
      const bgColor = link.social_preset === 'theme'
        ? primaryColor
        : (preset?.bgColor || link.custom_bg_color || primaryColor);
      const bgStyle = buttonOpacity < 100 && bgColor.startsWith('#') ? hexToRgba(bgColor, buttonOpacity) : bgColor;
      const textColor = preset?.textColor || link.custom_text_color || '#ffffff';
      const iconName = link.icon || preset?.icon || 'link';

      return `
        <a href="${link.url}" target="_blank" class="link-card" style="background: ${bgStyle}; color: ${textColor};">
          <span class="link-card-icon">${getIconSvg(iconName, 32)}</span>
          <span class="link-card-title">${link.title}</span>
          ${link.description ? `<span class="link-card-description">${link.description}</span>` : ''}
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
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: '${fontText}', sans-serif;
            min-height: 100vh;
            ${pageBgStyle}
            padding: 40px 20px;
          }
          .container { max-width: 480px; margin: 0 auto; }
          .profile { text-align: center; margin-bottom: 32px; }
          .profile-image {
            width: 96px; height: 96px; border-radius: 50%;
            object-fit: cover; margin-bottom: 16px;
            border: 3px solid rgba(255,255,255,0.2);
          }
          .profile-name {
            font-family: '${fontTitle}', sans-serif;
            font-size: 24px; font-weight: 600;
            color: ${textColors.text}; margin-bottom: 8px;
          }
          .profile-bio {
            font-size: 14px; color: ${textColors.muted}; line-height: 1.5;
          }
          .links-cards {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }
          .link-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 1.5rem 1rem;
            border-radius: 0.75rem;
            text-align: center;
            text-decoration: none;
            transition: transform 0.15s ease, box-shadow 0.15s ease;
          }
          .link-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          }
          .link-card-icon {
            width: 32px; height: 32px; margin-bottom: 0.75rem;
            display: flex; align-items: center; justify-content: center;
          }
          .link-card-title { font-size: 0.875rem; font-weight: 500; }
          .link-card-description {
            font-size: 0.75rem; opacity: 0.7; margin-top: 0.25rem;
          }
          .footer {
            text-align: center; margin-top: 40px;
            font-size: 12px; color: ${textColors.muted};
          }
          .footer a { color: inherit; text-decoration: none; }
          .empty-state {
            text-align: center; color: ${textColors.muted};
            padding: 40px; grid-column: 1 / -1;
          }
          .vcard-button {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            border-radius: 2rem;
            font-size: 0.875rem;
            font-weight: 500;
            border: 1px solid currentColor;
            opacity: 0.8;
            margin: 2rem auto 0;
            color: ${textColors.muted};
            text-decoration: none;
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
          <div class="links-cards">
            ${linksHtml || '<div class="empty-state">Aucun lien actif</div>'}
          </div>
          ${client.vcard_enabled ? `
            <a href="#" class="vcard-button" onclick="return false;">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/>
                <line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
              Ajouter aux contacts
            </a>
          ` : ''}
          <div class="footer">
            <a href="https://jonlabs.ch">Créé avec jLinks</a>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  function generateGridHtml(client: Client, links: Link[], fontTitle: string, fontText: string, primaryColor: string): string {
    const bgValue = client.background_value || '#ffffff';
    const pageBgStyle = client.background_type === 'gradient'
      ? `background: ${bgValue};`
      : client.background_type === 'image'
        ? `background: url('${bgValue}') center/cover no-repeat;`
        : `background: ${bgValue};`;

    const textColors = client.background_type === 'solid'
      ? getTextColorForBackground(bgValue)
      : { text: '#ffffff', muted: 'rgba(255,255,255,0.7)' };

    const buttonOpacity = client.button_opacity ?? 100;
    const linksHtml = links.map(link => {
      const preset = link.social_preset ? SOCIAL_PRESETS[link.social_preset as SocialPresetKey] : null;
      const bgColor = link.social_preset === 'theme'
        ? primaryColor
        : (preset?.bgColor || link.custom_bg_color || primaryColor);
      const bgStyle = buttonOpacity < 100 && bgColor.startsWith('#') ? hexToRgba(bgColor, buttonOpacity) : bgColor;
      const textColor = preset?.textColor || link.custom_text_color || '#ffffff';
      const iconName = link.icon || preset?.icon || 'link';

      return `
        <a href="${link.url}" target="_blank" class="link-grid-item" style="background: ${bgStyle}; color: ${textColor};" title="${link.title}">
          <span class="link-grid-icon">${getIconSvg(iconName, 28)}</span>
          <span class="link-grid-title">${link.title}</span>
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
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: '${fontText}', sans-serif;
            min-height: 100vh;
            ${pageBgStyle}
            padding: 40px 20px;
          }
          .container { max-width: 480px; margin: 0 auto; }
          .profile { text-align: center; margin-bottom: 32px; }
          .profile-image {
            width: 96px; height: 96px; border-radius: 50%;
            object-fit: cover; margin-bottom: 16px;
            border: 3px solid rgba(255,255,255,0.2);
          }
          .profile-name {
            font-family: '${fontTitle}', sans-serif;
            font-size: 24px; font-weight: 600;
            color: ${textColors.text}; margin-bottom: 8px;
          }
          .profile-bio {
            font-size: 14px; color: ${textColors.muted}; line-height: 1.5;
          }
          .links-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0.75rem;
          }
          .link-grid-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            aspect-ratio: 1;
            border-radius: 1rem;
            text-align: center;
            text-decoration: none;
            padding: 1rem;
            transition: transform 0.15s ease;
          }
          .link-grid-item:hover {
            transform: scale(1.05);
          }
          .link-grid-icon {
            width: 28px; height: 28px; margin-bottom: 0.5rem;
            display: flex; align-items: center; justify-content: center;
          }
          .link-grid-title {
            font-size: 0.75rem; font-weight: 500;
            white-space: nowrap; overflow: hidden;
            text-overflow: ellipsis; max-width: 100%;
          }
          .footer {
            text-align: center; margin-top: 40px;
            font-size: 12px; color: ${textColors.muted};
          }
          .footer a { color: inherit; text-decoration: none; }
          .empty-state {
            text-align: center; color: ${textColors.muted};
            padding: 40px; grid-column: 1 / -1;
          }
          .vcard-button {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            border-radius: 2rem;
            font-size: 0.875rem;
            font-weight: 500;
            border: 1px solid currentColor;
            opacity: 0.8;
            margin: 2rem auto 0;
            color: ${textColors.muted};
            text-decoration: none;
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
          <div class="links-grid">
            ${linksHtml || '<div class="empty-state">Aucun lien actif</div>'}
          </div>
          ${client.vcard_enabled ? `
            <a href="#" class="vcard-button" onclick="return false;">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/>
                <line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
              Ajouter aux contacts
            </a>
          ` : ''}
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
