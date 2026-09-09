// Formatting helpers shared across the app.

// Business One is multi-currency; the demo data carries plain numbers, so we format
// with grouping and a single configurable symbol rather than assuming a locale currency.
const CURRENCY_SYMBOL = '$'

/** "$45,000" — full grouped amount. */
export function fmtMoney(n: number): string {
  return CURRENCY_SYMBOL + Math.round(n).toLocaleString('en-US')
}

/** "$45K" / "$1.2M" — compact for stat-tile values and tight columns. */
export function fmtMoneyCompact(n: number): string {
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return CURRENCY_SYMBOL + (n / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1) + 'M'
  if (abs >= 1_000)     return CURRENCY_SYMBOL + Math.round(n / 1000) + 'K'
  return CURRENCY_SYMBOL + Math.round(n).toLocaleString('en-US')
}

/** "12 Aug 2025" */
export function fmtDate(s: string): string {
  if (!s) return '—'
  return new Date(s + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

/** Whole-day span between two ISO dates, inclusive of both endpoints. */
export function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b + 'T00:00:00').getTime() - new Date(a + 'T00:00:00').getTime()) / 86_400_000) + 1
}
