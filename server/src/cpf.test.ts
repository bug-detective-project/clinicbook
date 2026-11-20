import { describe, expect, it } from 'vitest';
import { cpfDigits, cpfFrom } from './cpf.ts';

describe('the CPF', () => {
  it('is read with or without the dots and the dash', () => {
    expect(cpfDigits('123.456.789-09')).toBe('12345678909');
    expect(cpfDigits('12345678909')).toBe('12345678909');
    expect(cpfDigits('123.456.789')).toBeNull();
    expect(cpfDigits('123.456.789-0A')).toBeNull();
  });

  it('gets its check digits from the first nine', () => {
    expect(cpfFrom('123456789')).toBe('12345678909');
    expect(cpfFrom('529982247')).toBe('52998224725');
  });
});
