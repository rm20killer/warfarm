import vendorCatalogJson from './generated/vendor-catalog.json';
import incarnonGenesisJson from './generated/incarnon-genesis.json';

export interface ItemVendorAcquisition {
  itemId: string;
  itemName: string;
  vendorName: string;
  syndicateOrStore: string;
  cost: string;
  rankRequirement?: string;
  location: string;
  fullAcquisitionSentence: string;
  notes?: string;
}

const vendorCatalog: Record<string, ItemVendorAcquisition> = vendorCatalogJson as unknown as Record<
  string,
  ItemVendorAcquisition
>;

export const VENDOR_ACQUISITIONS: ItemVendorAcquisition[] = Object.values(vendorCatalog);

export const CODA_BATCH_A = [
  'Coda Hema',
  'Coda Sporothrix',
  'Coda Catabolyst',
  'Coda Pox',
  'Dual Coda Torxica',
  'Coda Mire',
  'Coda Motovore',
];

export const CODA_BATCH_B = [
  'Coda Bassocyst',
  'Coda Bubonico',
  'Coda Synapse',
  'Coda Tysis',
  'Coda Caustacyst',
  'Coda Hirudo',
  'Coda Pathocyst',
];

export const TENET_ERGO_GLAST_WEAPONS = [
  'Tenet Agendus',
  'Tenet Exec',
  'Tenet Livia',
  'Tenet Grigori',
  'Tenet Ferrox',
];

export const TENET_SISTERS_WEAPONS = [
  'Tenet Arca Plasmor',
  'Tenet Envoy',
  'Tenet Flux Rifle',
  'Tenet Spirex',
  'Tenet Tetra',
  'Tenet Cycron',
  'Tenet Detron',
  'Tenet Diplos',
  'Tenet Glaxion',
  'Tenet Plinx',
];

export const KUVA_WEAPONS_LIST = [
  'Kuva Bramma',
  'Kuva Zarr',
  'Kuva Nukor',
  'Kuva Chakkhurr',
  'Kuva Drakgoon',
  'Kuva Hek',
  'Kuva Karak',
  'Kuva Kohm',
  'Kuva Ogris',
  'Kuva Shildeg',
  'Kuva Quartakk',
  'Kuva Seer',
  'Kuva Brakk',
  'Kuva Twin Stubbas',
  'Kuva Ayanga',
  'Kuva Grattler',
  'Kuva Hind',
  'Kuva Tonkor',
  'Kuva Sobek',
  'Kuva Kraken',
];

export const INCARNON_ORIGINALS = ['Praedos', 'Phenmor', 'Felarx', 'Laetum', 'Innodem'];

export interface IncarnonGenesisRotation {
  week: number;
  weapons: string[];
}

export const INCARNON_GENESIS_ROTATIONS: IncarnonGenesisRotation[] = [
  { week: 1, weapons: ['Braton', 'Lato', 'Skana', 'Paris', 'Kunai'] },
  { week: 2, weapons: ['Bo', 'Latron', 'Furis', 'Furax', 'Strun'] },
  { week: 3, weapons: ['Lex', 'Magistar', 'Boltor', 'Bronco', 'Ceramic Dagger'] },
  { week: 4, weapons: ['Torid', 'Dual Toxocyst', 'Dual Ichor', 'Miter', 'Atomos'] },
  { week: 5, weapons: ['Ack & Brunt', 'Soma', 'Vasto', 'Nami Solo', 'Burston'] },
  { week: 6, weapons: ['Zylok', 'Sibear', 'Dread', 'Despair', 'Hate'] },
  { week: 7, weapons: ['Boar', 'Gammacor', 'Angstrum', 'Gorgon', 'Anku'] },
];

export function getCodaBatch(name: string): 'Batch A' | 'Batch B' | undefined {
  const norm = name.toLowerCase().trim();
  if (CODA_BATCH_A.some((w) => w.toLowerCase() === norm)) return 'Batch A';
  if (CODA_BATCH_B.some((w) => w.toLowerCase() === norm)) return 'Batch B';
  if (norm.startsWith('coda ') || norm.includes('coda')) return 'Batch B';
  return undefined;
}

export function getIncarnonGenesisWeek(name: string): { week: number; pool: string[] } | undefined {
  const norm = name.toLowerCase().replace(/ (prime|vandal|wraith|prisma|kuva|tenet|dex)$/i, '').trim();
  for (const rot of INCARNON_GENESIS_ROTATIONS) {
    if (rot.weapons.some((w) => w.toLowerCase() === norm)) {
      return { week: rot.week, pool: rot.weapons };
    }
  }
  return undefined;
}

export interface IncarnonRequirement {
  name: string;
  count: number;
}

export interface IncarnonPerk {
  name: string;
  description: string;
  notes?: string;
}

export interface IncarnonTier {
  tier: string;
  challenge?: string;
  perks: IncarnonPerk[];
}

export interface IncarnonGenesisDetails {
  id: string;
  weaponName: string;
  articleTitle: string;
  circuitWeek?: number;
  circuitRotationText?: string;
  installationRequirements: IncarnonRequirement[];
  acquisition: string;
  overview?: string;
  evolutions: IncarnonTier[];
}

const incarnonMap = incarnonGenesisJson as Record<string, IncarnonGenesisDetails>;

export function getIncarnonGenesisDetails(nameOrId: string): IncarnonGenesisDetails | undefined {
  if (!nameOrId) return undefined;
  const lower = nameOrId.toLowerCase().trim();
  const id = lower.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const stripped = lower.replace(/ (prime|vandal|wraith|prisma|kuva|tenet|dex)$/i, '').trim();
  const strippedId = stripped.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

  return incarnonMap[id] || incarnonMap[lower] || incarnonMap[strippedId] || incarnonMap[stripped];
}

export function getItemVendorAcquisition(idOrName: string): ItemVendorAcquisition | undefined {
  const normalized = idOrName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const lowerName = idOrName.toLowerCase().trim();

  // 2. Coda Weapons (Eleanor - The Hex - Höllvania Central Mall - 1999)
  const isCoda = lowerName.startsWith('coda ') || lowerName.includes('coda') || CODA_BATCH_A.some(w => w.toLowerCase() === lowerName) || CODA_BATCH_B.some(w => w.toLowerCase() === lowerName);
  if (isCoda) {
    const batch = getCodaBatch(idOrName) || 'Batch B';
    const otherBatch = batch === 'Batch A' ? 'Batch B' : 'Batch A';
    const batchWeapons = batch === 'Batch A' ? CODA_BATCH_A : CODA_BATCH_B;
    return {
      itemId: normalized,
      itemName: idOrName,
      vendorName: 'Eleanor',
      syndicateOrStore: 'The Hex (Höllvania Central Mall)',
      cost: '10 Live Heartcell',
      rankRequirement: 'Rank 1 with The Hex',
      location: 'Höllvania Central Mall (1999)',
      fullAcquisitionSentence: `${idOrName} is purchased from Eleanor of The Hex in the Höllvania Central Mall for 10 Live Heartcell obtained from vanquishing a Technocyte Coda.`,
      notes: `Offerings rotate every 4 days between Batch A and Batch B with randomized elemental progenitor damage types and percentage bonuses. This weapon belongs to ${batch} (${batchWeapons.join(', ')}). Alternate batch: ${otherBatch}.`,
    };
  }

  // 3. Tenet Weapons - Ergo Glast (The Perrin Sequence)
  const isErgoTenet = TENET_ERGO_GLAST_WEAPONS.some((w) => w.toLowerCase() === lowerName);
  if (isErgoTenet) {
    return {
      itemId: normalized,
      itemName: idOrName,
      vendorName: 'Ergo Glast',
      syndicateOrStore: 'The Perrin Sequence',
      cost: '40 Corrupted Holokeys',
      location: 'Any Tenno Relay (Perrin Sequence Enclave)',
      fullAcquisitionSentence: `${idOrName} is purchased directly from Ergo Glast in The Perrin Sequence enclave at any Tenno Relay for 40 Corrupted Holokeys.`,
      notes: 'Each offering has a random progenitor bonus damage type and percentage increase, which is cycled every 4 days. Corrupted Holokeys are rewarded from Railjack Void Storm missions (highest rate: 10 per run in Veil Proxima).',
    };
  }

  // 4. Tenet Weapons - Sisters of Parvos
  const isSistersTenet = lowerName.startsWith('tenet ') || TENET_SISTERS_WEAPONS.some((w) => w.toLowerCase() === lowerName);
  if (isSistersTenet) {
    return {
      itemId: normalized,
      itemName: idOrName,
      vendorName: 'Sister of Parvos (Vanquish)',
      syndicateOrStore: 'Sisters of Parvos Nemesis System',
      cost: 'Vanquish Sister in Railjack Showdown',
      location: 'Corpus Ship (Granum Void) -> Railjack Proxima',
      fullAcquisitionSentence: `${idOrName} is acquired by spawning a Sister of Parvos Candidate via Tier 3 Zenith Granum Void (25+ kills) on level 30+ Corpus Ship missions, unveiling the Requiem sequence, and vanquishing her in Railjack Proxima.`,
      notes: 'The fully crafted weapon is delivered directly to your Foundry ready to claim with a randomized progenitor elemental bonus (up to 60%). No crafting blueprint or build time required.',
    };
  }

  // 5. Kuva Weapons - Kuva Lich
  const isKuva = lowerName.startsWith('kuva ') || KUVA_WEAPONS_LIST.some((w) => w.toLowerCase() === lowerName);
  if (isKuva) {
    return {
      itemId: normalized,
      itemName: idOrName,
      vendorName: 'Kuva Lich (Vanquish)',
      syndicateOrStore: 'Kuva Lich Nemesis System',
      cost: 'Vanquish Lich in Saturn Proxima Showdown',
      location: 'Grineer Star Chart (Level 20+) -> Saturn Proxima',
      fullAcquisitionSentence: `${idOrName} is acquired by downing a Kuva Larvling on level 20+ Grineer missions (e.g. Cassini, Saturn), executing with Parazon, hunting Thralls to unveil the 3 Requiem mods, and vanquishing the Lich in the Saturn Proxima Railjack confrontation.`,
      notes: 'The fully crafted weapon is delivered directly to your Foundry ready to claim with a randomized progenitor elemental bonus (up to 60%). No crafting blueprint or build time required.',
    };
  }

  // 6. Zariman Incarnon Originals
  const isZarimanIncarnon = INCARNON_ORIGINALS.some((w) => w.toLowerCase() === lowerName);
  if (isZarimanIncarnon) {
    return {
      itemId: normalized,
      itemName: idOrName,
      vendorName: 'Cavalero',
      syndicateOrStore: 'The Holdfasts',
      cost: 'Holdfasts Standing + Zariman Resources',
      rankRequirement: 'Rank 1 to 3 with The Holdfasts',
      location: 'Chrysalith (Zariman Ten Zero)',
      fullAcquisitionSentence: `${idOrName} blueprint is purchased from Cavalero in the Chrysalith using Holdfasts Standing.`,
      notes: 'After crafting, the weapon features 5 Evolution tiers unlocked by completing gameplay challenges with Cavalero. Charging the Incarnon transmutation gauge allows alt-fire transformation during missions.',
    };
  }

  // 7. Incarnon Genesis Adapters
  const genesis = getIncarnonGenesisWeek(idOrName);
  if (genesis) {
    return {
      itemId: normalized,
      itemName: `${idOrName} (Incarnon Genesis)`,
      vendorName: 'Cavalero (Installation) / The Circuit',
      syndicateOrStore: 'The Steel Path Circuit (Duviri)',
      cost: '20 Pathos Clamps + Regional Duviri Resources',
      location: 'The Circuit (Duviri) & Chrysalith (Zariman)',
      fullAcquisitionSentence: `The Incarnon Genesis Adapter for ${idOrName} is earned as a Tier 5 or Tier 10 milestone reward from the Steel Path Circuit in Duviri (Week ${genesis.week} Rotation). Cavalero installs the adapter in the Chrysalith.`,
      notes: `Week ${genesis.week} rotation options: ${genesis.pool.join(', ')}. The adapter can be installed on standard, Prime, Prisma, Vandal, or Wraith variants of ${idOrName}, granting 5 evolution tiers and alt-fire transmutation.`,
    };
  }

  // 7. General vendor catalog lookup
  return vendorCatalog[normalized] || vendorCatalog[lowerName];
}

