export type Money = {
  amountMinor: number;
  currency: "USD";
};

export function createMoney(amountDollars: number): Money {
  if (amountDollars < 0) {
    throw new Error("Amount cannot be negative");
  }
  return {
    amountMinor: Math.round(amountDollars * 100),
    currency: "USD",
  };
}

export function formatMoney(money: Money, locale: string = "en-US"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: money.currency,
  }).format(money.amountMinor / 100);
}
