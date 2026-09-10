export type LootCategory = 'Warframe' | 'Weapon' | 'Mod' | 'Gear' | 'Companions' | 'Archwing' | 'Arcane';

export interface ComponentDrop {
  partName: string;
  sourceText: string;
  dropChance?: number;
  rotation?: string;
}

export interface LootSourceItem {
  id: string;
  name: string;
  category: LootCategory;
  subType?: string;
  acquisitionType: 'Boss' | 'Mission' | 'Enemy' | 'Challenge' | 'Quest' | 'ClanDojo' | 'Syndicate' | 'Baro';
  bossOrEnemyName?: string;
  locationNode?: string;
  planet?: string;
  description: string;
  specialRequirementKey?: string;
  components?: ComponentDrop[];
  generalDropInfo?: string;
}

export const LOOT_SOURCES: LootSourceItem[] = [
  // --- WARFRAMES ---
  {
    id: 'rhino',
    name: 'Rhino',
    category: 'Warframe',
    subType: 'Armored Tank',
    acquisitionType: 'Boss',
    bossOrEnemyName: 'Jackal',
    locationNode: 'Fossa',
    planet: 'Venus',
    description: 'The heavyweight frontline Warframe. Highly recommended as the first crafted frame for all new players.',
    components: [
      { partName: 'Main Blueprint', sourceText: 'In-Game Market (35,000 Credits)' },
      { partName: 'Neuroptics Blueprint', sourceText: 'Jackal (Fossa, Venus)', dropChance: 38.72 },
      { partName: 'Chassis Blueprint', sourceText: 'Jackal (Fossa, Venus)', dropChance: 38.72 },
      { partName: 'Systems Blueprint', sourceText: 'Jackal (Fossa, Venus)', dropChance: 22.56 },
    ],
  },
  {
    id: 'saryn',
    name: 'Saryn',
    category: 'Warframe',
    subType: 'Spore & Toxic DPS',
    acquisitionType: 'Boss',
    bossOrEnemyName: 'Kela De Thaym',
    locationNode: 'Merrow',
    planet: 'Sedna',
    description: 'Map-clearing viral and corrosive spore plague master. High-tier frame for Sanctuary Onslaught and Elite missions.',
    specialRequirementKey: 'judgement_points',
    generalDropInfo: 'Entering the Merrow assassination requires 25 Judgement Points, obtained by completing Rathuum arena matches on Sedna.',
    components: [
      { partName: 'Main Blueprint', sourceText: 'In-Game Market (35,000 Credits)' },
      { partName: 'Neuroptics Blueprint', sourceText: 'Kela De Thaym (Merrow, Sedna)', dropChance: 38.72 },
      { partName: 'Chassis Blueprint', sourceText: 'Kela De Thaym (Merrow, Sedna)', dropChance: 38.72 },
      { partName: 'Systems Blueprint', sourceText: 'Kela De Thaym (Merrow, Sedna)', dropChance: 22.56 },
    ],
  },
  {
    id: 'wisp',
    name: 'Wisp',
    category: 'Warframe',
    subType: 'Support & DPS',
    acquisitionType: 'Boss',
    bossOrEnemyName: 'Ropalolyst',
    locationNode: 'Remains of Jovian Concord',
    planet: 'Jupiter',
    description: 'Summons Motes granting squad health regen, attack/movement speed, and electric crowd control shockwaves.',
    specialRequirementKey: 'chimera_prologue',
    generalDropInfo: 'Requires completion of the Chimera Prologue quest to unlock the Ropalolyst node.',
    components: [
      { partName: 'Main Blueprint', sourceText: 'Ropalolyst (Jupiter)', dropChance: 25.81 },
      { partName: 'Neuroptics Blueprint', sourceText: 'Ropalolyst (Jupiter)', dropChance: 25.81 },
      { partName: 'Chassis Blueprint', sourceText: 'Ropalolyst (Jupiter)', dropChance: 25.81 },
      { partName: 'Systems Blueprint', sourceText: 'Ropalolyst (Jupiter)', dropChance: 22.58 },
    ],
  },

  // --- WEAPONS ---
  {
    id: 'dread',
    name: 'Dread',
    category: 'Weapon',
    subType: 'Bow (Primary)',
    acquisitionType: 'Enemy',
    bossOrEnemyName: 'Shadow Stalker',
    description: 'Signature hunting bow of the Stalker. Features exceptionally high base critical hit chance.',
    components: [
      { partName: 'Main Blueprint', sourceText: 'Shadow Stalker (Assassin spawn on death-marked players)', dropChance: 37.94 },
    ],
  },
  {
    id: 'drakgoon',
    name: 'Drakgoon',
    category: 'Weapon',
    subType: 'Flak Cannon / Shotgun (Primary)',
    acquisitionType: 'Boss',
    bossOrEnemyName: 'In-Game Market / Kuva Larvling (Kuva Variant)',
    locationNode: 'Market Console / Level 20+ Grineer Missions',
    description: 'Grineer heavy flak cannon firing piercing shrapnel that ricochets off walls with tight spread on charge.',
    components: [
      { partName: 'Main Blueprint', sourceText: 'In-Game Market (20,000 Credits)' },
      { partName: 'Kuva Drakgoon', sourceText: 'Defeating Kuva Lich spawned via Kuva Larvling' },
      { partName: 'Fomorian Accelerant (Augment)', sourceText: 'Kela De Thaym (Merrow, Sedna)', dropChance: 11.28 },
    ],
    generalDropInfo: 'Main weapon blueprint is bought in the market. The exclusive Fomorian Accelerant augment mod drops from Kela De Thaym on Merrow, Sedna.',
  },

  // --- MODS ---
  {
    id: 'power_drift',
    name: 'Power Drift',
    category: 'Mod',
    subType: 'Exilus Mod (Warframe)',
    acquisitionType: 'Challenge',
    locationNode: 'Any Non-Defense Lua Node (e.g. Plato, Copernicus)',
    planet: 'Lua',
    description: '+15% Ability Strength, +30% Chance to Resist Knockdown. Key Exilus mod for hitting ability thresholds.',
    specialRequirementKey: 'hall_power',
    generalDropInfo: 'Rewarded by successfully completing the Power Principle puzzle room on Lua.',
  },
  {
    id: 'cunning_drift',
    name: 'Cunning Drift',
    category: 'Mod',
    subType: 'Exilus Mod (Warframe)',
    acquisitionType: 'Challenge',
    locationNode: 'Any Non-Defense Lua Node',
    planet: 'Lua',
    description: '+15% Ability Range, +12% Slide, -30% Friction. Premier Exilus slot mod for range-scaling Warframes.',
    specialRequirementKey: 'hall_cunning',
    generalDropInfo: 'Rewarded by completing the Cunning Principle (Security Eye boss fight) on Lua.',
  },
  {
    id: 'agility_drift',
    name: 'Agility Drift',
    category: 'Mod',
    subType: 'Exilus Mod (Warframe)',
    acquisitionType: 'Challenge',
    locationNode: 'Any Non-Defense Lua Node',
    planet: 'Lua',
    description: '-12% Damage Airborne, +18% Maximum Evasion.',
    specialRequirementKey: 'hall_agility',
    generalDropInfo: 'Rewarded by completing the Agility Principle pipe organ puzzle room on Lua.',
  },
  {
    id: 'speed_drift',
    name: 'Speed Drift',
    category: 'Mod',
    subType: 'Exilus Mod (Warframe)',
    acquisitionType: 'Challenge',
    locationNode: 'Any Non-Defense Lua Node',
    planet: 'Lua',
    description: '+12% Sprint Speed, +15% Casting Speed. Highly valued for speeding up long ability casting animations.',
    specialRequirementKey: 'hall_speed',
    generalDropInfo: 'Rewarded by completing the Speed Principle obstacle room on Lua.',
  },
  {
    id: 'stealth_drift',
    name: 'Stealth Drift',
    category: 'Mod',
    subType: 'Exilus Mod (Warframe)',
    acquisitionType: 'Challenge',
    locationNode: 'Any Non-Defense Lua Node',
    planet: 'Lua',
    description: '+18m Enemy Radar, -12% Aim Glide / Wall Latch drain.',
    specialRequirementKey: 'hall_stealth',
    generalDropInfo: 'Rewarded by navigating the laser stealth room on Lua without touching sensor beams.',
  },
  {
    id: 'endurance_drift',
    name: 'Endurance Drift',
    category: 'Mod',
    subType: 'Exilus Mod (Warframe)',
    acquisitionType: 'Challenge',
    locationNode: 'Any Non-Defense Lua Node',
    planet: 'Lua',
    description: '+15% Maximum Energy, +12% Parkour Velocity.',
    specialRequirementKey: 'hall_endurance',
    generalDropInfo: 'Rewarded by enduring laser column damage on the endurance platform on Lua.',
  },
  {
    id: 'coaction_drift',
    name: 'Coaction Drift',
    category: 'Mod',
    subType: 'Exilus Mod (Warframe)',
    acquisitionType: 'Challenge',
    locationNode: 'Any Non-Defense Lua Node',
    planet: 'Lua',
    description: '+15% Aura Strength, +15% Aura Effectiveness for squadmates.',
    specialRequirementKey: 'hall_coaction',
    generalDropInfo: 'Rewarded by stepping on 4 synchronized floor plates (solo with Operator, Specters, and Warframe).',
  },
  {
    id: 'blind_rage',
    name: 'Blind Rage',
    category: 'Mod',
    subType: 'Corrupted Mod (Warframe)',
    acquisitionType: 'Challenge',
    locationNode: 'Horend / Terrorek (Orokin Vaults)',
    planet: 'Deimos',
    description: '+99% Ability Strength, -55% Ability Efficiency. Cornerstone mod for massive strength builds.',
    specialRequirementKey: 'orokin_vault',
    generalDropInfo: 'Found inside hidden Orokin Derelict Vaults on Deimos. Requires equiping Bleeding, Decaying, Extinguished, or Hobbled Dragon Keys.',
  },
  {
    id: 'fleeting_expertise',
    name: 'Fleeting Expertise',
    category: 'Mod',
    subType: 'Corrupted Mod (Warframe)',
    acquisitionType: 'Challenge',
    locationNode: 'Horend / Terrorek (Orokin Vaults)',
    planet: 'Deimos',
    description: '+60% Ability Efficiency, -60% Ability Duration. Essential for maxing efficiency cap at 175%.',
    specialRequirementKey: 'orokin_vault',
    generalDropInfo: 'Found inside Orokin Vaults on Deimos requiring Dragon Keys to unlock.',
  },
  {
    id: 'narrow_minded',
    name: 'Narrow Minded',
    category: 'Mod',
    subType: 'Corrupted Mod (Warframe)',
    acquisitionType: 'Challenge',
    locationNode: 'Horend / Terrorek (Orokin Vaults)',
    planet: 'Deimos',
    description: '+99% Ability Duration, -66% Ability Range. Key mod for self-buff and stealth frames.',
    specialRequirementKey: 'orokin_vault',
    generalDropInfo: 'Found inside Orokin Vaults on Deimos requiring Dragon Keys to unlock.',
  },
  {
    id: 'overextended',
    name: 'Overextended',
    category: 'Mod',
    subType: 'Corrupted Mod (Warframe)',
    acquisitionType: 'Challenge',
    locationNode: 'Horend / Terrorek (Orokin Vaults)',
    planet: 'Deimos',
    description: '+90% Ability Range, -60% Ability Strength. Crucial for massive crowd control and spore spreading.',
    specialRequirementKey: 'orokin_vault',
    generalDropInfo: 'Found inside Orokin Vaults on Deimos requiring Dragon Keys to unlock.',
  },
  {
    id: 'condition_overload',
    name: 'Condition Overload',
    category: 'Mod',
    subType: 'Melee Mod',
    acquisitionType: 'Enemy',
    bossOrEnemyName: 'Drekar Butcher / Grineer Butchers',
    locationNode: 'Ophelia',
    planet: 'Uranus',
    description: '+80% Melee Damage per Status Type affecting the target. Keystone mod for all endgame melee DPS.',
    generalDropInfo: 'High drop chance from Drekar enemies on Uranus; best farmed in Ophelia survival with loot frames.',
  },
  {
    id: 'blood_rush',
    name: 'Blood Rush',
    category: 'Mod',
    subType: 'Melee Mod',
    acquisitionType: 'Mission',
    locationNode: 'Pavlov (Spy) / Isolation Vaults',
    planet: 'Lua / Deimos',
    description: '+40% Critical Chance stacks with Combo Multiplier. Standard for all combo-based melee builds.',
    generalDropInfo: 'Drop from Pavlov Lua Spy Vault A (12.18%) or Deimos Mother Isolation Vault bounty tables.',
  },
  {
    id: 'fomorian_accelerant',
    name: 'Fomorian Accelerant',
    category: 'Mod',
    subType: 'Drakgoon Weapon Augment Mod',
    acquisitionType: 'Boss',
    bossOrEnemyName: 'Kela De Thaym',
    locationNode: 'Merrow',
    planet: 'Sedna',
    description: '+60% Flak Bounce, +80% Projectile Flight Speed. Increases pellet bounce count by 4.',
    specialRequirementKey: 'judgement_points',
    generalDropInfo: 'Assassination drop from Kela De Thaym on Sedna with an 11.28% drop rate. Requires 25 Judgement Points to enter.',
  },
  {
    id: 'contagious_bond',
    name: 'Contagious Bond',
    category: 'Mod',
    subType: 'Companion Mod (Beast / Robotic)',
    acquisitionType: 'Syndicate',
    bossOrEnemyName: 'Son (Entrati)',
    locationNode: 'Necralisk',
    planet: 'Deimos',
    description: 'When companion kills an enemy, spreads up to 50% of their status effects to nearby enemies within 9m.',
    generalDropInfo: 'Purchased from Son in the Necralisk for 20,000 Entrati standing at Rank 3 - Associate.',
  },
];

import allWarframesJson from './generated/all-warframes.json';
import allWeaponsJson from './generated/all-weapons.json';
import allGearJson from './generated/all-gear.json';
import { getEnemyDropsForItem } from './item-database';
import { getArcane, getAllArcanes, ArcaneData } from './arcanes';

export function arcaneToLootSource(a: ArcaneData): LootSourceItem {
  return {
    id: a.id,
    name: a.name,
    category: 'Arcane',
    subType: a.type,
    acquisitionType: a.vendorSource ? 'Syndicate' : 'Mission',
    bossOrEnemyName: a.vendorSource?.vendorName,
    locationNode: a.drops[0]?.location || a.vendorSource?.location,
    planet: a.vendorSource?.location,
    description: a.description,
    components: a.drops.map((d) => ({
      partName: a.name,
      sourceText: d.location,
      dropChance: d.chance,
    })),
    generalDropInfo: a.dissolutionPack ? `Arcane Dissolution: Available in ${a.dissolutionPack}.` : undefined,
  };
}
import {
  CODA_BATCH_A,
  CODA_BATCH_B,
  getCodaBatch,
  TENET_ERGO_GLAST_WEAPONS,
  TENET_SISTERS_WEAPONS,
  KUVA_WEAPONS_LIST,
  INCARNON_ORIGINALS,
  getIncarnonGenesisWeek,
} from './vendor-sources';

export function synthesizeSpecialLootSource(idOrName: string): LootSourceItem | undefined {
  const normalized = idOrName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const lowerName = idOrName.toLowerCase().trim();

  // 1. Voidplumes
  if (lowerName.startsWith('voidplume') || lowerName.includes('voidplume')) {
    const isQuill = lowerName.includes('quill');
    const isPinion = lowerName.includes('pinion');
    const isCrest = lowerName.includes('crest');
    const isVane = lowerName.includes('vane');
    const isDown = lowerName.includes('down');

    return {
      id: normalized,
      name: idOrName,
      category: 'Gear',
      subType: 'Zariman Resource',
      acquisitionType: 'Mission',
      bossOrEnemyName: isPinion
        ? 'Ravenous Void Angel'
        : isQuill
        ? 'Zariman Bounties (Quinn) / Cephalon Melica Consoles'
        : 'Zariman Scavenge Pickups',
      locationNode: isQuill
        ? 'Chrysalith Bounties (Quinn) / Zariman Corridors'
        : isPinion
        ? 'Halako Perimeter / Dormant Angel Spawns'
        : 'Halako Perimeter / Zariman Missions',
      planet: 'Zariman Ten Zero',
      description: isPinion
        ? 'The radiant crest feather of a dormant Void Angel. Crucial for Incarnon blueprints and Holdfasts rank advancement.'
        : isQuill
        ? 'A crystallized feather of Void energy harvested from Zariman bounties and Melica terminals. Used for Holdfasts standing and Incarnon crafting.'
        : isCrest
        ? 'A rare Void crystal pickup found scattered in Zariman missions. Exactly 1 spawns per level.'
        : isVane
        ? 'A fan-shaped Void crystal formation found as a physical pickup or Tier 2 bounty reward.'
        : 'Common physical Void crystal pickup found across Zariman corridors and Tier 1 bounty rewards.',
      generalDropInfo: isPinion
        ? 'Guaranteed 1 drop per defeated Ravenous Void Angel in any Zariman mission. Also purchased from Archimedean Yonta on daily reset rotation.'
        : isQuill
        ? 'Guaranteed reward for completing Zariman Bounties from Quinn in the Chrysalith (Tier 3-5 bounties grant 2 to 5 Quills). Also obtained by delivering Orokin Sound Codes to Cephalon Melica terminals.'
        : isCrest
        ? 'Spawns as 1 of the 8 hidden pickups across any Zariman mission. Use wide-radius container breaking and loot radar to isolate un-broken markers on the mini-map.'
        : isVane
        ? 'Spawns as 1 to 3 of the 8 hidden pickups across Zariman missions. Also awarded from Tier 2 Zariman bounties.'
        : 'Spawns as 4 to 5 of the 8 hidden pickups across Zariman missions. Also awarded from Tier 1 Zariman bounties.',
      components: [
        {
          partName: idOrName,
          sourceText: isPinion
            ? 'Defeating Ravenous Void Angel (Guaranteed 1 per kill)'
            : isQuill
            ? 'Zariman Bounties (Tier 3-5) / Melica Consoles'
            : isCrest
            ? 'Zariman Level Scavenge (1 per mission)'
            : isVane
            ? 'Zariman Level Scavenge / Tier 2 Bounties'
            : 'Zariman Level Scavenge / Tier 1 Bounties',
        },
      ],
    };
  }

  // 2. Coda Weapons (Eleanor / The Hex - Höllvania Central Mall - 1999)
  const isCoda =
    lowerName.startsWith('coda ') ||
    lowerName.includes('coda') ||
    CODA_BATCH_A.some((w) => w.toLowerCase() === lowerName) ||
    CODA_BATCH_B.some((w) => w.toLowerCase() === lowerName);
  if (isCoda) {
    const batch = getCodaBatch(idOrName) || 'Batch B';
    const batchWeapons = batch === 'Batch A' ? CODA_BATCH_A : CODA_BATCH_B;
    return {
      id: normalized,
      name: idOrName,
      category: 'Weapon',
      subType: 'Technocyte Coda Infested Weapon',
      acquisitionType: 'Syndicate',
      bossOrEnemyName: 'Eleanor / Technocyte Coda',
      locationNode: 'Höllvania Central Mall',
      planet: '1999 (Earth)',
      description: `${idOrName} is an Infested Technocyte Coda weapon purchased from Eleanor in the Höllvania Central Mall.`,
      generalDropInfo: `Purchased from Eleanor of The Hex in the Höllvania Central Mall for 10 Live Heartcell obtained from vanquishing a Technocyte Coda. Each offering has a random progenitor bonus damage type and percentage increase, which is cycled every 4 days between Batch A and Batch B. This weapon belongs to ${batch} (${batchWeapons.join(', ')}).`,
      components: [
        {
          partName: 'Fully Built Weapon',
          sourceText: 'Eleanor (10 Live Heartcell - 4-Day Rotating Batch)',
        },
      ],
    };
  }

  // 3. Tenet Ergo Glast Weapons (The Perrin Sequence)
  const isErgoTenet = TENET_ERGO_GLAST_WEAPONS.some((w) => w.toLowerCase() === lowerName);
  if (isErgoTenet) {
    return {
      id: normalized,
      name: idOrName,
      category: 'Weapon',
      subType: 'Tenet Syndicate Melee',
      acquisitionType: 'Syndicate',
      bossOrEnemyName: 'Ergo Glast (The Perrin Sequence)',
      locationNode: 'Perrin Sequence Enclave (Any Relay)',
      planet: 'Tenno Relays',
      description: `${idOrName} is an executive Tenet melee weapon sold by Ergo Glast.`,
      generalDropInfo: 'Purchased directly from Ergo Glast in The Perrin Sequence enclave at any Tenno Relay for 40 Corrupted Holokeys. Offerings rotate progenitor bonus damage types every 4 days. Corrupted Holokeys are rewarded from Railjack Void Storm missions (highest yield: 10 per drop in Veil Proxima).',
      components: [
        {
          partName: 'Fully Built Weapon',
          sourceText: 'Ergo Glast (40 Corrupted Holokeys)',
        },
      ],
    };
  }

  // 4. Tenet Sisters of Parvos Weapons
  const isSistersTenet =
    lowerName.startsWith('tenet ') ||
    TENET_SISTERS_WEAPONS.some((w) => w.toLowerCase() === lowerName);
  if (isSistersTenet) {
    return {
      id: normalized,
      name: idOrName,
      category: 'Weapon',
      subType: 'Tenet Corpus Nemesis Weapon',
      acquisitionType: 'Boss',
      bossOrEnemyName: 'Sister of Parvos (Vanquish)',
      locationNode: 'Granum Void (Zenith Crown) / Railjack Proxima',
      planet: 'Corpus Ship / Proxima',
      description: `${idOrName} is an upgraded Corpus executive weapon claimed from a Sister of Parvos.`,
      generalDropInfo: 'Spawned by scoring 25+ kills in Tier 3 Zenith Granum Void on level 30+ Corpus Ship missions to create a Sister Candidate. Unveil her Requiem mod sequence through Thrall confrontations and vanquish her in Railjack Proxima. The fully crafted weapon is delivered directly to your Foundry ready to claim with a randomized progenitor elemental bonus (up to 60%).',
      components: [
        {
          partName: 'Fully Built Weapon',
          sourceText: 'Sister of Parvos Vanquish (Delivered to Foundry)',
        },
      ],
    };
  }

  // 5. Kuva Weapons (Kuva Lich)
  const isKuva =
    lowerName.startsWith('kuva ') ||
    KUVA_WEAPONS_LIST.some((w) => w.toLowerCase() === lowerName);
  if (isKuva) {
    return {
      id: normalized,
      name: idOrName,
      category: 'Weapon',
      subType: 'Kuva Grineer Nemesis Weapon',
      acquisitionType: 'Boss',
      bossOrEnemyName: 'Kuva Lich (Vanquish)',
      locationNode: 'Cassini (Larvling Spawn) / Saturn Proxima Showdown',
      planet: 'Grineer Star Chart / Saturn Proxima',
      description: `${idOrName} is a heavy Grineer weapon enhanced with Kuva and progenitor element buffs.`,
      generalDropInfo: 'Spawned by executing a Kuva Larvling in level 20+ Grineer missions (Cassini, Saturn is community favorite). Hunt Thralls on influenced nodes to reveal the 3 Requiem mods, then defeat and vanquish the Lich in Saturn Proxima Railjack. Delivered fully crafted to your Foundry with a randomized progenitor elemental bonus (up to 60%).',
      components: [
        {
          partName: 'Fully Built Weapon',
          sourceText: 'Kuva Lich Vanquish (Delivered to Foundry)',
        },
      ],
    };
  }

  // 6. Zariman Incarnon Originals
  const isZarimanIncarnon = INCARNON_ORIGINALS.some((w) => w.toLowerCase() === lowerName);
  if (isZarimanIncarnon) {
    return {
      id: normalized,
      name: idOrName,
      category: 'Weapon',
      subType: 'Incarnon Evolving Weapon',
      acquisitionType: 'Syndicate',
      bossOrEnemyName: 'Cavalero (The Holdfasts)',
      locationNode: 'Chrysalith',
      planet: 'Zariman Ten Zero',
      description: `${idOrName} is an ancient Zariman weapon capable of Void Transmutation into an alternate firing mode.`,
      generalDropInfo: 'Blueprints are purchased from Cavalero in the Chrysalith with Holdfasts Standing. After crafting, weapons unlock 5 Evolution tiers by completing gameplay challenges at Cavalero\'s workbench.',
      components: [
        {
          partName: 'Main Blueprint',
          sourceText: 'Cavalero (The Holdfasts Standing)',
        },
      ],
    };
  }

  // 7. Incarnon Genesis
  const genesis = getIncarnonGenesisWeek(idOrName);
  if (genesis) {
    return {
      id: normalized,
      name: idOrName,
      category: 'Weapon',
      subType: 'Incarnon Genesis Compatible Weapon',
      acquisitionType: 'Mission',
      bossOrEnemyName: 'The Circuit (Duviri Steel Path) / Cavalero',
      locationNode: 'The Circuit / Chrysalith',
      planet: 'Duviri / Zariman',
      description: `${idOrName} can be upgraded with an Incarnon Genesis Adapter earned from the Steel Path Circuit.`,
      generalDropInfo: `Incarnon Genesis Adapter earned as a Tier 5 or Tier 10 milestone reward from the Steel Path Circuit in Duviri (Week ${genesis.week} Rotation pool: ${genesis.pool.join(', ')}). Cavalero installs the adapter in the Chrysalith for 20 Pathos Clamps and regional Duviri resources.`,
      components: [
        {
          partName: 'Incarnon Genesis Adapter',
          sourceText: `Steel Path Circuit Week ${genesis.week} Milestone`,
        },
      ],
    };
  }

  return undefined;
}

const ALL_COMPREHENSIVE_WARFRAMES: LootSourceItem[] = (() => {
  const list: LootSourceItem[] = [...LOOT_SOURCES.filter((i) => i.category === 'Warframe')];
  const seenNames = new Set(list.map((w) => w.name.toLowerCase()));

  for (const raw of allWarframesJson) {
    if (seenNames.has(raw.name.toLowerCase())) continue;
    seenNames.add(raw.name.toLowerCase());

    list.push({
      id: raw.id,
      name: raw.name,
      category: 'Warframe',
      subType: raw.subType,
      acquisitionType: raw.subType.includes('Prime') ? 'Mission' : 'Boss',
      description: raw.description,
      components: (raw.components || []).map((c: any) => ({
        partName: c.partName,
        sourceText: c.sourceText,
        dropChance: c.dropChance,
      })),
      generalDropInfo: raw.subType.includes('Prime')
        ? 'Components obtained through Void Fissure Relics.'
        : 'Components drop from assassination bosses, quests, or clan research labs.',
    });
  }
  return list;
})();

const ALL_COMPREHENSIVE_WEAPONS: LootSourceItem[] = (() => {
  const list: LootSourceItem[] = [...LOOT_SOURCES.filter((i) => i.category === 'Weapon')];
  const seenNames = new Set(list.map((w) => w.name.toLowerCase()));

  for (const raw of allWeaponsJson) {
    if (seenNames.has(raw.name.toLowerCase())) continue;
    seenNames.add(raw.name.toLowerCase());

    list.push({
      id: raw.id,
      name: raw.name,
      category: 'Weapon',
      subType: raw.subType,
      acquisitionType: 'Mission',
      description: raw.description,
      components: (raw.components || []).map((c: any) => ({
        partName: c.partName,
        sourceText: c.sourceText,
        dropChance: c.dropChance,
      })),
      generalDropInfo: `Mastery Rank ${raw.masteryReq} weapon. Trigger: ${raw.trigger}, Base Crit: ${raw.critChance}, Status: ${raw.statusChance}.`,
    });
  }

  // Populate Nemesis & Incarnon weapons
  const allNemesisAndIncarnonNames = [
    ...CODA_BATCH_A,
    ...CODA_BATCH_B,
    ...TENET_ERGO_GLAST_WEAPONS,
    ...TENET_SISTERS_WEAPONS,
    ...KUVA_WEAPONS_LIST,
    ...INCARNON_ORIGINALS,
  ];
  for (const name of allNemesisAndIncarnonNames) {
    if (!seenNames.has(name.toLowerCase())) {
      seenNames.add(name.toLowerCase());
      const synthesized = synthesizeSpecialLootSource(name);
      if (synthesized) {
        list.push(synthesized);
      }
    }
  }

  return list;
})();

const ALL_COMPREHENSIVE_GEAR: LootSourceItem[] = (() => {
  const list: LootSourceItem[] = [];
  for (const raw of allGearJson) {
    const cat =
      raw.category === 'Companions' || raw.category === 'Archwing'
        ? (raw.category as LootCategory)
        : 'Gear';

    list.push({
      id: raw.id,
      name: raw.name,
      category: cat,
      subType: raw.type || raw.category,
      acquisitionType: 'Mission',
      description: raw.description || '',
      components: (raw.components || []).map((c: any) => ({
        partName: c.partName,
        sourceText: c.sourceText,
        dropChance: c.dropChance,
      })),
      generalDropInfo: `Mastery Rank ${raw.masteryReq || 0} equipment. ${
        raw.buildTime ? `Build time: ${raw.buildTime}.` : ''
      }`,
    });
  }

  // Populate Zariman Voidplumes
  const voidplumes = [
    'Voidplume Quill',
    'Voidplume Pinion',
    'Voidplume Crest',
    'Voidplume Vane',
    'Voidplume Down',
  ];
  for (const vp of voidplumes) {
    if (!list.some((g) => g.name.toLowerCase() === vp.toLowerCase())) {
      const synthesized = synthesizeSpecialLootSource(vp);
      if (synthesized) list.push(synthesized);
    }
  }

  return list;
})();

export function getLootSource(idOrName: string): LootSourceItem | undefined {
  const normalized = idOrName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const foundInCurated = LOOT_SOURCES.find(
    (item) => item.id === normalized || item.name.toLowerCase() === idOrName.toLowerCase()
  );
  if (foundInCurated) return foundInCurated;

  const special = synthesizeSpecialLootSource(idOrName);
  if (special) return special;

  const foundInComprehensive =
    ALL_COMPREHENSIVE_WARFRAMES.find(
      (item) => item.id === normalized || item.name.toLowerCase() === idOrName.toLowerCase()
    ) ||
    ALL_COMPREHENSIVE_WEAPONS.find(
      (item) => item.id === normalized || item.name.toLowerCase() === idOrName.toLowerCase()
    ) ||
    ALL_COMPREHENSIVE_GEAR.find(
      (item) => item.id === normalized || item.name.toLowerCase() === idOrName.toLowerCase()
    );
  if (foundInComprehensive) return foundInComprehensive;

  const arcane = getArcane(idOrName);
  if (arcane) return arcaneToLootSource(arcane);

  const enemyDrops = getEnemyDropsForItem(idOrName);
  if (enemyDrops.length > 0) {
    const topDrop = enemyDrops[0];
    return {
      id: normalized,
      name: idOrName,
      category: (topDrop.category as any) || 'Mod',
      acquisitionType: 'Enemy',
      bossOrEnemyName: topDrop.enemyName,
      description: `Acquired as an official drop from ${topDrop.enemyName} and other units.`,
      generalDropInfo: `Drops from ${enemyDrops.length} enemy sources. Top source: ${topDrop.enemyName} (${topDrop.dropChance}%).`,
      components: enemyDrops.slice(0, 5).map((d) => ({
        partName: `${idOrName} from ${d.enemyName}`,
        sourceText: `${d.enemyName} (${d.rarity || 'Drop'})`,
        dropChance: d.enemyDropChance ? Number(((d.enemyDropChance * d.dropChance) / 100).toFixed(2)) : d.dropChance,
      })),
    };
  }

  return undefined;
}

export function searchLootSources(query: string): LootSourceItem[] {
  const q = query.toLowerCase().trim();
  const allItems = [
    ...ALL_COMPREHENSIVE_WARFRAMES,
    ...ALL_COMPREHENSIVE_WEAPONS,
    ...ALL_COMPREHENSIVE_GEAR,
    ...getAllLootMods(),
    ...getAllArcanes().map(arcaneToLootSource),
  ];
  if (!q) return allItems;

  return allItems.filter(
    (item) =>
      item.name.toLowerCase().includes(q) ||
      (item.subType && item.subType.toLowerCase().includes(q)) ||
      (item.bossOrEnemyName && item.bossOrEnemyName.toLowerCase().includes(q)) ||
      (item.locationNode && item.locationNode.toLowerCase().includes(q)) ||
      (item.planet && item.planet.toLowerCase().includes(q)) ||
      item.description.toLowerCase().includes(q) ||
      (item.components && item.components.some((c) => c.partName.toLowerCase().includes(q)))
  );
}

export function getAllWarframes(): LootSourceItem[] {
  return ALL_COMPREHENSIVE_WARFRAMES;
}

export function getAllWeapons(): LootSourceItem[] {
  return ALL_COMPREHENSIVE_WEAPONS;
}

export function getAllGear(): LootSourceItem[] {
  return ALL_COMPREHENSIVE_GEAR;
}

export function getAllLootMods(): LootSourceItem[] {
  return LOOT_SOURCES.filter((i) => i.category === 'Mod');
}

export function getAllArcanesLoot(): LootSourceItem[] {
  return getAllArcanes().map(arcaneToLootSource);
}

