export function formatMoney(value: number, language: string) {
  return new Intl.NumberFormat(language, {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(value: string, language: string) {
  return new Intl.DateTimeFormat(language, { year: 'numeric', month: 'short', day: '2-digit' }).format(new Date(value));
}
