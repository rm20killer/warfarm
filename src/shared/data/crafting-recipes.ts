import foundryRecipesJson from './generated/foundry-recipes.json';
import weaponRecipesJson from './generated/weapon-recipes.json';
import warframeRecipesJson from './generated/warframe-recipes.json';
import allRelicsJson from './generated/all-relics.json';

export interface CraftingIngredient {
  name: string;
  count: number;
  isComponent?: boolean;
}

export interface FoundryCraftingRecipe {
  itemId: string;
  itemName: string;
  buildTimeText: string;
  buildPriceCredits: number;
  rushPricePlat?: number;
  ingredients: CraftingIngredient[];
  componentRecipes?: FoundryCraftingRecipe[];
}

const foundryRecipesMap: Record<string, FoundryCraftingRecipe> = foundryRecipesJson as unknown as Record<
  string,
  FoundryCraftingRecipe
>;

export const CRAFTING_RECIPES: FoundryCraftingRecipe[] = Object.values(foundryRecipesMap);

export function getCraftingRecipe(idOrName: string): FoundryCraftingRecipe | undefined {
  const normalized = idOrName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const lowerName = idOrName.toLowerCase().trim();
  const wfCatalog = warframeRecipesJson as Record<string, any>;

  // 1. Direct lookup in foundry recipes
  const match = foundryRecipesMap[normalized] || foundryRecipesMap[lowerName];
  if (match) {
    // If it's a warframe and has no component recipes, try enriching from warframeRecipesJson
    if (!match.componentRecipes || match.componentRecipes.length === 0) {
      const wf = wfCatalog[lowerName] || wfCatalog[normalized];
      if (wf) {
        const componentRecipes: FoundryCraftingRecipe[] = [];
        if (wf.neuroptics) {
          componentRecipes.push({
            itemId: `${normalized}_neuroptics`,
            itemName: `${wf.name} Neuroptics`,
            buildTimeText: wf.neuroptics.buildTime || '12 hours',
            buildPriceCredits: wf.neuroptics.buildPrice || 15000,
            rushPricePlat: wf.neuroptics.rushPricePlat || 25,
            ingredients: (wf.neuroptics.ingredients || []).map((ing: any) => ({
              name: ing.name,
              count: ing.count,
            })),
          });
        }
        if (wf.chassis) {
          componentRecipes.push({
            itemId: `${normalized}_chassis`,
            itemName: `${wf.name} Chassis`,
            buildTimeText: wf.chassis.buildTime || '12 hours',
            buildPriceCredits: wf.chassis.buildPrice || 15000,
            rushPricePlat: wf.chassis.rushPricePlat || 25,
            ingredients: (wf.chassis.ingredients || []).map((ing: any) => ({
              name: ing.name,
              count: ing.count,
            })),
          });
        }
        if (wf.systems) {
          componentRecipes.push({
            itemId: `${normalized}_systems`,
            itemName: `${wf.name} Systems`,
            buildTimeText: wf.systems.buildTime || '12 hours',
            buildPriceCredits: wf.systems.buildPrice || 15000,
            rushPricePlat: wf.systems.rushPricePlat || 25,
            ingredients: (wf.systems.ingredients || []).map((ing: any) => ({
              name: ing.name,
              count: ing.count,
            })),
          });
        }
        if (componentRecipes.length > 0) {
          return {
            ...match,
            componentRecipes,
          };
        }
      }
    }
    return match;
  }

  // 2. Weapon Recipes catalog (covers all 612 weapons)
  const wpCatalog = weaponRecipesJson as Record<string, FoundryCraftingRecipe>;
  const weaponRecipe = wpCatalog[normalized] || wpCatalog[lowerName];
  if (weaponRecipe) {
    return weaponRecipe;
  }

  // 3. Warframe Recipes catalog (covers all 121 Warframes including Primes)
  const wf = wfCatalog[lowerName] || wfCatalog[normalized];
  if (wf) {
    const componentRecipes: FoundryCraftingRecipe[] = [];
    if (wf.neuroptics) {
      componentRecipes.push({
        itemId: `${normalized}_neuroptics`,
        itemName: `${wf.name} Neuroptics`,
        buildTimeText: wf.neuroptics.buildTime || '12 hours',
        buildPriceCredits: wf.neuroptics.buildPrice || 15000,
        rushPricePlat: wf.neuroptics.rushPricePlat || 25,
        ingredients: (wf.neuroptics.ingredients || []).map((ing: any) => ({
          name: ing.name,
          count: ing.count,
        })),
      });
    }
    if (wf.chassis) {
      componentRecipes.push({
        itemId: `${normalized}_chassis`,
        itemName: `${wf.name} Chassis`,
        buildTimeText: wf.chassis.buildTime || '12 hours',
        buildPriceCredits: wf.chassis.buildPrice || 15000,
        rushPricePlat: wf.chassis.rushPricePlat || 25,
        ingredients: (wf.chassis.ingredients || []).map((ing: any) => ({
          name: ing.name,
          count: ing.count,
        })),
      });
    }
    if (wf.systems) {
      componentRecipes.push({
        itemId: `${normalized}_systems`,
        itemName: `${wf.name} Systems`,
        buildTimeText: wf.systems.buildTime || '12 hours',
        buildPriceCredits: wf.systems.buildPrice || 15000,
        rushPricePlat: wf.systems.rushPricePlat || 25,
        ingredients: (wf.systems.ingredients || []).map((ing: any) => ({
          name: ing.name,
          count: ing.count,
        })),
      });
    }

    const bpIngredients: CraftingIngredient[] = (wf.blueprint?.ingredients || []).map((ing: any) => ({
      name: ing.name,
      count: ing.count,
      isComponent:
        ing.name.toLowerCase().includes('neuroptics') ||
        ing.name.toLowerCase().includes('chassis') ||
        ing.name.toLowerCase().includes('systems') ||
        ing.name.toLowerCase().includes('helmet'),
    }));

    if (bpIngredients.length === 0 && componentRecipes.length > 0) {
      componentRecipes.forEach((cr) => {
        bpIngredients.push({ name: cr.itemName, count: 1, isComponent: true });
      });
    }

    return {
      itemId: normalized,
      itemName: wf.name,
      buildTimeText: wf.blueprint?.buildTime || '72 hours',
      buildPriceCredits: wf.blueprint?.buildPrice || 25000,
      rushPricePlat: wf.blueprint?.rushPricePlat || 50,
      ingredients: bpIngredients,
      componentRecipes: componentRecipes.length > 0 ? componentRecipes : undefined,
    };
  }


  // 4. Component direct lookup (e.g., "Rhino Prime Chassis", "Rhino Prime Chassis Blueprint", "Ash Neuroptics")
  const strippedComponentName = lowerName.replace(/\s+blueprint$/, '');
  for (const wf of Object.values(wfCatalog)) {
    if (!wf || !wf.name) continue;
    const wfNameLower = wf.name.toLowerCase();
    if (lowerName.startsWith(wfNameLower) || strippedComponentName.startsWith(wfNameLower)) {
      if (lowerName.includes('neuroptics') && wf.neuroptics) {
        return {
          itemId: `${wf.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_neuroptics`,
          itemName: `${wf.name} Neuroptics`,
          buildTimeText: wf.neuroptics.buildTime || '12 hours',
          buildPriceCredits: wf.neuroptics.buildPrice || 15000,
          rushPricePlat: wf.neuroptics.rushPricePlat || 25,
          ingredients: (wf.neuroptics.ingredients || []).map((ing: any) => ({
            name: ing.name,
            count: ing.count,
          })),
        };
      }
      if (lowerName.includes('chassis') && wf.chassis) {
        return {
          itemId: `${wf.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_chassis`,
          itemName: `${wf.name} Chassis`,
          buildTimeText: wf.chassis.buildTime || '12 hours',
          buildPriceCredits: wf.chassis.buildPrice || 15000,
          rushPricePlat: wf.chassis.rushPricePlat || 25,
          ingredients: (wf.chassis.ingredients || []).map((ing: any) => ({
            name: ing.name,
            count: ing.count,
          })),
        };
      }
      if (lowerName.includes('systems') && wf.systems) {
        return {
          itemId: `${wf.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_systems`,
          itemName: `${wf.name} Systems`,
          buildTimeText: wf.systems.buildTime || '12 hours',
          buildPriceCredits: wf.systems.buildPrice || 15000,
          rushPricePlat: wf.systems.rushPricePlat || 25,
          ingredients: (wf.systems.ingredients || []).map((ing: any) => ({
            name: ing.name,
            count: ing.count,
          })),
        };
      }
    }
  }

  // 5. If blueprint of an item (e.g. "Alternox Prime Blueprint" or "Perigale Prime Blueprint")
  if (lowerName.endsWith(' blueprint')) {
    const parentName = idOrName.replace(/\s+blueprint$/i, '').trim();
    const parentRecipe = getCraftingRecipe(parentName);
    if (parentRecipe) {
      return {
        ...parentRecipe,
        itemId: `${parentRecipe.itemId}_blueprint`,
        itemName: `${parentRecipe.itemName} Blueprint`,
      };
    }
  }

  // 6. Dynamic Prime Weapon / Item Recipe Synthesis from Void Relics (only for a specific main Prime item)
  const isPartSuffix = /\s+(barrel|receiver|stock|blade|handle|hilt|guard|grip|string|upper limb|lower limb|disc|gauntlet|pouch|stars|ornament|chain|head|motor|heatsink|link)$/i.test(idOrName);
  const isPrimeItemName = (lowerName.endsWith(' prime') || lowerName.endsWith(' prime set')) && lowerName !== 'prime' && lowerName.length > 6;
  if (!isPartSuffix && isPrimeItemName) {
    const parentPrimeName = idOrName.replace(/\s+set$/i, '').trim();
    const parentLowerP = parentPrimeName.toLowerCase();
    const allRelicsList = (allRelicsJson as any[]) || [];
    const foundParts = new Set<string>();

    for (const relic of allRelicsList) {
      for (const rw of relic.rewards || []) {
        const rwL = (rw.itemName || '').toLowerCase();
        if ((rwL.startsWith(parentLowerP + ' ') || rwL === parentLowerP) && !rwL.endsWith('blueprint')) {
          foundParts.add(rw.itemName);
        }
      }
    }

    if (foundParts.size > 0) {
      const ingredients: CraftingIngredient[] = Array.from(foundParts).map((partName) => ({
        name: partName,
        count: 1,
        isComponent: true,
      }));
      ingredients.push({
        name: 'Orokin Cell',
        count: 10,
        isComponent: false,
      });

      return {
        itemId: parentPrimeName.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
        itemName: parentPrimeName,
        buildTimeText: '12 hours',
        buildPriceCredits: 15000,
        rushPricePlat: 50,
        ingredients,
      };
    }
  }

  return undefined;
}


