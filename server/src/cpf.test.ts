import { describe, expect, it } from 'vitest';
import { cpfDigits, cpfFrom, isValidCpf } from './cpf.ts';

describe('the CPF', () => {
  it('is read with or without the dots and the dash', () => {
    expect(cpfDigits('123.456.789-09')).toBe('12345678909');
    expect(cpfDigits('12345678909')).toBe('12345678909');
    expect(cpfDigits('123.456.789')).toBeNull();
    expect(cpfDigits('123.456.789-0A')).toBeNull();
  });

  it('is valid only when both check digits match', () => {
    expect(isValidCpf('12345678909')).toBe(true);
    expect(isValidCpf('12345678900')).toBe(false);
    expect(isValidCpf('12345678919')).toBe(false);
  });

  it('is not valid with all the digits the same', () => {
    expect(isValidCpf('11111111111')).toBe(false);
    expect(isValidCpf('00000000000')).toBe(false);
  });

  it('gets its check digits from the first nine', () => {
    expect(cpfFrom('123456789')).toBe('12345678909');
    expect(isValidCpf(cpfFrom('987654321'))).toBe(true);
  });
});
