import { Mod, Weapon, Warframe, DamageType } from './warframe';
export type { Mod, Weapon, Warframe, DamageType };

export interface BuildSlot {
  slotIndex: number;
  mod: Mod | null;
  rank: number;
}

export interface ModLoadout {
  slots: BuildSlot[];
  aura: BuildSlot | null;
  exilus: BuildSlot | null;
}

export interface DpsResult {
  raw: number;
  burst: number;
  sustained: number;
  byDamageType: Partial<Record<DamageType, number>>;
}

export interface EhpResult {
  health: number;
  shield: number;
  armor: number;
  effectiveHp: number;
}

export interface WeaponBuild {
  id: string;
  weapon: Weapon;
  loadout: ModLoadout;
  calculatedDps: DpsResult;
  author: string;
  title: string;
  description: string;
  upvotes: number;
  createdAt: string;
}

export interface WarframeBuild {
  id: string;
  warframe: Warframe;
  loadout: ModLoadout;
  calculatedEhp: EhpResult;
  author: string;
  title: string;
  description: string;
  upvotes: number;
  createdAt: string;
}
