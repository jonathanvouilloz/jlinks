<script lang="ts">
  import type { Client, Link, SocialPresetKey } from '@noko/shared/types';
  import { SOCIAL_PRESETS } from '@noko/shared/social-presets';

  interface Props {
    client: Client | null;
    links: Link[];
  }

  let { client, links }: Props = $props();

  // Debounced preview HTML for smoother updates
  let debouncedHtml = $state('');
  let debounceTimer: ReturnType<typeof setTimeout>;

  $effect(() => {
    const html = generatePreviewHtml(client, links);
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      debouncedHtml = html;
    }, 150);

    return () => clearTimeout(debounceTimer);
  });

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

  // Get border-radius based on button style
  function getButtonRadius(style: string | undefined): string {
    switch (style) {
      case 'pill': return '50px';
      case 'square': return '4px';
      case 'soft': return '16px';
      case 'outline': return '8px';
      case 'outline-icon': return '8px';
      case 'rounded':
      default: return '8px';
    }
  }

  // Check if button style is outline (includes outline-icon)
  function isOutlineStyle(style: string | undefined): boolean {
    return style === 'outline' || style === 'outline-icon';
  }

  // Official brand SVGs (Simple Icons) for social platforms
  function getBrandIconSvg(iconName: string, size: number = 24): string | null {
    const brandIcons: Record<string, string> = {
      // Instagram - Official brand icon
      instagram: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor"><path d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077"/></svg>`,
      // YouTube - Official brand icon
      youtube: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
      // LinkedIn - Official brand icon
      linkedin: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
      // X (Twitter) - Official brand icon
      x: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>`,
      // TikTok - Official brand icon
      tiktok: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>`,
      // Facebook - Official brand icon
      facebook: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 36.6 36.6 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/></svg>`,
      // GitHub - Official brand icon
      github: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>`,
      // WhatsApp - Official brand icon
      whatsapp: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>`,
    };
    return brandIcons[iconName] || null;
  }

  // Lucide-style stroke icons for generic/non-brand icons
  function getLucideIconSvg(iconName: string, size: number = 24): string {
    const icons: Record<string, string> = {
      music: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>`,
      mail: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`,
      'message-circle': `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>`,
      palette: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5"></circle><circle cx="17.5" cy="10.5" r=".5"></circle><circle cx="8.5" cy="7.5" r=".5"></circle><circle cx="6.5" cy="12.5" r=".5"></circle><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z"></path></svg>`,
      globe: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`,
      link: `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`,
    };
    return icons[iconName] || icons['link'];
  }

  // Get icon SVG - prioritize brand icons, fall back to Lucide
  function getIconSvg(iconName: string, size: number = 24): string {
    const brandIcon = getBrandIconSvg(iconName, size);
    if (brandIcon) return brandIcon;
    return getLucideIconSvg(iconName, size);
  }

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
    const primaryColor = client.primary_color || '#FF6B5B';

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
    const buttonRadius = getButtonRadius(client.button_style);
    const isOutline = isOutlineStyle(client.button_style);
    const linksHtml = activeLinks.map(link => {
      const preset = link.social_preset ? SOCIAL_PRESETS[link.social_preset as SocialPresetKey] : null;
      // Use primaryColor for 'theme' preset, otherwise use preset color or custom color
      const bgColor = link.social_preset === 'theme'
        ? primaryColor
        : (preset?.bgColor || link.custom_bg_color || primaryColor);
      const bgWithOpacity = buttonOpacity < 100 && bgColor.startsWith('#') ? hexToRgba(bgColor, buttonOpacity) : bgColor;
      const textColor = preset?.textColor || link.custom_text_color || '#ffffff';

      // Apply outline or filled style
      const btnStyle = isOutline
        ? `background: transparent; border: 2px solid ${bgColor}; color: ${bgColor};`
        : `background: ${bgWithOpacity}; color: ${textColor};`;

      return `
        <a href="${link.url}" target="_blank" class="link-btn" style="${btnStyle}">
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
            transition: background 0.2s ease;
          }
          .profile-name, .profile-bio, .link-btn, .vcard-button, .footer {
            transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
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
            border-radius: ${buttonRadius};
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
            <a href="https://nokolink.com">Créé avec Noko</a>
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
          .profile-name, .profile-bio, .premium-link-card, .premium-link-icon, .footer {
            transition: color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;
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
            <a href="https://nokolink.com">Créé avec Noko</a>
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
    const buttonRadius = getButtonRadius(client.button_style);
    const isOutline = isOutlineStyle(client.button_style);
    const linksHtml = links.map(link => {
      const preset = link.social_preset ? SOCIAL_PRESETS[link.social_preset as SocialPresetKey] : null;
      const bgColor = link.social_preset === 'theme'
        ? primaryColor
        : (preset?.bgColor || link.custom_bg_color || primaryColor);
      const bgWithOpacity = buttonOpacity < 100 && bgColor.startsWith('#') ? hexToRgba(bgColor, buttonOpacity) : bgColor;
      const textColor = preset?.textColor || link.custom_text_color || '#ffffff';
      const iconName = link.icon || preset?.icon || 'link';

      const cardStyle = isOutline
        ? `background: transparent; border: 2px solid ${bgColor}; color: ${bgColor};`
        : `background: ${bgWithOpacity}; color: ${textColor};`;

      return `
        <a href="${link.url}" target="_blank" class="link-card" style="${cardStyle}">
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
            transition: background 0.2s ease;
          }
          .profile-name, .profile-bio, .link-card, .vcard-button, .footer {
            transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
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
            border-radius: ${buttonRadius};
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
            <a href="https://nokolink.com">Créé avec Noko</a>
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
    const buttonRadius = getButtonRadius(client.button_style);
    const isOutline = isOutlineStyle(client.button_style);
    const linksHtml = links.map(link => {
      const preset = link.social_preset ? SOCIAL_PRESETS[link.social_preset as SocialPresetKey] : null;
      const bgColor = link.social_preset === 'theme'
        ? primaryColor
        : (preset?.bgColor || link.custom_bg_color || primaryColor);
      const bgWithOpacity = buttonOpacity < 100 && bgColor.startsWith('#') ? hexToRgba(bgColor, buttonOpacity) : bgColor;
      const textColor = preset?.textColor || link.custom_text_color || '#ffffff';
      const iconName = link.icon || preset?.icon || 'link';

      const gridStyle = isOutline
        ? `background: transparent; border: 2px solid ${bgColor}; color: ${bgColor};`
        : `background: ${bgWithOpacity}; color: ${textColor};`;

      return `
        <a href="${link.url}" target="_blank" class="link-grid-item" style="${gridStyle}" title="${link.title}">
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
            transition: background 0.2s ease;
          }
          .profile-name, .profile-bio, .link-grid-item, .vcard-button, .footer {
            transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
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
            border-radius: ${buttonRadius};
            text-align: center;
            text-decoration: none;
            padding: 1rem;
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
            <a href="https://nokolink.com">Créé avec Noko</a>
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
    <div class="phone-mockup">
      <div class="phone-notch"></div>
      <iframe
        srcdoc={debouncedHtml}
        title="Preview"
        sandbox="allow-scripts"
      ></iframe>
      <div class="phone-home-indicator"></div>
    </div>
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
    align-items: flex-start;
    padding: var(--space-4);
    background: #f1f5f9;
    min-height: 500px;
    overflow-y: auto;
  }

  .phone-mockup {
    position: relative;
    width: 280px;
    min-height: 580px;
    height: auto;
    background: #1a1a1a;
    border-radius: 40px;
    padding: 12px;
    box-shadow:
      0 25px 50px -12px rgba(0, 0, 0, 0.25),
      0 0 0 1px rgba(255, 255, 255, 0.1) inset,
      0 0 0 4px #1a1a1a,
      0 0 0 5px #333;
  }

  .phone-notch {
    position: absolute;
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 28px;
    background: #1a1a1a;
    border-radius: 0 0 16px 16px;
    z-index: 10;
  }

  .phone-notch::before {
    content: '';
    position: absolute;
    top: 8px;
    left: 50%;
    transform: translateX(-50%);
    width: 8px;
    height: 8px;
    background: #333;
    border-radius: 50%;
  }

  .phone-home-indicator {
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 4px;
    background: #333;
    border-radius: 2px;
  }

  .phone-mockup iframe {
    width: 100%;
    height: 100%;
    min-height: 556px;
    border: none;
    border-radius: 28px;
    background: white;
  }
</style>
