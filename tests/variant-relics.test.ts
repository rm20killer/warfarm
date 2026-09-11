import { describe, it, expect } from 'vitest';
import {
  getAllRelics,
  getRelicsByEra,
  searchRelics,
  getRelicDropsForPrimeItem,
  getRelicById,
  getRewardRefinementChances,
  calculateSquadSuccessProbability,
} from '../src/shared/data/relic-database';
import {
  extractBaseItemName,
  getVariantType,
  getItemVariantFamily,
} from '../src/shared/data/item-database';
import { getCraftingRecipe } from '../src/shared/data/crafting-recipes';

describe('Relic Database & Prime Drops', () => {
  it('loads all 700+ void relics', () => {
    const relics = getAllRelics();
    expect(relics.length).toBeGreaterThanOrEqual(700);
  });

  it('filters relics by era correctly', () => {
    const axi = getRelicsByEra('Axi');
    const lith = getRelicsByEra('Lith');
    expect(axi.length).toBeGreaterThan(50);
    expect(lith.length).toBeGreaterThan(50);
    expect(axi.every((r) => r.era === 'Axi')).toBe(true);
    expect(lith.every((r) => r.era === 'Lith')).toBe(true);
  });

  it('searches relics by rewarded item name', () => {
    const results = searchRelics('Acceltra Prime');
    expect(results.length).toBeGreaterThanOrEqual(20);
    expect(
      results.some((r) => r.rewards.some((rw) => rw.itemName.includes('Acceltra Prime Barrel')))
    ).toBe(true);
  });

  it('returns all relic drop sources grouped by component for Prime items', () => {
    const acceltraDrops = getRelicDropsForPrimeItem('Acceltra Prime');
    const components = Object.keys(acceltraDrops);

    expect(components).toContain('Barrel');
    expect(components).toContain('Blueprint');
    expect(components).toContain('Receiver');
    expect(components).toContain('Stock');

    expect(acceltraDrops['Barrel'].length).toBeGreaterThanOrEqual(4);
    expect(acceltraDrops['Stock'].length).toBeGreaterThanOrEqual(2);

    const rhinoDrops = getRelicDropsForPrimeItem('Rhino Prime');
    expect(Object.keys(rhinoDrops).length).toBeGreaterThanOrEqual(3);
  });

  it('looks up relics by full name, code, and normalized id', () => {
    const r1 = getRelicById('Lith A12 Relic');
    const r2 = getRelicById('lith_a12');
    const r3 = getRelicById('Lith A12');
    const r4 = getRelicById('a12');

    expect(r1).toBeDefined();
    expect(r1?.fullName).toBe('Lith A12 Relic');
    expect(r2?.id).toBe('lith_a12');
    expect(r3?.fullName).toBe('Lith A12 Relic');
    expect(r4?.fullName).toBe('Lith A12 Relic');
    expect(r1?.rewards.length).toBe(6);
  });

  it('calculates refinement probabilities and squad chances correctly', () => {
    const rareChances = getRewardRefinementChances('Rare');
    expect(rareChances.intact).toBe(2.0);
    expect(rareChances.exceptional).toBe(4.0);
    expect(rareChances.flawless).toBe(6.0);
    expect(rareChances.radiant).toBe(10.0);

    const squadRadiantRare = calculateSquadSuccessProbability(10.0, 4);
    expect(squadRadiantRare).toBe(34.39);

    const uncommonChances = getRewardRefinementChances('Uncommon');
    expect(uncommonChances.radiant).toBe(20.0);

    const commonChances = getRewardRefinementChances('Common');
    expect(commonChances.radiant).toBe(16.67);
  });
});

describe('Variant Family Detection & Combat Stats Comparison', () => {
  it('extracts base name from Prime, Kuva, Tenet, Coda, and Syndicate items', () => {
    expect(extractBaseItemName('Acceltra Prime')).toBe('Acceltra');
    expect(extractBaseItemName('Kuva Hek')).toBe('Hek');
    expect(extractBaseItemName('Tenet Arca Plasmor')).toBe('Arca Plasmor');
    expect(extractBaseItemName('Coda Torid')).toBe('Torid');
    expect(extractBaseItemName('Vaykor Hek')).toBe('Hek');
    expect(extractBaseItemName('Ignis Wraith')).toBe('Ignis');
    expect(extractBaseItemName('Braton Vandal')).toBe('Braton');
    expect(extractBaseItemName('Rhino Prime')).toBe('Rhino');
  });

  it('correctly classifies variant types', () => {
    expect(getVariantType('Acceltra', 'Acceltra')).toBe('Base');
    expect(getVariantType('Acceltra Prime', 'Acceltra')).toBe('Prime');
    expect(getVariantType('Kuva Hek', 'Hek')).toBe('Kuva');
    expect(getVariantType('Tenet Arca Plasmor', 'Arca Plasmor')).toBe('Tenet');
    expect(getVariantType('Coda Torid', 'Torid')).toBe('Coda');
    expect(getVariantType('Vaykor Hek', 'Hek')).toBe('Syndicate');
    expect(getVariantType('Ignis Wraith', 'Ignis')).toBe('Wraith');
  });

  it('finds all variants in a weapon family with side-by-side comparison', () => {
    const hekFamily = getItemVariantFamily('Hek');
    expect(hekFamily).toBeDefined();
    expect(hekFamily?.category).toBe('Weapon');
    expect(hekFamily?.variants.length).toBeGreaterThanOrEqual(2);

    const variantNames = hekFamily!.variants.map((v) => v.name);
    expect(variantNames).toContain('Hek');
    expect(variantNames).toContain('Kuva Hek');
    expect(variantNames).toContain('Vaykor Hek');

    expect(hekFamily?.comparisonRows.length).toBeGreaterThan(5);
    const critRow = hekFamily?.comparisonRows.find((r) => r.label === 'Critical Chance');
    expect(critRow).toBeDefined();
  });

  it('finds Warframe variants (Base <-> Prime) with defensive stats comparison', () => {
    const rhinoComparison = getItemVariantFamily('Rhino');
    expect(rhinoComparison).toBeDefined();
    expect(rhinoComparison?.category).toBe('Warframe');
    expect(rhinoComparison?.selectedVariantName).toBe('Rhino Prime');

    const armorRow = rhinoComparison?.comparisonRows.find((r) => r.label === 'Armor');
    expect(armorRow).toBeDefined();
    expect(armorRow?.isImprovement).toBe(true);
  });
});

import {
  parseItemComponent,
  getParentItemComponents,
  resolveComponentFullName,
} from '../src/shared/data/item-components';

describe('Prime Component Crafting Recipes & Linking', () => {
  it('resolves component recipes for Prime Warframes', () => {
    const ashPrime = getCraftingRecipe('Ash Prime');
    expect(ashPrime).toBeDefined();
    expect(ashPrime?.componentRecipes).toBeDefined();
    expect(ashPrime?.componentRecipes?.length).toBe(3);

    const neuroptics = ashPrime?.componentRecipes?.find((c) => c.itemName.includes('Neuroptics'));
    expect(neuroptics?.ingredients.length).toBeGreaterThan(0);
  });

  it('resolves direct component lookups', () => {
    const chassis = getCraftingRecipe('Rhino Prime Chassis');
    expect(chassis).toBeDefined();
    expect(chassis?.buildPriceCredits).toBe(15000);
    expect(chassis?.ingredients.length).toBeGreaterThan(0);
  });

  it('parses Alternox Prime Blueprint and links back to Alternox Prime & base Alternox', () => {
    const info = parseItemComponent('Alternox Prime Blueprint');
    expect(info).toBeDefined();
    expect(info?.componentType).toBe('Blueprint');
    expect(info?.parentItemName).toBe('Alternox Prime');
    expect(info?.baseItemName).toBe('Alternox');
    expect(info?.isPrime).toBe(true);
    expect(info?.isBlueprint).toBe(true);
    expect(info?.siblingComponents.length).toBeGreaterThanOrEqual(1);

    const recipe = info?.craftingRecipe;
    expect(recipe).toBeDefined();
    expect(recipe?.ingredients.length).toBeGreaterThan(0);
  });

  it('parses Perigale Prime Receiver and links back to Perigale Prime & base Perigale', () => {
    const info = parseItemComponent('Perigale Prime Receiver');
    expect(info).toBeDefined();
    expect(info?.componentType).toBe('Receiver');
    expect(info?.parentItemName).toBe('Perigale Prime');
    expect(info?.baseItemName).toBe('Perigale');
    expect(info?.isPrime).toBe(true);
    expect(info?.isPreCraftedDrop).toBe(true);
    expect(info?.siblingComponents.length).toBeGreaterThanOrEqual(1);

    const parentComponents = getParentItemComponents('Perigale Prime');
    expect(parentComponents.length).toBeGreaterThanOrEqual(1);
    expect(parentComponents.some((p) => p.shortName === 'Receiver' || p.name.includes('Receiver'))).toBe(true);
  });

  it('resolves full component names from short ingredient labels', () => {
    expect(resolveComponentFullName('Barrel', 'Acceltra Prime')).toBe('Acceltra Prime Barrel');
    expect(resolveComponentFullName('Receiver', 'Perigale Prime')).toBe('Perigale Prime Receiver');
    expect(resolveComponentFullName('Orokin Cell', 'Alternox Prime')).toBe('Orokin Cell');
  });
});

