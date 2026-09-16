export const LOOKUP_POOL = [
  // User's core items
  'Argon Crystal',
  'Orokin Cell',
  'Tellurium',
  'Plastids',
  'Meso N15 Relic',
  'Axi A17 Relic',
  'Lith A12 Relic',
  'Wisp Prime',
  'Toroid',
  // Popular Warframes & Primes
  'Rhino Prime',
  'Saryn Prime',
  'Volt Prime',
  'Mesa Prime',
  'Dante',
  'Kullervo',
  'Protea Prime',
  // Top Weapons & Incarnons
  'Torid',
  'Burston Prime',
  'Dual Toxocyst',
  'Laetum',
  'Praedos',
  'Kuva Bramma',
  'Tenet Arca Plasmor',
  'Coda Caustacyst',
  // Top Arcanes
  'Arcane Energize',
  'Arcane Avenger',
  'Secondary Merciless',
  'Molt Augmented',
  'Melee Duplicate',
  'Melee Exposure',
  // Key Resources & Components
  'Pathos Clamp',
  'Entrati Lanthorn',
  'Lua Thrax Plasm',
  'Nitain Extract',
  'Cryotic',
  'Oxium',
  'Morphics',
  'Neural Sensors',
  'Control Module',
];

export function getRandomLookups(count = 8): string[] {
  const poolCopy = [...LOOKUP_POOL];
  for (let i = poolCopy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [poolCopy[i], poolCopy[j]] = [poolCopy[j], poolCopy[i]];
  }
  return poolCopy.slice(0, count);
}

