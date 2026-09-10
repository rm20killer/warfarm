import { RelicEra, RelicRefinement, DropRarity } from '../types/warframe';

export interface MissionReward {
  planet: string;
  node: string;
  missionType: string;
  rotation: string;
  rewards: Array<{
    itemName: string;
    chance: number;
    rarity: DropRarity;
  }>;
}

export interface RelicDropTable {
  era: RelicEra;
  name: string;
  refinement: RelicRefinement;
  rewards: Array<{
    itemName: string;
    chance: number;
    rarity: DropRarity;
  }>;
}

export interface FarmLocation {
  node: string;
  missionType: string;
  rotation: string;
  dropChance: number;
}

const BASE_URL = 'https://drops.warframestat.us/data/all.slim.json';

export async function fetchMissionRewards(): Promise<MissionReward[]> {
  const response = await fetch(BASE_URL);
  if (!response.ok) {
    throw new Error('Failed to fetch drop data');
  }
  const data = await response.json();
  
  // Minimal mapping example, assumes wfcd structure maps roughly to these fields
  const missions: MissionReward[] = [];
  if (data.missionRewards) {
    for (const [planetNode, nodeData] of Object.entries<any>(data.missionRewards)) {
      const [planet, node] = planetNode.split('/');
      // Mapping logic for structure
    }
  }
  return missions;
}

export async function fetchRelicDrops(): Promise<RelicDropTable[]> {
  const response = await fetch(BASE_URL);
  if (!response.ok) {
    throw new Error('Failed to fetch drop data');
  }
  const data = await response.json();
  
  const relics: RelicDropTable[] = [];
  // Parse data.relics
  return relics;
}

export async function findBestFarmLocation(itemName: string): Promise<FarmLocation[]> {
  const missions = await fetchMissionRewards();
  const locations: FarmLocation[] = [];

  for (const mission of missions) {
    const reward = mission.rewards.find((r) => r.itemName === itemName);
    if (reward) {
      locations.push({
        node: `${mission.planet} / ${mission.node}`,
        missionType: mission.missionType,
        rotation: mission.rotation,
        dropChance: reward.chance,
      });
    }
  }

  return locations.sort((a, b) => b.dropChance - a.dropChance);
}

export interface RelicFarmingSpot {
  era: RelicEra;
  node: string;
  planet: string;
  missionType: string;
  rotation: string;
  expectedTime: string;
  dropRateText: string;
  strategyTip: string;
}

export const BEST_RELIC_SPOTS: Record<RelicEra, RelicFarmingSpot[]> = {
  Lith: [
    {
      era: 'Lith',
      node: 'Hepit',
      planet: 'Void',
      missionType: 'Capture',
      rotation: 'A',
      expectedTime: '45-90 seconds',
      dropRateText: '~100% Lith Relic',
      strategyTip: 'Use Volt, Titania, or Wukong. Sprint straight to target, capture, and extract.',
    },
    {
      era: 'Lith',
      node: 'Olympus',
      planet: 'Mars',
      missionType: 'Disruption',
      rotation: 'A / B',
      expectedTime: '2-3 min per round',
      dropRateText: 'High Chance',
      strategyTip: 'Fast conduit completions reward Lith relics consistently on early rotations.',
    },
  ],
  Meso: [
    {
      era: 'Meso',
      node: 'Ukko',
      planet: 'Void',
      missionType: 'Capture',
      rotation: 'A',
      expectedTime: '60-90 seconds',
      dropRateText: '50% Meso / 50% Neo',
      strategyTip: 'Extremely fast capture run. Drops either Meso or Neo relic every completion.',
    },
    {
      era: 'Meso',
      node: 'Io',
      planet: 'Jupiter',
      missionType: 'Defense',
      rotation: 'A (Waves 5 & 10)',
      expectedTime: '4-5 minutes',
      dropRateText: '85% on Rot A',
      strategyTip: 'Extract at wave 10. Also yields abundant Oxium from Corpus Osprey spawns.',
    },
  ],
  Neo: [
    {
      era: 'Neo',
      node: 'Ukko',
      planet: 'Void',
      missionType: 'Capture',
      rotation: 'A',
      expectedTime: '60-90 seconds',
      dropRateText: '50% Neo / 50% Meso',
      strategyTip: 'Fastest single node for farming quick Neo relics when speedrunning.',
    },
    {
      era: 'Neo',
      node: 'Ur',
      planet: 'Uranus',
      missionType: 'Disruption',
      rotation: 'B / C',
      expectedTime: '2-3 min per round',
      dropRateText: 'Guaranteed Neo/Axi',
      strategyTip: 'Defend conduits quickly; rounds can be pushed infinitely as long as your DPS holds.',
    },
  ],
  Axi: [
    {
      era: 'Axi',
      node: 'Apollo',
      planet: 'Lua',
      missionType: 'Disruption',
      rotation: 'B & C',
      expectedTime: '2-3 min per round',
      dropRateText: 'Tier-1 Axi Source (~100% on Rot B/C)',
      strategyTip: 'Gold standard for Axi farming. High-damage squad melts Demolysts effortlessly.',
    },
    {
      era: 'Axi',
      node: 'Xini',
      planet: 'Eris',
      missionType: 'Interception',
      rotation: 'B & C (Rounds 3 & 4)',
      expectedTime: '10-12 minutes',
      dropRateText: 'Guaranteed Axi on Rot B & C',
      strategyTip: 'Low effort Infested Interception. Use crowd control frames to lock capture points.',
    },
  ],
  Requiem: [
    {
      era: 'Requiem',
      node: 'Kuva Siphon / Flood',
      planet: 'Various',
      missionType: 'Syndicate Alert',
      rotation: 'Completion',
      expectedTime: '3-5 minutes',
      dropRateText: '100% on Flood / 50% on Siphon',
      strategyTip: 'Always prioritize Kuva Floods for a guaranteed Requiem Relic drop.',
    },
  ],
};

export function getBestRelicSpots(era: RelicEra): RelicFarmingSpot[] {
  return BEST_RELIC_SPOTS[era] || [];
}

