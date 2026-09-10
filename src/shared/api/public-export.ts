import { Weapon, Warframe, Relic, Mod, FoundryRecipe } from '../types/warframe';

const BASE_URL = 'https://raw.githubusercontent.com/WFCD/warframe-items/master/data/json/';

async function fetchExport<T>(filename: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${filename}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch WFCD warframe-items data: ${filename}`);
  }
  return response.json();
}

export async function fetchWeapons(): Promise<Weapon[]> {
  const rawData = await fetchExport<any[]>('Weapons.json');
  return rawData.map((item) => {
    const damageObj: any = {};
    if (item.damagePerShot && typeof item.damagePerShot === 'object') {
      Object.assign(damageObj, item.damagePerShot);
    }
    return {
      uniqueName: item.uniqueName,
      name: item.name,
      category: item.productCategory || item.category || 'Primary',
      damage: damageObj,
      critChance: item.criticalChance,
      critMultiplier: item.criticalMultiplier,
      statusChance: item.procChance,
      fireRate: item.fireRate,
      masteryReq: item.masteryReq || item.mr,
      disposition: item.omegaAttenuation || item.disposition,
    } as Weapon;
  });
}

export async function fetchWarframes(): Promise<Warframe[]> {
  const rawData = await fetchExport<any[]>('Warframes.json');
  return rawData.map((item) => ({
    uniqueName: item.uniqueName,
    name: item.name,
    health: item.health,
    shield: item.shield,
    armor: item.armor,
    energy: item.power,
    sprintSpeed: item.sprintSpeed,
    masteryReq: item.masteryReq || item.mr,
    abilities: item.abilities || [],
  })) as Warframe[];
}

export async function fetchRelics(): Promise<Relic[]> {
  const rawData = await fetchExport<any[]>('Relics.json');
  return rawData.map((item) => ({
    era: item.tier || item.era,
    name: item.name,
    rewards: item.rewards || [],
  })) as Relic[];
}

export async function fetchMods(): Promise<Mod[]> {
  const rawData = await fetchExport<any[]>('Mods.json');
  return rawData.map((item) => ({
    uniqueName: item.uniqueName,
    name: item.name,
    polarity: item.polarity,
    drain: item.baseDrain,
    maxRank: item.fusionLimit,
    type: item.type,
    effects: [], // Would require parsing description or internal stats
  })) as Mod[];
}

export async function fetchRecipes(): Promise<FoundryRecipe[]> {
  const rawData = await fetchExport<any[]>('Weapons.json');
  return rawData
    .filter((item) => item.components && item.components.length > 0)
    .map((item) => ({
      resultName: item.name,
      resultUniqueName: item.uniqueName,
      buildTime: item.buildTime || 0,
      buildPrice: item.buildPrice || 0,
      ingredients: (item.components || []).map((c: any) => ({
        itemName: c.name,
        itemUniqueName: c.uniqueName || c.name,
        count: c.itemCount || 1,
      })),
    })) as FoundryRecipe[];
}

export interface StaticDataSummary {
  items: Array<{
    id: string;
    urlName: string;
    displayName: string;
    itemType: string;
    ducatValue: number;
  }>;
  relics: Array<{
    id: string;
    era: string;
    name: string;
    rewards: any[];
  }>;
}

export async function fetchStaticData(): Promise<StaticDataSummary> {
  const [weapons, warframes, relics] = await Promise.all([
    fetchWeapons().catch(() => []),
    fetchWarframes().catch(() => []),
    fetchRelics().catch(() => []),
  ]);

  const items: StaticDataSummary['items'] = [];

  for (const w of weapons) {
    items.push({
      id: w.uniqueName,
      urlName: w.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, ''),
      displayName: w.name,
      itemType: w.category,
      ducatValue: 0,
    });
  }

  for (const wf of warframes) {
    items.push({
      id: wf.uniqueName,
      urlName: wf.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, ''),
      displayName: wf.name,
      itemType: 'Warframe',
      ducatValue: 0,
    });
  }

  const relicList: StaticDataSummary['relics'] = relics.map((r) => ({
    id: `${r.era}_${r.name}`,
    era: r.era,
    name: r.name,
    rewards: r.rewards,
  }));

  return {
    items,
    relics: relicList,
  };
}

