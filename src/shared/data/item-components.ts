import { extractBaseItemName } from './item-database';
import { ALL_RELICS, RelicEntry } from './relic-database';
import { getCraftingRecipe, FoundryCraftingRecipe } from './crafting-recipes';
import warframeRecipesJson from './generated/warframe-recipes.json';
import weaponRecipesJson from './generated/weapon-recipes.json';
import allWeapons from './generated/all-weapons.json';
import allWarframes from './generated/all-warframes.json';

export interface SiblingComponent {
  name: string;
  shortName: string;
  isCurrent: boolean;
  path: string;
  vaulted?: boolean;
  relicCount: number;
}

export interface ItemComponentInfo {
  rawName: string;
  componentType: string;
  parentItemName: string;
  baseItemName: string;
  parentCategory: 'Weapon' | 'Warframe' | 'Sentinel' | 'Archwing' | 'Item';
  isPrime: boolean;
  isBlueprint: boolean;
  isWarframePart: boolean;
  siblingComponents: SiblingComponent[];
  craftingRecipe?: FoundryCraftingRecipe;
  parentRecipe?: FoundryCraftingRecipe;
  isPreCraftedDrop: boolean;
}

const COMPONENT_SUFFIXES: Array<{ suffix: string; cleanType: string; isWarframePart?: boolean }> = [
  // Warframe / Archwing component blueprints & parts
  { suffix: 'Neuroptics Blueprint', cleanType: 'Neuroptics Blueprint', isWarframePart: true },
  { suffix: 'Chassis Blueprint', cleanType: 'Chassis Blueprint', isWarframePart: true },
  { suffix: 'Systems Blueprint', cleanType: 'Systems Blueprint', isWarframePart: true },
  { suffix: 'Harness Blueprint', cleanType: 'Harness Blueprint', isWarframePart: true },
  { suffix: 'Wings Blueprint', cleanType: 'Wings Blueprint', isWarframePart: true },
  { suffix: 'Helmet Blueprint', cleanType: 'Helmet Blueprint', isWarframePart: true },
  { suffix: 'Carapace Blueprint', cleanType: 'Carapace Blueprint', isWarframePart: true },
  { suffix: 'Cerebrum Blueprint', cleanType: 'Cerebrum Blueprint', isWarframePart: true },
  { suffix: 'Neuroptics', cleanType: 'Neuroptics', isWarframePart: true },
  { suffix: 'Chassis', cleanType: 'Chassis', isWarframePart: true },
  { suffix: 'Systems', cleanType: 'Systems', isWarframePart: true },
  { suffix: 'Harness', cleanType: 'Harness', isWarframePart: true },
  { suffix: 'Wings', cleanType: 'Wings', isWarframePart: true },
  { suffix: 'Helmet', cleanType: 'Helmet', isWarframePart: true },
  { suffix: 'Carapace', cleanType: 'Carapace', isWarframePart: true },
  { suffix: 'Cerebrum', cleanType: 'Cerebrum', isWarframePart: true },

  // Multi-word weapon / gear parts
  { suffix: 'Upper Limb', cleanType: 'Upper Limb' },
  { suffix: 'Lower Limb', cleanType: 'Lower Limb' },
  { suffix: 'Left Gauntlet', cleanType: 'Left Gauntlet' },
  { suffix: 'Right Gauntlet', cleanType: 'Right Gauntlet' },
  { suffix: 'Sub-Assembly', cleanType: 'Sub-Assembly' },

  // Standard weapon parts & blueprints
  { suffix: 'Prime Blueprint', cleanType: 'Blueprint' },
  { suffix: 'Blueprint', cleanType: 'Blueprint' },
  { suffix: 'Prime Barrel', cleanType: 'Barrel' },
  { suffix: 'Barrel', cleanType: 'Barrel' },
  { suffix: 'Prime Receiver', cleanType: 'Receiver' },
  { suffix: 'Receiver', cleanType: 'Receiver' },
  { suffix: 'Prime Stock', cleanType: 'Stock' },
  { suffix: 'Stock', cleanType: 'Stock' },
  { suffix: 'Prime Blade', cleanType: 'Blade' },
  { suffix: 'Blade', cleanType: 'Blade' },
  { suffix: 'Blades', cleanType: 'Blades' },
  { suffix: 'Prime Handle', cleanType: 'Handle' },
  { suffix: 'Handle', cleanType: 'Handle' },
  { suffix: 'Prime Hilt', cleanType: 'Hilt' },
  { suffix: 'Hilt', cleanType: 'Hilt' },
  { suffix: 'Prime Guard', cleanType: 'Guard' },
  { suffix: 'Guard', cleanType: 'Guard' },
  { suffix: 'Prime Grip', cleanType: 'Grip' },
  { suffix: 'Grip', cleanType: 'Grip' },
  { suffix: 'Prime String', cleanType: 'String' },
  { suffix: 'String', cleanType: 'String' },
  { suffix: 'Prime Limb', cleanType: 'Limb' },
  { suffix: 'Limb', cleanType: 'Limb' },
  { suffix: 'Prime Disc', cleanType: 'Disc' },
  { suffix: 'Disc', cleanType: 'Disc' },
  { suffix: 'Prime Gauntlet', cleanType: 'Gauntlet' },
  { suffix: 'Gauntlet', cleanType: 'Gauntlet' },
  { suffix: 'Prime Pouch', cleanType: 'Pouch' },
  { suffix: 'Pouch', cleanType: 'Pouch' },
  { suffix: 'Prime Stars', cleanType: 'Stars' },
  { suffix: 'Stars', cleanType: 'Stars' },
  { suffix: 'Prime Ornament', cleanType: 'Ornament' },
  { suffix: 'Ornament', cleanType: 'Ornament' },
  { suffix: 'Prime Chain', cleanType: 'Chain' },
  { suffix: 'Chain', cleanType: 'Chain' },
  { suffix: 'Prime Head', cleanType: 'Head' },
  { suffix: 'Head', cleanType: 'Head' },
  { suffix: 'Prime Motor', cleanType: 'Motor' },
  { suffix: 'Motor', cleanType: 'Motor' },
  { suffix: 'Prime Heatsink', cleanType: 'Heatsink' },
  { suffix: 'Heatsink', cleanType: 'Heatsink' },
  { suffix: 'Prime Link', cleanType: 'Link' },
  { suffix: 'Link', cleanType: 'Link' },
  { suffix: 'Prime Boot', cleanType: 'Boot' },
  { suffix: 'Boot', cleanType: 'Boot' },
  { suffix: 'Prime Band', cleanType: 'Band' },
  { suffix: 'Band', cleanType: 'Band' },
  { suffix: 'Prime Buckle', cleanType: 'Buckle' },
  { suffix: 'Buckle', cleanType: 'Buckle' },
];

/**
 * Expands an ingredient or subpart name (e.g. "Barrel" or "Chassis") into its
 * full canonical item name relative to the parent item (e.g. "Alternox Prime Barrel").
 */
export function resolveComponentFullName(partOrIngName: string, parentItemName: string): string {
  if (!partOrIngName) return parentItemName || '';
  const p = (partOrIngName || '').trim();
  const parent = (parentItemName || '').trim();
  if (!p) return parent;
  if (!parent) return p;
  const pLower = p.toLowerCase();
  const parentLower = parent.toLowerCase();

  if (pLower.startsWith(parentLower)) {
    return p;
  }

  // If it's a common resource or credit, keep as is
  const commonResources = [
    'orokin cell',
    'credits',
    'alloy plate',
    'ferrite',
    'rubedo',
    'morphics',
    'neural sensors',
    'neurodes',
    'polymer bundle',
    'circuits',
    'control module',
    'argon crystal',
    'gallium',
    'tellurium',
    'plastids',
    'nano spores',
    'salvage',
    'detonite ampule',
    'fieldron sample',
    'mutagen sample',
    'cryotic',
    'hexenon',
    'oxium',
    'forma',
  ];

  if (commonResources.includes(pLower)) {
    return p;
  }

  // Otherwise prefix with parent item name
  return `${parent} ${p}`;
}

/**
 * Retrieves all component parts and blueprints belonging to a parent item (e.g. "Alternox Prime" or "Rhino Prime").
 */
export function getParentItemComponents(parentItemName: string, currentItemName?: string): SiblingComponent[] {
  if (!parentItemName) return [];
  const parentLower = parentItemName.trim().toLowerCase();
  const siblingsMap = new Map<string, SiblingComponent>();

  // 1. Gather all relic drop parts for this parent
  for (const relic of ALL_RELICS) {
    for (const rw of relic.rewards) {
      const rwLower = rw.itemName.toLowerCase();
      if (rwLower.includes(parentLower)) {
        let shortName = rw.itemName;
        const idx = rwLower.indexOf(parentLower);
        if (idx !== -1) {
          shortName = rw.itemName.slice(idx + parentItemName.length).trim();
        }
        if (!shortName) shortName = 'Blueprint';

        const fullName = rw.itemName;
        if (!siblingsMap.has(fullName)) {
          siblingsMap.set(fullName, {
            name: fullName,
            shortName,
            isCurrent: currentItemName ? fullName.toLowerCase() === currentItemName.toLowerCase() : false,
            path: `/item/${encodeURIComponent(fullName)}`,
            vaulted: relic.vaulted,
            relicCount: 1,
          });
        } else {
          const existing = siblingsMap.get(fullName)!;
          existing.relicCount += 1;
          if (!relic.vaulted) {
            existing.vaulted = false; // unvaulted if at least one relic is unvaulted
          }
        }
      }
    }
  }

  // 2. Gather from Warframe recipes catalog if applicable
  const wfCatalog = warframeRecipesJson as Record<string, any>;
  const wfKey = parentLower.replace(/[^a-z0-9]+/g, '_');
  const wf = wfCatalog[parentLower] || wfCatalog[wfKey];
  if (wf) {
    const parts = [
      { key: 'blueprint', name: `${wf.name} Blueprint`, shortName: 'Blueprint' },
      { key: 'neuroptics', name: `${wf.name} Neuroptics Blueprint`, shortName: 'Neuroptics Blueprint' },
      { key: 'chassis', name: `${wf.name} Chassis Blueprint`, shortName: 'Chassis Blueprint' },
      { key: 'systems', name: `${wf.name} Systems Blueprint`, shortName: 'Systems Blueprint' },
    ];
    for (const p of parts) {
      if (!siblingsMap.has(p.name)) {
        siblingsMap.set(p.name, {
          name: p.name,
          shortName: p.shortName,
          isCurrent: currentItemName ? p.name.toLowerCase() === currentItemName.toLowerCase() : false,
          path: `/item/${encodeURIComponent(p.name)}`,
          relicCount: 0,
        });
      }
    }
  }

  // 3. Gather from Weapon recipes catalog if applicable
  const wpCatalog = weaponRecipesJson as Record<string, any>;
  const wp = wpCatalog[parentLower] || wpCatalog[wfKey];
  if (wp && Array.isArray(wp.ingredients)) {
    for (const ing of wp.ingredients) {
      if (ing.isComponent) {
        const full = resolveComponentFullName(ing.name, parentItemName);
        if (!siblingsMap.has(full)) {
          siblingsMap.set(full, {
            name: full,
            shortName: ing.name,
            isCurrent: currentItemName ? full.toLowerCase() === currentItemName.toLowerCase() : false,
            path: `/item/${encodeURIComponent(full)}`,
            relicCount: 0,
          });
        }
      }
    }
  }

  // Ensure Main Blueprint is in the list
  const bpFullName = `${parentItemName} Blueprint`;
  if (!siblingsMap.has(bpFullName)) {
    siblingsMap.set(bpFullName, {
      name: bpFullName,
      shortName: 'Blueprint',
      isCurrent: currentItemName ? bpFullName.toLowerCase() === currentItemName.toLowerCase() : false,
      path: `/item/${encodeURIComponent(bpFullName)}`,
      relicCount: 0,
    });
  }

  // Sort components: Blueprint first, then Neuroptics/Barrel, Chassis/Receiver, Systems/Stock, Blade, Handle, etc.
  const shortOrder: Record<string, number> = {
    blueprint: 1,
    'main blueprint': 1,
    neuroptics: 2,
    'neuroptics blueprint': 2,
    barrel: 2,
    'prime barrel': 2,
    chassis: 3,
    'chassis blueprint': 3,
    receiver: 3,
    'prime receiver': 3,
    systems: 4,
    'systems blueprint': 4,
    stock: 4,
    'prime stock': 4,
    blade: 5,
    'prime blade': 5,
    handle: 6,
    'prime handle': 6,
    guard: 7,
    grip: 8,
    string: 9,
    'upper limb': 10,
    'lower limb': 11,
  };

  return Array.from(siblingsMap.values()).sort((a, b) => {
    const oa = shortOrder[a.shortName.toLowerCase()] || 99;
    const ob = shortOrder[b.shortName.toLowerCase()] || 99;
    if (oa !== ob) return oa - ob;
    return a.shortName.localeCompare(b.shortName);
  });
}

/**
 * Parses an item name and determines if it is a component / blueprint of a parent item.
 * Links child parts back to the parent Prime weapon/Warframe and discovers sibling components.
 */
export function parseItemComponent(itemName: string): ItemComponentInfo | undefined {
  if (!itemName) return undefined;
  const raw = itemName.trim();
  const rawLower = raw.toLowerCase();

  let matchedSuffix: (typeof COMPONENT_SUFFIXES)[0] | undefined;

  for (const s of COMPONENT_SUFFIXES) {
    const sLower = s.suffix.toLowerCase();
    if (rawLower.endsWith(` ${sLower}`) || rawLower.endsWith(`_${sLower.replace(/\s+/g, '_')}`)) {
      matchedSuffix = s;
      break;
    }
  }

  if (!matchedSuffix) {
    return undefined;
  }

  // Extract parent name
  const suffixLen = matchedSuffix.suffix.length;
  let parent = raw.slice(0, raw.length - suffixLen).trim().replace(/_+$/, '');

  // Handle case where suffix is "Prime Blueprint" or similar
  if (matchedSuffix.suffix.startsWith('Prime ') && !parent.toLowerCase().endsWith('prime')) {
    parent = `${parent} Prime`;
  }

  if (!parent) {
    return undefined;
  }

  const isPrime = parent.toLowerCase().includes('prime') || rawLower.includes('prime');
  const baseName = extractBaseItemName(parent);
  const isBlueprint = matchedSuffix.cleanType.toLowerCase().includes('blueprint');
  const isWarframePart = Boolean(matchedSuffix.isWarframePart);

  // Determine parent category
  let parentCategory: ItemComponentInfo['parentCategory'] = 'Weapon';
  const isWf = (allWarframes as any[]).some(
    (w) => w.name.toLowerCase() === parent.toLowerCase() || extractBaseItemName(w.name).toLowerCase() === baseName.toLowerCase()
  );
  if (isWf || isWarframePart) {
    parentCategory = 'Warframe';
  }

  const siblings = getParentItemComponents(parent, raw);
  const recipe = getCraftingRecipe(raw);
  const pRecipe = getCraftingRecipe(parent);

  // Prime weapon parts drop directly from relics without a sub-foundry crafting step
  const isPreCraftedDrop = isPrime && !isBlueprint && !isWarframePart;

  return {
    rawName: raw,
    componentType: matchedSuffix.cleanType,
    parentItemName: parent,
    baseItemName: baseName,
    parentCategory,
    isPrime,
    isBlueprint,
    isWarframePart,
    siblingComponents: siblings,
    craftingRecipe: recipe,
    parentRecipe: pRecipe,
    isPreCraftedDrop,
  };
}

