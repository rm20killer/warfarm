import allRelicsJson from './generated/all-relics.json';
import { RelicEra, DropRarity } from '../types/warframe';

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
  vaulted: boolean;
  rewards: RelicRewardEntry[];
}

export interface PrimeComponentRelicDrop {
  componentName: string;
  relicId: string;
  era: RelicEra;
  relicName: string;
  fullName: string;
  rarity: DropRarity;
  intactChance: number;
  radiantChance: number;
  vaulted: boolean;
}

export interface PrimeComponentRelicSummary {
  componentName: string;
  relics: PrimeComponentRelicDrop[];
  highestIntactRate: number;
  highestRadiantRate: number;
  unvaultedCount: number;
  vaultedCount: number;
}

export type RelicRefinement = 'Intact' | 'Exceptional' | 'Flawless' | 'Radiant';

export const REFINEMENT_TRACES: Record<RelicRefinement, number> = {
  Intact: 0,
  Exceptional: 25,
  Flawless: 50,
  Radiant: 100,
};

export interface RewardProbabilities {
  rarity: DropRarity;
  intact: number;
  exceptional: number;
  flawless: number;
  radiant: number;
}

export function getRewardRefinementChances(rarity: DropRarity): RewardProbabilities {
  if (rarity === 'Rare') {
    return {
      rarity: 'Rare',
      intact: 2.0,
      exceptional: 4.0,
      flawless: 6.0,
      radiant: 10.0,
    };
  } else if (rarity === 'Uncommon') {
    return {
      rarity: 'Uncommon',
      intact: 11.0,
      exceptional: 13.0,
      flawless: 17.0,
      radiant: 20.0,
    };
  } else {
    return {
      rarity: 'Common',
      intact: 25.33,
      exceptional: 23.33,
      flawless: 20.0,
      radiant: 16.67,
    };
  }
}

export function calculateSquadSuccessProbability(singleChancePercent: number, squadSize: number = 4): number {
  const p = singleChancePercent / 100;
  const squadChance = 1 - Math.pow(1 - p, squadSize);
  return Number((squadChance * 100).toFixed(2));
}

export const ALL_RELICS: RelicEntry[] = allRelicsJson as RelicEntry[];

const RELICS_BY_ID = new Map<string, RelicEntry>();
ALL_RELICS.forEach((r) => {
  const eraL = r.era.toLowerCase();
  const nameL = r.name.toLowerCase();
  const fullL = r.fullName.toLowerCase();
  const idL = r.id.toLowerCase();

  RELICS_BY_ID.set(idL, r);
  RELICS_BY_ID.set(fullL, r);
  RELICS_BY_ID.set(`${eraL} ${nameL}`, r);
  RELICS_BY_ID.set(`${eraL}_${nameL}`, r);
  RELICS_BY_ID.set(`${idL}_relic`, r);
  RELICS_BY_ID.set(`${eraL}_${nameL}_relic`, r);
  RELICS_BY_ID.set(`${eraL} ${nameL} relic`, r);
  RELICS_BY_ID.set(`${nameL} relic`, r);
  if (!RELICS_BY_ID.has(nameL)) {
    RELICS_BY_ID.set(nameL, r);
  }
});

export function getAllRelics(): RelicEntry[] {
  return ALL_RELICS;
}

export function getRelicById(idOrName: string): RelicEntry | undefined {
  if (!idOrName) return undefined;
  const raw = idOrName.trim().toLowerCase();
  if (RELICS_BY_ID.has(raw)) return RELICS_BY_ID.get(raw);

  const norm = raw.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  if (RELICS_BY_ID.has(norm)) return RELICS_BY_ID.get(norm);

  const withoutRelic = raw.replace(/\brelic\b/g, '').trim();
  if (RELICS_BY_ID.has(withoutRelic)) return RELICS_BY_ID.get(withoutRelic);

  const normWithoutRelic = withoutRelic.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  if (RELICS_BY_ID.has(normWithoutRelic)) return RELICS_BY_ID.get(normWithoutRelic);

  return undefined;
}

export function getRelicsByEra(era: RelicEra | 'All', vaultFilter: RelicVaultFilter = 'All'): RelicEntry[] {
  let list = era === 'All' ? ALL_RELICS : ALL_RELICS.filter((r) => r.era.toLowerCase() === era.toLowerCase());
  if (vaultFilter === 'Unvaulted') {
    list = list.filter((r) => !r.vaulted);
  } else if (vaultFilter === 'Vaulted') {
    list = list.filter((r) => r.vaulted);
  }
  return list;
}

export function searchRelics(query: string, era: RelicEra | 'All' = 'All', vaultFilter: RelicVaultFilter = 'All'): RelicEntry[] {
  const q = query.trim().toLowerCase();
  const eraFiltered = getRelicsByEra(era, vaultFilter);
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
  if (!primeItemName) return result;

  const rawQuery = primeItemName.trim().toLowerCase();
  const suffixMatch = rawQuery.match(/\s+(blueprint|barrel|receiver|stock|blade|blades|handle|hilt|guard|grip|string|upper limb|lower limb|disc|gauntlet|pouch|stars|ornament|chain|head|motor|heatsink|link|chassis|neuroptics|systems|harness|wings|helmet|carapace|cerebrum)(\s+blueprint)?$/i);

  let parentPrimeQuery = rawQuery;
  let specificPartQuery: string | null = null;
  if (suffixMatch && suffixMatch.index !== undefined) {
    specificPartQuery = rawQuery;
    parentPrimeQuery = rawQuery.slice(0, suffixMatch.index).trim();
  }

  for (const relic of ALL_RELICS) {
    for (const rw of relic.rewards) {
      const rwLower = rw.itemName.toLowerCase();

      if (specificPartQuery) {
        if (rwLower === specificPartQuery || rwLower.includes(specificPartQuery)) {
          let partLabel = rw.itemName;
          const idx = rwLower.indexOf(parentPrimeQuery);
          if (idx !== -1) {
            partLabel = rw.itemName.slice(idx + parentPrimeQuery.length).trim();
          }
          if (!partLabel) partLabel = rw.itemName;

          if (!result[partLabel]) result[partLabel] = [];
          result[partLabel].push({
            componentName: partLabel,
            relicId: relic.id,
            era: relic.era,
            relicName: relic.name,
            fullName: relic.fullName,
            rarity: rw.rarity,
            intactChance: rw.intactChance,
            radiantChance: rw.radiantChance,
            vaulted: relic.vaulted,
          });
        }
      } else if (rwLower.includes(parentPrimeQuery)) {
        let partName = rw.itemName;
        const primeIdx = rwLower.indexOf(parentPrimeQuery);
        if (primeIdx !== -1) {
          partName = rw.itemName.slice(primeIdx + parentPrimeQuery.length).trim();
        }
        if (!partName) {
          partName = 'Blueprint';
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
          rarity: rw.rarity,
          intactChance: rw.intactChance,
          radiantChance: rw.radiantChance,
          vaulted: relic.vaulted,
        });
      }
    }
  }

  // Sort each component's relics: Unvaulted first, then era order, then relic name
  const eraOrder: Record<string, number> = { Lith: 1, Meso: 2, Neo: 3, Axi: 4, Requiem: 5 };
  for (const part of Object.keys(result)) {
    result[part].sort((a, b) => {
      if (a.vaulted !== b.vaulted) {
        return a.vaulted ? 1 : -1; // Unvaulted first
      }
      const ea = eraOrder[a.era] || 99;
      const eb = eraOrder[b.era] || 99;
      if (ea !== eb) return ea - eb;
      return a.relicName.localeCompare(b.relicName, undefined, { numeric: true });
    });
  }

  return result;
}
