export function formatARS(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(amount)
    .replace("ARS", "$")
    .trim();
}

export function formatAmountParts(amount: number): { integer: string; decimal: string } {
  const formatted = new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  const parts = formatted.split(",");
  return {
    integer: parts[0],
    decimal: parts[1] || "00",
  };
}

export function maskAccount(account: string): string {
  if (account.startsWith("****")) return account;
  return "****" + account.slice(-4);
}
