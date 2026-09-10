import foundryRecipesJson from './generated/foundry-recipes.json';
import weaponRecipesJson from './generated/weapon-recipes.json';
import warframeRecipesJson from './generated/warframe-recipes.json';

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

  // 1. Direct lookup in foundry recipes
  const match = foundryRecipesMap[normalized] || foundryRecipesMap[lowerName];
  if (match) return match;

  // 2. Weapon Recipes catalog (covers all 612 weapons)
  const wpCatalog = weaponRecipesJson as Record<string, FoundryCraftingRecipe>;
  const weaponRecipe = wpCatalog[normalized] || wpCatalog[lowerName];
  if (weaponRecipe) {
    return weaponRecipe;
  }

  // 3. Warframe Recipes catalog (covers all 121 Warframes)
  const wfCatalog = warframeRecipesJson as Record<string, any>;
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

  return undefined;
}

