export function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/[^0-9+]/g, '');

  if (cleaned.startsWith('+')) {
    return cleaned;
  }

  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return '+33' + cleaned.substring(1);
  }

  return cleaned;
}

export function isValidPhone(phone: string): boolean {
  const normalized = normalizePhone(phone);
  return /^\+[1-9]\d{6,14}$/.test(normalized);
}
