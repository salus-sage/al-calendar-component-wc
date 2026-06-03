/**
 * Format date and timestamp values for display.
 * Detects whether input is a date (YYYY-MM-DD) or timestamp (ISO 8601) and formats accordingly.
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
    const date = new Date(dateStr + 'T00:00:00');
    return new Intl.DateTimeFormat('en-US', {
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
    const datePart = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);

    const timePart = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);

    return `${datePart} ${timePart}`;
  } catch {
    return '';
  }
}
