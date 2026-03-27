export function fmtARS(n: number): string {
  return new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export function fmtParts(n: number): { int: string; dec: string } {
  const s = fmtARS(n);
  const [int, dec] = s.split(",");
  return { int, dec: dec || "00" };
}
