export interface PersonalTarget {
  id: string;
  name: string;
  category: string;
  targetQuantity: number;
  currentQuantity: number;
  notes: string;
  updatedAt: string;
}

const STORAGE_KEY = 'warframe_personal_targets_v1';
const NOTES_KEY = 'warframe_personal_notes_v1';
const HISTORY_STORAGE_KEY = 'warframe_wiki_visit_history_v1';
const MAX_HISTORY_ITEMS = 30;

const memoryStore: Record<string, string> = {};

function safeGetItem(key: string): string | null {
  try {
    if (typeof localStorage !== 'undefined' && localStorage.getItem) {
      return localStorage.getItem(key);
    }
  } catch {
    // Fall back to memoryStore
  }
  return memoryStore[key] || null;
}

function safeSetItem(key: string, value: string): void {
  try {
    if (typeof localStorage !== 'undefined' && localStorage.setItem) {
      localStorage.setItem(key, value);
    }
  } catch {
    // Fall back to memoryStore
  }
  memoryStore[key] = value;
}

function safeRemoveItem(key: string): void {
  try {
    if (typeof localStorage !== 'undefined' && localStorage.removeItem) {
      localStorage.removeItem(key);
    }
  } catch {
    // Fall back to memoryStore
  }
  delete memoryStore[key];
}

function safeDispatchEvent(name: string): void {
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    try {
      window.dispatchEvent(new Event(name));
    } catch {
      // Ignore
    }
  }
}

export function getPersonalTargets(): PersonalTarget[] {
  const raw = safeGetItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function savePersonalTarget(target: Omit<PersonalTarget, 'updatedAt'>): PersonalTarget[] {
  const existing = getPersonalTargets();
  const index = existing.findIndex((t) => t.id === target.id);
  const updatedEntry: PersonalTarget = {
    ...target,
    updatedAt: new Date().toISOString(),
  };

  let nextList: PersonalTarget[];
  if (index >= 0) {
    nextList = [...existing];
    nextList[index] = updatedEntry;
  } else {
    nextList = [updatedEntry, ...existing];
  }

  safeSetItem(STORAGE_KEY, JSON.stringify(nextList));
  safeDispatchEvent('personal-targets-updated');
  return nextList;
}

export function removePersonalTarget(id: string): PersonalTarget[] {
  const existing = getPersonalTargets();
  const nextList = existing.filter((t) => t.id !== id);

  safeSetItem(STORAGE_KEY, JSON.stringify(nextList));
  safeDispatchEvent('personal-targets-updated');
  return nextList;
}

export function getPersonalItemNote(itemId: string): string {
  const raw = safeGetItem(NOTES_KEY);
  if (!raw) return '';
  try {
    const map = JSON.parse(raw);
    return map[itemId] || '';
  } catch {
    return '';
  }
}

export function savePersonalItemNote(itemId: string, note: string): void {
  const raw = safeGetItem(NOTES_KEY);
  let map: Record<string, string> = {};
  if (raw) {
    try {
      map = JSON.parse(raw);
    } catch {
      map = {};
    }
  }
  map[itemId] = note;
  safeSetItem(NOTES_KEY, JSON.stringify(map));
}

export interface PageVisitHistory {
  id: string;
  title: string;
  path: string;
  category?: string;
  visitedAt: string;
}

const NON_ITEM_CATEGORIES = new Set(['Directory', 'Live', 'Tracker']);

export function getVisitHistory(): PageVisitHistory[] {
  const raw = safeGetItem(HISTORY_STORAGE_KEY);
  if (!raw) return [];
  try {
    const list: PageVisitHistory[] = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list.filter(
      (item) =>
        Boolean(item.path && item.path.startsWith('/item/')) &&
        !NON_ITEM_CATEGORIES.has(item.category || '')
    );
  } catch {
    return [];
  }
}

export function addVisitHistory(entry: Omit<PageVisitHistory, 'visitedAt'>): PageVisitHistory[] {
  if (!entry.path || !entry.path.startsWith('/item/') || NON_ITEM_CATEGORIES.has(entry.category || '')) {
    return getVisitHistory();
  }

  const existing = getVisitHistory();
  const filtered = existing.filter((item) => item.path !== entry.path && item.id !== entry.id);
  const updatedEntry: PageVisitHistory = {
    ...entry,
    visitedAt: new Date().toISOString(),
  };

  const nextList = [updatedEntry, ...filtered].slice(0, MAX_HISTORY_ITEMS);

  safeSetItem(HISTORY_STORAGE_KEY, JSON.stringify(nextList));
  safeDispatchEvent('wiki-history-updated');

  return nextList;
}

export function clearVisitHistory(): void {
  safeRemoveItem(HISTORY_STORAGE_KEY);
  safeDispatchEvent('wiki-history-updated');
}


