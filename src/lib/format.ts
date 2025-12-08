export const formatNumberUA = (n: number): string =>
  new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 0 }).format(n);

export const formatCurrencyUA = (n: number, symbol = "₴"): string =>
  `${formatNumberUA(n)} ${symbol}`;
