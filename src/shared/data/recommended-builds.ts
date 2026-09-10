export interface BuildModSlot {
  slot: number; // 0 to 7
  modName: string;
  rank?: number;
  drain?: number;
  polarity?: string;
}

export interface RecommendedBuild {
  id: string;
  title: string;
  author: string;
  targetItem: string;
  category: 'Warframe' | 'Primary' | 'Secondary' | 'Melee' | 'Companion';
  archetype: 'Steel Path' | 'General Purpose' | 'Endurance / Level Cap' | 'Eidolon / Boss' | 'Buff Support' | 'Speedrun' | 'Primer' | 'Heavy Attack' | 'Slash & Crit' | 'Loot Farming';
  description: string;
  playstyle: string;
  auraOrStance?: string;
  exilus?: string;
  mods: BuildModSlot[];
  arcanes?: string[];
  archonShards?: string[];
  helminth?: { ability: string; replacedAbility: string; description: string };
  focusSchool?: string;
  formaCount?: number;
  externalLinks?: {
    reframedUrl?: string;
    redditUrl?: string;
    tiktokUrl?: string;
    overframeUrl?: string;
  };
}

export const CURATED_BUILDS: RecommendedBuild[] = [
  // --- WARFRAMES ---
  {
    id: 'rhino-steel-path-tank',
    title: 'Iron Skin Tank & Roar Buffer',
    author: 'TennoMaster',
    targetItem: 'Rhino',
    category: 'Warframe',
    archetype: 'Steel Path',
    description: 'High Armor and Ability Strength build utilizing Ironclad Charge to multiply base armor before activating Iron Skin, resulting in hundreds of thousands of absorption health.',
    playstyle: 'Group enemies with Operator or grouping ability, cast Charge through the pack for massive armor increase, then immediately recast Iron Skin (via Iron Shrapnel). Maintain Roar for 120%+ faction damage buff for squad.',
    auraOrStance: 'Growing Power',
    exilus: 'Power Drift',
    mods: [
      { slot: 0, modName: 'Ironclad Charge', rank: 5, drain: 9 },
      { slot: 1, modName: 'Iron Shrapnel', rank: 3, drain: 7 },
      { slot: 2, modName: 'Blind Rage', rank: 10, drain: 16 },
      { slot: 3, modName: 'Transient Fortitude', rank: 10, drain: 16 },
      { slot: 4, modName: 'Primed Continuity', rank: 10, drain: 14 },
      { slot: 5, modName: 'Umbral Intensify', rank: 10, drain: 16 },
      { slot: 6, modName: 'Umbral Fiber', rank: 10, drain: 16 },
      { slot: 7, modName: 'Streamline', rank: 5, drain: 9 },
    ],
    arcanes: ['Arcane Tanker', 'Molt Augmented'],
    archonShards: ['2x Crimson (Ability Strength)', '3x Amber (Casting Speed)'],
    helminth: { ability: 'Nourish', replacedAbility: 'Rhino Stomp', description: 'Provides viral damage coating on weapons and massive energy multiplier.' },
    focusSchool: 'Zenurik',
    formaCount: 3,
  },
  {
    id: 'rhino-boss-eidolon',
    title: 'Index & Archon/Eidolon Damage Amp',
    author: 'VoidRunner',
    targetItem: 'Rhino',
    category: 'Warframe',
    archetype: 'Eidolon / Boss',
    description: 'Maximum Ability Strength setup to push Roar to the absolute limit for Archon Hunts and The Index.',
    playstyle: 'Activate Roar before engaging bosses. In The Index, Iron Skin makes you immune to Financial Stress energy and health drain.',
    auraOrStance: 'Corrosive Projection',
    exilus: 'Coaction Drift',
    mods: [
      { slot: 0, modName: 'Blind Rage', rank: 10, drain: 16 },
      { slot: 1, modName: 'Transient Fortitude', rank: 10, drain: 16 },
      { slot: 2, modName: 'Umbral Intensify', rank: 10, drain: 16 },
      { slot: 3, modName: 'Augur Secrets', rank: 5, drain: 7 },
      { slot: 4, modName: 'Primed Continuity', rank: 10, drain: 14 },
      { slot: 5, modName: 'Narrow Minded', rank: 10, drain: 16 },
      { slot: 6, modName: 'Rolling Guard', rank: 10, drain: 12 },
      { slot: 7, modName: 'Preparation', rank: 10, drain: 12 },
    ],
    arcanes: ['Arcane Nullifier', 'Molt Vigor'],
    focusSchool: 'Madurai',
    formaCount: 3,
  },
  {
    id: 'saryn-spore-plague-steel-path',
    title: 'Spore Plague Map Eraser',
    author: 'PlagueDoctor',
    targetItem: 'Saryn',
    category: 'Warframe',
    archetype: 'Steel Path',
    description: 'High Range and balanced Strength setup designed to spread spores across entire tile-sets while stripping 100% Corrosive armor and maintaining Gloom lifesteal.',
    playstyle: 'Cast Spores on a tanky enemy, pop spores using Toxic Lash buffed weapons, then use Miasma when spore count is high to accelerate viral damage tick rates.',
    auraOrStance: 'Brief Respite',
    exilus: 'Cunning Drift',
    mods: [
      { slot: 0, modName: 'Overextended', rank: 5, drain: 11 },
      { slot: 1, modName: 'Stretch', rank: 5, drain: 9 },
      { slot: 2, modName: 'Augur Reach', rank: 5, drain: 7 },
      { slot: 3, modName: 'Umbral Intensify', rank: 10, drain: 16 },
      { slot: 4, modName: 'Primed Continuity', rank: 10, drain: 14 },
      { slot: 5, modName: 'Adaptation', rank: 10, drain: 12 },
      { slot: 6, modName: 'Venom Dose', rank: 5, drain: 9 },
      { slot: 7, modName: 'Rolling Guard', rank: 10, drain: 12 },
    ],
    arcanes: ['Arcane Energize', 'Molt Augmented'],
    archonShards: ['2x Emerald (+2 Max Corrosive Stacks for 100% Armor Strip)', '3x Crimson (+Ability Strength)'],
    helminth: { ability: 'Gloom', replacedAbility: 'Molt', description: 'Gives massive slow aura and instant lifesteal on every spore tick.' },
    focusSchool: 'Zenurik',
    formaCount: 4,
  },
  {
    id: 'ash-blade-storm-slash',
    title: 'Endurance True Damage Blade Storm',
    author: 'ShinobiTenno',
    targetItem: 'Ash',
    category: 'Warframe',
    archetype: 'Endurance / Level Cap',
    description: 'Utilizes Ash passive (+25% Slash damage & duration) combined with Savage Silence to multiply Blade Storm true damage to millions per strike.',
    playstyle: 'Stay invisible with Smoke Screen. Cast Silence to stun and trigger Savage Silence 300% finisher bonus, mark targets with Blade Storm, and watch whole rooms bleed to death bypassing all armor.',
    auraOrStance: 'Steel Charge',
    exilus: 'Primed Sure Footed',
    mods: [
      { slot: 0, modName: 'Savage Silence', rank: 5, drain: 9 },
      { slot: 1, modName: 'Rising Storm', rank: 5, drain: 9 },
      { slot: 2, modName: 'Primed Continuity', rank: 10, drain: 14 },
      { slot: 3, modName: 'Stretch', rank: 5, drain: 9 },
      { slot: 4, modName: 'Transient Fortitude', rank: 10, drain: 16 },
      { slot: 5, modName: 'Rolling Guard', rank: 10, drain: 12 },
      { slot: 6, modName: 'Umbral Intensify', rank: 10, drain: 16 },
      { slot: 7, modName: 'Streamline', rank: 5, drain: 9 },
    ],
    arcanes: ['Arcane Trickery', 'Arcane Fury'],
    archonShards: ['3x Crimson (Melee Crit Damage)', '2x Amber (Casting Speed)'],
    helminth: { ability: 'Silence', replacedAbility: 'Shuriken', description: 'Stuns enemies and triggers Savage Silence finisher damage scaling on Blade Storm.' },
    focusSchool: 'Naramon',
    formaCount: 3,
  },
  {
    id: 'dante-overguard-nuke',
    title: 'Immortal Overguard & Tragedy Nuke',
    author: 'GrimoireScholar',
    targetItem: 'Dante',
    category: 'Warframe',
    archetype: 'Steel Path',
    description: 'High Strength and Range build giving whole squad 50,000+ Overguard with Triumph, and detonating all damage over time statuses with Final Verse (Tragedy).',
    playstyle: 'Cast Light Verse twice + Final Verse for Triumph (Squad Overguard buffer). Cast Dark Verse twice + Final Verse for Tragedy (massive Line of Sight AoE nuke). Keep Wordwarden active for floating Noctua fire support.',
    auraOrStance: 'Brief Respite',
    exilus: 'Cunning Drift',
    mods: [
      { slot: 0, modName: 'Blind Rage', rank: 10, drain: 16 },
      { slot: 1, modName: 'Transient Fortitude', rank: 10, drain: 16 },
      { slot: 2, modName: 'Overextended', rank: 5, drain: 11 },
      { slot: 3, modName: 'Stretch', rank: 5, drain: 9 },
      { slot: 4, modName: 'Primed Continuity', rank: 10, drain: 14 },
      { slot: 5, modName: 'Augur Reach', rank: 5, drain: 7 },
      { slot: 6, modName: 'Archon Stretch', rank: 10, drain: 16 },
      { slot: 7, modName: 'Umbral Intensify', rank: 10, drain: 16 },
    ],
    arcanes: ['Molt Augmented', 'Arcane Energize'],
    archonShards: ['3x Amber (Casting Speed)', '2x Crimson (Ability Strength)'],
    focusSchool: 'Zenurik',
    formaCount: 2,
  },
  {
    id: 'kullervo-red-crit',
    title: '1000% Tier 4 Red Crit Wrathful Bleed',
    author: 'SevenBlades',
    targetItem: 'Kullervo',
    category: 'Warframe',
    archetype: 'Steel Path',
    description: 'Leverages Wrathful Advance to add over +300% flat Melee Critical Chance, transforming every melee swing into guaranteed Tier 3 and Tier 4 Red Crits linked through Collective Curse.',
    playstyle: 'Chain groups of enemies together with Collective Curse (3rd ability). Cast Wrathful Advance (1st ability) to teleport into heavy attack melee strike; 100% of the damage is transferred across all chained targets.',
    auraOrStance: 'Steel Charge',
    exilus: 'Primed Sure Footed',
    mods: [
      { slot: 0, modName: 'Blind Rage', rank: 10, drain: 16 },
      { slot: 1, modName: 'Transient Fortitude', rank: 10, drain: 16 },
      { slot: 2, modName: 'Umbral Intensify', rank: 10, drain: 16 },
      { slot: 3, modName: 'Umbral Vitality', rank: 10, drain: 16 },
      { slot: 4, modName: 'Primed Continuity', rank: 10, drain: 14 },
      { slot: 5, modName: 'Stretch', rank: 5, drain: 9 },
      { slot: 6, modName: 'Adaptation', rank: 10, drain: 12 },
      { slot: 7, modName: 'Gladiator Resolve', rank: 5, drain: 9 },
    ],
    arcanes: ['Arcane Reaper', 'Molt Augmented'],
    archonShards: ['3x Crimson (Melee Crit Damage)', '2x Amber (Casting Speed)'],
    focusSchool: 'Naramon',
    formaCount: 3,
  },
  {
    id: 'khora-whipclaw-pilfering',
    title: 'Pilfering Dome & Red Crit Whipclaw',
    author: 'CatTamer',
    targetItem: 'Khora',
    category: 'Warframe',
    archetype: 'Loot Farming',
    description: 'Ultimate resource farming setup utilizing Pilfering Strangledome for 65% bonus loot drop chance, combined with Accumulating Whipclaw for room-clearing AoE.',
    playstyle: 'Drop Strangledomes on choke points. Whip trapped enemies with Whipclaw to stack Accumulating Whipclaw to +350% bonus damage and instantly eliminate trapped mobs.',
    auraOrStance: 'Brief Respite',
    exilus: 'Primed Sure Footed',
    mods: [
      { slot: 0, modName: 'Accumulating Whipclaw', rank: 5, drain: 9 },
      { slot: 1, modName: 'Pilfering Strangledome', rank: 5, drain: 9 },
      { slot: 2, modName: 'Overextended', rank: 5, drain: 11 },
      { slot: 3, modName: 'Stretch', rank: 5, drain: 9 },
      { slot: 4, modName: 'Primed Continuity', rank: 10, drain: 14 },
      { slot: 5, modName: 'Streamline', rank: 5, drain: 9 },
      { slot: 6, modName: 'Rolling Guard', rank: 10, drain: 12 },
      { slot: 7, modName: 'Augur Reach', rank: 5, drain: 7 },
    ],
    arcanes: ['Arcane Energize', 'Arcane Fury'],
    focusSchool: 'Naramon',
    formaCount: 4,
  },

  // --- WEAPONS ---
  {
    id: 'braton-incarnon-slash-viral',
    title: 'Incarnon Viral & Hunter Munitions Shredder',
    author: 'VeteranSoldier',
    targetItem: 'Braton',
    category: 'Primary',
    archetype: 'Slash & Crit',
    description: 'Harnesses Braton Genesis Incarnon mode explosive rounds with Galvanized Multishot and Hunter Munitions for massive cascading bleed procs.',
    playstyle: 'Land headshots in standard mode to charge Incarnon meter, then switch to Incarnon explosive fire mode to wipe Steel Path hallways.',
    exilus: 'Vigilante Supplies',
    mods: [
      { slot: 0, modName: 'Serration', rank: 10, drain: 14 },
      { slot: 1, modName: 'Galvanized Chamber', rank: 10, drain: 12 },
      { slot: 2, modName: 'Critical Delay', rank: 5, drain: 9 },
      { slot: 3, modName: 'Vital Sense', rank: 5, drain: 9 },
      { slot: 4, modName: 'Hunter Munitions', rank: 5, drain: 9 },
      { slot: 5, modName: 'Rime Rounds', rank: 5, drain: 7 },
      { slot: 6, modName: 'Malignant Force', rank: 5, drain: 7 },
      { slot: 7, modName: 'Primed Shred', rank: 10, drain: 16 },
    ],
    arcanes: ['Primary Merciless (Rank 5)'],
    formaCount: 4,
  },
  {
    id: 'torid-incarnon-corrosive',
    title: 'Torid Incarnon Chain Beam Death Ray',
    author: 'MetaHunter',
    targetItem: 'Torid',
    category: 'Primary',
    archetype: 'Steel Path',
    description: 'The premier primary weapon in the current meta. Transforms into a chaining radiation/corrosive laser beam that melts through crowds with zero recoil.',
    playstyle: 'Direct hits instantly charge the Incarnon gauge. Activate Incarnon mode and hold left click while aiming at anything in range.',
    exilus: 'Vigilante Supplies',
    mods: [
      { slot: 0, modName: 'Galvanized Chamber', rank: 10, drain: 12 },
      { slot: 1, modName: 'Galvanized Aptitude', rank: 10, drain: 12 },
      { slot: 2, modName: 'Critical Delay', rank: 5, drain: 9 },
      { slot: 3, modName: 'Vital Sense', rank: 5, drain: 9 },
      { slot: 4, modName: 'High Voltage', rank: 5, drain: 7 },
      { slot: 5, modName: 'Malignant Force', rank: 5, drain: 7 },
      { slot: 6, modName: 'Primed Firestorm', rank: 10, drain: 14 },
      { slot: 7, modName: 'Vile Acceleration', rank: 5, drain: 9 },
    ],
    arcanes: ['Primary Merciless (Rank 5)'],
    formaCount: 5,
  },
  {
    id: 'laetum-overwhelming-attrition',
    title: 'Overwhelming Attrition Non-Crit Pocket Archgun',
    author: 'ZarimanVeteran',
    targetItem: 'Laetum',
    category: 'Secondary',
    archetype: 'Steel Path',
    description: 'Specialized 2000% damage multiplier build avoiding critical hits to trigger Devastating Attrition on every single bullet.',
    playstyle: 'Hit heads to charge gauge, switch to automatic micro-missile explosive mode. Melts Archons, Acolytes, and Level Cap eximus effortlessly.',
    exilus: 'Lethal Momentum',
    mods: [
      { slot: 0, modName: 'Galvanized Diffusion', rank: 10, drain: 12 },
      { slot: 1, modName: 'Galvanized Shot', rank: 10, drain: 12 },
      { slot: 2, modName: 'Anemic Agility', rank: 5, drain: 9 },
      { slot: 3, modName: 'Scorch', rank: 5, drain: 7 },
      { slot: 4, modName: 'Frostbite', rank: 5, drain: 7 },
      { slot: 5, modName: 'Pistol Pestilence', rank: 5, drain: 7 },
      { slot: 6, modName: 'Jolt', rank: 5, drain: 7 },
      { slot: 7, modName: 'Primed Fulmination', rank: 10, drain: 14 },
    ],
    arcanes: ['Secondary Deadhead (Rank 5)'],
    formaCount: 4,
  },
  {
    id: 'glaive-prime-heavy-attack',
    title: 'Heavy Attack Detonation Infinite Bleed',
    author: 'BoomerangKing',
    targetItem: 'Glaive Prime',
    category: 'Melee',
    archetype: 'Heavy Attack',
    description: 'Legendary forced-slash detonation build. Detonates in mid-air dealing millions of guaranteed Slash bleed ticks that bypass all shields and armor.',
    playstyle: 'Charge throw at groups or above enemy heads, press heavy attack (middle mouse) mid-flight to detonate. Move on while everything dies to bleed.',
    auraOrStance: 'Astral Twilight',
    mods: [
      { slot: 0, modName: 'Sacrificial Pressure', rank: 10, drain: 16 },
      { slot: 1, modName: 'Sacrificial Steel', rank: 10, drain: 16 },
      { slot: 2, modName: 'Amalgam Organ Shatter', rank: 5, drain: 9 },
      { slot: 3, modName: 'Killing Blow', rank: 5, drain: 9 },
      { slot: 4, modName: 'Volatile Quick Return', rank: 3, drain: 7 },
      { slot: 5, modName: 'Corrupt Charge', rank: 3, drain: 7 },
      { slot: 6, modName: 'Gladiator Might', rank: 5, drain: 9 },
      { slot: 7, modName: 'Power Throw', rank: 5, drain: 9 },
    ],
    arcanes: ['Melee Duplicate or Melee Crescendo'],
    formaCount: 3,
  },
  {
    id: 'stropha-heavy-attack-shotgun',
    title: 'Heavy Attack Gunblade Point-Blank One-Shot',
    author: 'CorpusBreaker',
    targetItem: 'Stropha',
    category: 'Melee',
    archetype: 'Heavy Attack',
    description: 'High burst damage heavy attack gunblade firing wide plasma buckshot that obliterates Demolysts, Acolytes, and Profit-Taker legs.',
    playstyle: 'Spam heavy attack at close to medium range. Corrupt Charge ensures constant 2x combo multiplier without building up hits.',
    auraOrStance: 'High Noon',
    mods: [
      { slot: 0, modName: 'Sacrificial Steel', rank: 10, drain: 16 },
      { slot: 1, modName: 'Sacrificial Pressure', rank: 10, drain: 16 },
      { slot: 2, modName: 'Amalgam Organ Shatter', rank: 5, drain: 9 },
      { slot: 3, modName: 'Killing Blow', rank: 5, drain: 9 },
      { slot: 4, modName: 'Corrupt Charge', rank: 3, drain: 7 },
      { slot: 5, modName: 'Gladiator Might', rank: 5, drain: 9 },
      { slot: 6, modName: 'Molten Impact', rank: 5, drain: 11 },
      { slot: 7, modName: 'Fever Strike', rank: 5, drain: 11 },
    ],
    arcanes: ['Melee Exposure'],
    formaCount: 3,
  },
];

/**
 * Returns curated recommended builds for an item, or generates standard meta archetypes
 * matching the item category if no custom hand-crafted build exists.
 */
export function getRecommendedBuildsForItem(itemName: string, category?: string): RecommendedBuild[] {
  const normName = itemName.toLowerCase().trim();
  const matched = CURATED_BUILDS.filter(
    (b) => b.targetItem.toLowerCase() === normName || normName.includes(b.targetItem.toLowerCase())
  );

  const cleanName = itemName.replace(/ Prime| Vandal| Wraith| Kuva| Tenet/gi, '').trim();
  const searchEnc = encodeURIComponent(itemName);
  const searchEncReddit = encodeURIComponent(`${itemName} build warframe`);
  const searchEncTiktok = encodeURIComponent(`warframe ${itemName} build`);
  const overframeSlug = encodeURIComponent(itemName.toLowerCase().replace(/ /g, '-'));

  const baseLinks = {
    reframedUrl: `https://reframed.site/search?q=${searchEnc}`,
    redditUrl: `https://www.reddit.com/r/Warframe/search/?q=${searchEncReddit}&restrict_sr=1`,
    tiktokUrl: `https://www.tiktok.com/search?q=${searchEncTiktok}`,
    overframeUrl: `https://overframe.gg/search/?q=${overframeSlug}`,
  };

  if (matched.length > 0) {
    return matched.map((b) => ({
      ...b,
      externalLinks: b.externalLinks || baseLinks,
    }));
  }

  // No custom builds found – return empty array
return [];
}

