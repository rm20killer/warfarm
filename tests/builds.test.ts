import { describe, it, expect } from 'vitest';
import {
  getRecommendedBuildsForItem,
  CURATED_BUILDS,
} from '../src/shared/data/recommended-builds';

describe('Recommended Builds System', () => {
  it('contains curated builds for popular Warframes and Weapons', () => {
    expect(CURATED_BUILDS.length).toBeGreaterThanOrEqual(10);
    const rhinoBuild = CURATED_BUILDS.find((b) => b.targetItem === 'Rhino');
    expect(rhinoBuild).toBeDefined();
    expect(rhinoBuild?.mods.length).toBe(8);
    expect(rhinoBuild?.mods.some((m) => m.modName === 'Ironclad Charge')).toBe(true);
  });

  it('retrieves curated builds for Rhino with external community links', () => {
    const builds = getRecommendedBuildsForItem('Rhino', 'Warframe');
    expect(builds.length).toBeGreaterThanOrEqual(2);

    const steelPathBuild = builds.find((b) => b.archetype === 'Steel Path');
    expect(steelPathBuild).toBeDefined();
    expect(steelPathBuild?.externalLinks?.reframedUrl).toContain('reframed.site');
    expect(steelPathBuild?.externalLinks?.redditUrl).toContain('reddit.com');
    expect(steelPathBuild?.externalLinks?.tiktokUrl).toContain('tiktok.com');
    expect(steelPathBuild?.externalLinks?.overframeUrl).toContain('overframe.gg');
  });

  it('returns empty array for items without custom builds', () => {
    const builds = getRecommendedBuildsForItem('NonExistentItemXYZ', 'Warframe');
    expect(builds).toEqual([]);
  });

  it('returns empty array for uncurated weapons', () => {
    const builds = getRecommendedBuildsForItem('Stug', 'Secondary');
    expect(builds).toEqual([]);
  });
});

