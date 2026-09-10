export interface OpenWorldCycle {
  id: string;
  expiry: string;
  activation?: string;
  state: string;
  timeLeft: string;
  isDay?: boolean;
  isWarm?: boolean;
  isCorpus?: boolean;
  active?: string;
  shortString?: string;
}

export interface VoidFissure {
  id: string;
  node: string;
  missionType: string;
  enemy: string;
  tier: string;
  tierNum: number;
  eta: string;
  expiry: string;
  isStorm: boolean;
  isHard: boolean; // Steel Path
}

export interface BountyRewardItem {
  item: string;
  rarity?: string;
  chance?: number;
  count?: number;
}

export interface SyndicateJob {
  id: string;
  type: string;
  enemyLevels: [number, number];
  standingStages: number[];
  minMR?: number;
  rewardPool?: string[];
  rewardPoolDrops?: BountyRewardItem[];
}

export interface SyndicateBounties {
  id: string;
  syndicate: string;
  syndicateKey: string;
  jobs: SyndicateJob[];
}

export interface WorldStateEvent {
  id: string;
  description: string;
  tooltip?: string;
  node?: string;
  health?: number;
  rewards?: Array<{ items: string[] }>;
  jobs?: SyndicateJob[];
}

export interface WorldStateAlertReward {
  items: string[];
  countedItems?: Array<{ count: number; type: string }>;
  credits?: number;
  asString?: string;
  thumbnail?: string;
}

export interface WorldStateAlert {
  id: string;
  activation: string;
  expiry: string;
  active: boolean;
  mission: {
    node: string;
    type: string;
    faction: string;
    minEnemyLevel?: number;
    maxEnemyLevel?: number;
    reward?: WorldStateAlertReward;
  };
  eta: string;
  rewardTypes?: string[];
}

export interface InGameNews {
  id: string;
  message: string;
  link: string;
  imageLink?: string;
  date: string;
  priority?: boolean;
}

export interface VoidTraderState {
  id: string;
  character: string;
  location: string;
  active: boolean;
  startString?: string;
  endString?: string;
  inventory?: Array<{ item: string; ducats: number; credits: number }>;
}

export interface SortieState {
  id: string;
  boss: string;
  faction: string;
  eta: string;
  variants: Array<{ node: string; missionType: string; modifier: string; modifierDescription: string }>;
}

export interface ArchonHuntState {
  id: string;
  boss: string;
  faction: string;
  eta: string;
  missions: Array<{ node: string; type: string }>;
}

export interface InvasionState {
  id: string;
  node: string;
  desc: string;
  attacker: { faction: string; reward?: { items?: string[] } };
  defender: { faction: string; reward?: { items?: string[] } };
  completion: number;
  completed: boolean;
}

export interface WorldStateData {
  timestamp: string;
  buildLabel?: string;
  cetusCycle: OpenWorldCycle;
  vallisCycle: OpenWorldCycle;
  cambionCycle: OpenWorldCycle;
  earthCycle: OpenWorldCycle;
  zarimanCycle: OpenWorldCycle;
  duviriCycle?: { state: string; choices?: any[] };
  fissures: VoidFissure[];
  syndicateMissions: SyndicateBounties[];
  events: WorldStateEvent[];
  alerts?: WorldStateAlert[];
  news: InGameNews[];
  voidTrader: VoidTraderState;
  sortie?: SortieState;
  archonHunt?: ArchonHuntState;
  invasions?: InvasionState[];
}

let cachedWorldState: WorldStateData | null = null;
let lastFetchTimestamp = 0;
const CACHE_TTL_MS = 30000; // 30s cache

export async function fetchWorldState(forceRefresh = false): Promise<WorldStateData> {
  const now = Date.now();
  if (!forceRefresh && cachedWorldState && now - lastFetchTimestamp < CACHE_TTL_MS) {
    return cachedWorldState;
  }

  try {
    const res = await fetch('https://api.warframestat.us/pc', {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`WorldState API responded with HTTP ${res.status}`);
    }

    const data = await res.json();
    cachedWorldState = data as WorldStateData;
    lastFetchTimestamp = now;
    return cachedWorldState;
  } catch (err) {
    if (cachedWorldState) {
      console.warn('WorldState fetch failed, serving stale cache', err);
      return cachedWorldState;
    }
    throw err;
  }
}
