// ---------------------------------------------------------------------
// Shared formatting helpers — single source of truth for currency
// (Iraqi Dinar) and number formatting across the app.
// ---------------------------------------------------------------------

const IQD_FORMATTER = new Intl.NumberFormat('ar-IQ', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/**
 * Format a number as Iraqi Dinar.
 *   1234.5  →  "١٬٢٣٥ د.ع"
 *   0       →  "٠ د.ع"
 */
export function formatIQD(n) {
  const v = Number.isFinite(Number(n)) ? Number(n) : 0;
  return `${IQD_FORMATTER.format(v)} د.ع`;
}

/**
 * Compact short form for tables/lists (still IQD).
 *   1234567 →  "١٬٢٣٤٬٥٦٧ د.ع"
 */
export function formatIQDShort(n) {
  return formatIQD(n);
}

/**
 * Format a number using Arabic-Indic digits without the currency suffix.
 */
export function formatNumber(n, fractionDigits = 0) {
  const fmt = new Intl.NumberFormat('ar-IQ', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
  return fmt.format(Number(n) || 0);
}

/**
 * Format a date in Arabic (Gregorian).
 */
export function formatDate(iso) {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('ar-IQ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(iso));
}

/**
 * Format a date+time in Arabic (Gregorian).
 */
export function formatDateTime(iso) {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('ar-IQ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}
