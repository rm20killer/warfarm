import React from 'react';
import { FoundryCraftingRecipe } from '../../../shared/data/crafting-recipes';
import { ResourceFarmTooltip } from '../ResourceFarmTooltip';
import { detailStyles as styles } from './itemDetailStyles';

interface FoundryRecipeViewProps {
  craftingRecipe?: FoundryCraftingRecipe;
  itemName: string;
  parentItemName?: string;
}

export function FoundryRecipeView({ craftingRecipe, itemName, parentItemName }: FoundryRecipeViewProps) {
  if (!craftingRecipe) return null;

  return (
    <section style={styles.sectionCard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
        <div>
          <h2 style={styles.sectionTitle}>Foundry & Crafting Recipe</h2>
          <span style={styles.craftCostText}>
            Build Price: {craftingRecipe.buildPriceCredits.toLocaleString()} Credits
            {craftingRecipe.rushPricePlat ? ` | Rush: ${craftingRecipe.rushPricePlat} Plat` : ''}
          </span>
        </div>
        <div style={styles.cookTimeBadge}>
          <span style={styles.cookTimeLabel}>Time to Cook:</span>
          <span style={styles.cookTimeValue}>{craftingRecipe.buildTimeText}</span>
        </div>
      </div>

      <div style={styles.ingredientsBlock}>
        <span style={styles.ingredientsTitle}>Required Crafting Resources (Hover to see best farming spots):</span>
        <div style={styles.ingredientsGrid}>
          {craftingRecipe.ingredients.map((ing, i) => (
            <ResourceFarmTooltip
              key={i}
              ingredientName={ing.name}
              count={ing.count}
              isComponent={ing.isComponent}
              parentItemName={parentItemName || itemName}
            />
          ))}
        </div>
      </div>

      {craftingRecipe.componentRecipes && craftingRecipe.componentRecipes.length > 0 && (
        <div style={styles.componentRecipesSection}>
          <span style={styles.componentsHeading}>Component Blueprints (Cook time: 12 hours each):</span>
          <div style={styles.componentRecipesList}>
            {craftingRecipe.componentRecipes.map((comp) => (
              <div key={comp.itemId} style={styles.compRecipeBox}>
                <div style={styles.compRecipeHeader}>
                  <span style={styles.compRecipeName}>{comp.itemName}</span>
                  <span style={styles.compRecipeMeta}>
                    Time: {comp.buildTimeText} | {comp.buildPriceCredits.toLocaleString()} Credits
                  </span>
                </div>
                <div style={styles.ingredientsGrid}>
                  {comp.ingredients.map((ing, i) => (
                    <ResourceFarmTooltip
                      key={i}
                      ingredientName={ing.name}
                      count={ing.count}
                      isComponent={ing.isComponent}
                      parentItemName={comp.itemName || parentItemName || itemName}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

