import {
  getDisplayLocale,
  isValidStoredYear,
  parseIsoDateOnly,
} from './parse-time';

/**
 * Format date and timestamp values for display.
 * Detects whether input is a date (YYYY-MM-DD) or timestamp (ISO 8601) and formats accordingly.
 * Uses the user's Albert language preference (ljs-lang) when available.
 */
export function formatDate(value: string | null | undefined): string {
  if (!value) return '';

  // Detect timestamp vs date by presence of 'T'
  if (value.includes('T')) {
    return formatTimestamp(value);
  }
  return formatDateOnly(value);
}

function formatDateOnly(dateStr: string): string {
  try {
    const date = parseIsoDateOnly(dateStr);
    if (!date) {
      return '';
    }

    return new Intl.DateTimeFormat(getDisplayLocale(), {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch {
    return '';
  }
}

function formatTimestamp(isoStr: string): string {
  try {
    const date = new Date(isoStr);
    if (isNaN(date.getTime()) || !isValidStoredYear(date.getFullYear(), String(date.getFullYear()))) {
      return '';
    }

    const locale = getDisplayLocale();
    const datePart = new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);

    const timePart = new Intl.DateTimeFormat(locale, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZoneName: 'shortOffset',
    }).format(date);

    return `${datePart} ${timePart}`;
  } catch {
    return '';
  }
}
