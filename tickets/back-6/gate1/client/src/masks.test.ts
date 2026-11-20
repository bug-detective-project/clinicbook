import { describe, expect, it } from 'vitest';
import { formatPhone, maskCpf, maskPhone } from './masks.ts';

describe('the CPF mask', () => {
  it('puts the dots and the dash as the digits come', () => {
    expect(maskCpf('390')).toBe('390');
    expect(maskCpf('3905')).toBe('390.5');
    expect(maskCpf('390533447')).toBe('390.533.447');
    expect(maskCpf('3905334470')).toBe('390.533.447-0');
    expect(maskCpf('39053344707')).toBe('390.533.447-07');
  });

  it('keeps only the digits, eleven at most', () => {
    expect(maskCpf('390.533.447-07')).toBe('390.533.447-07');
    expect(maskCpf('39a0533447079999')).toBe('390.533.447-07');
    expect(maskCpf('abc')).toBe('');
  });
});

describe('the phone mask', () => {
  it('writes the area code in parentheses', () => {
    expect(maskPhone('1')).toBe('(1');
    expect(maskPhone('11')).toBe('(11');
    expect(maskPhone('119')).toBe('(11) 9');
  });

  it('splits a landline after four digits and a mobile after five', () => {
    expect(maskPhone('1135554004')).toBe('(11) 3555-4004');
    expect(maskPhone('11988881001')).toBe('(11) 98888-1001');
  });

  it('keeps only the digits, eleven at most, without the country code', () => {
    expect(maskPhone('(11) 98888-1001')).toBe('(11) 98888-1001');
    expect(maskPhone('+55 11 98888-1001')).toBe('(11) 98888-1001');
    expect(maskPhone('')).toBe('');
  });
});

describe('a saved phone on the screen', () => {
  it('gets the mask whatever way it was saved', () => {
    expect(formatPhone('11 97777-2002')).toBe('(11) 97777-2002');
    expect(formatPhone('11955555005')).toBe('(11) 95555-5005');
    expect(formatPhone('+55 11 96666-3003')).toBe('(11) 96666-3003');
    expect(formatPhone('11 3555 4004')).toBe('(11) 3555-4004');
  });

  it('stays as it was saved when it has no area code', () => {
    expect(formatPhone('3555-4004')).toBe('3555-4004');
  });
});
