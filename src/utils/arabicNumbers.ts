const EASTERN_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

export function toEasternArabic(input: number | string): string {
  return String(input).replace(/[0-9]/g, (d) => EASTERN_DIGITS[Number(d)]);
}

export function normalizeToWestern(input: string): string {
  return input
    .replace(/[٠-٩]/g, (d) => String(EASTERN_DIGITS.indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .trim();
}

export function parseNumericInput(input: string): number | null {
  const normalized = normalizeToWestern(input);
  if (!/^\d+$/.test(normalized)) {
    return null;
  }
  return Number.parseInt(normalized, 10);
}

export function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

export function simplifyFraction(num: number, den: number): { num: number; den: number } {
  const divisor = gcd(num, den);
  return { num: num / divisor, den: den / divisor };
}

export function fractionsEqual(n1: number, d1: number, n2: number, d2: number): boolean {
  if (d1 === 0 || d2 === 0) return false;
  return n1 * d2 === n2 * d1;
}
