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

const USD_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Convert an IQD amount to USD using the given exchange rate
 * (IQD per 1 USD). All prices in the app are stored in IQD; this is
 * purely a display-time conversion.
 */
export function iqdToUsd(amountIqd, exchangeRate) {
  const rate = Number(exchangeRate) > 0 ? Number(exchangeRate) : 1310;
  return (Number(amountIqd) || 0) / rate;
}

/**
 * Format an IQD amount as its USD equivalent.
 *   250000, 1310  →  "$190.84"
 */
export function formatUSD(amountIqd, exchangeRate) {
  return USD_FORMATTER.format(iqdToUsd(amountIqd, exchangeRate));
}

/**
 * Format a price as "IQD (USD)" — the standard dual-currency display
 * used across POS, inventory and receipts.
 *   250000, 1310  →  "٢٥٠٬٠٠٠ د.ع ($190.84)"
 */
export function formatDualCurrency(amountIqd, exchangeRate) {
  return `${formatIQD(amountIqd)} (${formatUSD(amountIqd, exchangeRate)})`;
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
