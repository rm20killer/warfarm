import { describe, it, expect } from 'vitest';
import { isOverwolf } from '../src/shared/utils/env';
import { getWikiUrl } from '../src/shared/api/wiki-client';
import {
  getResourceGuide,
  searchResourceGuides,
  RESOURCE_GUIDES,
} from '../src/shared/data/resource-guide';
import { getBestRelicSpots } from '../src/shared/api/drop-data';

describe('Environment Detection', () => {
  it('correctly detects non-Overwolf environment in Node/tests', () => {
    expect(isOverwolf()).toBe(false);
  });
});

describe('Wiki Client Helpers', () => {
  it('constructs correct official Warframe wiki URLs', () => {
    expect(getWikiUrl('Argon Crystal')).toBe('https://wiki.warframe.com/w/Argon_Crystal');
    expect(getWikiUrl('Wisp Prime')).toBe('https://wiki.warframe.com/w/Wisp_Prime');
    expect(getWikiUrl('Meso N15 Relic')).toBe('https://wiki.warframe.com/w/Meso_N15_Relic');
  });
});

describe('Resource Farming Knowledge Base', () => {
  it('contains comprehensive guide for Argon Crystal', () => {
    const argon = getResourceGuide('Argon Crystal');
    expect(argon).toBeDefined();
    expect(argon?.planets).toContain('Void');
    expect(argon?.category).toBe('Rare');
    expect(argon?.specialMechanics).toContain('Decay Timer');
    expect(argon?.optimalNodes.length).toBeGreaterThan(0);
    expect(argon?.optimalNodes[0].node).toBe('Mot');
  });

  it('contains comprehensive guide for Orokin Cell', () => {
    const cell = getResourceGuide('orokin_cell');
    expect(cell).toBeDefined();
    expect(cell?.planets).toContain('Saturn');
    expect(cell?.optimalNodes.some((n) => n.node === 'Piscinas')).toBe(true);
  });

  it('contains comprehensive guide for Tellurium', () => {
    const tellurium = getResourceGuide('Tellurium');
    expect(tellurium).toBeDefined();
    expect(tellurium?.planets).toContain('Uranus');
    expect(tellurium?.optimalNodes.some((n) => n.node === 'Ophelia')).toBe(true);
  });

  it('filters resource guides by search query', () => {
    const results = searchResourceGuides('Saturn');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.name === 'Orokin Cell')).toBe(true);

    const empty = searchResourceGuides('NonExistentResourceXYZ');
    expect(empty.length).toBe(0);
  });
});

describe('Relic Speedrun Spots', () => {
  it('returns high efficiency nodes for Lith relics', () => {
    const spots = getBestRelicSpots('Lith');
    expect(spots.length).toBeGreaterThan(0);
    expect(spots.some((s) => s.node === 'Hepit')).toBe(true);
  });

  it('returns high efficiency nodes for Axi relics', () => {
    const spots = getBestRelicSpots('Axi');
    expect(spots.length).toBeGreaterThan(0);
    expect(spots.some((s) => s.node === 'Apollo')).toBe(true);
  });

  it('returns high efficiency nodes for Meso and Neo relics', () => {
    const meso = getBestRelicSpots('Meso');
    expect(meso.some((s) => s.node === 'Ukko')).toBe(true);

    const neo = getBestRelicSpots('Neo');
    expect(neo.some((s) => s.node === 'Ukko')).toBe(true);
  });
});

