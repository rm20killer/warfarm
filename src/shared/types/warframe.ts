export type RelicEra = 'Lith' | 'Meso' | 'Neo' | 'Axi' | 'Requiem';
export type RelicRefinement = 'Intact' | 'Exceptional' | 'Flawless' | 'Radiant';
export type DropRarity = 'Common' | 'Uncommon' | 'Rare';
export type DamageType = 'Impact' | 'Puncture' | 'Slash' | 'Heat' | 'Cold' | 'Electricity' | 'Toxin' | 'Blast' | 'Corrosive' | 'Gas' | 'Magnetic' | 'Radiation' | 'Viral';
export type WeaponCategory = 'Primary' | 'Secondary' | 'Melee' | 'Archgun' | 'Archmelee';
export type ModPolarity = 'Madurai' | 'Vazarin' | 'Naramon' | 'Zenurik' | 'Unairu' | 'Penjaga' | 'Umbra';

export interface RelicReward {
  itemName: string;
  itemUniqueName: string;
  rarity: DropRarity;
  chance: number;
}

export interface Relic {
  era: RelicEra;
  name: string;
  rewards: RelicReward[];
}

export interface Weapon {
  uniqueName: string;
  name: string;
  category: WeaponCategory;
  damage: Partial<Record<DamageType, number>>;
  critChance: number;
  critMultiplier: number;
  statusChance: number;
  fireRate: number;
  masteryReq: number;
  disposition: number;
}

export interface Ability {
  name: string;
  description: string;
}

export interface Warframe {
  uniqueName: string;
  name: string;
  health: number;
  shield: number;
  armor: number;
  energy: number;
  sprintSpeed: number;
  masteryReq: number;
  abilities: Ability[];
}

export interface ModEffect {
  stat: string;
  value: number;
  isPercentage: boolean;
}

export interface Mod {
  uniqueName: string;
  name: string;
  polarity: ModPolarity;
  drain: number;
  maxRank: number;
  type: string;
  effects: ModEffect[];
}

export interface RecipeIngredient {
  itemName: string;
  itemUniqueName: string;
  count: number;
}

export interface FoundryRecipe {
  resultName: string;
  resultUniqueName: string;
  buildTime: number;
  buildPrice: number;
  ingredients: RecipeIngredient[];
}
