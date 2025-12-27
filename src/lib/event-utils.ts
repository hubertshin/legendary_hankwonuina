/**
 * Event-specific utility functions
 */

/**
 * Generate a unique session ID for anonymous users
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate Korean phone number format
 * Accepts: 010-1234-5678, 01012345678, 010 1234 5678
 */
export function validateKoreanPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s-]/g, '');
  const phoneRegex = /^01[0-9]{8,9}$/;
  return phoneRegex.test(cleaned);
}

/**
 * Format phone number for display
 * Input: 01012345678 or 010-1234-5678
 * Output: 010-1234-5678
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[\s-]/g, '');

  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }

  return phone;
}

/**
 * Clean phone number for storage (remove separators)
 */
export function cleanPhoneNumber(phone: string): string {
  return phone.replace(/[\s-]/g, '');
}
