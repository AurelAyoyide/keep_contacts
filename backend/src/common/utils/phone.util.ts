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

/**
 * Generate alternate phone number for Benin contacts
 * If phone starts with 01, return version without 01
 * If phone doesn't start with 01, return version with 01
 * Returns null for non-Benin countries
 */
export function generateAlternatePhone(phone: string, countryCode?: string): string | null {
  // Only apply for Benin (+229)
  if (countryCode !== '+229') {
    return null;
  }

  // Remove all non-digit characters
  const cleaned = phone.replace(/[^0-9]/g, '');

  // Check if it starts with 01
  if (cleaned.startsWith('01')) {
    // Remove the 01 prefix
    return cleaned.substring(2);
  } else {
    // Add 01 prefix
    return '01' + cleaned;
  }
}
