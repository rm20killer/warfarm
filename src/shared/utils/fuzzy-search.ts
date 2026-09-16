import allWeapons from '../data/generated/all-weapons.json';
import allWarframes from '../data/generated/all-warframes.json';
import allMods from '../data/generated/all-mods.json';
import allArcanes from '../data/generated/all-arcanes.json';
import allResources from '../data/generated/all-resources.json';
import allRelics from '../data/generated/all-relics.json';

export interface SimilarItemSuggestion {
  name: string;
  category: 'Weapon' | 'Warframe' | 'Mod' | 'Arcane' | 'Resource' | 'Relic' | 'Gear';
  subType?: string;
  path: string;
  score: number;
}

interface IndexableItem {
  name: string;
  category: SimilarItemSuggestion['category'];
  subType?: string;
  aliases?: string[];
}

const SEARCH_INDEX: IndexableItem[] = (() => {
  const list: IndexableItem[] = [];
  const seen = new Set<string>();

  const add = (name: string, category: SimilarItemSuggestion['category'], subType?: string, aliases?: string[]) => {
    if (!name) return;
    const key = name.toLowerCase().trim();
    if (seen.has(key)) return;
    seen.add(key);
    list.push({ name, category, subType, aliases });
  };

  // Warframes
  for (const w of allWarframes as any[]) {
    add(w.name, 'Warframe', w.subType || 'Warframe');
  }

  // Weapons
  for (const w of allWeapons as any[]) {
    add(w.name, 'Weapon', w.subType || w.category || 'Weapon');
  }

  // Mods
  for (const m of allMods as any[]) {
    add(m.name, 'Mod', m.type || 'Mod');
  }

  // Arcanes
  for (const a of allArcanes as any[]) {
    add(a.name, 'Arcane', a.slot || 'Arcane');
  }

  // Resources
  for (const r of allResources as any[]) {
    add(r.name, 'Resource', r.type || 'Resource');
  }

  // Relics (index with code aliases like A12, Lith A12, etc.)
  for (const r of allRelics as any[]) {
    add(r.fullName, 'Relic', `${r.era} Relic`, [
      r.name,
      r.id,
      `${r.era} ${r.name}`,
      `${r.name} relic`,
      `${r.name} ${r.era}`,
    ]);
  }

  return list;
})();

function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = [];

  for (let i = 0; i <= m; i++) {
    dp[i] = [i];
  }
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1, // deletion
          dp[i][j - 1] + 1, // insertion
          dp[i - 1][j - 1] + 1 // substitution
        );
      }
    }
  }

  return dp[m][n];
}

function calculateSimilarity(query: string, target: string, aliases?: string[]): number {
  const q = query.toLowerCase().trim();
  const t = target.toLowerCase().trim();

  if (q === t) return 1.0;

  // Direct alias check (e.g. "a12" -> "Lith A12 Relic")
  if (aliases) {
    for (const alias of aliases) {
      const a = alias.toLowerCase().trim();
      if (q === a) return 0.99;
      if (a.startsWith(q) && q.length >= 2) return 0.95;
      if (a.includes(q) && q.length >= 2) return 0.90;
    }
  }

  const qWords = q.split(/\s+/).filter(Boolean);
  const tWords = t.split(/\s+/).filter(Boolean);

  // Exact word token match (e.g. "a12" in ["lith", "a12", "relic"], "rhino" in ["rhino", "prime"])
  if (tWords.includes(q)) return 0.94;

  // Prefix word token match (e.g. "excal" in ["excalibur", "prime"])
  if (tWords.some((tw) => tw.startsWith(q) && q.length >= 2)) return 0.88;

  if (t.startsWith(q)) return 0.90;
  if (t.includes(q)) return 0.82;

  // Multi-word token matching
  const matchingWords = qWords.filter((qw) => tWords.some((tw) => tw.includes(qw) || qw.includes(tw)));
  if (matchingWords.length > 0) {
    const wordRatio = matchingWords.length / Math.max(qWords.length, tWords.length);
    if (wordRatio >= 0.3) return 0.6 + wordRatio * 0.25;
  }

  // Levenshtein similarity fallback
  const maxLen = Math.max(q.length, t.length);
  if (maxLen === 0) return 0;
  const dist = levenshteinDistance(q, t);
  const levSim = 1 - dist / maxLen;

  return Math.max(0, levSim);
}

export function findSimilarItems(query: string, limit = 8): SimilarItemSuggestion[] {
  const q = query.trim();
  if (!q || q.length < 2) return [];

  const scored: SimilarItemSuggestion[] = [];

  for (const item of SEARCH_INDEX) {
    const sim = calculateSimilarity(q, item.name, item.aliases);
    if (sim > 0.35) {
      scored.push({
        name: item.name,
        category: item.category,
        subType: item.subType,
        path: `/item/${encodeURIComponent(item.name)}`,
        score: sim,
      });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

export interface NameFamilyResult {
  query: string;
  categoryShortcut?: { title: string; path: string; description: string };
  familyItems: SimilarItemSuggestion[];
}

export function findNameFamilyItems(query: string, limit = 16): NameFamilyResult {
  const q = query.trim().toLowerCase();
  if (!q) return { query, familyItems: [] };

  let categoryShortcut: NameFamilyResult['categoryShortcut'] = undefined;
  if (/^arcanes?$/i.test(q)) {
    categoryShortcut = {
      title: 'Arcanes & Enhancements Directory',
      path: '/arcanes',
      description: 'Explore all Arcanes across Warframes, Weapons, and Operators with drop chances and dissolution costs.',
    };
  } else if (/^mods?$/i.test(q)) {
    categoryShortcut = {
      title: 'Warframe & Companion Mods Directory',
      path: '/mods',
      description: 'Browse 1,800+ Warframe, Primed, Galvanized, and Augment mods with drop locations.',
    };
  } else if (/^relics?$/i.test(q)) {
    categoryShortcut = {
      title: 'Void Relics & Prime Parts Directory',
      path: '/relics',
      description: 'Check drop rates, refinement chances, and active vaulted status for 770+ Void relics.',
    };
  } else if (/^(warframes?|frames?)$/i.test(q)) {
    categoryShortcut = {
      title: 'Warframes Directory',
      path: '/gear?tab=Warframes',
      description: 'Browse all Warframes, Prime variants, crafting blueprints, and abilities.',
    };
  } else if (/^weapons?$/i.test(q)) {
    categoryShortcut = {
      title: 'Weapons Directory',
      path: '/gear?tab=Weapons',
      description: 'Explore Primary, Secondary, and Melee weapons with combat stats and weapon lineage.',
    };
  } else if (/^resources?$/i.test(q)) {
    categoryShortcut = {
      title: 'Star Chart Resource Locator',
      path: '/resources',
      description: 'Find best farming locations for rare resources, mining gems, and open world components.',
    };
  }

  const matches: SimilarItemSuggestion[] = [];
  const seen = new Set<string>();

  for (const item of SEARCH_INDEX) {
    const nameLower = item.name.toLowerCase();
    const words = nameLower.split(/[\s_-]+/);

    const isPrefix = nameLower.startsWith(q);
    const isWordMatch = words.includes(q);
    const isSubstring = nameLower.includes(q) && q.length >= 3;

    if (isPrefix || isWordMatch || isSubstring) {
      if (!seen.has(nameLower)) {
        seen.add(nameLower);
        let score = 0.5;
        if (isPrefix) score += 0.4;
        if (isWordMatch) score += 0.3;
        matches.push({
          name: item.name,
          category: item.category,
          subType: item.subType,
          path: `/item/${encodeURIComponent(item.name)}`,
          score,
        });
      }
    }
  }

  matches.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  const familyItems = matches.length > 0 ? matches.slice(0, limit) : findSimilarItems(query, limit);

  return {
    query,
    categoryShortcut,
    familyItems,
  };
}

