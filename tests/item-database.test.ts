import { describe, it, expect } from 'vitest';
import {
  getItemGeneralInfo,
  getWeaponCombatStats,
  getWeaponExtraInfo,
  getEnemyDropsForItem,
} from '../src/shared/data/item-database';
import { getCraftingRecipe } from '../src/shared/data/crafting-recipes';
import { getLootSource } from '../src/shared/data/loot-sources';
import { getItemVendorAcquisition, getIncarnonGenesisDetails } from '../src/shared/data/vendor-sources';
import { getDetailedMod } from '../src/shared/data/mod-database';
import { searchPlanetMissions, getMissionDetail } from '../src/shared/data/planet-missions';

describe('Drakgoon & Weapon Item Data', () => {
  it('loads General Information for Drakgoon', () => {
    const general = getItemGeneralInfo('Drakgoon');
    expect(general).toBeDefined();
    expect(general?.type).toContain('Primary');
    expect(general?.type).toContain('Shotgun');
    expect(general?.masteryReq).toBe(5);
    expect(general?.polarity).toBe('Naramon');
    expect(general?.trigger).toContain('Charge');
    expect(general?.ammoType).toContain('Shotgun');
    expect(general?.rivenDisposition).toContain('1.35x');
    expect(general?.introduced).toContain('Update 11.3');
    expect(general?.vendorSources).toContain('Market Blueprint');
    expect(general?.officialDropSourceUrl).toBe('https://www.warframe.com/droptables');
  });

  it('loads Combat and Damage Stats for Drakgoon with uncharged and charged modes', () => {
    const stats = getWeaponCombatStats('Drakgoon');
    expect(stats).toBeDefined();
    expect(stats?.pelletCount).toBe(10);
    expect(stats?.critChance).toBe('7.5%');
    expect(stats?.critMultiplier).toBe('2.0x');
    expect(stats?.statusChance).toBe('10.0% (per pellet)');
    expect(stats?.magazine).toBe(7);
    expect(stats?.reload).toBe('2.3s');
    expect(stats?.mechanicsNote).toContain('ricochet');

    expect(stats?.modes).toHaveLength(2);
    const uncharged = stats?.modes[0];
    expect(uncharged?.modeName).toContain('Uncharged');
    expect(uncharged?.damageTotal).toBe(300);
    expect(uncharged?.damageTypes.Slash).toBe(210);

    const charged = stats?.modes[1];
    expect(charged?.modeName).toContain('Charged');
    expect(charged?.damageTotal).toBe(700);
    expect(charged?.damageTypes.Slash).toBe(490);
  });

  it('loads Drakgoon augment mod (Fomorian Accelerant) and Kuva variant', () => {
    const extras = getWeaponExtraInfo('Drakgoon');
    expect(extras).toBeDefined();
    expect(extras?.augments).toHaveLength(1);
    expect(extras?.augments[0].name).toBe('Fomorian Accelerant');
    expect(extras?.augments[0].source).toContain('Kela De Thaym');
    expect(extras?.augments[0].effect).toContain('Flak Bounce');

    expect(extras?.variants).toHaveLength(1);
    expect(extras?.variants[0].variantName).toBe('Kuva Drakgoon');
    expect(extras?.variants[0].acquisition).toContain('Kuva Lich');
  });

  it('retrieves Drakgoon crafting recipe with 24h cook time and required resources', () => {
    const recipe = getCraftingRecipe('Drakgoon');
    expect(recipe).toBeDefined();
    expect(recipe?.buildTimeText).toBe('24 hours');
    expect(recipe?.buildPriceCredits).toBe(30000);
    expect(recipe?.rushPricePlat).toBe(40);
    expect(recipe?.ingredients).toEqual([
      { name: 'Alloy Plate', count: 950, isComponent: false },
      { name: 'Circuits', count: 1100, isComponent: false },
      { name: 'Morphics', count: 5, isComponent: false },
      { name: 'Nano Spores', count: 5500, isComponent: false },
    ]);
  });

  it('retrieves Market acquisition for Drakgoon and boss drop for Fomorian Accelerant', () => {
    const acq = getItemVendorAcquisition('Drakgoon');
    expect(acq).toBeDefined();
    expect(acq?.syndicateOrStore).toBe('In-Game Market');
    expect(acq?.cost).toBe('20,000 Credits');

    const modAcq = getItemVendorAcquisition('Fomorian Accelerant');
    expect(modAcq).toBeDefined();
    expect(modAcq?.vendorName).toBe('Kela De Thaym');
    expect(modAcq?.location).toContain('Merrow');
  });

  it('retrieves Fomorian Accelerant mod stats and rank progression', () => {
    const mod = getDetailedMod('Fomorian Accelerant');
    expect(mod).toBeDefined();
    expect(mod?.type).toContain('Drakgoon');
    expect(mod?.maxRank).toBe(3);
    expect(mod?.polarity).toBe('Madurai');
    expect(mod?.rarity).toBe('Rare');
  });

  it('provides loot source entry for Drakgoon and Fomorian Accelerant', () => {
    const loot = getLootSource('Drakgoon');
    expect(loot).toBeDefined();
    expect(loot?.category).toBe('Weapon');

    const modLoot = getLootSource('Fomorian Accelerant');
    expect(modLoot).toBeDefined();
    expect(modLoot?.bossOrEnemyName).toBe('Kela De Thaym');
    expect(modLoot?.locationNode).toBe('Merrow');
  });
});

describe('Mission Selection, Drops, and Spawnable Enemies', () => {
  it('retrieves mission detail with spawnable enemies on Sedna > Merrow', () => {
    const detail = getMissionDetail('Merrow');
    expect(detail).toBeDefined();
    expect(detail?.planet.name).toBe('Sedna');
    expect(detail?.mission.node).toBe('Merrow');
    expect(detail?.mission.missionType).toBe('Assassination');

    // Verify all drops on Merrow include Saryn parts and Fomorian Accelerant
    expect(detail?.mission.specialDrops?.some((d) => d.includes('Saryn Neuroptics'))).toBe(true);
    expect(detail?.mission.specialDrops?.some((d) => d.includes('Fomorian Accelerant'))).toBe(true);

    // Verify spawnable enemies
    const enemies = detail?.mission.spawnableEnemies;
    expect(enemies).toBeDefined();
    expect(enemies?.length).toBeGreaterThan(0);

    const kela = enemies?.find((e) => e.name.includes('Kela De Thaym'));
    expect(kela).toBeDefined();
    expect(kela?.unitCategory).toBe('Boss');
    expect(kela?.armorOrHealthType).toContain('Alloy Armor');
    expect(kela?.drops.some((d) => d.itemName === 'Fomorian Accelerant')).toBe(true);
    expect(kela?.drops.some((d) => d.itemName === 'Saryn Chassis Blueprint')).toBe(true);
  });

  it('searches missions by spawnable enemy drop name', () => {
    const results = searchPlanetMissions('Fomorian Accelerant');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((m) => m.node === 'Merrow')).toBe(true);

    const conditionOverload = searchPlanetMissions('Condition Overload');
    expect(conditionOverload.length).toBeGreaterThan(0);
    expect(conditionOverload.some((m) => m.node === 'Ophelia')).toBe(true);
  });
});

describe('Official Enemy Drop Tables', () => {
  it('retrieves enemy drops for Condition Overload including Drekar Butcher', () => {
    const drops = getEnemyDropsForItem('Condition Overload');
    expect(drops).toBeDefined();
    expect(drops.length).toBeGreaterThan(0);
    const drekarButcher = drops.find((d) => d.enemyName.toLowerCase().includes('drekar butcher'));
    expect(drekarButcher).toBeDefined();
    expect(drekarButcher?.rarity).toBe('Legendary');
    expect(drekarButcher?.dropChance).toBe(0.67);
    expect(drekarButcher?.enemyDropChance).toBe(3);
  });

  it('retrieves enemy drops for Target Acquired mod including Tusk Thumper units', () => {
    const drops = getEnemyDropsForItem('Target Acquired');
    expect(drops).toBeDefined();
    expect(drops.length).toBeGreaterThan(0);
    const thumper = drops.find((d) => d.enemyName.toLowerCase().includes('thumper'));
    expect(thumper).toBeDefined();
    expect(thumper?.dropChance).toBeGreaterThan(0);
  });

  it('retrieves Stalker enemy drops for Dread weapon and blueprint', () => {
    const dropsWeapon = getEnemyDropsForItem('Dread');
    expect(dropsWeapon.length).toBeGreaterThan(0);
    const stalker = dropsWeapon.find((d) => d.enemyName.toLowerCase().includes('stalker'));
    expect(stalker).toBeDefined();
    expect(stalker?.dropChance).toBeGreaterThan(30);

    const dropsBp = getEnemyDropsForItem('Dread Blueprint');
    expect(dropsBp.length).toBeGreaterThan(0);
    expect(dropsBp.some((d) => d.enemyName.toLowerCase().includes('stalker'))).toBe(true);
  });

  it('retrieves enemy drop table for Tellurium resource', () => {
    const drops = getEnemyDropsForItem('Tellurium');
    expect(drops).toBeDefined();
    expect(drops.length).toBeGreaterThan(0);
    expect(drops[0].dropChance).toBeGreaterThan(0);
  });

  it('retrieves Jackal boss drop for Rhino Chassis Blueprint', () => {
    const drops = getEnemyDropsForItem('Rhino Chassis Blueprint');
    expect(drops).toBeDefined();
    expect(drops.length).toBeGreaterThan(0);
    const jackal = drops.find((d) => d.enemyName.toLowerCase().includes('jackal'));
    expect(jackal).toBeDefined();
    expect(jackal?.dropChance).toBe(38.72);
  });

  it('returns empty array for unknown item or empty string', () => {
    expect(getEnemyDropsForItem('')).toEqual([]);
    expect(getEnemyDropsForItem('non_existent_fake_item_999')).toEqual([]);
  });
});

describe('Incarnon Genesis Data & Evolutions', () => {
  it('retrieves Hate Incarnon Genesis with installation requirements and evolutions', () => {
    const hate = getIncarnonGenesisDetails('Hate');
    expect(hate).toBeDefined();
    expect(hate?.id).toBe('hate');
    expect(hate?.weaponName).toBe('Hate');
    expect(hate?.circuitWeek).toBe(6);

    // Requirements check
    expect(hate?.installationRequirements).toBeDefined();
    const reqs = hate!.installationRequirements;
    const clamp = reqs.find((r) => r.name === 'Pathos Clamp');
    const dracroot = reqs.find((r) => r.name === 'Dracroot');
    const mawFang = reqs.find((r) => r.name === 'Maw Fang');

    expect(clamp?.count).toBe(20);
    expect(dracroot?.count).toBe(70);
    expect(mawFang?.count).toBe(20);

    // Acquisition & Overview check
    expect(hate?.acquisition).toContain('Duviri Paradox');
    expect(hate?.acquisition).toContain('Angels of the Zariman');
    expect(hate?.acquisition).toContain('Steel Path');
    expect(hate?.acquisition).toContain('Cavalero');
    expect(hate?.acquisition).toContain('120 Platinum');
    expect(hate?.overview).toContain('Incarnon Form');

    // Evolutions check
    expect(hate?.evolutions.length).toBeGreaterThanOrEqual(4);
    const evo2 = hate?.evolutions.find((e) => e.tier === 'EVO2');
    expect(evo2).toBeDefined();
    expect(evo2?.challenge).toBeDefined();
    expect(evo2?.perks.some((p) => p.name === "Swordsman's Flourish")).toBe(true);
    expect(evo2?.perks.some((p) => p.name === "Stalker's Legacy")).toBe(true);
  });

  it('retrieves Torid Incarnon Genesis requirements and Week 4 rotation', () => {
    const torid = getIncarnonGenesisDetails('Torid');
    expect(torid).toBeDefined();
    expect(torid?.circuitWeek).toBe(4);
    const reqs = torid!.installationRequirements;
    expect(reqs.find((r) => r.name === 'Pathos Clamp')?.count).toBe(20);
    expect(reqs.find((r) => r.name === 'Rune Marrow')?.count).toBe(60);
    expect(reqs.find((r) => r.name === 'Maw Fang')?.count).toBe(20);
  });

  it('resolves variant weapons like Braton Prime to Braton Incarnon Genesis', () => {
    const bratonPrime = getIncarnonGenesisDetails('Braton Prime');
    expect(bratonPrime).toBeDefined();
    expect(bratonPrime?.weaponName).toBe('Braton');
    expect(bratonPrime?.circuitWeek).toBe(1);
    const reqs = bratonPrime!.installationRequirements;
    expect(reqs.find((r) => r.name === 'Pathos Clamp')?.count).toBe(20);
    expect(reqs.find((r) => r.name === 'Rune Marrow')?.count).toBe(60);
    expect(reqs.find((r) => r.name === 'Tasoma Extract')?.count).toBe(60);
  });

  it('returns undefined for non-incarnon weapons like Drakgoon', () => {
    expect(getIncarnonGenesisDetails('Drakgoon')).toBeUndefined();
    expect(getIncarnonGenesisDetails('')).toBeUndefined();
  });
});

