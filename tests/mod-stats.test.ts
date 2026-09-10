import { describe, it, expect } from 'vitest';
import {
  getDetailedMod,
  calculateModEndoToMax,
  calculateModCreditsToMax,
  calculateTradingTax,
  generateModRankStats,
} from '../src/shared/data/mod-database';
import { getItemVendorAcquisition } from '../src/shared/data/vendor-sources';

describe('Mod Vendor Acquisition & Calculations', () => {
  it('contains vendor acquisition details for Mecha Empowered from Son', () => {
    const mod = getDetailedMod('Mecha Empowered');
    expect(mod).toBeDefined();
    expect(mod?.vendorSource).toBeDefined();
    expect(mod?.vendorSource?.vendorName).toBe('Son');
    expect(mod?.vendorSource?.factionOrSyndicate).toBe('Entrati');
    expect(mod?.vendorSource?.rankRequirement).toContain('Rank 3 - Associate');
    expect(mod?.vendorSource?.standingCost).toContain('20,000');
    expect(mod?.vendorSource?.location).toContain('Necralisk');
  });

  it('calculates exact Endo required to max rank', () => {
    // Rare Rank 5 mod: 30 * (2^5 - 1) = 930
    expect(calculateModEndoToMax('Rare', 5)).toBe(930);

    // Rare Rank 10 mod: 30 * (2^10 - 1) = 30,690
    expect(calculateModEndoToMax('Rare', 10)).toBe(30690);

    // Legendary Rank 10 mod: 40 * (2^10 - 1) = 40,920
    expect(calculateModEndoToMax('Legendary', 10)).toBe(40920);
  });

  it('calculates exact Credits required to max rank', () => {
    // Rare Rank 5 mod credit requirement
    expect(calculateModCreditsToMax('Rare', 5)).toBe(44919);
  });

  it('calculates trading tax according to rarity', () => {
    expect(calculateTradingTax('Common')).toBe(2000);
    expect(calculateTradingTax('Uncommon')).toBe(4000);
    expect(calculateTradingTax('Rare')).toBe(8000);
    expect(calculateTradingTax('Legendary')).toBe(1000000);
  });

  it('generates per-rank stats progression from Rank 0 to Max Rank', () => {
    const mod = getDetailedMod('Thermite Rounds');
    expect(mod).toBeDefined();
    if (!mod) return;

    const rankStats = generateModRankStats(mod);
    expect(rankStats.length).toBe(mod.maxRank + 1);

    // Rank 0: Drain = 4, Heat = 15%
    expect(rankStats[0].rank).toBe(0);
    expect(rankStats[0].cost).toBe(4);
    expect(rankStats[0].statValues.heat).toBe('15%');

    // Rank 3 (Max): Drain = 7, Heat = 60%
    expect(rankStats[3].rank).toBe(3);
    expect(rankStats[3].cost).toBe(7);
    expect(rankStats[3].statValues.heat).toBe('60%');
  });

  it('retrieves vendor acquisition for Clan Dojo items', () => {
    const wukong = getItemVendorAcquisition('Wukong');
    expect(wukong).toBeDefined();
    expect(wukong?.syndicateOrStore).toContain('Clan Dojo');
    expect(wukong?.location).toContain('Tenno Lab');
  });
});

