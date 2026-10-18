import { describe, it, expect } from 'vitest';
import { translateEnToHi, translateHiToEn } from './translation';

describe('Bidirectional Translation Engine', () => {
  it('translates civic and political phrases from English to Hindi', () => {
    expect(translateEnToHi('Civic Opinion Poll')).toContain('नागरिक जनमत सर्वेक्षण');
    expect(translateEnToHi('Prime Minister')).toContain('प्रधानमंत्री');
    expect(translateEnToHi('Chief Minister')).toContain('मुख्यमंत्री');
    expect(translateEnToHi('Delhi Assembly Civic Opinion Poll 2029')).toContain('दिल्ली');
    expect(translateEnToHi('Delhi Assembly Civic Opinion Poll 2029')).toContain('विधानसभा');
    expect(translateEnToHi('Delhi Assembly Civic Opinion Poll 2029')).toContain('नागरिक जनमत सर्वेक्षण');
  });

  it('translates Hindi civic terms to English', () => {
    const en = translateHiToEn('मुख्यमंत्री जनमत सर्वेक्षण');
    expect(en).toContain('Chief Minister');
    expect(en).toContain('Poll');
  });

  it('translates party names with bidirectional accuracy', () => {
    expect(translateEnToHi('Aam Aadmi Party')).toContain('आप (AAP)');
    expect(translateEnToHi('Bharatiya Janata Party')).toContain('भारतीय');
    expect(translateEnToHi('Bharatiya Janata Party')).toContain('जनता');
    expect(translateEnToHi('Samajwadi Party')).toContain('सपा (SP)');
  });

  it('handles empty and whitespace strings gracefully', () => {
    expect(translateEnToHi('')).toBe('');
    expect(translateEnToHi('   ')).toBe('');
    expect(translateHiToEn('')).toBe('');
    expect(translateHiToEn('   ')).toBe('');
  });
});
