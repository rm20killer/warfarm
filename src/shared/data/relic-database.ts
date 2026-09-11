import allRelicsJson from './generated/all-relics.json';
import { RelicEra, DropRarity, RelicRefinement } from '../types/warframe';

export type { RelicRefinement };
export type RelicVaultFilter = 'All' | 'Unvaulted' | 'Vaulted';

export interface RelicRewardEntry {
  itemName: string;
  rarity: DropRarity;
  intactChance: number;
  radiantChance: number;
}

export interface RelicEntry {
  id: string;
  era: RelicEra;
  name: string;
  fullName: string;
  vaulted?: boolean;
  rewards: RelicRewardEntry[];
}

export interface PrimeComponentRelicDrop {
  componentName: string;
  relicId: string;
  era: RelicEra;
  relicName: string;
  fullName: string;
  vaulted?: boolean;
  rarity: DropRarity;
  intactChance: number;
  radiantChance: number;
}

export const REFINEMENT_TRACES: Record<RelicRefinement, number> = {
  Intact: 0,
  Exceptional: 25,
  Flawless: 50,
  Radiant: 100,
};

export interface RefinementChances {
  intact: number;
  exceptional: number;
  flawless: number;
  radiant: number;
}

export function getRewardRefinementChances(rarity: DropRarity): RefinementChances {
  const r = (rarity || '').toLowerCase();
  if (r.includes('rare')) {
    return { intact: 2.0, exceptional: 4.0, flawless: 6.0, radiant: 10.0 };
  }
  if (r.includes('uncommon')) {
    return { intact: 11.0, exceptional: 13.0, flawless: 17.0, radiant: 20.0 };
  }
  return { intact: 25.33, exceptional: 23.33, flawless: 20.0, radiant: 16.67 };
}

export function calculateSquadSuccessProbability(singleChancePercent: number, squadSize: number = 4): number {
  if (singleChancePercent <= 0) return 0;
  if (singleChancePercent >= 100) return 100;
  const p = singleChancePercent / 100;
  const failProb = Math.pow(1 - p, Math.max(1, squadSize));
  return Number(((1 - failProb) * 100).toFixed(2));
}

export const ALL_RELICS: RelicEntry[] = allRelicsJson as RelicEntry[];

const RELICS_BY_ID = new Map<string, RelicEntry>();
ALL_RELICS.forEach((r) => {
  RELICS_BY_ID.set(r.id.toLowerCase(), r);
  RELICS_BY_ID.set(r.fullName.toLowerCase(), r);
  RELICS_BY_ID.set(`${r.era.toLowerCase()} ${r.name.toLowerCase()}`, r);
});

export function getAllRelics(): RelicEntry[] {
  return ALL_RELICS;
}

export function getRelicById(idOrName: string): RelicEntry | undefined {
  const norm = idOrName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return RELICS_BY_ID.get(norm) || RELICS_BY_ID.get(idOrName.trim().toLowerCase());
}

export function getRelicsByEra(era: RelicEra | 'All'): RelicEntry[] {
  if (era === 'All') return ALL_RELICS;
  return ALL_RELICS.filter((r) => r.era.toLowerCase() === era.toLowerCase());
}

export function searchRelics(query: string, era: RelicEra | 'All' = 'All'): RelicEntry[] {
  const q = query.trim().toLowerCase();
  const eraFiltered = getRelicsByEra(era);
  if (!q) return eraFiltered;

  return eraFiltered.filter((r) => {
    if (r.fullName.toLowerCase().includes(q)) return true;
    if (r.name.toLowerCase().includes(q)) return true;
    if (r.era.toLowerCase().includes(q)) return true;
    return r.rewards.some((rw) => rw.itemName.toLowerCase().includes(q));
  });
}

/**
 * Maps a Prime item name (e.g., 'Acceltra Prime' or 'Rhino Prime') to all its
 * dropping relics, organized by component name (Blueprint, Barrel, Chassis, etc.).
 */
export function getRelicDropsForPrimeItem(primeItemName: string): Record<string, PrimeComponentRelicDrop[]> {
  const result: Record<string, PrimeComponentRelicDrop[]> = {};
  const query = primeItemName.trim().toLowerCase();

  for (const relic of ALL_RELICS) {
    for (const rw of relic.rewards) {
      const rwLower = rw.itemName.toLowerCase();
      if (rwLower.includes(query)) {
        let partName = rw.itemName;
        const primeIdx = rwLower.indexOf(query);
        if (primeIdx !== -1) {
          partName = rw.itemName.slice(primeIdx + primeItemName.length).trim();
        }
        if (!partName) {
          partName = 'Main Blueprint';
        }

        if (!result[partName]) {
          result[partName] = [];
        }

        result[partName].push({
          componentName: partName,
          relicId: relic.id,
          era: relic.era,
          relicName: relic.name,
          fullName: relic.fullName,
          vaulted: !!relic.vaulted,
          rarity: rw.rarity,
          intactChance: rw.intactChance,
          radiantChance: rw.radiantChance,
        });
      }
    }
  }

  // Sort each component's relics by era order (Lith, Meso, Neo, Axi, Requiem) then relic name
  const eraOrder: Record<string, number> = { Lith: 1, Meso: 2, Neo: 3, Axi: 4, Requiem: 5 };
  for (const part of Object.keys(result)) {
    result[part].sort((a, b) => {
      const ea = eraOrder[a.era] || 99;
      const eb = eraOrder[b.era] || 99;
      if (ea !== eb) return ea - eb;
      return a.relicName.localeCompare(b.relicName, undefined, { numeric: true });
    });
  }

  return result;
}

