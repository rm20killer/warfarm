import { describe, it, expect } from 'vitest';
import { getCraftingRecipe, CRAFTING_RECIPES } from '../src/shared/data/crafting-recipes';
import { getResourceGuide } from '../src/shared/data/resource-guide';

describe('Foundry Crafting Recipes & Cook Times', () => {
  it('loads valid crafting recipes catalogue', () => {
    expect(CRAFTING_RECIPES.length).toBeGreaterThan(5);
  });

  it('retrieves Warframe crafting recipe for Rhino with 72h cook time and subcomponents', () => {
    const rhino = getCraftingRecipe('Rhino');
    expect(rhino).toBeDefined();
    expect(rhino?.itemName).toBe('Rhino');
    expect(rhino?.buildTimeText).toBe('72 hours');
    expect(rhino?.buildPriceCredits).toBe(25000);
    expect(rhino?.rushPricePlat).toBe(50);
    expect(rhino?.ingredients).toHaveLength(4);

    const orokinCell = rhino?.ingredients.find((i) => i.name === 'Orokin Cell');
    expect(orokinCell).toBeDefined();
    expect(orokinCell?.count).toBe(1);

    expect(rhino?.componentRecipes).toBeDefined();
    expect(rhino?.componentRecipes).toHaveLength(3);

    const neuroptics = rhino?.componentRecipes?.find((c) => c.itemName === 'Rhino Neuroptics');
    expect(neuroptics).toBeDefined();
    expect(neuroptics?.buildTimeText).toBe('12 hours');
    expect(neuroptics?.buildPriceCredits).toBe(15000);
    expect(neuroptics?.rushPricePlat).toBe(25);
    expect(neuroptics?.ingredients).toEqual([
      { name: 'Neural Sensors', count: 1 },
      { name: 'Polymer Bundle', count: 500 },
      { name: 'Rubedo', count: 150 },
      { name: 'Ferrite', count: 1000 },
    ]);
  });

  it('retrieves gear recipe for Forma with 24h cook time', () => {
    const forma = getCraftingRecipe('Forma');
    expect(forma).toBeDefined();
    expect(forma?.buildTimeText).toBe('24 hours');
    expect(forma?.buildPriceCredits).toBe(35000);
    expect(forma?.rushPricePlat).toBe(10);
    expect(forma?.ingredients).toEqual([
      { name: 'Morphics', count: 1 },
      { name: 'Neural Sensors', count: 1 },
      { name: 'Neurodes', count: 1 },
      { name: 'Orokin Cell', count: 1 },
    ]);
  });

  it('retrieves Wisp recipe containing Hexenon and Nitain Extract requirements', () => {
    const wisp = getCraftingRecipe('Wisp');
    expect(wisp).toBeDefined();
    expect(wisp?.buildTimeText).toBe('72 hours');
    expect(wisp?.componentRecipes).toHaveLength(3);

    const systems = wisp?.componentRecipes?.find((c) => c.itemName === 'Wisp Systems');
    expect(systems).toBeDefined();
    expect(systems?.ingredients.some((i) => i.name === 'Nitain Extract')).toBe(true);
    expect(systems?.ingredients.some((i) => i.name === 'Hexenon')).toBe(true);
  });

  it('links recipe ingredients to farming guide entries with optimal spots', () => {
    const rhino = getCraftingRecipe('Rhino');
    expect(rhino).toBeDefined();

    const neuroptics = rhino?.componentRecipes?.find((c) => c.itemName === 'Rhino Neuroptics');
    expect(neuroptics).toBeDefined();

    const neuralSensorsGuide = getResourceGuide('Neural Sensors');
    expect(neuralSensorsGuide).toBeDefined();
    expect(neuralSensorsGuide?.optimalNodes.length).toBeGreaterThan(0);
    expect(neuralSensorsGuide?.optimalNodes[0].planet).toBe('Jupiter');

    const polymerGuide = getResourceGuide('Polymer Bundle');
    expect(polymerGuide).toBeDefined();
    expect(polymerGuide?.optimalNodes.length).toBeGreaterThan(0);
    expect(polymerGuide?.optimalNodes[0].planet).toBe('Uranus');
  });

  it('retrieves dynamic weapon recipe for Drakgoon with 24h cook time and resource breakdown', () => {
    const drakgoon = getCraftingRecipe('Drakgoon');
    expect(drakgoon).toBeDefined();
    expect(drakgoon?.itemName).toBe('Drakgoon');
    expect(drakgoon?.buildTimeText).toBe('24 hours');
    expect(drakgoon?.buildPriceCredits).toBe(30000);
    expect(drakgoon?.rushPricePlat).toBe(40);
    expect(drakgoon?.ingredients.length).toBeGreaterThan(2);

    const alloy = drakgoon?.ingredients.find((i) => i.name === 'Alloy Plate');
    expect(alloy).toBeDefined();
    expect(alloy?.count).toBe(950);

    const circuits = drakgoon?.ingredients.find((i) => i.name === 'Circuits');
    expect(circuits).toBeDefined();
    expect(circuits?.count).toBe(1100);
  });

  it('resolves wiki-gathered resources like Alloy Plate and Salvage with farming locations', () => {
    const alloyGuide = getResourceGuide('Alloy Plate');
    expect(alloyGuide).toBeDefined();
    expect(alloyGuide?.name).toBe('Alloy Plate');
    expect(alloyGuide?.planets.length).toBeGreaterThan(0);
    expect(alloyGuide?.optimalNodes.length).toBeGreaterThan(0);

    const salvageGuide = getResourceGuide('Salvage');
    expect(salvageGuide).toBeDefined();
    expect(salvageGuide?.name).toBe('Salvage');
    expect(salvageGuide?.planets.length).toBeGreaterThan(0);
    expect(salvageGuide?.optimalNodes.length).toBeGreaterThan(0);
  });

  it('handles case-insensitive and hyphenated search keys', () => {
    expect(getCraftingRecipe('rhino')).toBeDefined();
    expect(getCraftingRecipe('RHINO')).toBeDefined();
    expect(getCraftingRecipe('orokin-catalyst')).toBeDefined();
    expect(getCraftingRecipe('Orokin Catalyst')).toBeDefined();
    expect(getCraftingRecipe('non-existent-gear')).toBeUndefined();
  });

  it('resolves crafting recipe for Alternox Prime Blueprint and prime weapon synthesis', () => {
    const alternoxBp = getCraftingRecipe('Alternox Prime Blueprint');
    expect(alternoxBp).toBeDefined();
    expect(alternoxBp?.itemName).toContain('Alternox Prime');
    expect(alternoxBp?.ingredients.length).toBeGreaterThan(0);
    expect(alternoxBp?.ingredients.some((i) => i.name === 'Orokin Cell')).toBe(true);
  });

  it('resolves crafting recipe for Perigale Prime and its components', () => {
    const perigale = getCraftingRecipe('Perigale Prime');
    expect(perigale).toBeDefined();
    expect(perigale?.itemName).toBe('Perigale Prime');
    expect(perigale?.ingredients.length).toBeGreaterThan(0);
  });
});

