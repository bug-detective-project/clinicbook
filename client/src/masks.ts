// Masks for the fields the front desk types digits into: whatever is typed, only the digits count,
// and they are shown the way Brazilians write them.

const digitsOf = (text: string, most: number) => text.replace(/\D/g, '').slice(0, most);

/** "390.533.447-07": a CPF as it is typed, from its first digit to its eleventh. */
export function maskCpf(text: string): string {
  const digits = digitsOf(text, 11);
  return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 9)].filter(Boolean).join('.') + (digits.length > 9 ? `-${digits.slice(9)}` : '');
}

/** "(11) 98888-1001" for a mobile, "(11) 3555-4004" for a landline: a phone with its area code, as it is typed. */
export function maskPhone(text: string): string {
  const digits = digitsOf(text, 11);
  if (digits.length <= 2) {
    return digits.length === 0 ? '' : `(${digits}`;
  }
  const area = `(${digits.slice(0, 2)}) `;
  const rest = digits.slice(2);
  // A mobile has nine digits after the area code, a landline eight.
  const split = rest.length === 9 ? 5 : 4;
  return rest.length <= split ? `${area}${rest}` : `${area}${rest.slice(0, split)}-${rest.slice(split)}`;
}
