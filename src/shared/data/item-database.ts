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

