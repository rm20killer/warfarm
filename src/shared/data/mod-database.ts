import allModsJson from './generated/all-mods.json';
import vendorCatalogJson from './generated/vendor-catalog.json';

export type ModRarity = 'Common' | 'Uncommon' | 'Rare' | 'Legendary';
export type ModPolarity = 'Madurai' | 'Vazarin' | 'Naramon' | 'Zenurik' | 'Unairu' | 'Penjaga' | 'Umbra' | 'Universal';

export interface VendorSource {
  vendorName: string;
  factionOrSyndicate: string;
  standingCost: string;
  rankRequirement?: string;
  location: string;
  notes?: string;
}

export interface ModRankStat {
  rank: number;
  cost: number;
  description: string;
  statValues: Record<string, string>;
}

export interface DetailedModData {
  id: string;
  name: string;
  type: string;
  polarity: ModPolarity;
  rarity: ModRarity;
  baseCost: number;
  maxRank: number;
  introduced: string;
  descriptionTemplate: string;
  statLabels: string[];
  statGrowth: (rank: number) => Record<string, string>;
  vendorSource?: VendorSource;
  officialDropSourceUrl?: string;
}

export function calculateModEndoToMax(rarity: ModRarity, maxRank: number): number {
  const multiplierMap: Record<ModRarity, number> = {
    Common: 10,
    Uncommon: 20,
    Rare: 30,
    Legendary: 40,
  };
  const multiplier = multiplierMap[rarity] || 30;
  return multiplier * (Math.pow(2, maxRank) - 1);
}

export function calculateModCreditsToMax(rarity: ModRarity, maxRank: number): number {
  const endo = calculateModEndoToMax(rarity, maxRank);
  return Math.round(endo * 48.2995);
}

export function calculateTradingTax(rarity: ModRarity): number {
  const taxMap: Record<ModRarity, number> = {
    Common: 2000,
    Uncommon: 4000,
    Rare: 8000,
    Legendary: 1000000,
  };
  return taxMap[rarity] || 8000;
}

export function generateModRankStats(mod: DetailedModData): ModRankStat[] {
  const stats: ModRankStat[] = [];
  for (let r = 0; r <= mod.maxRank; r++) {
    const cost = mod.baseCost + r;
    const statValues = mod.statGrowth(r);
    stats.push({
      rank: r,
      cost,
      description: mod.descriptionTemplate.replace(/\{(\w+)\}/g, (_, key) => statValues[key] || ''),
      statValues,
    });
  }
  return stats;
}

const vendorCatalog = vendorCatalogJson as Record<string, any>;

const SPECIAL_STAT_CONFIGS: Record<
  string,
  {
    type?: string;
    rarity?: ModRarity;
    template: string;
    labels: string[];
    growth: (rank: number) => Record<string, string>;
    polarity?: ModPolarity;
  }
> = {
  thermite_rounds: {
    template: '+{heat}% Heat, +{status}% Status Chance',
    labels: ['Heat Damage', 'Status Chance'],
    growth: (rank) => {
      const val = (rank + 1) * 15;
      return { heat: `${val}%`, status: `${val}%` };
    },
  },
  rime_rounds: {
    template: '+{cold}% Cold, +{status}% Status Chance',
    labels: ['Cold Damage', 'Status Chance'],
    growth: (rank) => {
      const val = (rank + 1) * 15;
      return { cold: `${val}%`, status: `${val}%` };
    },
  },
  high_voltage: {
    template: '+{electric}% Electricity, +{status}% Status Chance',
    labels: ['Electricity Damage', 'Status Chance'],
    growth: (rank) => {
      const val = (rank + 1) * 15;
      return { electric: `${val}%`, status: `${val}%` };
    },
  },
  malignant_force: {
    template: '+{toxin}% Toxin, +{status}% Status Chance',
    labels: ['Toxin Damage', 'Status Chance'],
    growth: (rank) => {
      const val = (rank + 1) * 15;
      return { toxin: `${val}%`, status: `${val}%` };
    },
  },
  contagious_bond: {
    polarity: 'Naramon',
    template: 'When your Companion kills an enemy afflicted with a Status Effect, {spread}% of that effect spreads to enemies within {radius}m.',
    labels: ['Spread %', 'Radius'],
    growth: (rank) => {
      const spreads = ['8%', '17%', '25%', '33%', '42%', '50%'];
      const radii = ['1.5m', '3m', '4.5m', '6m', '7.5m', '9m'];
      return {
        spread: spreads[rank] || '50%',
        radius: radii[rank] || '9m',
      };
    },
  },
  fomorian_accelerant: {
    type: 'Drakgoon Augment / Shotgun',
    rarity: 'Rare',
    template: '+{bounce} Flak Bounce, +{speed}% Flight Speed',
    labels: ['Flak Bounce', 'Flight Speed'],
    growth: (rank) => ({
      bounce: `${rank + 1}`,
      speed: `${(rank + 1) * 20}%`,
    }),
  },
};

const ALL_COMPREHENSIVE_MODS: DetailedModData[] = (() => {
  const map = new Map<string, DetailedModData>();

  for (const raw of allModsJson) {
    const key = raw.name.toLowerCase();
    if (map.has(key)) continue;

    const special = SPECIAL_STAT_CONFIGS[raw.id];

    const modRarity =
      special?.rarity ||
      ((['Common', 'Uncommon', 'Rare', 'Legendary'].includes(raw.rarity)
        ? raw.rarity
        : 'Common') as ModRarity);

    const modPolarity =
      special?.polarity ||
      ((['Madurai', 'Vazarin', 'Naramon', 'Zenurik', 'Unairu', 'Penjaga', 'Umbra'].includes(raw.polarity)
        ? raw.polarity
        : 'Universal') as ModPolarity);

    const levels = raw.levelStats || [];

    let vendorSource: VendorSource | undefined = undefined;
    const vRec = vendorCatalog[raw.id] || vendorCatalog[key];
    if (vRec) {
      vendorSource = {
        vendorName: vRec.vendorName,
        factionOrSyndicate: vRec.syndicateOrStore,
        standingCost: vRec.cost,
        rankRequirement: vRec.rankRequirement,
        location: vRec.location,
        notes: vRec.notes,
      };
    } else if (raw.sourceText) {
      vendorSource = {
        vendorName: raw.sourceText.includes('(') ? raw.sourceText.split('(')[1].replace(')', '') : raw.sourceText,
        factionOrSyndicate: 'Star Chart / Vendor',
        standingCost: 'Drop / Syndicate Acquisition',
        location: raw.sourceText,
      };
    }

    const generatedMod: DetailedModData = {
      id: raw.id,
      name: raw.name,
      type: special?.type || raw.type,
      polarity: modPolarity,
      rarity: modRarity,
      baseCost: raw.baseCost || 4,
      maxRank: raw.maxRank || 5,
      introduced: 'Warframe Codex',
      descriptionTemplate: special ? special.template : levels.length > 0 ? '{effect}' : (raw.description || ''),
      statLabels: special ? special.labels : levels.length > 0 ? ['Effect'] : ['Description'],
      statGrowth: special
        ? special.growth
        : (rank: number) => {
            if (levels.length > 0) {
              const eff = levels[rank] || levels[levels.length - 1] || raw.description || '';
              return { effect: eff };
            }
            return { effect: raw.description || '' };
          },
      vendorSource,
      officialDropSourceUrl: 'https://www.warframe.com/droptables',
    };

    map.set(key, generatedMod);
    map.set(raw.id, generatedMod);
  }

  const seen = new Set<string>();
  const list: DetailedModData[] = [];
  for (const m of map.values()) {
    if (!seen.has(m.id)) {
      seen.add(m.id);
      list.push(m);
    }
  }
  return list;
})();

export const DETAILED_MODS: DetailedModData[] = ALL_COMPREHENSIVE_MODS;

export function getAllMods(): DetailedModData[] {
  return ALL_COMPREHENSIVE_MODS;
}

export function getDetailedMod(idOrName: string): DetailedModData | undefined {
  const normalized = idOrName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return ALL_COMPREHENSIVE_MODS.find(
    (m) => m.id === normalized || m.name.toLowerCase() === idOrName.toLowerCase()
  );
}
