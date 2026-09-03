export interface ParsedTime {
  hours: number;
  minutes: number;
  meridiem: 'AM' | 'PM';
}

export function parseTime(input: string): ParsedTime | null {
  if (!input || typeof input !== 'string') {
    return null;
  }

  const trimmed = input.trim().toLowerCase();

  // Try to parse explicit meridiem (am/pm)
  const meridiemMatch = trimmed.match(/(am|pm|a|p)$/);
  const hasMeridiem = !!meridiemMatch;
  const meridiem = meridiemMatch ? (meridiemMatch[1].startsWith('p') ? 'PM' : 'AM') : null;

  // Remove meridiem from input for further processing
  const withoutMeridiem = meridiemMatch ? trimmed.slice(0, -meridiemMatch[1].length).trim() : trimmed;

  // Remove separator characters (: . -)
  const cleaned = withoutMeridiem.replace(/[:.\-\s]/g, '');

  // Must contain only digits
  if (!cleaned || !/^\d+$/.test(cleaned)) {
    return null;
  }

  let hours: number;
  let minutes: number;

  // Parse based on digit count
  if (cleaned.length === 1) {
    // Single digit: bare hour
    hours = parseInt(cleaned, 10);
    minutes = 0;
  } else if (cleaned.length === 2) {
    // Two digits: bare hour or 24h with minutes
    const num = parseInt(cleaned, 10);
    if (num >= 13 || hasMeridiem) {
      // 13-23 is 24h format; or if meridiem specified, must be 1-12
      hours = num;
      minutes = 0;
    } else {
      // Ambiguous bare hour
      hours = num;
      minutes = 0;
    }
  } else if (cleaned.length === 3) {
    // 3 digits: Hm (1-digit hour + 2-digit minutes)
    hours = parseInt(cleaned.slice(0, 1), 10);
    minutes = parseInt(cleaned.slice(1), 10);
  } else if (cleaned.length === 4) {
    // 4 digits: HMm (2-digit hour + 2-digit minutes)
    hours = parseInt(cleaned.slice(0, 2), 10);
    minutes = parseInt(cleaned.slice(2), 10);
  } else {
    // More than 4 digits is invalid
    return null;
  }

  // Validate ranges
  if (minutes < 0 || minutes > 59) {
    return null;
  }

  // Determine AM/PM if not explicitly provided
  let finalMeridiem: 'AM' | 'PM';
  if (hasMeridiem && meridiem) {
    // Explicit meridiem: constrain to 1-12
    if (hours < 1 || hours > 12) {
      return null;
    }
    finalMeridiem = meridiem;
  } else if (hours >= 13) {
    // 24h format: >= 13 is always PM
    finalMeridiem = 'PM';
  } else if (hours === 0) {
    // 0 is midnight (12 AM)
    hours = 12;
    finalMeridiem = 'AM';
  } else if (hours === 12) {
    // 12 is noon (12 PM)
    finalMeridiem = 'PM';
  } else if (hours >= 1 && hours <= 6) {
    // 1-6: PM heuristic
    finalMeridiem = 'PM';
  } else if (hours >= 7 && hours <= 11) {
    // 7-11: AM heuristic
    finalMeridiem = 'AM';
  } else {
    // Invalid hour
    return null;
  }

  // Normalize to 12-hour format for PM
  if (finalMeridiem === 'PM' && hours > 12) {
    hours = hours - 12;
  }

  // Ensure hours is 1-12
  if (hours < 1 || hours > 12) {
    return null;
  }

  return { hours, minutes, meridiem: finalMeridiem };
}

export function formatTime(time: ParsedTime | null): string {
  if (!time) return '';
  return `${time.hours}:${String(time.minutes).padStart(2, '0')} ${time.meridiem}`;
}

export function timeToIso(date: Date, time: ParsedTime): string {
  let hours24 = time.hours;
  if (time.meridiem === 'PM' && hours24 !== 12) {
    hours24 += 12;
  } else if (time.meridiem === 'AM' && hours24 === 12) {
    hours24 = 0;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hoursStr = String(hours24).padStart(2, '0');
  const minutes = String(time.minutes).padStart(2, '0');

  // Compute local UTC offset for this specific date (handles DST correctly)
  const localDate = new Date(year, date.getMonth(), date.getDate(), hours24, time.minutes, 0);
  const offsetTotalMinutes = -localDate.getTimezoneOffset();
  const offsetSign = offsetTotalMinutes >= 0 ? '+' : '-';
  const absOffset = Math.abs(offsetTotalMinutes);
  const offsetHH = String(Math.floor(absOffset / 60)).padStart(2, '0');
  const offsetMM = String(absOffset % 60).padStart(2, '0');

  return `${year}-${month}-${day}T${hoursStr}:${minutes}:00${offsetSign}${offsetHH}:${offsetMM}`;
}

/**
 * Extract the local-timezone time from a Date object as a 12-hour ParsedTime.
 * Used wherever a stored ISO timestamp must be displayed in the viewer's locale.
 */
export function dateToLocalTime(d: Date): ParsedTime {
  const hours24 = d.getHours();
  const minutes = d.getMinutes();
  let hours12 = hours24 % 12;
  if (hours12 === 0) hours12 = 12;
  return { hours: hours12, minutes, meridiem: hours24 < 12 ? 'AM' : 'PM' };
}

export function dateToIsoString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** ISO date-only pattern: YYYY-MM-DD (storage format for date parameters). */
export const ISO_DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Calendar years we accept — rejects JS quirks like 0326-09-20 → year 326. */
export function isValidStoredYear(year: number, yearStr: string): boolean {
  if (yearStr.startsWith('0')) {
    return false;
  }
  return year >= 1000 && year <= 9999;
}

/**
 * Parse a stored date-only ISO string (YYYY-MM-DD) or ISO timestamp (uses date part).
 * Returns null for malformed values including leading-zero years (e.g. 0326-09-20).
 */
export function parseIsoDateOnly(value: string): Date | null {
  const trimmed = value.trim();
  const datePart = trimmed.includes('T') ? trimmed.split('T')[0] : trimmed;
  const match = ISO_DATE_ONLY_RE.exec(datePart);
  if (!match) {
    return null;
  }

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);
  if (!isValidStoredYear(year, match[1]) || month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

/** Normalize a stored date parameter value to canonical YYYY-MM-DD, or '' if invalid. */
export function normalizeIsoDateOnly(value: string | null | undefined): string {
  if (!value) {
    return '';
  }
  const parsed = parseIsoDateOnly(String(value));
  return parsed ? dateToIsoString(parsed) : '';
}

/** Normalize a stored timestamp parameter value; rejects invalid calendar years. */
export function normalizeIsoTimestamp(value: string | null | undefined): string {
  if (!value) {
    return '';
  }
  const trimmed = String(value).trim();
  if (!trimmed.includes('T')) {
    return normalizeIsoDateOnly(trimmed);
  }

  const d = new Date(trimmed);
  if (isNaN(d.getTime()) || !isValidStoredYear(d.getFullYear(), String(d.getFullYear()))) {
    return '';
  }

  return trimmed;
}

/**
 * Resolve display locale from Albert user preference (ljs-lang) with browser fallback.
 */
export function getDisplayLocale(): string {
  const localeMap: Record<string, string> = {
    de: 'de-DE',
    en: 'en-US',
    fr: 'fr-FR',
    es: 'es-ES',
    it: 'it-IT',
    pt: 'pt-BR',
    ja: 'ja-JP',
    zh: 'zh-CN',
    ko: 'ko-KR',
  };

  try {
    if (typeof localStorage !== 'undefined') {
      const lang = (localStorage.getItem('ljs-lang') || '').toLowerCase().split(/[-_]/)[0];
      if (lang && localeMap[lang]) {
        return localeMap[lang];
      }
    }
  } catch {
    // localStorage may be unavailable
  }

  return typeof navigator !== 'undefined' ? navigator.language || 'en-US' : 'en-US';
}

export function generateTimeOptions(): ParsedTime[] {
  const options: ParsedTime[] = [];
  for (let i = 0; i < 24 * 4; i++) {
    const totalMinutes = i * 15;
    const hours24 = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    let hours12 = hours24 % 12;
    if (hours12 === 0) hours12 = 12;

    const meridiem = hours24 < 12 ? 'AM' : 'PM';

    options.push({ hours: hours12, minutes: mins, meridiem });
  }
  return options;
}
