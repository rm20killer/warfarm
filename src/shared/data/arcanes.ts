import allArcanesJson from './generated/all-arcanes.json';
import { CURATED_BUILDS } from './recommended-builds';

export type ArcaneSlot =
  | 'Warframe'
  | 'Primary'
  | 'Secondary'
  | 'Melee'
  | 'Operator'
  | 'Amp'
  | 'Kitgun'
  | 'Zaw';

export type ArcaneRarity = 'Common' | 'Uncommon' | 'Rare' | 'Legendary';

export interface ArcaneRankStat {
  rank: number;
  effect: string;
  requiredCopies: number;
  arcanesToUpgrade: number;
  revives?: number;
  stats?: string[];
}

export interface ArcaneDropSource {
  location: string;
  source: string;
  chance?: number;
  rotation?: string;
  rarity?: string;
}

export interface ArcaneVendorSource {
  vendorName: string;
  location: string;
  syndicate: string;
  factionOrSyndicate: string;
  standingCost?: string;
  rankRequirement?: string;
  notes?: string;
}

export interface ArcaneData {
  id: string;
  name: string;
  uniqueName: string;
  type: string;
  slot: ArcaneSlot;
  rarity: ArcaneRarity;
  maxRank: number;
  description: string;
  stats: ArcaneRankStat[];
  levelStats?: Array<{ rank: number; stats: string[] }>;
  drops: ArcaneDropSource[];
  vendorSource?: ArcaneVendorSource;
  dissolutionPack?: string;
  imageName?: string;
  wikiaThumbnail?: string;
  wikiUrl?: string;
  introduced?: {
    name?: string;
    url?: string;
    date?: string;
  };
}

export interface ArcaneSynergy {
  itemName: string;
  itemType: 'Warframe' | 'Weapon';
  buildTitle: string;
  archetype: string;
  reason: string;
  buildRole: string;
}

interface RawArcaneJson {
  id: string;
  name: string;
  uniqueName: string;
  type: string;
  slot: ArcaneSlot;
  rarity: ArcaneRarity;
  maxRank: number;
  description: string;
  levelStats?: Array<{ rank: number; stats: string[] }>;
  drops?: Array<{ location?: string; source?: string; chance?: number; rotation?: string; rarity?: string }>;
  vendorSource?: {
    vendorName: string;
    location: string;
    syndicate: string;
    factionOrSyndicate?: string;
    standingCost?: string;
    rankRequirement?: string;
    notes?: string;
  };
  dissolutionPack?: string;
  imageName?: string;
  wikiaThumbnail?: string;
  wikiUrl?: string;
  introduced?: {
    name?: string;
    url?: string;
    date?: string;
  };
}

function computeRankStats(arcane: RawArcaneJson): ArcaneRankStat[] {
  const maxRank = arcane.maxRank ?? 5;
  const result: ArcaneRankStat[] = [];

  for (let r = 0; r <= maxRank; r++) {
    const rawStat = arcane.levelStats?.find((ls) => ls.rank === r);
    const effect = rawStat && rawStat.stats && rawStat.stats.length > 0
      ? rawStat.stats.join(' ')
      : arcane.description || '';

    // Cumulative copies: r=0 is 1, r=1 is 3 (+2), r=2 is 6 (+3), r=3 is 10 (+4), r=4 is 15 (+5), r=5 is 21 (+6)
    const requiredCopies = ((r + 1) * (r + 2)) / 2;
    const arcanesToUpgrade = r === 0 ? 0 : r + 1;

    let revives: number | undefined = undefined;
    if (arcane.slot === 'Warframe' && r >= 3) {
      revives = 1;
    }

    result.push({
      rank: r,
      effect,
      requiredCopies,
      arcanesToUpgrade,
      revives,
      stats: rawStat?.stats,
    });
  }

  return result;
}

const rawList = allArcanesJson as unknown as RawArcaneJson[];

const ARCANES: ArcaneData[] = rawList.map((raw) => {
  const stats = computeRankStats(raw);
  const drops: ArcaneDropSource[] = (raw.drops || []).map((d) => {
    const loc = d.location || d.source || '';
    return {
      location: loc,
      source: loc,
      chance: d.chance,
      rotation: d.rotation,
      rarity: d.rarity,
    };
  });

  const vendorSource: ArcaneVendorSource | undefined = raw.vendorSource
    ? {
        ...raw.vendorSource,
        factionOrSyndicate: raw.vendorSource.factionOrSyndicate || raw.vendorSource.syndicate,
      }
    : undefined;

  return {
    id: raw.id,
    name: raw.name,
    uniqueName: raw.uniqueName,
    type: raw.type,
    slot: raw.slot,
    rarity: raw.rarity,
    maxRank: raw.maxRank ?? 5,
    description: raw.description,
    stats,
    levelStats: raw.levelStats,
    drops,
    vendorSource,
    dissolutionPack: raw.dissolutionPack,
    imageName: raw.imageName,
    wikiaThumbnail: raw.wikiaThumbnail,
    wikiUrl: raw.wikiUrl,
    introduced: raw.introduced,
  };
});

const arcaneMap = new Map<string, ArcaneData>();

for (const a of ARCANES) {
  arcaneMap.set(a.id.toLowerCase(), a);
  arcaneMap.set(a.name.toLowerCase(), a);
  if (a.uniqueName) {
    arcaneMap.set(a.uniqueName.toLowerCase(), a);
  }
}

export function getAllArcanes(): ArcaneData[] {
  return ARCANES;
}

export function getArcane(idOrName: string): ArcaneData | undefined {
  if (!idOrName) return undefined;
  const clean = idOrName.trim().toLowerCase();
  const normalized = clean.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return arcaneMap.get(clean) || arcaneMap.get(normalized);
}

export function getArcanesBySlot(slot: string): ArcaneData[] {
  if (!slot || slot === 'All') return ARCANES;
  const lower = slot.toLowerCase();
  return ARCANES.filter((a) => a.slot.toLowerCase() === lower);
}

export function searchArcanes(
  query: string,
  options?: {
    slot?: string;
    rarity?: string;
    source?: string;
    sourceCategory?: string;
  }
): ArcaneData[] {
  const q = query.toLowerCase().trim();
  const slotFilter = options?.slot && options.slot !== 'All' ? options.slot.toLowerCase() : null;
  const rarityFilter = options?.rarity && options.rarity !== 'All' ? options.rarity.toLowerCase() : null;
  const rawSource = options?.source || options?.sourceCategory;
  const sourceFilter = rawSource && rawSource !== 'All' ? rawSource.toLowerCase() : null;

  return ARCANES.filter((a) => {
    if (slotFilter && a.slot.toLowerCase() !== slotFilter) return false;
    if (rarityFilter && a.rarity.toLowerCase() !== rarityFilter) return false;

    if (sourceFilter) {
      const matchSource = matchesSourceCategory(a, sourceFilter);
      if (!matchSource) return false;
    }

    if (!q) return true;

    if (a.name.toLowerCase().includes(q)) return true;
    if (a.type.toLowerCase().includes(q)) return true;
    if (a.slot.toLowerCase().includes(q)) return true;
    if (a.description.toLowerCase().includes(q)) return true;
    if (a.dissolutionPack?.toLowerCase().includes(q)) return true;
    if (a.vendorSource?.vendorName.toLowerCase().includes(q)) return true;
    if (a.vendorSource?.syndicate.toLowerCase().includes(q)) return true;

    return a.drops.some((d) => d.location.toLowerCase().includes(q));
  });
}

function matchesSourceCategory(a: ArcaneData, cat: string): boolean {
  const dropsStr = a.drops.map((d) => d.location.toLowerCase()).join(' ');
  const vendorStr = a.vendorSource ? `${a.vendorSource.vendorName} ${a.vendorSource.syndicate} ${a.vendorSource.location}`.toLowerCase() : '';
  const combined = `${dropsStr} ${vendorStr} ${a.dissolutionPack || ''}`.toLowerCase();

  switch (cat) {
    case 'eidolon':
    case 'eidolons':
      return combined.includes('eidolon') || combined.includes('hydrolyst') || combined.includes('teralyst') || combined.includes('gantulyst');
    case 'steel path':
    case 'steel_path':
    case 'acolytes':
      return combined.includes('acolyte') || combined.includes('steel path') || combined.includes('merciless') || combined.includes('deadhead') || combined.includes('dexterity');
    case 'zariman':
    case 'holdfasts':
      return combined.includes('zariman') || combined.includes('holdfasts') || combined.includes('cavalero') || combined.includes('thrax') || combined.includes('void angel');
    case 'sanctum':
    case 'cavia':
    case 'netracell':
      return combined.includes('sanctum') || combined.includes('cavia') || combined.includes('netracell') || combined.includes('archimedea') || combined.includes('bird 3') || combined.includes('fragmented');
    case 'duviri':
    case 'circuit':
      return combined.includes('duviri') || combined.includes('undercroft');
    case 'vendors':
    case 'vendor':
    case 'standing':
      return !!a.vendorSource;
    default:
      return combined.includes(cat);
  }
}

const NOTABLE_SYNERGIES: Record<string, ArcaneSynergy[]> = {
  'arcane energize': [
    {
      itemName: 'Volt',
      itemType: 'Warframe',
      buildTitle: 'High Voltage Speed & Discharge',
      archetype: 'General Purpose',
      reason: 'Sustains heavy energy consumption for non-stop Discharge and Speed casts.',
      buildRole: 'Warframe',
    },
    {
      itemName: 'Saryn',
      itemType: 'Warframe',
      buildTitle: 'Spore Propagation DPS',
      archetype: 'Loot Farming',
      reason: 'Instantly refills energy pool on energy orbs to keep Spores and Miasma active.',
      buildRole: 'Warframe',
    },
  ],
  'arcane avenger': [
    {
      itemName: 'Combat Discipline',
      itemType: 'Warframe',
      buildTitle: 'Self-Triggering Flat Crit Engine',
      archetype: 'Crit Buffer',
      reason: 'Self-inflicted health drain on enemy kills triggers Arcane Avenger consistently for +45% flat critical chance.',
      buildRole: 'Aura Synergy',
    },
  ],
  'secondary merciless': [
    {
      itemName: 'Kuva Nukor',
      itemType: 'Weapon',
      buildTitle: 'Chaining Beam Primer & Killer',
      archetype: 'Status & Damage',
      reason: 'Rapid beam kills quickly stack up to +360% base damage, +30% reload speed, and +100% max ammo.',
      buildRole: 'Secondary',
    },
  ],
  'molt augmented': [
    {
      itemName: 'Rhino',
      itemType: 'Warframe',
      buildTitle: 'Iron Skin Tank & Roar Buffer',
      archetype: 'Steel Path',
      reason: 'Stacking up to +60% Ability Strength permanently enhances Iron Skin armor multiplication and Roar damage buff.',
      buildRole: 'Warframe',
    },
  ],
};

export function getArcaneSynergies(arcaneName: string): ArcaneSynergy[] {
  const synergies: ArcaneSynergy[] = [];
  const targetLower = arcaneName.toLowerCase().trim();

  // 1. Curated builds from database
  for (const build of CURATED_BUILDS) {
    if (build.arcanes && build.arcanes.some((arc) => arc.toLowerCase() === targetLower)) {
      synergies.push({
        itemName: build.targetItem,
        itemType: build.category === 'Warframe' ? 'Warframe' : 'Weapon',
        buildTitle: build.title,
        archetype: build.archetype,
        reason: `Featured in the ${build.title} (${build.archetype}) community build.`,
        buildRole: `${build.category} Build`,
      });
    }
  }

  // 2. High-value notable interactions
  if (NOTABLE_SYNERGIES[targetLower]) {
    for (const syn of NOTABLE_SYNERGIES[targetLower]) {
      if (!synergies.some((s) => s.itemName.toLowerCase() === syn.itemName.toLowerCase())) {
        synergies.push(syn);
      }
    }
  }

  return synergies;
}

