import { parsePhoneNumber, isValidPhoneNumber, type CountryCode } from 'libphonenumber-js';

export interface ParsedPhoneResult {
  phone: string; // Full number with country code in E.164 format
  alternatePhone?: string | null; // Alternative version for Benin
  countryCode: string; // e.g., '+229'
  isValid: boolean;
  error?: string;
}

/**
 * Parse and validate phone number
 * Stores phone with country code (E.164 format: +XXXXXXXXXXXXX)
 * For Benin (+229), creates an alternate version without the '01' prefix if applicable
 * 
 * @param phone - Can be with or without country code
 * @param defaultCountry - Country code like 'BJ' for Benin, 'FR' for France
 * @returns ParsedPhoneResult with formatted phone and optional alternate
 */
export function parseAndValidatePhone(phone: string, defaultCountry: string = 'BJ'): ParsedPhoneResult {
  try {
    // Remove all spaces, dashes, parentheses, and other formatting
    const cleaned = phone.replace(/[\s\-\(\)\.]/g, '').trim();

    // If it doesn't start with +, try adding country code
    let phoneToValidate = cleaned;
    if (!cleaned.startsWith('+')) {
      const countryDialCode = getCountryDialCode(defaultCountry);
      phoneToValidate = countryDialCode + cleaned;
    }

    // Try to parse with default country
    const parsed = parsePhoneNumber(phoneToValidate, defaultCountry as CountryCode);

    if (!parsed) {
      return {
        phone: '',
        countryCode: getCountryCodeFromRegion(defaultCountry),
        isValid: false,
        error: 'Invalid phone number format',
      };
    }

    // Special handling for Benin: accept both formats (with/without 01)
    // For other countries, use strict validation
    if (String(parsed.countryCallingCode) !== '229' && !parsed.isValid()) {
      return {
        phone: '',
        countryCode: getCountryCodeFromRegion(defaultCountry),
        isValid: false,
        error: `Invalid phone number for ${defaultCountry}`,
      };
    }

    // For Benin, do a more lenient check (just ensure it parsed and has reasonable length)
    if (String(parsed.countryCallingCode) === '229') {
      const phoneE164 = parsed.format('E.164');
      // Benin numbers: +229 (3) + 8 digits = 11 chars total minimum
      if (!phoneE164 || phoneE164.length < 11 || phoneE164.length > 13) {
        return {
          phone: '',
          countryCode: getCountryCodeFromRegion(defaultCountry),
          isValid: false,
          error: 'Invalid Benin phone number length',
        };
      }
    }

    // Get E.164 format (e.g., +22901968118159 or +22997555338)
    const phoneE164 = parsed.format('E.164');
    const countryCode = '+' + parsed.countryCallingCode;

    // Handle Benin special case: create alternate with/without '01' prefix
    let alternatePhone: string | null = null;
    if (String(parsed.countryCallingCode) === '229') {
      alternatePhone = generateBeninAlternate(phoneE164);
    }

    return {
      phone: phoneE164,
      alternatePhone,
      countryCode,
      isValid: true,
    };
  } catch (error) {
    return {
      phone: '',
      countryCode: getCountryCodeFromRegion(defaultCountry),
      isValid: false,
      error: error instanceof Error ? error.message : 'Failed to parse phone number',
    };
  }
}

/**
 * For Benin numbers: create alternate without '01'
 * Input: +22901968118159 -> Output: +2299681811859
 * Input: +2299681811859 -> Output: +22901968118159
 */
function generateBeninAlternate(phoneE164: string): string | null {
  if (!phoneE164.startsWith('+229')) {
    return null;
  }

  const remainder = phoneE164.slice(4); // Remove '+229'

  if (remainder.startsWith('01')) {
    // Remove the '01' prefix
    return '+229' + remainder.slice(2);
  } else {
    // Add '01' prefix
    return '+22901' + remainder;
  }
}

/**
 * Get country calling code from region (the numeric part like 229, 33, 1, etc.)
 * e.g., 'BJ' -> '229', 'FR' -> '33'
 */
function getCountryDialCode(region: string): string {
  const regionCodeMap: { [key: string]: string } = {
    'BJ': '+229', // Benin
    'FR': '+33',  // France
    'US': '+1',   // USA
    'GB': '+44',  // UK
    'DE': '+49',  // Germany
    'ES': '+34',  // Spain
    'IT': '+39',  // Italy
    'CA': '+1',   // Canada
    'AU': '+61',  // Australia
    'JP': '+81',  // Japan
    'CN': '+86',  // China
    'IN': '+91',  // India
    'BR': '+55',  // Brazil
    'MX': '+52',  // Mexico
    'NG': '+234', // Nigeria
    'ZA': '+27',  // South Africa
    'KE': '+254', // Kenya
    'CI': '+225', // Ivory Coast
    'SN': '+221', // Senegal
    'GH': '+233', // Ghana
  };

  return regionCodeMap[region.toUpperCase()] || '+' + region;
}

/**
 * Get country code from region (ISO 3166-1 alpha-2)
 * e.g., 'BJ' -> '+229', 'FR' -> '+33'
 */
function getCountryCodeFromRegion(region: string): string {
  return getCountryDialCode(region);
}

/**
 * Format phone for display (removes country code prefix for readability)
 * +22901968118159 -> 01968118159
 */
export function formatPhoneForDisplay(phone: string, countryCode?: string): string {
  if (!phone) return '';

  if (countryCode && phone.startsWith(countryCode)) {
    return phone.slice(countryCode.length);
  }

  // Default: remove first + and up to 3 digits
  if (phone.startsWith('+')) {
    return phone.slice(1);
  }

  return phone;
}

/**
 * Validate if phone is valid E.164 format
 */
export function isValidPhoneFormat(phone: string): boolean {
  return /^\+[1-9]\d{6,14}$/.test(phone);
}
/**
 * Normalize Benin phone for duplicate detection
 * Both +22901968118159 and +2299681811859 normalize to +2299681811859
 * For non-Benin numbers, returns the phone as-is
 */
export function normalizePhoneForDeduplication(phone: string): string {
  if (!phone || !phone.startsWith('+229')) {
    return phone; // Non-Benin number, return as-is
  }

  const remainder = phone.slice(4); // Remove '+229'

  // If it has '01' prefix, remove it for normalization
  if (remainder.startsWith('01')) {
    return '+229' + remainder.slice(2);
  }

  // Already normalized (no '01' prefix)
  return phone;
}