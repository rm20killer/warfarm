import { describe, it, expect } from 'vitest';
import { getItemMarketSlug, getMarketItemUrl } from '../src/shared/api/market-client';
import { findNameFamilyItems } from '../src/shared/utils/fuzzy-search';
import { getCraftingRecipe } from '../src/shared/data/crafting-recipes';
import { getRelicDropsForPrimeItem } from '../src/shared/data/relic-database';
import { getVendorByNameOrId, getVendorsSellingItem } from '../src/shared/data/vendor-database';
import { isItemTradeable } from '../src/shared/data/item-database';

describe('Market Client & Slug Formatting', () => {
  it('formats Prime weapons and Warframes as set slugs', () => {
    expect(getItemMarketSlug('Alternox Prime')).toBe('alternox_prime_set');
    expect(getItemMarketSlug('Rhino Prime')).toBe('rhino_prime_set');
    expect(getItemMarketSlug('Wisp Prime Set')).toBe('wisp_prime_set');
  });

  it('formats Warframe Prime parts as blueprint slugs', () => {
    expect(getItemMarketSlug('Rhino Prime Chassis')).toBe('rhino_prime_chassis_blueprint');
    expect(getItemMarketSlug('Rhino Prime Neuroptics')).toBe('rhino_prime_neuroptics_blueprint');
    expect(getItemMarketSlug('Rhino Prime Systems')).toBe('rhino_prime_systems_blueprint');
    expect(getItemMarketSlug('Rhino Prime Blueprint')).toBe('rhino_prime_blueprint');
  });

  it('formats weapon Prime components without blueprint suffix', () => {
    expect(getItemMarketSlug('Alternox Prime Barrel')).toBe('alternox_prime_barrel');
    expect(getItemMarketSlug('Alternox Prime Receiver')).toBe('alternox_prime_receiver');
    expect(getItemMarketSlug('Alternox Prime Stock')).toBe('alternox_prime_stock');
  });

  it('formats standard items and resources', () => {
    expect(getItemMarketSlug('Orokin Cell')).toBe('orokin_cell');
    expect(getItemMarketSlug('Molt Augmented')).toBe('molt_augmented');
    expect(getItemMarketSlug('Blind Rage')).toBe('blind_rage');
  });

  it('formats Primed and Archon mods without _set suffix', () => {
    expect(getItemMarketSlug('Primed Continuity')).toBe('primed_continuity');
    expect(getItemMarketSlug('Primed Flow')).toBe('primed_flow');
    expect(getItemMarketSlug('Primed Pressure Point')).toBe('primed_pressure_point');
    expect(getItemMarketSlug('Archon Continuity')).toBe('archon_continuity');
    expect(getMarketItemUrl('Primed Continuity')).toBe('https://warframe.market/items/primed_continuity');
  });

  it('generates correct market web item url', () => {
    expect(getMarketItemUrl('Alternox Prime')).toBe('https://warframe.market/items/alternox_prime_set');
    expect(getMarketItemUrl('Rhino Prime Chassis')).toBe('https://warframe.market/items/rhino_prime_chassis_blueprint');
  });
});

describe('Name Family & Search Disambiguation', () => {
  it('resolves family items for "molt" (Molt arcanes)', () => {
    const res = findNameFamilyItems('molt');
    expect(res.familyItems.length).toBeGreaterThan(0);
    const names = res.familyItems.map((i) => i.name);
    expect(names.some((n) => n.includes('Molt Augmented'))).toBe(true);
    expect(names.some((n) => n.includes('Molt Efficiency'))).toBe(true);
  });

  it('resolves category directory shortcut for "arcanes"', () => {
    const res = findNameFamilyItems('arcanes');
    expect(res.categoryShortcut).toBeDefined();
    expect(res.categoryShortcut?.path).toBe('/arcanes');
    expect(res.familyItems.length).toBeGreaterThan(0);
  });

  it('resolves category directory shortcut for "relics"', () => {
    const res = findNameFamilyItems('relics');
    expect(res.categoryShortcut).toBeDefined();
    expect(res.categoryShortcut?.path).toBe('/relics');
  });

  it('resolves family items for "archon"', () => {
    const res = findNameFamilyItems('archon');
    expect(res.familyItems.length).toBeGreaterThan(0);
    const names = res.familyItems.map((i) => i.name);
    expect(names.some((n) => n.includes('Archon') || n.includes('Shard'))).toBe(true);
  });
});

describe('Prime Item & Generic Guard Behavior', () => {
  it('does not synthesize a recipe or match all relics for generic "prime" query', () => {
    expect(getCraftingRecipe('prime')).toBeUndefined();
    expect(getRelicDropsForPrimeItem('prime')).toEqual({});
  });

  it('synthesizes recipe and matches relics for real prime items', () => {
    const alternox = getCraftingRecipe('Alternox Prime');
    expect(alternox).toBeDefined();
    expect(alternox?.ingredients.some((ing) => ing.name === 'Orokin Cell')).toBe(true);

    const rhinoDrops = getRelicDropsForPrimeItem('Rhino Prime');
    expect(Object.keys(rhinoDrops).length).toBeGreaterThan(0);
  });
});

describe('Vendor Database & Cephalon Suda Lookups', () => {
  it('retrieves Cephalon Suda with full offerings catalog', () => {
    const suda = getVendorByNameOrId('Cephalon Suda');
    expect(suda).toBeDefined();
    expect(suda?.currency).toBe('Standing');
    expect(suda?.offerings.length).toBeGreaterThan(50);
    expect(suda?.offerings.some((o) => o.itemName.includes('Entropy Spike'))).toBe(true);
  });

  it('finds vendors selling specific items like Entropy Spike', () => {
    const vendors = getVendorsSellingItem('Entropy Spike');
    expect(vendors.length).toBeGreaterThan(0);
    expect(vendors.some((v) => v.vendor.name === 'Cephalon Suda')).toBe(true);
  });
});

describe('Tradeability Checks (isItemTradeable)', () => {
  it('marks standard Warframes as untradeable and Prime Warframes as tradeable', () => {
    expect(isItemTradeable('Ash', { isWarframe: true, category: 'Warframe' })).toBe(false);
    expect(isItemTradeable('Rhino', { isWarframe: true, category: 'Warframe' })).toBe(false);
    expect(isItemTradeable('Excalibur', { isWarframe: true, category: 'Warframe' })).toBe(false);

    expect(isItemTradeable('Ash Prime', { isWarframe: true, category: 'Warframe' })).toBe(true);
    expect(isItemTradeable('Rhino Prime', { isWarframe: true, category: 'Warframe' })).toBe(true);
  });

  it('marks standard weapon components as untradeable and Prime parts as tradeable', () => {
    expect(isItemTradeable('Ash Systems Blueprint', { isComponent: true })).toBe(false);
    expect(isItemTradeable('Rhino Chassis Blueprint', { isComponent: true })).toBe(false);
    expect(isItemTradeable('Ash Prime Systems Blueprint', { isComponent: true })).toBe(true);
    expect(isItemTradeable('Alternox Prime Barrel', { isComponent: true })).toBe(true);
  });

  it('marks base star chart resources as untradeable', () => {
    expect(isItemTradeable('Orokin Cell', { category: 'Resource' })).toBe(false);
    expect(isItemTradeable('Ferrite', { category: 'Resource' })).toBe(false);
    expect(isItemTradeable('Tellurium', { category: 'Resource' })).toBe(false);
  });

  it('marks mods, arcanes, and relics as tradeable', () => {
    expect(isItemTradeable('Primed Continuity', { isMod: true })).toBe(true);
    expect(isItemTradeable('Blind Rage', { isMod: true })).toBe(true);
    expect(isItemTradeable('Molt Augmented', { isArcane: true })).toBe(true);
    expect(isItemTradeable('Lith A12 Relic', { isRelic: true })).toBe(true);
  });
});



