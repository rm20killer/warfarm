import { describe, it, expect } from 'vitest';
import { getLootSource, searchLootSources } from '../src/shared/data/loot-sources';
import { getSpecialChallenge, searchSpecialChallenges } from '../src/shared/data/special-mechanics';
import { searchPlanetMissions, getPlanet, getAllPlanets } from '../src/shared/data/planet-missions';
import {
  getItemVendorAcquisition,
  getCodaBatch,
  getIncarnonGenesisWeek,
} from '../src/shared/data/vendor-sources';
import { getResourceGuide } from '../src/shared/data/resource-guide';
import { getWeaponLineage } from '../src/wiki/pages/GearDirectoryPage';

describe('Nemesis, Incarnon & Voidplume Acquisitions', () => {
  it('correctly provides acquisition for Coda weapons from Eleanor', () => {
    const vendor = getItemVendorAcquisition('Coda Caustacyst');
    expect(vendor).toBeDefined();
    expect(vendor?.vendorName).toBe('Eleanor');
    expect(vendor?.location).toContain('Höllvania Central Mall');
    expect(vendor?.cost).toContain('10 Live Heartcell');
    expect(getCodaBatch('Coda Caustacyst')).toBe('Batch B');
    expect(getCodaBatch('Coda Hema')).toBe('Batch A');

    const loot = getLootSource('Coda Caustacyst');
    expect(loot).toBeDefined();
    expect(loot?.generalDropInfo).toContain('10 Live Heartcell');
    expect(loot?.generalDropInfo).toContain('Batch B');
  });

  it('correctly differentiates Tenet weapon acquisition sources', () => {
    // Ergo Glast Perrin Sequence melee
    const agendusVendor = getItemVendorAcquisition('Tenet Agendus');
    expect(agendusVendor).toBeDefined();
    expect(agendusVendor?.vendorName).toBe('Ergo Glast');
    expect(agendusVendor?.cost).toContain('40 Corrupted Holokeys');

    // Sister of Parvos Foundry drop
    const arcaVendor = getItemVendorAcquisition('Tenet Arca Plasmor');
    expect(arcaVendor).toBeDefined();
    expect(arcaVendor?.vendorName).toContain('Sister of Parvos');
    expect(arcaVendor?.notes).toContain('Foundry');
  });

  it('provides Kuva Lich vanquish and Foundry delivery details for Kuva weapons', () => {
    const bramma = getItemVendorAcquisition('Kuva Bramma');
    expect(bramma).toBeDefined();
    expect(bramma?.vendorName).toContain('Kuva Lich');
    expect(bramma?.notes).toContain('Foundry');
    expect(bramma?.fullAcquisitionSentence).toContain('Cassini');
  });

  it('provides Zariman and Incarnon Genesis adapter acquisition details', () => {
    // Zariman original
    const praedos = getItemVendorAcquisition('Praedos');
    expect(praedos).toBeDefined();
    expect(praedos?.vendorName).toBe('Cavalero');
    expect(praedos?.location).toContain('Chrysalith');

    // Incarnon Genesis
    const toridGenesis = getIncarnonGenesisWeek('Torid');
    expect(toridGenesis).toBeDefined();
    expect(toridGenesis?.week).toBe(4);
    expect(toridGenesis?.pool).toContain('Dual Toxocyst');

    const toridVendor = getItemVendorAcquisition('Torid');
    expect(toridVendor).toBeDefined();
    expect(toridVendor?.cost).toContain('20 Pathos Clamps');
  });

  it('provides full farming guides and nodes for Voidplumes', () => {
    const quillGuide = getResourceGuide('Voidplume Quill');
    expect(quillGuide).toBeDefined();
    expect(quillGuide?.category).toBe('OpenWorld');
    expect(quillGuide?.acquisition).toContain('Quinn');
    expect(quillGuide?.optimalNodes.length).toBeGreaterThanOrEqual(2);
    expect(quillGuide?.optimalNodes.some((n) => n.node.includes('Bounties'))).toBe(true);

    const pinionGuide = getResourceGuide('Voidplume Pinion');
    expect(pinionGuide).toBeDefined();
    expect(pinionGuide?.acquisition).toContain('Ravenous Void Angel');

    const crestGuide = getResourceGuide('Voidplume Crest');
    expect(crestGuide).toBeDefined();
    expect(crestGuide?.specialMechanics).toContain('8 Voidplumes');
  });
});

describe('Warframe & Weapon Loot Sources', () => {
  it('locates Rhino components from Jackal on Venus', () => {
    const rhino = getLootSource('Rhino');
    expect(rhino).toBeDefined();
    expect(rhino?.bossOrEnemyName).toBe('Jackal');
    expect(rhino?.locationNode).toBe('Fossa');
    expect(rhino?.planet).toBe('Venus');
    expect(rhino?.components).toBeDefined();
    expect(rhino?.components?.some((c) => c.partName.includes('Chassis'))).toBe(true);
  });

  it('locates Saryn components from Kela De Thaym on Sedna', () => {
    const saryn = getLootSource('Saryn');
    expect(saryn).toBeDefined();
    expect(saryn?.bossOrEnemyName).toBe('Kela De Thaym');
    expect(saryn?.locationNode).toBe('Merrow');
    expect(saryn?.planet).toBe('Sedna');
  });

  it('locates Dread weapon blueprint from Shadow Stalker', () => {
    const dread = getLootSource('Dread');
    expect(dread).toBeDefined();
    expect(dread?.category).toBe('Weapon');
    expect(dread?.bossOrEnemyName).toBe('Shadow Stalker');
    expect(dread?.components?.[0].dropChance).toBeGreaterThan(30);
  });

  it('searches loot sources by keyword', () => {
    const results = searchLootSources('Sedna');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.name === 'Saryn' || r.name === 'Gauss')).toBe(true);
  });
});

describe('Special Acquisition Mechanics & Lua Halls of Ascension', () => {
  it('contains complete walkthrough for the Lua Power Principle', () => {
    const powerChallenge = getSpecialChallenge('hall_power');
    expect(powerChallenge).toBeDefined();
    expect(powerChallenge?.rewardItem).toBe('Power Drift');
    expect(powerChallenge?.roomVisualCue).toContain('cylindrical');
    expect(powerChallenge?.stepByStepSolution.length).toBeGreaterThan(3);
    expect(powerChallenge?.stepByStepSolution[0]).toContain('capacitors');
  });

  it('contains complete walkthrough for the Lua Agility Principle', () => {
    const agilityChallenge = getSpecialChallenge('hall_agility');
    expect(agilityChallenge).toBeDefined();
    expect(agilityChallenge?.rewardItem).toBe('Agility Drift');
    expect(agilityChallenge?.recommendedFrames.some((f) => f.includes('Titania'))).toBe(true);
  });

  it('contains guide for Orokin Dragon Key Vaults on Deimos', () => {
    const vaultGuide = getSpecialChallenge('orokin_vault');
    expect(vaultGuide).toBeDefined();
    expect(vaultGuide?.rewardItem).toContain('Corrupted Mods');
    expect(vaultGuide?.stepByStepSolution.some((s) => s.includes('Dragon Key'))).toBe(true);
  });

  it('searches special challenges by query', () => {
    const luaChallenges = searchSpecialChallenges('Lua');
    expect(luaChallenges.length).toBeGreaterThanOrEqual(7);
  });
});

describe('Planet & Mission Drop Tables', () => {
  it('returns all major planets in Star Chart', () => {
    const planets = getAllPlanets();
    expect(planets.length).toBeGreaterThan(7);
    expect(planets.some((p) => p.name === 'Jupiter')).toBe(true);
    expect(planets.some((p) => p.name === 'Lua')).toBe(true);
    expect(planets.some((p) => p.name === 'Void')).toBe(true);
  });

  it('finds mission drops for Fossa on Venus', () => {
    const missions = searchPlanetMissions('Fossa');
    expect(missions.length).toBeGreaterThan(0);
    const fossa = missions[0];
    expect(fossa.node).toBe('Fossa');
    expect(fossa.specialDrops?.some((d) => d.includes('Rhino'))).toBe(true);
  });

  it('finds endless rotation drops for Cameria on Jupiter', () => {
    const missions = searchPlanetMissions('Cameria');
    expect(missions.length).toBeGreaterThan(0);
    const cameria = missions[0];
    expect(cameria.rotationA?.length).toBeGreaterThan(0);
    expect(cameria.rotationB?.length).toBeGreaterThan(0);
    expect(cameria.rotationC?.length).toBeGreaterThan(0);
  });
});

describe('Weapon Lineage Detection & Sorting', () => {
  it('identifies Incarnon Genesis and Zariman original weapons', () => {
    expect(getWeaponLineage('Hate')).toBe('Incarnon');
    expect(getWeaponLineage('Torid')).toBe('Incarnon');
    expect(getWeaponLineage('Braton Prime')).toBe('Incarnon');
    expect(getWeaponLineage('Laetum')).toBe('Incarnon');
    expect(getWeaponLineage('Phenmor')).toBe('Incarnon');
    expect(getWeaponLineage('Praedos')).toBe('Incarnon');
  });

  it('identifies Technocyte Coda weapons', () => {
    expect(getWeaponLineage('Coda Hema')).toBe('Coda');
    expect(getWeaponLineage('Coda Caustacyst')).toBe('Coda');
    expect(getWeaponLineage('Coda Torid')).toBe('Coda');
  });

  it('identifies Tenet Sister and Ergo Glast weapons', () => {
    expect(getWeaponLineage('Tenet Arca Plasmor')).toBe('Tenet');
    expect(getWeaponLineage('Tenet Exec')).toBe('Tenet');
    expect(getWeaponLineage('Tenet Envoy')).toBe('Tenet');
  });

  it('identifies Kuva Lich weapons', () => {
    expect(getWeaponLineage('Kuva Bramma')).toBe('Kuva');
    expect(getWeaponLineage('Kuva Nukor')).toBe('Kuva');
  });

  it('returns null for non-lineage weapons', () => {
    expect(getWeaponLineage('Drakgoon')).toBeNull();
    expect(getWeaponLineage('Karak')).toBeNull();
  });
});

