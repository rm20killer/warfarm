import { describe, it, expect } from 'vitest';
import { findSimilarItems } from '../src/shared/utils/fuzzy-search';

describe('Fuzzy Search & Did You Mean Matching', () => {
  it('suggests Acceltra and Acceltra Prime for typo "acceltra prem"', () => {
    const results = findSimilarItems('acceltra prem');
    expect(results.length).toBeGreaterThan(0);
    const names = results.map((r) => r.name);
    expect(names.some((n) => n.includes('Acceltra'))).toBe(true);
  });

  it('suggests Excalibur for partial query "excal"', () => {
    const results = findSimilarItems('excal');
    expect(results.length).toBeGreaterThan(0);
    const names = results.map((r) => r.name);
    expect(names.some((n) => n.includes('Excalibur'))).toBe(true);
  });

  it('suggests Wisp Prime for "wisp prim"', () => {
    const results = findSimilarItems('wisp prim');
    expect(results.length).toBeGreaterThan(0);
    const names = results.map((r) => r.name);
    expect(names).toContain('Wisp Prime');
  });

  it('suggests Lith A12 Relic for "a12"', () => {
    const results = findSimilarItems('a12');
    expect(results.length).toBeGreaterThan(0);
    const names = results.map((r) => r.name);
    expect(names).toContain('Lith A12 Relic');
  });

  it('suggests Lith A12 Relic for "Lith A12"', () => {
    const results = findSimilarItems('Lith A12');
    expect(results.length).toBeGreaterThan(0);
    const names = results.map((r) => r.name);
    expect(names[0]).toBe('Lith A12 Relic');
  });

  it('handles empty or very short query gracefully', () => {
    expect(findSimilarItems('')).toEqual([]);
    expect(findSimilarItems('a')).toEqual([]);
  });
});

