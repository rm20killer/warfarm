import { describe, it, expect } from 'vitest';
import {
  getDetailedMod,
  getAllMods,
  generateModRankStats,
  calculateModEndoToMax,
  calculateModCreditsToMax,
  calculateTradingTax,
} from '../src/shared/data/mod-database';
import {
  getAllWarframes,
  getAllWeapons,
  getAllLootMods,
  getLootSource,
} from '../src/shared/data/loot-sources';
import {
  getItemGeneralInfo,
  getWeaponCombatStats,
  getWeaponExtraInfo,
} from '../src/shared/data/item-database';

describe('Contagious Bond & Directory Data Integrity', () => {
  it('correctly provides Contagious Bond general info, stats progression, and vendor source', () => {
    const mod = getDetailedMod('Contagious Bond');
    expect(mod).toBeDefined();
    if (!mod) return;

    // General Information
    expect(mod.name).toBe('Contagious Bond');
    expect(mod.polarity).toBe('Naramon');
    expect(mod.rarity).toBe('Rare');
    expect(mod.baseCost).toBe(4);
    expect(mod.maxRank).toBe(5);

    // Endo, Credits, Tax calculations
    expect(calculateModEndoToMax(mod.rarity, mod.maxRank)).toBe(930);
    expect(calculateModCreditsToMax(mod.rarity, mod.maxRank)).toBe(44919);
    expect(calculateTradingTax(mod.rarity)).toBe(8000);

    // Vendor Acquisition
    expect(mod.vendorSource).toBeDefined();
    expect(mod.vendorSource?.vendorName).toBe('Son');
    expect(mod.vendorSource?.standingCost).toBe('20,000 Standing');
    expect(mod.vendorSource?.rankRequirement).toBe('Rank 3 - Associate');
    expect(mod.vendorSource?.factionOrSyndicate).toBe('Entrati');
    expect(mod.vendorSource?.location).toContain('Necralisk');

    // Rank 0 to Rank 5 Stat Progression
    const rankStats = generateModRankStats(mod);
    expect(rankStats).toHaveLength(6);

    // Rank 0: 8% spread, 1.5m, drain 4
    expect(rankStats[0].rank).toBe(0);
    expect(rankStats[0].cost).toBe(4);
    expect(rankStats[0].statValues.spread).toBe('8%');
    expect(rankStats[0].statValues.radius).toBe('1.5m');

    // Rank 1: 17% spread, 3m, drain 5
    expect(rankStats[1].rank).toBe(1);
    expect(rankStats[1].cost).toBe(5);
    expect(rankStats[1].statValues.spread).toBe('17%');
    expect(rankStats[1].statValues.radius).toBe('3m');

    // Rank 2: 25% spread, 4.5m, drain 6
    expect(rankStats[2].rank).toBe(2);
    expect(rankStats[2].cost).toBe(6);
    expect(rankStats[2].statValues.spread).toBe('25%');
    expect(rankStats[2].statValues.radius).toBe('4.5m');

    // Rank 3: 33% spread, 6m, drain 7
    expect(rankStats[3].rank).toBe(3);
    expect(rankStats[3].cost).toBe(7);
    expect(rankStats[3].statValues.spread).toBe('33%');
    expect(rankStats[3].statValues.radius).toBe('6m');

    // Rank 4: 42% spread, 7.5m, drain 8
    expect(rankStats[4].rank).toBe(4);
    expect(rankStats[4].cost).toBe(8);
    expect(rankStats[4].statValues.spread).toBe('42%');
    expect(rankStats[4].statValues.radius).toBe('7.5m');

    // Rank 5: 50% spread, 9m, drain 9
    expect(rankStats[5].rank).toBe(5);
    expect(rankStats[5].cost).toBe(9);
    expect(rankStats[5].statValues.spread).toBe('50%');
    expect(rankStats[5].statValues.radius).toBe('9m');
  });

  it('exports full list of detailed mods and loot mods for Mods directory page', () => {
    const detailedList = getAllMods();
    expect(detailedList.length).toBeGreaterThan(1500);
    expect(detailedList.some((m) => m.name === 'Contagious Bond')).toBe(true);
    expect(detailedList.some((m) => m.name === 'Tenacious Bond')).toBe(true);
    expect(detailedList.some((m) => m.name === 'Duplex Bond')).toBe(true);

    const lootMods = getAllLootMods();
    expect(lootMods.length).toBeGreaterThanOrEqual(4);
    expect(lootMods.some((m) => m.name === 'Power Drift')).toBe(true);
  });

  it('exports Warframes catalog with acquisition sources and component drops', () => {
    const warframes = getAllWarframes();
    expect(warframes.length).toBeGreaterThanOrEqual(100);

    const rhino = warframes.find((w) => w.name === 'Rhino');
    expect(rhino).toBeDefined();
    expect(rhino?.acquisitionType).toBe('Boss');
    expect(rhino?.bossOrEnemyName).toBe('Jackal');
    expect(rhino?.components).toBeDefined();
    expect(rhino?.components?.length).toBeGreaterThanOrEqual(4);
  });

  it('exports Weapons catalog with acquisition sources and specs', () => {
    const weapons = getAllWeapons();
    expect(weapons.length).toBeGreaterThanOrEqual(500);

    const drakgoon = weapons.find((w) => w.name === 'Drakgoon');
    expect(drakgoon).toBeDefined();
    expect(drakgoon?.category).toBe('Weapon');

    const generalInfo = getItemGeneralInfo('Drakgoon');
    expect(generalInfo).toBeDefined();
    expect(generalInfo?.masteryReq).toBe(5);

    const combatStats = getWeaponCombatStats('Drakgoon');
    expect(combatStats).toBeDefined();
    expect(combatStats?.modes.length).toBeGreaterThanOrEqual(2);

    const extras = getWeaponExtraInfo('Drakgoon');
    expect(extras).toBeDefined();
    expect(extras?.augments.some((a) => a.name === 'Fomorian Accelerant')).toBe(true);
    expect(extras?.variants.some((v) => v.variantName === 'Kuva Drakgoon')).toBe(true);
  });
});

