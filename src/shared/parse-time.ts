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

  return `${year}-${month}-${day}T${hoursStr}:${minutes}:00`;
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
