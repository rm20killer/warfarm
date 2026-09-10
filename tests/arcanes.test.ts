import { describe, it, expect } from 'vitest';
import {
  getAllArcanes,
  getArcane,
  getArcanesBySlot,
  searchArcanes,
  getArcaneSynergies,
} from '../src/shared/data/arcanes';
import { getLootSource } from '../src/shared/data/loot-sources';
import { getItemGeneralInfo } from '../src/shared/data/item-database';

describe('Arcanes Catalog & Ingestion Engine', () => {
  it('loads all 172 arcanes with complete typing and structure', () => {
    const arcanes = getAllArcanes();
    expect(arcanes.length).toBe(172);

    for (const a of arcanes) {
      expect(a.id).toBeTruthy();
      expect(a.name).toBeTruthy();
      expect(a.slot).toBeTruthy();
      expect(a.rarity).toBeTruthy();
      expect(a.maxRank).toBeGreaterThanOrEqual(3);
      expect(a.stats.length).toBe(a.maxRank + 1);
      expect(Array.isArray(a.drops)).toBe(true);
    }
  });

  it('verifies Arcane Energize progression, Eidolon drops, and dissolution pack', () => {
    const energize = getArcane('Arcane Energize');
    expect(energize).toBeDefined();
    expect(energize?.slot).toBe('Warframe');
    expect(energize?.rarity).toBe('Legendary');
    expect(energize?.maxRank).toBe(5);
    expect(energize?.dissolutionPack).toContain('Eidolon Arcane Collection');

    expect(energize?.stats[0].requiredCopies).toBe(1);
    expect(energize?.stats[0].arcanesToUpgrade).toBe(0);
    expect(energize?.stats[5].requiredCopies).toBe(21);
    expect(energize?.stats[5].arcanesToUpgrade).toBe(6);
    expect(energize?.stats[5].revives).toBe(1);

    const hydrolystDrop = energize?.drops.find((d) => d.source.includes('Eidolon Hydrolyst') || d.location.includes('Eidolon Hydrolyst'));
    expect(hydrolystDrop).toBeDefined();
    expect(hydrolystDrop?.chance).toBe(5);
  });

  it('verifies vendor and standing data for open-world and syndicate arcanes', () => {
    const paxSeeker = getArcane('Pax Seeker');
    expect(paxSeeker).toBeDefined();
    expect(paxSeeker?.slot).toBe('Kitgun');
    expect(paxSeeker?.vendorSource?.vendorName).toBe('Rude Zuud');
    expect(paxSeeker?.vendorSource?.location).toContain('Fortuna');

    const moltAug = getArcane('Molt Augmented');
    expect(moltAug).toBeDefined();
    expect(moltAug?.slot).toBe('Warframe');
    expect(moltAug?.vendorSource?.vendorName).toBe('Cavalero');
    expect(moltAug?.vendorSource?.location).toContain('Chrysalith');
    expect(moltAug?.dissolutionPack).toContain('Zariman Arcane Collection');

    const meleeExp = getArcane('Melee Exposure');
    expect(meleeExp).toBeDefined();
    expect(meleeExp?.slot).toBe('Melee');
    expect(meleeExp?.vendorSource?.vendorName).toBe('Bird 3');
    expect(meleeExp?.vendorSource?.location).toContain('Sanctum Anatomica');
    expect(meleeExp?.dissolutionPack).toContain('Whispers Arcane Collection');

    const meleeDup = getArcane('Melee Duplicate');
    expect(meleeDup).toBeDefined();
    expect(meleeDup?.slot).toBe('Melee');
    expect(meleeDup?.rarity).toBe('Legendary');
    expect(meleeDup?.dissolutionPack).toContain('Whispers Arcane Collection');
  });

  it('supports slot and source query filters', () => {
    const warframeArcanes = getArcanesBySlot('Warframe');
    expect(warframeArcanes.length).toBe(75);

    const primaryArcanes = getArcanesBySlot('Primary');
    expect(primaryArcanes.length).toBe(16);

    const secondaryArcanes = getArcanesBySlot('Secondary');
    expect(secondaryArcanes.length).toBe(18);

    const meleeArcanes = getArcanesBySlot('Melee');
    expect(meleeArcanes.length).toBe(12);

    const kitgunArcanes = getArcanesBySlot('Kitgun');
    expect(kitgunArcanes.length).toBe(8);

    const zawArcanes = getArcanesBySlot('Zaw');
    expect(zawArcanes.length).toBe(8);

    const eidolons = searchArcanes('', { source: 'eidolon' });
    expect(eidolons.length).toBeGreaterThanOrEqual(20);
    expect(eidolons.some((a) => a.name === 'Arcane Energize')).toBe(true);
    expect(eidolons.some((a) => a.name === 'Arcane Grace')).toBe(true);

    const steelPath = searchArcanes('', { source: 'steel_path' });
    expect(steelPath.some((a) => a.name === 'Primary Merciless')).toBe(true);
    expect(steelPath.some((a) => a.name === 'Secondary Deadhead')).toBe(true);
  });

  it('provides synergy recommendations for top tier arcanes', () => {
    const energizeSynergies = getArcaneSynergies('Arcane Energize');
    expect(energizeSynergies.length).toBeGreaterThan(0);
    expect(energizeSynergies.some((s) => s.itemName === 'Volt' || s.itemName === 'Saryn')).toBe(true);

    const avengerSynergies = getArcaneSynergies('Arcane Avenger');
    expect(avengerSynergies.length).toBeGreaterThan(0);
    expect(avengerSynergies.some((s) => s.itemName === 'Combat Discipline')).toBe(true);

    const secondaryMercilessSynergies = getArcaneSynergies('Secondary Merciless');
    expect(secondaryMercilessSynergies.length).toBeGreaterThan(0);
    expect(secondaryMercilessSynergies.some((s) => s.itemName === 'Kuva Nukor')).toBe(true);
  });

  it('integrates seamlessly with loot-sources and item-database', () => {
    const loot = getLootSource('Arcane Grace');
    expect(loot).toBeDefined();
    expect(loot?.category).toBe('Arcane');
    expect(loot?.generalDropInfo).toContain('Eidolon');

    const generalInfo = getItemGeneralInfo('Arcane Energize');
    expect(generalInfo).toBeDefined();
    expect(generalInfo?.type).toContain('Arcane');
    expect(generalInfo?.officialDropSourceUrl).toContain('wiki.warframe.com');
  });
});
