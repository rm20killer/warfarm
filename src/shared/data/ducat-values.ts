import { DropRarity } from '../types/warframe';

export const DUCAT_VALUES: Record<DropRarity, number> = {
  Common: 15,
  Uncommon: 45,
  Rare: 100,
};

export function getDucatValue(rarity: DropRarity): number {
  return DUCAT_VALUES[rarity] || 0;
}

export function calculateDucatPerPlat(ducats: number, platPrice: number): number {
  if (platPrice <= 0) return 0;
  return ducats / platPrice;
}
