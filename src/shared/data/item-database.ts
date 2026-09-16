import allWeapons from './generated/all-weapons.json';
import allWarframes from './generated/all-warframes.json';
import allGear from './generated/all-gear.json';
import enemyDropTables from './generated/enemy-drop-tables.json';
import { getArcane } from './arcanes';

export interface EnemyDropEntry {
  enemyName: string;
  enemyDropChance?: number;
  dropChance: number;
  rarity?: string;
  category?: string;
}

export interface WarframeAbilityInfo {
  name: string;
  description: string;
  imageName?: string;
}

export interface WarframeCombatStats {
  id: string;
  name: string;
  health: number;
  shield: number;
  armor: number;
  power: number;
  sprintSpeed: number;
  masteryReq: number;
  passiveDescription: string;
  polarities: string[];
  aura?: string;
  sex?: string;
  introduced?: string;
  abilities: WarframeAbilityInfo[];
}

export interface ItemGeneralInfo {
  id: string;
  name: string;
  type: string;
  masteryReq: number;
  polarity?: string;
  trigger?: string;
  ammoType?: string;
  rivenDisposition?: string;
  introduced: string;
  vendorSources?: string;
  officialDropSourceUrl?: string;
}

export interface WeaponDamageMode {
  modeName: string;
  damageTotal: number;
  damageTypes: Record<string, number>;
  critChance?: string;
  critMultiplier?: string;
  statusChance?: string;
  pelletCount?: number;
}

export interface WeaponCombatStats {
  id: string;
  name: string;
  accuracy: string;
  critChance: string;
  critMultiplier: string;
  statusChance: string;
  pelletCount?: number;
  fireRate: string;
  magazine: number;
  reload: string;
  dispositionText: string;
  modes: WeaponDamageMode[];
  mechanicsNote?: string;
}

export interface AugmentModInfo {
  name: string;
  source: string;
  effect: string;
}

export interface WeaponVariantInfo {
  variantName: string;
  acquisition: string;
  innateBonus?: string;
}

export interface WeaponExtraInfo {
  id: string;
  name: string;
  augments: AugmentModInfo[];
  variants: WeaponVariantInfo[];
}

export const ITEMS_GENERAL_INFO: ItemGeneralInfo[] = [
  {
    id: 'drakgoon',
    name: 'Drakgoon',
    type: 'Primary (Flak Cannon / Shotgun)',
    masteryReq: 5,
    polarity: 'Naramon',
    trigger: 'Charge / Semi-Auto',
    ammoType: 'Shotgun (120 Max Reserve)',
    rivenDisposition: '1.35x (4/5 dots)',
    introduced: 'Update 11.3 (2013-12-11)',
    vendorSources: 'In-Game Market Blueprint (20,000 Credits)',
    officialDropSourceUrl: 'https://www.warframe.com/droptables',
  },
  {
    id: 'ignis_wraith',
    name: 'Ignis Wraith',
    type: 'Primary (Flamethrower / Beam Rifle)',
    masteryReq: 9,
    polarity: 'Madurai, Naramon',
    trigger: 'Held / Continuous',
    ammoType: 'Rifle (800 Max Reserve)',
    rivenDisposition: '0.85x (2/5 dots)',
    introduced: 'Update 19.12 (2017-03-02)',
    vendorSources: 'Clan Dojo (Chem Lab Rank 10) or Baro Ki\'Teer (250 Ducats + 50,000 Credits)',
    officialDropSourceUrl: 'https://www.warframe.com/droptables',
  },
  {
    id: 'stropha',
    name: 'Stropha',
    type: 'Melee (Gunblade)',
    masteryReq: 10,
    polarity: 'Vazarin Stance (High Noon / Bullet Dance)',
    trigger: 'Melee Combo / Gunblade Blast',
    ammoType: 'Infinite (Melee Heavy Shot)',
    rivenDisposition: '1.05x (3/5 dots)',
    introduced: 'Update 28.0 - The Deadlock Protocol (2020-06-11)',
    vendorSources: 'Jackal (Fossa, Venus) & Granum Void Tier 3',
    officialDropSourceUrl: 'https://www.warframe.com/droptables',
  },
  {
    id: 'dread',
    name: 'Dread',
    type: 'Primary (Hunting Bow)',
    masteryReq: 5,
    polarity: 'Madurai, Vazarin',
    trigger: 'Charge Bow',
    ammoType: 'Sniper/Bow (72 Max Reserve)',
    rivenDisposition: '1.25x (4/5 dots)',
    introduced: 'Update 8.0 (2013-05-23)',
    vendorSources: 'Shadow Stalker / Stalker Assassin Encounter (37.94% Blueprint Drop)',
    officialDropSourceUrl: 'https://www.warframe.com/droptables',
  },
  {
    id: 'laetum',
    name: 'Laetum',
    type: 'Secondary (Incarnon Semi-Pistol)',
    masteryReq: 14,
    polarity: 'Madurai, Naramon',
    trigger: 'Semi-Auto / Incarnon Full-Auto Explosive',
    ammoType: 'Pistol (210 Max Reserve)',
    rivenDisposition: '0.60x (1/5 dots)',
    introduced: 'Update 31.5 - Angels of the Zariman (2022-04-27)',
    vendorSources: 'Cavalero (Chrysalith, Zariman - 3,000 Standing)',
    officialDropSourceUrl: 'https://www.warframe.com/droptables',
  },
  {
    id: 'shedu',
    name: 'Shedu',
    type: 'Primary (Sentient Arm-Cannon)',
    masteryReq: 13,
    polarity: 'Madurai',
    trigger: 'Full Auto / Battery Explosive',
    ammoType: 'Battery Regenerative (7 rounds clip)',
    rivenDisposition: '1.00x (3/5 dots)',
    introduced: 'Update 27.0 - Empyrean (2019-12-13)',
    vendorSources: 'Erra Quest Blueprint + Symbilyst drops in Veil Proxima Murex',
    officialDropSourceUrl: 'https://www.warframe.com/droptables',
  },
];

export const WEAPON_COMBAT_STATS: WeaponCombatStats[] = [
  {
    id: 'drakgoon',
    name: 'Drakgoon',
    accuracy: '4.0 (Uncharged) / 100.0 (Fully Charged)',
    critChance: '7.5%',
    critMultiplier: '2.0x',
    statusChance: '10.0% (per pellet)',
    pelletCount: 10,
    fireRate: '2.0 rounds/sec',
    magazine: 7,
    reload: '2.3s',
    dispositionText: '1.35x',
    mechanicsNote: 'Fires shrapnel pellets that ricochet up to 3 times off surfaces with infinite enemy punch through when fully charged. Charging tightens the pellet spread into a pinpoint cluster.',
    modes: [
      {
        modeName: 'Uncharged Quick Shot',
        damageTotal: 300,
        pelletCount: 10,
        critChance: '7.5%',
        critMultiplier: '2.0x',
        statusChance: '10.0%',
        damageTypes: {
          Slash: 210,
          Impact: 45,
          Puncture: 45,
        },
      },
      {
        modeName: 'Fully Charged Shot',
        damageTotal: 700,
        pelletCount: 10,
        critChance: '7.5%',
        critMultiplier: '2.0x',
        statusChance: '10.0%',
        damageTypes: {
          Slash: 490,
          Impact: 105,
          Puncture: 105,
        },
      },
    ],
  },
  {
    id: 'ignis_wraith',
    name: 'Ignis Wraith',
    accuracy: '100.0',
    critChance: '17.0%',
    critMultiplier: '2.5x',
    statusChance: '29.0%',
    fireRate: '8.0 rounds/sec',
    magazine: 200,
    reload: '1.7s',
    dispositionText: '0.85x',
    mechanicsNote: 'Wide flamethrower cone penetrating enemies with 0.15m innate punch-through up to a 27-meter range.',
    modes: [
      {
        modeName: 'Continuous Stream',
        damageTotal: 35,
        critChance: '17.0%',
        critMultiplier: '2.5x',
        statusChance: '29.0%',
        damageTypes: {
          Heat: 35,
        },
      },
    ],
  },
  {
    id: 'stropha',
    name: 'Stropha',
    accuracy: '100.0',
    critChance: '30.0%',
    critMultiplier: '2.4x',
    statusChance: '14.0%',
    fireRate: '0.833 attacks/sec',
    magazine: 1,
    reload: 'Instant',
    dispositionText: '1.05x',
    mechanicsNote: 'Fires a short-range wide shockwave blanketing targets up to 16m with extreme heavy attack multiplier scaling.',
    modes: [
      {
        modeName: 'Gunblade Blast (Melee Shot)',
        damageTotal: 700,
        critChance: '30.0%',
        critMultiplier: '2.4x',
        statusChance: '14.0%',
        damageTypes: {
          Impact: 700,
        },
      },
    ],
  },
];

export const WEAPON_EXTRAS: WeaponExtraInfo[] = [
  {
    id: 'drakgoon',
    name: 'Drakgoon',
    augments: [
      {
        name: 'Fomorian Accelerant',
        source: 'Kela De Thaym (Merrow, Sedna - Rathuum Boss)',
        effect: '+60% Flak Bounce, +80% Projectile Flight Speed. Shrapnel ricochets up to 4 additional times.',
      },
    ],
    variants: [
      {
        variantName: 'Kuva Drakgoon',
        acquisition: 'Acquired by defeating a Kuva Lich generated with a Drakgoon from a Kuva Larvling on Level 20+ Grineer missions.',
        innateBonus: 'Up to +60% bonus elemental damage (Heat, Toxic, Cold, Electricity, Radiation, Magnetic, or Impact) determined by progenitor Warframe.',
      },
    ],
  },
  {
    id: 'ignis_wraith',
    name: 'Ignis Wraith',
    augments: [],
    variants: [
      {
        variantName: 'Ignis (Standard)',
        acquisition: 'In-Game Market Blueprint (15,000 Credits) or Chem Lab research in Clan Dojo.',
      },
    ],
  },
];

export function getItemGeneralInfo(idOrName: string): ItemGeneralInfo | undefined {
  const normalized = idOrName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const manual = ITEMS_GENERAL_INFO.find(
    (item) => item.id === normalized || item.name.toLowerCase() === idOrName.toLowerCase()
  );
  if (manual) return manual;

  // Check Weapons catalog
  const w = (allWeapons as any[]).find(
    (item) => item.id === normalized || item.name.toLowerCase() === idOrName.toLowerCase()
  );
  if (w) {
    const dispDots = w.disposition ? `${w.disposition}/5 dots` : '3/5 dots';
    const dispText = w.omegaAttenuation ? `${w.omegaAttenuation}x (${dispDots})` : dispDots;
    const bpSource =
      w.components?.find((c: any) => c.partName === 'Blueprint' || c.partName?.includes('Blueprint'))
        ?.sourceText || 'In-Game Market / Clan Dojo Blueprint';
    const intro =
      typeof w.introduced === 'object' && w.introduced?.name
        ? `${w.introduced.name}${w.introduced.date ? ` (${w.introduced.date})` : ''}`
        : typeof w.introduced === 'string'
        ? w.introduced
        : 'Warframe Archive';

    return {
      id: w.id,
      name: w.name,
      type: w.subType || `${w.subclass || 'Weapon'} (${w.slot || 'Primary'})`,
      masteryReq: w.masteryReq || 0,
      polarity: w.polarities && w.polarities.length > 0 ? w.polarities.join(', ') : 'None',
      trigger: w.trigger || 'Semi-Auto',
      ammoType: `${w.slot || 'Primary'} Ammo`,
      rivenDisposition: dispText,
      introduced: intro,
      vendorSources: bpSource,
      officialDropSourceUrl: 'https://www.warframe.com/droptables',
    };
  }

  // Check Warframes catalog
  const wf = (allWarframes as any[]).find(
    (item) => item.id === normalized || item.name.toLowerCase() === idOrName.toLowerCase()
  );
  if (wf) {
    const bpSource =
      wf.components?.find((c: any) => c.partName?.includes('Blueprint'))?.sourceText ||
      'Planetary Assassination / Tenno Lab Research';
    const intro =
      typeof wf.introduced === 'object' && wf.introduced?.name
        ? `${wf.introduced.name}${wf.introduced.date ? ` (${wf.introduced.date})` : ''}`
        : typeof wf.introduced === 'string'
        ? wf.introduced
        : 'Warframe Archive';

    return {
      id: wf.id,
      name: wf.name,
      type: `Warframe (${wf.sex || 'Tenno Exosuit'})`,
      masteryReq: wf.masteryReq || 0,
      polarity: wf.polarities && wf.polarities.length > 0 ? wf.polarities.join(', ') : 'None',
      introduced: intro,
      vendorSources: bpSource,
      officialDropSourceUrl: 'https://www.warframe.com/droptables',
    };
  }

  // Check Gear catalog
  const g = (allGear as any[]).find(
    (item) => item.id === normalized || item.name.toLowerCase() === idOrName.toLowerCase()
  );
  if (g) {
    const src =
      g.components && g.components.length > 0
        ? g.components[0].sourceText
        : 'Market Blueprint / Syndicate Offering';
    return {
      id: g.id,
      name: g.name,
      type: g.category || 'Gear',
      masteryReq: g.masteryReq || 0,
      introduced: 'Warframe Equipment Catalog',
      vendorSources: src,
      officialDropSourceUrl: 'https://www.warframe.com/droptables',
    };
  }

  // Check Arcanes catalog
  const arcane = getArcane(idOrName);
  if (arcane) {
    const src = arcane.vendorSource
      ? `${arcane.vendorSource.vendorName} (${arcane.vendorSource.location}) - ${arcane.vendorSource.standingCost || arcane.vendorSource.syndicate}`
      : arcane.drops.length > 0
      ? arcane.drops[0].location
      : 'Special Mission / Eidolon Drops';
    return {
      id: arcane.id,
      name: arcane.name,
      type: arcane.type,
      masteryReq: 0,
      introduced: arcane.introduced?.name || 'Warframe Arcanes',
      vendorSources: src,
      officialDropSourceUrl: arcane.wikiUrl || 'https://www.warframe.com/droptables',
    };
  }

  return undefined;
}

export function getWeaponCombatStats(idOrName: string): WeaponCombatStats | undefined {
  const normalized = idOrName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const manual = WEAPON_COMBAT_STATS.find(
    (w) => w.id === normalized || w.name.toLowerCase() === idOrName.toLowerCase()
  );
  if (manual) return manual;

  const w = (allWeapons as any[]).find(
    (item) => item.id === normalized || item.name.toLowerCase() === idOrName.toLowerCase()
  );
  if (!w) return undefined;

  const modes: WeaponDamageMode[] = [];
  if (Array.isArray(w.attacks) && w.attacks.length > 0) {
    for (const atk of w.attacks) {
      const dmgObj = atk.damage || {};
      const dmgTotal = Object.values(dmgObj).reduce(
        (acc: number, val: any) => acc + (typeof val === 'number' ? val : 0),
        0
      );
      modes.push({
        modeName: atk.name || 'Primary Fire',
        damageTotal: Math.round(dmgTotal * 10) / 10,
        damageTypes: dmgObj,
        critChance: atk.critChance || w.critChance,
        critMultiplier: atk.critMultiplier || w.critMultiplier,
        statusChance: atk.statusChance || w.statusChance,
        pelletCount: atk.pelletCount || (atk.shotType === 'Pellet' ? w.multishot : 1),
      });
    }
  } else if (w.damage && typeof w.damage === 'object') {
    const dmgObj = w.damage;
    const dmgTotal =
      w.totalDamage ||
      Object.values(dmgObj).reduce(
        (acc: number, val: any) => acc + (typeof val === 'number' ? val : 0),
        0
      );
    modes.push({
      modeName: 'Standard Fire',
      damageTotal: Math.round(dmgTotal * 10) / 10,
      damageTypes: dmgObj,
      critChance: w.critChance,
      critMultiplier: w.critMultiplier,
      statusChance: w.statusChance,
      pelletCount: w.multishot || 1,
    });
  }

  const dispDots = w.disposition ? `${w.disposition}/5 dots` : '3/5 dots';
  const dispText = w.omegaAttenuation ? `${w.omegaAttenuation}x (${dispDots})` : dispDots;

  return {
    id: w.id,
    name: w.name,
    accuracy: w.accuracy || '100.0',
    critChance: w.critChance || '0%',
    critMultiplier: w.critMultiplier || '1.0x',
    statusChance: w.statusChance || '0%',
    pelletCount: w.multishot || 1,
    fireRate:
      typeof w.fireRate === 'number'
        ? `${w.fireRate} rounds/sec`
        : w.fireRate
        ? `${w.fireRate} rounds/sec`
        : '1.0 rounds/sec',
    magazine: typeof w.magazineSize === 'number' ? w.magazineSize : 0,
    reload: w.reloadTime || '1.0s',
    dispositionText: dispText,
    modes,
    mechanicsNote: w.description || undefined,
  };
}

export function getWarframeCombatStats(idOrName: string): WarframeCombatStats | undefined {
  const normalized = idOrName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const wf = (allWarframes as any[]).find(
    (item) => item.id === normalized || item.name.toLowerCase() === idOrName.toLowerCase()
  );
  if (!wf) return undefined;

  return {
    id: wf.id,
    name: wf.name,
    health: wf.health || 100,
    shield: wf.shield || 100,
    armor: wf.armor || 100,
    power: wf.power || 100,
    sprintSpeed: typeof wf.sprintSpeed === 'number' ? wf.sprintSpeed : 1.0,
    masteryReq: wf.masteryReq || 0,
    passiveDescription: wf.passiveDescription || '',
    polarities: Array.isArray(wf.polarities) ? wf.polarities : [],
    aura: wf.aura || '',
    sex: wf.sex || '',
    introduced:
      typeof wf.introduced === 'object' && wf.introduced?.name
        ? `${wf.introduced.name}${wf.introduced.date ? ` (${wf.introduced.date})` : ''}`
        : typeof wf.introduced === 'string'
        ? wf.introduced
        : '',
    abilities: (wf.abilities || []).map((a: any) => ({
      name: a.name || '',
      description: a.description || '',
      imageName: a.imageName || '',
    })),
  };
}

export function getWeaponExtraInfo(idOrName: string): WeaponExtraInfo | undefined {
  const normalized = idOrName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return WEAPON_EXTRAS.find(
    (w) => w.id === normalized || w.name.toLowerCase() === idOrName.toLowerCase()
  );
}

const enemyDropsData = (enemyDropTables as unknown) as Record<string, EnemyDropEntry[]>;

export function getEnemyDropsForItem(idOrName: string): EnemyDropEntry[] {
  if (!idOrName) return [];
  const normalized = idOrName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  if (!normalized) return [];

  if (enemyDropsData[normalized] && enemyDropsData[normalized].length > 0) {
    return enemyDropsData[normalized];
  }

  if (!normalized.endsWith('_blueprint')) {
    const withBp = `${normalized}_blueprint`;
    if (enemyDropsData[withBp] && enemyDropsData[withBp].length > 0) {
      return enemyDropsData[withBp];
    }
  }

  if (normalized.endsWith('_blueprint')) {
    const stripped = normalized.replace(/_blueprint$/, '');
    if (enemyDropsData[stripped] && enemyDropsData[stripped].length > 0) {
      return enemyDropsData[stripped];
    }
  }

  return [];
}

export interface VariantItemEntry {
  name: string;
  variantType: 'Base' | 'Prime' | 'Kuva' | 'Tenet' | 'Coda' | 'Syndicate' | 'Wraith' | 'Vandal' | 'Prisma' | 'Dex' | 'Mutalist' | 'Other';
  isCurrent: boolean;
}

export interface StatComparisonRow {
  label: string;
  currentVal: string | number;
  counterpartVal: string | number;
  deltaText: string;
  isImprovement: boolean | null;
}

export interface ItemVariantComparison {
  currentItemName: string;
  baseItemName: string;
  category: 'Weapon' | 'Warframe';
  variants: VariantItemEntry[];
  selectedVariantName: string;
  comparisonRows: StatComparisonRow[];
}

export function extractBaseItemName(name: string): string {
  let base = name.trim();
  const prefixRegex = /^(Kuva|Tenet|Coda|Prisma|Dex|MK1-|Mk1\s+|Synoid|Telos|Vaykor|Secura|Rakta|Sancti|Mutalist|Carmine|Dragon|Mara)\s*/i;
  base = base.replace(prefixRegex, '');
  const suffixRegex = /\s+(Prime|Wraith|Vandal|Prisma|Dex|Umbra)$/i;
  base = base.replace(suffixRegex, '');
  return base.trim();
}

export function getVariantType(name: string, baseName: string): VariantItemEntry['variantType'] {
  const lower = name.toLowerCase().trim();
  const lowerBase = baseName.toLowerCase().trim();
  if (lower === lowerBase) return 'Base';
  if (lower.endsWith(' prime')) return 'Prime';
  if (lower.startsWith('kuva ')) return 'Kuva';
  if (lower.startsWith('tenet ')) return 'Tenet';
  if (lower.startsWith('coda ')) return 'Coda';
  if (lower.endsWith(' wraith')) return 'Wraith';
  if (lower.endsWith(' vandal')) return 'Vandal';
  if (lower.startsWith('prisma ') || lower.endsWith(' prisma')) return 'Prisma';
  if (lower.startsWith('dex ') || lower.endsWith(' dex')) return 'Dex';
  if (
    lower.startsWith('vaykor ') ||
    lower.startsWith('telos ') ||
    lower.startsWith('synoid ') ||
    lower.startsWith('secura ') ||
    lower.startsWith('rakta ') ||
    lower.startsWith('sancti ')
  ) {
    return 'Syndicate';
  }
  if (lower.startsWith('mutalist ')) return 'Mutalist';
  return 'Other';
}

function parseNum(strOrNum: string | number | undefined): number {
  if (typeof strOrNum === 'number') return strOrNum;
  if (!strOrNum) return 0;
  const match = strOrNum.toString().match(/[-+]?[0-9]*\.?[0-9]+/);
  return match ? parseFloat(match[0]) : 0;
}

export function compareWeaponCombatStats(
  current: WeaponCombatStats,
  counterpart: WeaponCombatStats,
  currentMR = 0,
  counterpartMR = 0
): StatComparisonRow[] {
  const rows: StatComparisonRow[] = [];

  // 1. Mastery Rank
  const mrDiff = counterpartMR - currentMR;
  rows.push({
    label: 'Mastery Rank',
    currentVal: `MR ${currentMR}`,
    counterpartVal: `MR ${counterpartMR}`,
    deltaText: mrDiff === 0 ? 'Same' : mrDiff > 0 ? `+${mrDiff} MR` : `${mrDiff} MR`,
    isImprovement: mrDiff === 0 ? null : mrDiff < 0, // Lower MR requirement is technically accessible earlier
  });

  // 2. Critical Chance
  const curCC = parseNum(current.critChance);
  const cntCC = parseNum(counterpart.critChance);
  const ccDiff = +(cntCC - curCC).toFixed(1);
  rows.push({
    label: 'Critical Chance',
    currentVal: current.critChance,
    counterpartVal: counterpart.critChance,
    deltaText: ccDiff === 0 ? 'Same' : ccDiff > 0 ? `+${ccDiff}%` : `${ccDiff}%`,
    isImprovement: ccDiff === 0 ? null : ccDiff > 0,
  });

  // 3. Critical Multiplier
  const curCD = parseNum(current.critMultiplier);
  const cntCD = parseNum(counterpart.critMultiplier);
  const cdDiff = +(cntCD - curCD).toFixed(1);
  rows.push({
    label: 'Critical Multiplier',
    currentVal: current.critMultiplier,
    counterpartVal: counterpart.critMultiplier,
    deltaText: cdDiff === 0 ? 'Same' : cdDiff > 0 ? `+${cdDiff}x` : `${cdDiff}x`,
    isImprovement: cdDiff === 0 ? null : cdDiff > 0,
  });

  // 4. Status Chance
  const curSC = parseNum(current.statusChance);
  const cntSC = parseNum(counterpart.statusChance);
  const scDiff = +(cntSC - curSC).toFixed(1);
  rows.push({
    label: 'Status Chance',
    currentVal: current.statusChance,
    counterpartVal: counterpart.statusChance,
    deltaText: scDiff === 0 ? 'Same' : scDiff > 0 ? `+${scDiff}%` : `${scDiff}%`,
    isImprovement: scDiff === 0 ? null : scDiff > 0,
  });

  // 5. Fire Rate / Attack Speed
  const curFR = parseNum(current.fireRate);
  const cntFR = parseNum(counterpart.fireRate);
  const frDiff = +(cntFR - curFR).toFixed(2);
  rows.push({
    label: 'Fire Rate / Speed',
    currentVal: current.fireRate,
    counterpartVal: counterpart.fireRate,
    deltaText: frDiff === 0 ? 'Same' : frDiff > 0 ? `+${frDiff}` : `${frDiff}`,
    isImprovement: frDiff === 0 ? null : frDiff > 0,
  });

  // 6. Magazine
  const magDiff = counterpart.magazine - current.magazine;
  rows.push({
    label: 'Magazine Size',
    currentVal: `${current.magazine} rounds`,
    counterpartVal: `${counterpart.magazine} rounds`,
    deltaText: magDiff === 0 ? 'Same' : magDiff > 0 ? `+${magDiff}` : `${magDiff}`,
    isImprovement: magDiff === 0 ? null : magDiff > 0,
  });

  // 7. Reload Time (Lower is better!)
  const curRel = parseNum(current.reload);
  const cntRel = parseNum(counterpart.reload);
  const relDiff = +(cntRel - curRel).toFixed(2);
  rows.push({
    label: 'Reload Time',
    currentVal: current.reload,
    counterpartVal: counterpart.reload,
    deltaText: relDiff === 0 ? 'Same' : relDiff < 0 ? `${relDiff}s (Faster)` : `+${relDiff}s (Slower)`,
    isImprovement: relDiff === 0 ? null : relDiff < 0,
  });

  // 8. Total Base Damage
  const curDmg = current.modes[0]?.damageTotal || 0;
  const cntDmg = counterpart.modes[0]?.damageTotal || 0;
  const dmgDiff = +(cntDmg - curDmg).toFixed(1);
  const dmgPct = curDmg > 0 ? +((dmgDiff / curDmg) * 100).toFixed(1) : 0;
  rows.push({
    label: 'Total Base Damage',
    currentVal: curDmg.toString(),
    counterpartVal: cntDmg.toString(),
    deltaText: dmgDiff === 0 ? 'Same' : dmgDiff > 0 ? `+${dmgDiff} (+${dmgPct}%)` : `${dmgDiff} (${dmgPct}%)`,
    isImprovement: dmgDiff === 0 ? null : dmgDiff > 0,
  });

  // 9. Riven Disposition
  rows.push({
    label: 'Riven Disposition',
    currentVal: current.dispositionText,
    counterpartVal: counterpart.dispositionText,
    deltaText: current.dispositionText === counterpart.dispositionText ? 'Same' : 'Variant-specific',
    isImprovement: null,
  });

  return rows;
}

export function compareWarframeCombatStats(
  current: WarframeCombatStats,
  counterpart: WarframeCombatStats
): StatComparisonRow[] {
  const rows: StatComparisonRow[] = [];

  // Health
  const hpDiff = counterpart.health - current.health;
  rows.push({
    label: 'Health',
    currentVal: current.health,
    counterpartVal: counterpart.health,
    deltaText: hpDiff === 0 ? 'Same' : hpDiff > 0 ? `+${hpDiff}` : `${hpDiff}`,
    isImprovement: hpDiff === 0 ? null : hpDiff > 0,
  });

  // Shield
  const shieldDiff = counterpart.shield - current.shield;
  rows.push({
    label: 'Shield',
    currentVal: current.shield,
    counterpartVal: counterpart.shield,
    deltaText: shieldDiff === 0 ? 'Same' : shieldDiff > 0 ? `+${shieldDiff}` : `${shieldDiff}`,
    isImprovement: shieldDiff === 0 ? null : shieldDiff > 0,
  });

  // Armor
  const armorDiff = counterpart.armor - current.armor;
  rows.push({
    label: 'Armor',
    currentVal: current.armor,
    counterpartVal: counterpart.armor,
    deltaText: armorDiff === 0 ? 'Same' : armorDiff > 0 ? `+${armorDiff}` : `${armorDiff}`,
    isImprovement: armorDiff === 0 ? null : armorDiff > 0,
  });

  // Energy / Power
  const pwrDiff = counterpart.power - current.power;
  rows.push({
    label: 'Energy (Power)',
    currentVal: current.power,
    counterpartVal: counterpart.power,
    deltaText: pwrDiff === 0 ? 'Same' : pwrDiff > 0 ? `+${pwrDiff}` : `${pwrDiff}`,
    isImprovement: pwrDiff === 0 ? null : pwrDiff > 0,
  });

  // Sprint Speed
  const spdDiff = +(counterpart.sprintSpeed - current.sprintSpeed).toFixed(2);
  rows.push({
    label: 'Sprint Speed',
    currentVal: current.sprintSpeed,
    counterpartVal: counterpart.sprintSpeed,
    deltaText: spdDiff === 0 ? 'Same' : spdDiff > 0 ? `+${spdDiff}` : `${spdDiff}`,
    isImprovement: spdDiff === 0 ? null : spdDiff > 0,
  });

  // Mastery Rank
  const mrDiff = counterpart.masteryReq - current.masteryReq;
  rows.push({
    label: 'Mastery Rank',
    currentVal: `MR ${current.masteryReq}`,
    counterpartVal: `MR ${counterpart.masteryReq}`,
    deltaText: mrDiff === 0 ? 'Same' : mrDiff > 0 ? `+${mrDiff} MR` : `${mrDiff} MR`,
    isImprovement: mrDiff === 0 ? null : mrDiff < 0,
  });

  // Polarities
  const curPol = current.polarities.join(', ') || 'None';
  const cntPol = counterpart.polarities.join(', ') || 'None';
  rows.push({
    label: 'Base Polarities',
    currentVal: curPol,
    counterpartVal: cntPol,
    deltaText:
      counterpart.polarities.length > current.polarities.length
        ? `+${counterpart.polarities.length - current.polarities.length} Polarity`
        : current.polarities.length === counterpart.polarities.length
        ? 'Same Count'
        : `${counterpart.polarities.length - current.polarities.length}`,
    isImprovement: counterpart.polarities.length > current.polarities.length ? true : null,
  });

  // Aura
  rows.push({
    label: 'Aura Polarity',
    currentVal: current.aura || 'None',
    counterpartVal: counterpart.aura || 'None',
    deltaText: current.aura === counterpart.aura ? 'Same' : 'Different',
    isImprovement: null,
  });

  return rows;
}

export function getItemVariantFamily(itemName: string, targetVariantName?: string): ItemVariantComparison | undefined {
  if (!itemName) return undefined;
  const baseName = extractBaseItemName(itemName);
  const baseNameLower = baseName.toLowerCase();

  // Check if this item is a Warframe
  const isWarframe = (allWarframes as any[]).some((wf) => extractBaseItemName(wf.name).toLowerCase() === baseNameLower);

  if (isWarframe) {
    const matchingWarframes = (allWarframes as any[]).filter(
      (wf) => extractBaseItemName(wf.name).toLowerCase() === baseNameLower
    );

    if (matchingWarframes.length <= 1 && !itemName.toLowerCase().includes('prime')) {
      return undefined;
    }

    const variants: VariantItemEntry[] = matchingWarframes.map((wf) => ({
      name: wf.name,
      variantType: getVariantType(wf.name, baseName),
      isCurrent: wf.name.toLowerCase() === itemName.toLowerCase(),
    }));

    // Sort: Base first, then Prime, then others
    const typeOrder: Record<string, number> = { Base: 1, Prime: 2, Other: 3 };
    variants.sort((a, b) => (typeOrder[a.variantType] || 9) - (typeOrder[b.variantType] || 9));

    // Choose counterpart: requested target or first non-current variant (preferring Prime if on Base, or Base if on Prime)
    let counterpart = targetVariantName
      ? variants.find((v) => v.name.toLowerCase() === targetVariantName.toLowerCase())
      : undefined;

    if (!counterpart) {
      if (itemName.toLowerCase().endsWith(' prime')) {
        counterpart = variants.find((v) => v.variantType === 'Base') || variants.find((v) => !v.isCurrent);
      } else {
        counterpart = variants.find((v) => v.variantType === 'Prime') || variants.find((v) => !v.isCurrent);
      }
    }

    if (!counterpart) return undefined;

    const currentStats = getWarframeCombatStats(itemName);
    const counterpartStats = getWarframeCombatStats(counterpart.name);

    if (!currentStats || !counterpartStats) return undefined;

    const comparisonRows = compareWarframeCombatStats(currentStats, counterpartStats);

    return {
      currentItemName: itemName,
      baseItemName: baseName,
      category: 'Warframe',
      variants,
      selectedVariantName: counterpart.name,
      comparisonRows,
    };
  }

  // Otherwise check Weapons
  const matchingWeapons = (allWeapons as any[]).filter(
    (w) => extractBaseItemName(w.name).toLowerCase() === baseNameLower
  );

  if (matchingWeapons.length <= 1) {
    return undefined;
  }

  const variants: VariantItemEntry[] = matchingWeapons.map((w) => ({
    name: w.name,
    variantType: getVariantType(w.name, baseName),
    isCurrent: w.name.toLowerCase() === itemName.toLowerCase(),
  }));

  // Sort: Base first, Prime, Kuva, Tenet, Coda, Syndicate, Wraith, Vandal, Prisma, Dex, Other
  const typeOrder: Record<string, number> = {
    Base: 1,
    Prime: 2,
    Kuva: 3,
    Tenet: 4,
    Coda: 5,
    Syndicate: 6,
    Wraith: 7,
    Vandal: 8,
    Prisma: 9,
    Dex: 10,
    Mutalist: 11,
    Other: 12,
  };
  variants.sort((a, b) => (typeOrder[a.variantType] || 99) - (typeOrder[b.variantType] || 99));

  let counterpart = targetVariantName
    ? variants.find((v) => v.name.toLowerCase() === targetVariantName.toLowerCase())
    : undefined;

  if (!counterpart) {
    if (itemName.toLowerCase().endsWith(' prime')) {
      counterpart = variants.find((v) => v.variantType === 'Base') || variants.find((v) => !v.isCurrent);
    } else {
      counterpart =
        variants.find((v) => v.variantType === 'Prime') ||
        variants.find((v) => v.variantType === 'Kuva') ||
        variants.find((v) => v.variantType === 'Tenet') ||
        variants.find((v) => v.variantType === 'Coda') ||
        variants.find((v) => !v.isCurrent);
    }
  }

  if (!counterpart) return undefined;

  const currentStats = getWeaponCombatStats(itemName);
  const counterpartStats = getWeaponCombatStats(counterpart.name);

  if (!currentStats || !counterpartStats) return undefined;

  const curRaw = (allWeapons as any[]).find((w) => w.name.toLowerCase() === itemName.toLowerCase());
  const cntRaw = (allWeapons as any[]).find((w) => w.name.toLowerCase() === counterpart!.name.toLowerCase());

  const comparisonRows = compareWeaponCombatStats(
    currentStats,
    counterpartStats,
    curRaw?.masteryReq || 0,
    cntRaw?.masteryReq || 0
  );

  return {
    currentItemName: itemName,
    baseItemName: baseName,
    category: 'Weapon',
    variants,
    selectedVariantName: counterpart.name,
    comparisonRows,
  };
}

export function isItemTradeable(
  itemName: string,
  context?: {
    category?: string;
    isComponent?: boolean;
    isMod?: boolean;
    isArcane?: boolean;
    isRelic?: boolean;
    isWarframe?: boolean;
    isWeapon?: boolean;
    tradable?: boolean;
  }
): boolean {
  if (!itemName) return false;
  const lower = itemName.trim().toLowerCase();

  // Explicit flag from resource or item data if present
  if (context?.tradable !== undefined) {
    return context.tradable;
  }

  // 1. Relics: All relics are tradeable
  if (context?.isRelic || /^(lith|meso|neo|axi|requiem)\s+/i.test(lower)) {
    return true;
  }

  // 2. Arcanes: All arcanes are tradeable
  if (
    context?.isArcane ||
    lower.startsWith('arcane ') ||
    lower.startsWith('magus ') ||
    lower.startsWith('virtuos ') ||
    lower.startsWith('pax ') ||
    lower.startsWith('exodia ') ||
    lower.startsWith('melee ') ||
    lower.startsWith('primary ') ||
    lower.startsWith('secondary ') ||
    lower.startsWith('shotgun ')
  ) {
    return true;
  }

  // 3. Mods: Tradeable except Flawed and quest Umbral/Sacrificial mods
  if (context?.isMod || lower.endsWith(' mod')) {
    if (lower.startsWith('flawed ') || lower.startsWith('umbral ') || lower.startsWith('sacrificial ')) {
      return false;
    }
    return true;
  }

  // 4. Components (e.g. Ash Prime Systems Blueprint vs Ash Systems Blueprint)
  const isPartSuffix = /\s+(blueprint|chassis|neuroptics|systems|harness|wings|barrel|receiver|stock|blade|handle|hilt|guard|grip|string|upper limb|lower limb|disc|gauntlet|pouch|stars|ornament|chain|head|motor|heatsink|link)$/i.test(lower);
  if (context?.isComponent || isPartSuffix) {
    // Only Prime parts, Vandal/Wraith parts, Necramech damaged parts, and syndicate archwing parts are tradeable
    if (
      lower.includes('prime') ||
      lower.includes('vandal') ||
      lower.includes('wraith') ||
      lower.includes('necramech') ||
      lower.includes('damaged necramech') ||
      lower.includes('scintillant')
    ) {
      return true;
    }
    return false;
  }

  // 5. Warframes: Base Warframes are NOT tradeable! Only Prime Warframes are tradeable.
  if (context?.isWarframe || context?.category === 'Warframe') {
    return lower.includes('prime');
  }

  // 6. Weapons: Base weapons are NOT tradeable. Only Prime, Syndicate, Vandal, Wraith, Prisma, Tenet, Kuva, etc. are tradeable.
  if (context?.isWeapon || context?.category === 'Weapon') {
    return (
      lower.includes('prime') ||
      lower.includes('vandal') ||
      lower.includes('wraith') ||
      lower.includes('prisma') ||
      lower.includes('secura') ||
      lower.includes('rakta') ||
      lower.includes('telos') ||
      lower.includes('sancti') ||
      lower.includes('synoid') ||
      lower.includes('vaykor') ||
      lower.includes('ceti') ||
      lower.includes('tenet') ||
      lower.includes('kuva')
    );
  }

  // 7. Base Resources: Untradeable
  const untradeableResources = new Set([
    'orokin cell', 'ferrite', 'rubedo', 'nano spores', 'plastids', 'alloy plate',
    'circuits', 'polymer bundle', 'salvage', 'gallium', 'morphics', 'neural sensors',
    'neurodes', 'control module', 'argon crystal', 'tellurium', 'oxium', 'cryotic',
    'credits', 'endo', 'kuva', 'forma', 'forma blueprint'
  ]);
  if (untradeableResources.has(lower)) {
    return false;
  }

  // Catch-all: If name contains Prime, it is tradeable
  if (lower.includes('prime')) {
    return true;
  }

  return false;
}


