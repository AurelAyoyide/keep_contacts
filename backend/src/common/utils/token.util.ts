import { randomBytes } from 'crypto';

export function generateSecureToken(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

export function getExpirationDate(hours: number = 24): Date {
  const date = new Date();
  date.setHours(date.getHours() + hours);
  return date;
}
