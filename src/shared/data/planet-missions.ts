export interface MissionDropItem {
  itemName: string;
  chance: number;
  rarity: 'Common' | 'Uncommon' | 'Rare';
}

export interface EnemyDrop {
  itemName: string;
  category: 'Mod' | 'Resource' | 'Blueprint' | 'Part';
  chanceText: string;
}

export interface SpawnableEnemy {
  name: string;
  unitCategory: 'Light' | 'Medium' | 'Heavy' | 'Elite' | 'Boss' | 'Eximus';
  armorOrHealthType: string;
  levelScale?: string;
  drops: EnemyDrop[];
}

export interface PlanetNodeMission {
  node: string;
  planet?: string;
  missionType: string;
  levelRange: string;
  faction: string;
  rotationA?: MissionDropItem[];
  rotationB?: MissionDropItem[];
  rotationC?: MissionDropItem[];
  specialDrops?: string[];
  spawnableEnemies?: SpawnableEnemy[];
  notes?: string;
}

export interface PlanetData {
  id: string;
  name: string;
  faction: string;
  resourceDrops: string[];
  bossName?: string;
  missions: PlanetNodeMission[];
}

import planetMissionsJson from './generated/planet-missions.json';

export const PLANETS_DATA: PlanetData[] = (planetMissionsJson as unknown as PlanetData[]) || [];

export function getAllPlanets(): PlanetData[] {
  return PLANETS_DATA;
}

export function getPlanet(id: string): PlanetData | undefined {
  return PLANETS_DATA.find((p) => p.id.toLowerCase() === id.toLowerCase());
}

export function searchPlanetMissions(query: string, planetId?: string, missionType?: string): PlanetNodeMission[] {
  const q = query.toLowerCase().trim();
  const allMissions: PlanetNodeMission[] = [];

  for (const planet of PLANETS_DATA) {
    if (planetId && planetId !== 'All' && planet.id !== planetId) {
      continue;
    }

    for (const mission of planet.missions) {
      if (missionType && missionType !== 'All' && !mission.missionType.toLowerCase().includes(missionType.toLowerCase())) {
        continue;
      }

      const matchesSearch =
        !q ||
        mission.node.toLowerCase().includes(q) ||
        planet.name.toLowerCase().includes(q) ||
        mission.missionType.toLowerCase().includes(q) ||
        (mission.notes && mission.notes.toLowerCase().includes(q)) ||
        (mission.specialDrops && mission.specialDrops.some((d) => d.toLowerCase().includes(q))) ||
        (mission.rotationA && mission.rotationA.some((r) => r.itemName.toLowerCase().includes(q))) ||
        (mission.rotationB && mission.rotationB.some((r) => r.itemName.toLowerCase().includes(q))) ||
        (mission.rotationC && mission.rotationC.some((r) => r.itemName.toLowerCase().includes(q))) ||
        (mission.spawnableEnemies && mission.spawnableEnemies.some((e) =>
          e.name.toLowerCase().includes(q) ||
          e.drops.some((d) => d.itemName.toLowerCase().includes(q))
        ));

      if (matchesSearch) {
        allMissions.push({
          ...mission,
          planet: mission.planet || planet.name,
        });
      }
    }
  }

  return allMissions;
}

export function getMissionDetail(nodeName: string): { planet: PlanetData; mission: PlanetNodeMission } | undefined {
  const normalized = nodeName.toLowerCase().trim();
  for (const planet of PLANETS_DATA) {
    const found = planet.missions.find((m) => m.node.toLowerCase() === normalized);
    if (found) {
      return {
        planet,
        mission: {
          ...found,
          planet: planet.name,
        },
      };
    }
  }
  return undefined;
}
