// Better-auth crypto utilities for secure password hashing
// We use scrypt from better-auth/crypto for password hashing

import { hashPassword as scryptHash, verifyPassword as scryptVerify } from 'better-auth/crypto';

// Legacy SHA-256 verification for migrating existing passwords
export async function verifySHA256(password: string, hash: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const inputHash = Buffer.from(hashBuffer).toString('hex');
  return inputHash === hash;
}

// Hash password using scrypt (secure, slow, salted)
export async function hashPassword(password: string): Promise<string> {
  return scryptHash(password);
}

// Verify password - tries scrypt first, falls back to SHA-256 for migration
export async function verifyPassword(password: string, hash: string, needsUpgrade: boolean): Promise<boolean> {
  if (needsUpgrade) {
    // Legacy SHA-256 hash
    return verifySHA256(password, hash);
  }

  // Modern scrypt hash
  try {
    return await scryptVerify({ password, hash });
  } catch {
    return false;
  }
}
