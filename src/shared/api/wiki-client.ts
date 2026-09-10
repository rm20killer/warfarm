export interface WikiSearchResult {
  title: string;
  snippet?: string;
  url: string;
}

export interface WikiArticleDetails {
  title: string;
  extract: string;
  thumbnailUrl?: string;
  canonicalUrl: string;
}

const WIKI_API_BASE = 'https://wiki.warframe.com/api.php';
const WIKI_PAGE_BASE = 'https://wiki.warframe.com/w/';

export function getWikiUrl(title: string): string {
  const sanitizedTitle = encodeURIComponent(title.replace(/\s+/g, '_'));
  return `${WIKI_PAGE_BASE}${sanitizedTitle}`;
}

export async function searchWiki(query: string, limit: number = 8): Promise<WikiSearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const url = `${WIKI_API_BASE}?action=query&list=search&srsearch=${encodeURIComponent(trimmed)}&srlimit=${limit}&format=json&origin=*`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Wiki search failed with status ${response.status}`);
    }

    const data = await response.json();
    const searchItems = data?.query?.search || [];

    return searchItems.map((item: { title: string; snippet?: string }) => ({
      title: item.title,
      snippet: item.snippet ? item.snippet.replace(/<[^>]+>/g, '') : undefined,
      url: getWikiUrl(item.title),
    }));
  } catch {
    return [];
  }
}

export async function fetchWikiArticle(title: string): Promise<WikiArticleDetails | null> {
  const trimmed = title.trim();
  if (!trimmed) return null;

  const url = `${WIKI_API_BASE}?action=query&prop=extracts|pageimages&exintro=1&explaintext=1&piprop=thumbnail&pithumbsize=300&titles=${encodeURIComponent(trimmed)}&format=json&origin=*`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Wiki article fetch failed with status ${response.status}`);
    }

    const data = await response.json();
    const pages = data?.query?.pages;
    if (!pages) return null;

    const pageId = Object.keys(pages)[0];
    if (!pageId || pageId === '-1') return null;

    const page = pages[pageId];

    return {
      title: page.title,
      extract: page.extract || 'No article preview available.',
      thumbnailUrl: page.thumbnail?.source,
      canonicalUrl: getWikiUrl(page.title),
    };
  } catch {
    return {
      title: trimmed,
      extract: 'Could not load wiki summary at this moment. You can view the full article on the Warframe Wiki.',
      canonicalUrl: getWikiUrl(trimmed),
    };
  }
}

