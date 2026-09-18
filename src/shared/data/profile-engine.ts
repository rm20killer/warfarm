import { AlecaInventory, AlecaRecipe, AlecaMiscItem, AlecaXPInfo, AlecaSuit, AlecaWeapon } from '../utils/aleca-decoder';
import allWarframesJson from './generated/all-warframes.json';
import allWeaponsJson from './generated/all-weapons.json';
import allModsJson from './generated/all-mods.json';
import allResourcesJson from './generated/all-resources.json';
import allGearJson from './generated/all-gear.json';
import { getCraftingRecipe, FoundryCraftingRecipe } from './crafting-recipes';
import { RESOURCE_GUIDES, ResourceFarmingGuide } from './resource-guide';

export type EquipmentCategory = 'Warframes' | 'Primary' | 'Secondary' | 'Melee' | 'Companions' | 'Archwing' | 'Other';

export interface CategoryMasteryStats {
  category: EquipmentCategory;
  totalItems: number;
  mastered: number;
  owned: number;
  inFoundry: number;
  unowned: number;
  masteryPointsEarned: number;
  masteryPointsTotal: number;
}

export interface PlayerProfileSummary {
  playerName: string;
  masteryRank: number;
  credits: number;
  platinum: number;
  endo: number;
  ducats: number;
  tradesRemaining: number;
  totalMasteryPoints: number;
  currentRankPoints: number;
  nextRankPoints: number;
  rankProgressPercent: number;
  totalCatalogItems: number;
  totalItemsMastered: number;
  totalItemsOwned: number;
  categoryStats: Record<EquipmentCategory, CategoryMasteryStats>;
}

export interface ProfileEquipmentItem {
  id: string;
  name: string;
  category: EquipmentCategory;
  subType: string;
  masteryReq: number;
  uniqueName: string;
  imageName?: string;
  status: 'mastered' | 'owned_leveling' | 'in_foundry' | 'unowned';
  xp: number;
  maxXP: number;
  currentRank: number;
  maxRank: number;
  formaCount: number;
  blueprintCount: number;
  recipe?: FoundryCraftingRecipe;
  details?: Record<string, unknown>;
}

export interface CraftingAssistantItem {
  recipe: FoundryCraftingRecipe;
  itemName: string;
  category: string;
  uniqueName?: string;
  masteryReq: number;
  ownedBlueprintCount: number;
  status: 'ready' | 'almost_ready' | 'needs_farm';
  ingredients: Array<{
    name: string;
    required: number;
    owned: number;
    missing: number;
    isComponent?: boolean;
    farmGuide?: ResourceFarmingGuide;
  }>;
  missingCount: number;
  isMastered: boolean;
  isOwned: boolean;
}

export interface PersonalRecommendation {
  id: string;
  title: string;
  type: 'craft_ready' | 'mastery_gain' | 'meta_gear' | 'farm_missing';
  itemName: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  linkPath: string;
  badgeText?: string;
  details?: string;
}

export interface FullProfileAnalysis {
  summary: PlayerProfileSummary;
  equipment: ProfileEquipmentItem[];
  craftingAssistant: CraftingAssistantItem[];
  recommendations: PersonalRecommendation[];
  ownedResources: Array<{ name: string; count: number; uniqueName: string }>;
  ownedMods: Array<{ name: string; count: number; rank?: number; uniqueName: string }>;
}

export function calculateMasteryRankFromPoints(points: number): {
  rank: number;
  currentRankMinPoints: number;
  nextRankPoints: number;
  progressPercent: number;
} {
  const rank = Math.floor(Math.sqrt(points / 2500));
  const currentRankMinPoints = 2500 * rank * rank;
  const nextRankPoints = 2500 * (rank + 1) * (rank + 1);
  const pointsInRank = points - currentRankMinPoints;
  const rankSpan = nextRankPoints - currentRankMinPoints;
  const progressPercent = rankSpan > 0 ? Math.min(100, Math.max(0, (pointsInRank / rankSpan) * 100)) : 0;

  return {
    rank,
    currentRankMinPoints,
    nextRankPoints,
    progressPercent: Math.round(progressPercent * 10) / 10,
  };
}

function normalizeName(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

const warframesList = allWarframesJson as Array<any>;
const weaponsList = allWeaponsJson as Array<any>;
const modsList = allModsJson as Array<any>;
const resourcesList = allResourcesJson as Array<any>;
const gearList = allGearJson as Array<any>;

const catalogByUniqueName = new Map<string, any>();
const catalogByName = new Map<string, any>();

warframesList.forEach((wf) => {
  if (wf.uniqueName) catalogByUniqueName.set(wf.uniqueName.toLowerCase(), { ...wf, _cat: 'Warframes' });
  catalogByName.set(normalizeName(wf.name), { ...wf, _cat: 'Warframes' });
});

weaponsList.forEach((wp) => {
  let cat: EquipmentCategory = 'Primary';
  const c = (wp.category || '').toLowerCase();
  if (c.includes('second') || c.includes('pistol')) cat = 'Secondary';
  else if (c.includes('melee')) cat = 'Melee';
  else if (c.includes('arch')) cat = 'Archwing';
  else if (c.includes('companion') || c.includes('sentinel')) cat = 'Companions';

  if (wp.uniqueName) catalogByUniqueName.set(wp.uniqueName.toLowerCase(), { ...wp, _cat: cat });
  catalogByName.set(normalizeName(wp.name), { ...wp, _cat: cat });
});

const resourceGuideMap = new Map<string, ResourceFarmingGuide>();
RESOURCE_GUIDES.forEach((guide) => {
  resourceGuideMap.set(normalizeName(guide.name), guide);
  resourceGuideMap.set(guide.id, guide);
});

export function analyzePlayerProfile(
  inventory: AlecaInventory,
  displayName: string = 'Tenno'
): FullProfileAnalysis {
  const blueprintCounts = new Map<string, number>();
  const recipeList: AlecaRecipe[] = inventory.Recipes || [];
  recipeList.forEach((r) => {
    if (!r.ItemType) return;
    blueprintCounts.set(r.ItemType.toLowerCase(), (blueprintCounts.get(r.ItemType.toLowerCase()) || 0) + (r.ItemCount || 1));
    const parts = r.ItemType.split('/');
    const last = parts[parts.length - 1]?.replace(/Recipe$/i, '') || '';
    if (last) {
      blueprintCounts.set(normalizeName(last), (blueprintCounts.get(normalizeName(last)) || 0) + (r.ItemCount || 1));
    }
  });

  const ownedResourceMap = new Map<string, number>();
  const ownedResourcesList: Array<{ name: string; count: number; uniqueName: string }> = [];
  (inventory.MiscItems || []).forEach((m) => {
    if (!m.ItemType) return;
    const count = m.ItemCount || 0;
    ownedResourceMap.set(m.ItemType.toLowerCase(), count);
    
    const res = resourcesList.find((r) => r.uniqueName?.toLowerCase() === m.ItemType.toLowerCase());
    const name = res ? res.name : m.ItemType.split('/').pop() || m.ItemType;
    ownedResourceMap.set(normalizeName(name), count);
    ownedResourcesList.push({ name, count, uniqueName: m.ItemType });
  });

  const ownedItemsMap = new Map<string, { xp: number; forma: number; count: number }>();
  const masteredUniqueNames = new Set<string>();

  (inventory.XPInfo || []).forEach((xp) => {
    if (!xp.ItemType) return;
    const key = xp.ItemType.toLowerCase();
    if (xp.XP >= 90000) {
      masteredUniqueNames.add(key);
      const parts = key.split('/');
      const last = parts[parts.length - 1];
      if (last) masteredUniqueNames.add(normalizeName(last));
    }
  });

  (inventory.Suits || []).forEach((suit) => {
    if (!suit.ItemType) return;
    const key = suit.ItemType.toLowerCase();
    const current = ownedItemsMap.get(key) || { xp: 0, forma: 0, count: 0 };
    ownedItemsMap.set(key, {
      xp: Math.max(current.xp, suit.XP || 0),
      forma: Math.max(current.forma, suit.Polarized || 0),
      count: current.count + 1,
    });
    if ((suit.XP || 0) >= 180000) {
      masteredUniqueNames.add(key);
    }
  });

  const allOwnedWeaponLists: AlecaWeapon[][] = [
    inventory.LongGuns || [],
    inventory.Pistols || [],
    inventory.Melee || [],
    inventory.SpaceGuns || [],
    inventory.SpaceMelee || [],
    inventory.SentinelWeapons || [],
    inventory.MechLongGuns || [],
    inventory.MechMelee || [],
    inventory.OperatorAmps || [],
  ];

  allOwnedWeaponLists.forEach((list) => {
    list.forEach((wp) => {
      if (!wp.ItemType) return;
      const key = wp.ItemType.toLowerCase();
      const current = ownedItemsMap.get(key) || { xp: 0, forma: 0, count: 0 };
      ownedItemsMap.set(key, {
        xp: Math.max(current.xp, wp.XP || 0),
        forma: Math.max(current.forma, wp.Polarized || 0),
        count: current.count + 1,
      });
      if ((wp.XP || 0) >= 90000) {
        masteredUniqueNames.add(key);
      }
    });
  });

  const equipmentItems: ProfileEquipmentItem[] = [];
  const categoryStats: Record<EquipmentCategory, CategoryMasteryStats> = {
    Warframes: { category: 'Warframes', totalItems: 0, mastered: 0, owned: 0, inFoundry: 0, unowned: 0, masteryPointsEarned: 0, masteryPointsTotal: 0 },
    Primary: { category: 'Primary', totalItems: 0, mastered: 0, owned: 0, inFoundry: 0, unowned: 0, masteryPointsEarned: 0, masteryPointsTotal: 0 },
    Secondary: { category: 'Secondary', totalItems: 0, mastered: 0, owned: 0, inFoundry: 0, unowned: 0, masteryPointsEarned: 0, masteryPointsTotal: 0 },
    Melee: { category: 'Melee', totalItems: 0, mastered: 0, owned: 0, inFoundry: 0, unowned: 0, masteryPointsEarned: 0, masteryPointsTotal: 0 },
    Companions: { category: 'Companions', totalItems: 0, mastered: 0, owned: 0, inFoundry: 0, unowned: 0, masteryPointsEarned: 0, masteryPointsTotal: 0 },
    Archwing: { category: 'Archwing', totalItems: 0, mastered: 0, owned: 0, inFoundry: 0, unowned: 0, masteryPointsEarned: 0, masteryPointsTotal: 0 },
    Other: { category: 'Other', totalItems: 0, mastered: 0, owned: 0, inFoundry: 0, unowned: 0, masteryPointsEarned: 0, masteryPointsTotal: 0 },
  };

  const allMasterableItems = [
    ...warframesList.map((wf) => ({ ...wf, _cat: 'Warframes' as EquipmentCategory, _maxRank: 30, _points: 6000 })),
    ...weaponsList.map((wp) => {
      let cat: EquipmentCategory = 'Primary';
      const c = (wp.category || '').toLowerCase();
      if (c.includes('second') || c.includes('pistol')) cat = 'Secondary';
      else if (c.includes('melee')) cat = 'Melee';
      else if (c.includes('arch')) cat = 'Archwing';
      else if (c.includes('companion') || c.includes('sentinel')) cat = 'Companions';
      return { ...wp, _cat: cat as EquipmentCategory, _maxRank: 30, _points: 3000 };
    }),
  ];

  let totalMasteryPointsEarned = 0;
  let totalMasteredCount = 0;
  let totalOwnedCount = 0;

  allMasterableItems.forEach((item) => {
    const norm = normalizeName(item.name);
    const uKey = (item.uniqueName || '').toLowerCase();
    
    const ownedData = ownedItemsMap.get(uKey) || ownedItemsMap.get(norm);
    const isOwned = Boolean(ownedData && ownedData.count > 0);
    const isMastered = masteredUniqueNames.has(uKey) || masteredUniqueNames.has(norm) || (ownedData && ownedData.xp >= (item._cat === 'Warframes' ? 180000 : 90000));
    const bpCount = blueprintCounts.get(uKey) || blueprintCounts.get(norm) || 0;

    let status: ProfileEquipmentItem['status'] = 'unowned';
    if (isMastered) status = 'mastered';
    else if (isOwned) status = 'owned_leveling';
    else if (bpCount > 0) status = 'in_foundry';

    const maxXP = item._cat === 'Warframes' ? 180000 : 90000;
    const currentXP = isMastered ? maxXP : (ownedData?.xp || 0);
    const currentRank = isMastered ? 30 : Math.min(30, Math.floor(Math.sqrt(currentXP / (item._cat === 'Warframes' ? 200 : 100))));

    const cat: EquipmentCategory = (item._cat as EquipmentCategory) || 'Other';
    const cStat = categoryStats[cat] || categoryStats.Other;
    cStat.totalItems += 1;
    cStat.masteryPointsTotal += item._points;

    if (isMastered) {
      cStat.mastered += 1;
      cStat.masteryPointsEarned += item._points;
      totalMasteryPointsEarned += item._points;
      totalMasteredCount += 1;
    } else if (isOwned) {
      cStat.owned += 1;
      const partialPoints = Math.round((currentRank / 30) * item._points);
      cStat.masteryPointsEarned += partialPoints;
      totalMasteryPointsEarned += partialPoints;
    } else if (bpCount > 0) {
      cStat.inFoundry += 1;
    } else {
      cStat.unowned += 1;
    }

    if (isOwned) totalOwnedCount += 1;

    equipmentItems.push({
      id: item.id || norm,
      name: item.name,
      category: cat,
      subType: item.type || item.category || cat,
      masteryReq: item.masteryReq || 0,
      uniqueName: item.uniqueName || '',
      imageName: item.imageName,
      status,
      xp: currentXP,
      maxXP,
      currentRank,
      maxRank: 30,
      formaCount: ownedData?.forma || 0,
      blueprintCount: bpCount,
      recipe: getCraftingRecipe(item.name),
    });
  });

  const craftingAssistant: CraftingAssistantItem[] = [];

  recipeList.forEach((r) => {
    if (!r.ItemType) return;
    const parts = r.ItemType.split('/');
    const rawName = parts[parts.length - 1]?.replace(/Recipe$/i, '') || '';
    const spacedName = rawName.replace(/([a-z])([A-Z])/g, '$1 $2').trim();
    
    let recipe = getCraftingRecipe(spacedName) || getCraftingRecipe(rawName);
    if (!recipe) {
      const catItem = catalogByUniqueName.get(r.ItemType.toLowerCase());
      if (catItem) {
        recipe = getCraftingRecipe(catItem.name);
      }
    }

    if (!recipe || !recipe.ingredients || recipe.ingredients.length === 0) return;

    const norm = normalizeName(recipe.itemName || rawName);
    const uKey = r.ItemType.toLowerCase();

    const isMastered = masteredUniqueNames.has(uKey) || masteredUniqueNames.has(norm);
    const isOwned = ownedItemsMap.has(uKey) || ownedItemsMap.has(norm);

    let missingCount = 0;
    const ingredientAnalysis = recipe.ingredients.map((ing) => {
      const ingNorm = normalizeName(ing.name);
      const owned = ownedResourceMap.get(ingNorm) || 0;
      const required = ing.count || 1;
      const missing = Math.max(0, required - owned);
      if (missing > 0) missingCount += 1;

      return {
        name: ing.name,
        required,
        owned,
        missing,
        isComponent: ing.isComponent,
        farmGuide: resourceGuideMap.get(ingNorm),
      };
    });

    let craftStatus: CraftingAssistantItem['status'] = 'needs_farm';
    if (missingCount === 0) craftStatus = 'ready';
    else if (missingCount <= 2) craftStatus = 'almost_ready';

    craftingAssistant.push({
      recipe,
      itemName: recipe.itemName || rawName,
      category: recipe.itemName.includes('Prime') ? 'Prime' : 'Standard',
      uniqueName: r.ItemType,
      masteryReq: 0,
      ownedBlueprintCount: r.ItemCount || 1,
      status: craftStatus,
      ingredients: ingredientAnalysis,
      missingCount,
      isMastered,
      isOwned,
    });
  });

  craftingAssistant.sort((a, b) => {
    if (a.status === 'ready' && b.status !== 'ready') return -1;
    if (b.status === 'ready' && a.status !== 'ready') return 1;
    if (a.status === 'almost_ready' && b.status === 'needs_farm') return -1;
    if (b.status === 'almost_ready' && a.status === 'needs_farm') return 1;
    if (!a.isMastered && b.isMastered) return -1;
    if (a.isMastered && !b.isMastered) return 1;
    return a.missingCount - b.missingCount;
  });

  const recommendations: PersonalRecommendation[] = [];

  const readyUnmastered = craftingAssistant.filter((c) => c.status === 'ready' && !c.isMastered);
  if (readyUnmastered.length > 0) {
    readyUnmastered.slice(0, 3).forEach((item) => {
      recommendations.push({
        id: `craft_${normalizeName(item.itemName)}`,
        title: `Build ${item.itemName} in Foundry`,
        type: 'craft_ready',
        itemName: item.itemName,
        reason: 'You own the blueprint and all crafting resources! Build it for +3,000 to +6,000 Mastery XP.',
        priority: 'high',
        linkPath: `/item/${encodeURIComponent(item.itemName)}`,
        badgeText: 'Ready to Craft',
      });
    });
  }

  const almostReady = craftingAssistant.filter((c) => c.status === 'almost_ready' && !c.isMastered);
  if (almostReady.length > 0) {
    almostReady.slice(0, 3).forEach((item) => {
      const missingIng = item.ingredients.find((i) => i.missing > 0);
      const farmLoc = missingIng?.farmGuide?.optimalNodes?.[0]?.node
        ? `${missingIng.farmGuide.optimalNodes[0].node} (${missingIng.farmGuide.optimalNodes[0].planet})`
        : 'recommended drop planets';

      recommendations.push({
        id: `farm_${normalizeName(item.itemName)}`,
        title: `Farm ${missingIng?.missing}x ${missingIng?.name} for ${item.itemName}`,
        type: 'farm_missing',
        itemName: item.itemName,
        reason: `Only missing ${missingIng?.missing} ${missingIng?.name} to start crafting! Best node: ${farmLoc}.`,
        priority: 'medium',
        linkPath: `/resources`,
        badgeText: 'Almost Ready',
        details: missingIng?.farmGuide?.optimalNodes?.[0]?.strategyNote,
      });
    });
  }

  const unownedFrames = equipmentItems.filter((e) => e.category === 'Warframes' && e.status === 'unowned');
  if (unownedFrames.length > 0) {
    unownedFrames.slice(0, 2).forEach((wf) => {
      recommendations.push({
        id: `get_wf_${normalizeName(wf.name)}`,
        title: `Acquire Warframe: ${wf.name}`,
        type: 'mastery_gain',
        itemName: wf.name,
        reason: `Warframes yield +6,000 Mastery XP when ranked to 30.`,
        priority: 'medium',
        linkPath: `/item/${encodeURIComponent(wf.name)}`,
        badgeText: '+6,000 MR XP',
      });
    });
  }

  const mrCalc = calculateMasteryRankFromPoints(totalMasteryPointsEarned);
  const playerLevel = inventory.PlayerLevel !== undefined ? inventory.PlayerLevel : mrCalc.rank;

  const summary: PlayerProfileSummary = {
    playerName: displayName,
    masteryRank: playerLevel,
    credits: inventory.RegularCredits || 0,
    platinum: inventory.PremiumCreditsFree || 0,
    endo: inventory.FusionPoints || 0,
    ducats: inventory.PrimeTokens || 0,
    tradesRemaining: inventory.TradesRemaining || Math.max(0, playerLevel),
    totalMasteryPoints: totalMasteryPointsEarned,
    currentRankPoints: mrCalc.currentRankMinPoints,
    nextRankPoints: mrCalc.nextRankPoints,
    rankProgressPercent: mrCalc.progressPercent,
    totalCatalogItems: allMasterableItems.length,
    totalItemsMastered: totalMasteredCount,
    totalItemsOwned: totalOwnedCount,
    categoryStats,
  };

  return {
    summary,
    equipment: equipmentItems,
    craftingAssistant,
    recommendations,
    ownedResources: ownedResourcesList,
    ownedMods: (inventory.Upgrades || []).map((u) => ({
      name: u.ItemType.split('/').pop() || u.ItemType,
      count: u.ItemCount || 1,
      rank: u.UpgradeVer,
      uniqueName: u.ItemType,
    })),
  };
}

