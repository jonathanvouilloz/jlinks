// apps/admin/src/lib/server/auth/password.ts
import { hashPassword as scryptHash, verifyPassword as scryptVerify } from 'better-auth/crypto';

export async function verifySHA256(password: string, hash: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const inputHash = Buffer.from(hashBuffer).toString('hex');
  return inputHash === hash;
}

export async function hashPassword(password: string): Promise<string> {
  return scryptHash(password);
}

export async function verifyPassword(password: string, hash: string, needsUpgrade: boolean): Promise<boolean> {
  if (needsUpgrade) {
    return verifySHA256(password, hash);
  }
  try {
    return await scryptVerify({ password, hash });
  } catch {
    return false;
  }
}
