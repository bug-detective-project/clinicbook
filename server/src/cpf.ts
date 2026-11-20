// A CPF is the Brazilian taxpayer number every patient has: 11 digits, the last two of which check
// the first nine. The API takes it with or without the dots and the dash, and keeps the digits.

/** The 11 digits of a CPF written as 123.456.789-09 or 12345678909, or null when it is not one. */
export function cpfDigits(text: string): string | null {
  const digits = text.replace(/[.-]/g, '');
  return /^\d{11}$/.test(digits) ? digits : null;
}

/** The check digit that follows `digits` (the first nine, then the first ten). */
function checkDigit(digits: string): number {
  const weight = digits.length + 1;
  const sum = [...digits].reduce((total, digit, index) => total + Number(digit) * (weight - index), 0);
  const rest = (sum * 10) % 11;
  return rest === 10 ? 0 : rest;
}

/** True for the 11 digits of a real CPF: both check digits match, and the digits are not all the same. */
export function isValidCpf(digits: string): boolean {
  if (!/^\d{11}$/.test(digits) || /^(\d)\1{10}$/.test(digits)) {
    return false;
  }
  return checkDigit(digits.slice(0, 9)) === Number(digits[9]) && checkDigit(digits.slice(0, 10)) === Number(digits[10]);
}

/** A valid CPF from its first nine digits: the two check digits are worked out and added. */
export function cpfFrom(nine: string): string {
  const ten = `${nine}${checkDigit(nine)}`;
  return `${ten}${checkDigit(ten)}`;
}
