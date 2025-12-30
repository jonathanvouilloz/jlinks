import type { VCardData } from './types';

/**
 * Escape special characters in vCard values
 */
function escapeVCardValue(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Generate a vCard 3.0 formatted string from contact data
 * @param data - Contact information
 * @returns VCard 3.0 formatted string
 */
export function generateVCard(data: VCardData): string {
  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${escapeVCardValue(data.name)}`,
  ];

  // Parse name into components (simple version)
  const nameParts = data.name.trim().split(' ');
  const lastName = nameParts.length > 1 ? nameParts.pop() : '';
  const firstName = nameParts.join(' ');

  if (firstName || lastName) {
    lines.push(`N:${escapeVCardValue(lastName || '')};${escapeVCardValue(firstName || '')};;;`);
  }

  if (data.company) {
    lines.push(`ORG:${escapeVCardValue(data.company)}`);
  }

  if (data.email) {
    lines.push(`EMAIL:${escapeVCardValue(data.email)}`);
  }

  if (data.phone) {
    lines.push(`TEL:${escapeVCardValue(data.phone)}`);
  }

  if (data.website) {
    lines.push(`URL:${escapeVCardValue(data.website)}`);
  }

  // Add revision timestamp
  lines.push(`REV:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`);

  lines.push('END:VCARD');

  // vCard spec requires CRLF line endings
  return lines.join('\r\n');
}

/**
 * Parse a vCard string into contact data
 * @param vcard - VCard formatted string
 * @returns Parsed contact data
 */
export function parseVCard(vcard: string): Partial<VCardData> {
  const lines = vcard.split(/\r?\n/);
  const data: Partial<VCardData> = {};

  for (const line of lines) {
    const [key, ...valueParts] = line.split(':');
    const value = valueParts.join(':');

    switch (key?.toUpperCase()) {
      case 'FN':
        data.name = value;
        break;
      case 'EMAIL':
        data.email = value;
        break;
      case 'TEL':
        data.phone = value;
        break;
      case 'ORG':
        data.company = value;
        break;
      case 'URL':
        data.website = value;
        break;
    }
  }

  return data;
}

/**
 * Generate a data URI for vCard download
 * @param vcard - VCard formatted string
 * @returns Data URI string
 */
export function generateVCardDataUri(vcard: string): string {
  const encoded = encodeURIComponent(vcard);
  return `data:text/vcard;charset=utf-8,${encoded}`;
}

/**
 * Generate a blob URL for vCard download
 * @param vcard - VCard formatted string
 * @returns Blob URL string
 */
export function generateVCardBlobUrl(vcard: string): string {
  const blob = new Blob([vcard], { type: 'text/vcard' });
  return URL.createObjectURL(blob);
}
