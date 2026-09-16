import { describe, it, expect, beforeEach } from 'vitest';
import {
  getVisitHistory,
  addVisitHistory,
  clearVisitHistory,
  PageVisitHistory,
} from '../src/wiki/storage';
import { getRandomLookups } from '../src/wiki/utils/search-lookups';

describe('Randomized Quick Lookups', () => {
  it('generates 8 unique lookup items from the pool', () => {
    const lookups = getRandomLookups(8);
    expect(lookups.length).toBe(8);

    const uniqueSet = new Set(lookups);
    expect(uniqueSet.size).toBe(8);
  });

  it('supports custom counts', () => {
    const lookups5 = getRandomLookups(5);
    expect(lookups5.length).toBe(5);

    const lookups12 = getRandomLookups(12);
    expect(lookups12.length).toBe(12);
  });

  it('produces randomized selections across multiple invocations', () => {
    const sample1 = getRandomLookups(8).join(',');
    let differentCount = 0;

    for (let i = 0; i < 5; i++) {
      const sampleN = getRandomLookups(8).join(',');
      if (sampleN !== sample1) {
        differentCount++;
      }
    }

  });
});

const storageMap = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (key: string) => storageMap.get(key) || null,
  setItem: (key: string, value: string) => storageMap.set(key, value),
  removeItem: (key: string) => storageMap.delete(key),
  clear: () => storageMap.clear(),
};

describe('Page & Item Visit History', () => {
  beforeEach(() => {
    storageMap.clear();
    clearVisitHistory();
  });

  it('records new item visits and preserves latest visit first', () => {
    addVisitHistory({
      id: 'Argon Crystal',
      title: 'Argon Crystal',
      path: '/item/Argon%20Crystal',
      category: 'Resource',
    });

    addVisitHistory({
      id: 'Arcane Energize',
      title: 'Arcane Energize',
      path: '/item/Arcane%20Energize',
      category: 'Arcane',
    });

    const history = getVisitHistory();
    expect(history.length).toBe(2);
    expect(history[0].title).toBe('Arcane Energize');
    expect(history[0].category).toBe('Arcane');
    expect(history[1].title).toBe('Argon Crystal');
    expect(history[1].category).toBe('Resource');
  });

  it('deduplicates when visiting the same page again and moves it to the front', () => {
    addVisitHistory({
      id: 'Tellurium',
      title: 'Tellurium',
      path: '/item/Tellurium',
      category: 'Resource',
    });

    addVisitHistory({
      id: 'Torid',
      title: 'Torid',
      path: '/item/Torid',
      category: 'Weapon',
    });

    addVisitHistory({
      id: 'Tellurium',
      title: 'Tellurium',
      path: '/item/Tellurium',
      category: 'Resource',
    });

    const history = getVisitHistory();
    expect(history.length).toBe(2);
    expect(history[0].title).toBe('Tellurium');
    expect(history[1].title).toBe('Torid');
  });

  it('clears visit history completely', () => {
    addVisitHistory({
      id: 'Rhino',
      title: 'Rhino',
      path: '/item/Rhino',
      category: 'Warframe',
    });

    expect(getVisitHistory().length).toBe(1);
    clearVisitHistory();
    expect(getVisitHistory().length).toBe(0);
  });

  it('rejects directory and non-item paths from being added to history', () => {
    addVisitHistory({
      id: '/live',
      title: 'Live WorldState',
      path: '/live',
      category: 'Live',
    });

    addVisitHistory({
      id: '/mods',
      title: 'Mods Directory',
      path: '/mods',
      category: 'Directory',
    });

    addVisitHistory({
      id: '/gear',
      title: 'Warframes & Weapons',
      path: '/gear',
      category: 'Directory',
    });

    addVisitHistory({
      id: '/targets',
      title: 'My Targets',
      path: '/targets',
      category: 'Tracker',
    });

    expect(getVisitHistory().length).toBe(0);

    // Specific item paths must succeed
    addVisitHistory({
      id: 'Axi A17 Relic',
      title: 'Axi A17 Relic',
      path: '/item/Axi%20A17%20Relic',
      category: 'Relic',
    });

    expect(getVisitHistory().length).toBe(1);
    expect(getVisitHistory()[0].title).toBe('Axi A17 Relic');
    expect(getVisitHistory()[0].category).toBe('Relic');
  });

  it('filters out legacy directory and tracker entries from storage', () => {
    localStorage.setItem(
      'warframe_wiki_visit_history_v1',
      JSON.stringify([
        { id: '/live', title: 'Live WorldState', path: '/live', category: 'Live', visitedAt: new Date().toISOString() },
        { id: 'Hate', title: 'Hate', path: '/item/Hate', category: 'Weapon', visitedAt: new Date().toISOString() },
        { id: '/arcanes', title: 'Arcanes', path: '/arcanes', category: 'Directory', visitedAt: new Date().toISOString() },
        { id: 'Adaptation', title: 'Adaptation', path: '/item/Adaptation', category: 'Mod', visitedAt: new Date().toISOString() },
      ])
    );

    const history = getVisitHistory();
    expect(history.length).toBe(2);
    expect(history.map((h) => h.title)).toEqual(['Hate', 'Adaptation']);
  });
});
