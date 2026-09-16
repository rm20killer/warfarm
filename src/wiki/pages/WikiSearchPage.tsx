import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchWiki, WikiSearchResult } from '../../shared/api/wiki-client';
import { RESOURCE_GUIDES } from '../../shared/data/resource-guide';
import { getVisitHistory, clearVisitHistory, PageVisitHistory } from '../storage';
import { findSimilarItems } from '../../shared/utils/fuzzy-search';
import { ItemThumbnail } from '../../shared/utils/item-images';
import { usePageMeta } from '../../shared/utils/usePageMeta';
import { getRandomLookups } from '../utils/search-lookups';
import { theme } from '../styles/theme';

export function WikiSearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<WikiSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(true);
  const [quickLookups, setQuickLookups] = useState<string[]>(() => getRandomLookups(8));
  const [history, setHistory] = useState<PageVisitHistory[]>(getVisitHistory);

  usePageMeta({
    title: 'Warframe Codex & Item Search - Warfarm Tracker',
    description: 'Search items, weapons, warframes, mods, arcanes, and relics with drop tables and farming locations.',
    canonicalPath: '/',
  });

  useEffect(() => {
    const updateHistory = () => setHistory(getVisitHistory());
    window.addEventListener('wiki-history-updated', updateHistory);
    return () => window.removeEventListener('wiki-history-updated', updateHistory);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    // Fast local fuzzy search from static catalogs
    const localSuggestions = findSimilarItems(trimmed, 8);
    const localItems: WikiSearchResult[] = localSuggestions.map((s) => ({
      title: s.name,
      snippet: `${s.category}${s.subType ? ` · ${s.subType}` : ''}`,
      url: s.path,
    }));

    setResults(localItems);
    setShowDropdown(true);

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const onlineResults = await searchWiki(trimmed, 8);

      const seen = new Set<string>();
      const merged: WikiSearchResult[] = [];

      for (const item of localItems) {
        const key = item.title.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          merged.push(item);
        }
      }

      for (const item of onlineResults) {
        const key = item.title.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          merged.push(item);
        }
      }

      setResults(merged.slice(0, 10));
      setIsSearching(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (title: string) => {
    setShowDropdown(false);
    navigate(`/item/${encodeURIComponent(title)}`);
  };

  const handleShuffle = () => {
    setQuickLookups(getRandomLookups(8));
  };

  return (
    <div className="page-container-responsive" style={styles.container}>
      <header style={styles.heroSection}>
        <h1 style={styles.heroTitle}>Warframe Codex & Item Search</h1>
        <p style={styles.heroSubtitle}>
          Search items, consult official wiki data, and discover optimal farming locations across the Star Chart.
        </p>

        <div style={styles.searchWrapper}>
          <input
            type="text"
            placeholder="Search items, resources, warframes, relics (e.g. A12, Tellurium, Rhino Prime)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => {
              if (results.length > 0) setShowDropdown(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim()) {
                if (results.length > 0) {
                  handleSelect(results[0].title);
                } else {
                  handleSelect(query.trim());
                }
              } else if (e.key === 'Escape') {
                setShowDropdown(false);
              }
            }}
            style={styles.searchInput}
            aria-label="Search personal wiki"
            autoFocus
          />
          {isSearching && <span style={styles.searchIndicator}>Searching...</span>}

          {showDropdown && results.length > 0 && (
            <>
              <div
                style={styles.dropdownBackdrop}
                onClick={() => setShowDropdown(false)}
              />
              <div style={styles.autocompleteBox}>
                {results.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => handleSelect(item.title)}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = theme.colors.bgCardHover;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                    }}
                    style={styles.autocompleteRow}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
                      <ItemThumbnail name={item.title} size={32} />
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
                        <span style={styles.itemTitle}>{item.title}</span>
                        {item.snippet && <span style={styles.itemSnippet}>{item.snippet}</span>}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {history.length > 0 && (
          <div style={styles.historyContainer}>
            <div style={styles.historyHeader}>
              <span style={styles.historyLabel}>
                Recently Visited:
              </span>
              <button
                type="button"
                onClick={() => clearVisitHistory()}
                style={styles.clearHistoryBtn}
              >
                Clear History
              </button>
            </div>
            <div style={styles.historyList}>
              {history.slice(0, 10).map((h) => (
                <button
                  key={h.path}
                  onClick={() => navigate(h.path)}
                  style={styles.historyButton}
                  title={`Go back to ${h.title}`}
                >
                  {h.category && (
                    <span style={styles.historyCatBadge}>
                      {h.category}
                    </span>
                  )}
                  <span>{h.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={styles.quickTags}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={styles.quickTagLabel}>Quick lookups:</span>
            <button
              type="button"
              onClick={handleShuffle}
              style={styles.shuffleButton}
              title="Randomize quick lookups"
              aria-label="Randomize quick lookups"
            >
              Randomize
            </button>
          </div>
          {quickLookups.map((tag) => (
            <button
              key={tag}
              onClick={() => handleSelect(tag)}
              style={styles.tagButton}
            >
              {tag}
            </button>
          ))}
        </div>

        <div style={{ ...styles.quickTags, marginTop: 8 }}>
          <span style={styles.quickTagLabel}>Hubs & Lineages:</span>
          <button
            onClick={() => navigate('/arcanes')}
            style={{ ...styles.tagButton, borderColor: theme.colors.goldBorder, color: theme.colors.gold }}
          >
            Arcanes (172)
          </button>
          <button
            onClick={() => navigate('/gear?tab=Weapons&lineage=Incarnon')}
            style={{ ...styles.tagButton, borderColor: theme.colors.purpleBorder, color: theme.colors.purpleLight }}
          >
            Incarnon Weapons
          </button>
          <button
            onClick={() => navigate('/gear?tab=Weapons&lineage=Coda')}
            style={{ ...styles.tagButton, borderColor: '#782637', color: '#ffb3c0' }}
          >
            Coda Weapons
          </button>
          <button
            onClick={() => navigate('/gear?tab=Weapons&lineage=Tenet')}
            style={{ ...styles.tagButton, borderColor: '#235178', color: '#8ecbfc' }}
          >
            Tenet Weapons
          </button>
          <button
            onClick={() => navigate('/gear?tab=Weapons&lineage=Kuva')}
            style={{ ...styles.tagButton, borderColor: '#782828', color: '#ff9e9e' }}
          >
            Kuva Weapons
          </button>
        </div>
      </header>

      <section style={styles.featuredSection}>
        <h2 style={styles.sectionHeader}>Key Farming Resources</h2>
        <div className="card-grid-responsive" style={styles.resourceGrid}>
          {RESOURCE_GUIDES.slice(0, 6).map((resource) => (
            <div
              key={resource.id}
              onClick={() => handleSelect(resource.name)}
              style={styles.resourceCard}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleSelect(resource.name)}
            >
              <div style={styles.cardTop}>
                <span style={styles.cardName}>{resource.name}</span>
                <span style={styles.categoryBadge}>{resource.category}</span>
              </div>
              <p style={styles.cardDesc}>{resource.description}</p>
              <div style={styles.topNodeBox}>
                <span style={styles.topNodeLabel}>Best Node:</span>
                <span style={styles.topNodeValue}>
                  {resource.optimalNodes[0]?.node} ({resource.optimalNodes[0]?.planet})
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '24px 20px 60px 20px',
    maxWidth: 960,
    margin: '0 auto',
    color: theme.colors.textPrimary,
  },
  heroSection: {
    marginBottom: 40,
    textAlign: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 700,
    color: theme.colors.textHighlight,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    maxWidth: 620,
    margin: '0 auto 24px',
    lineHeight: 1.5,
  },
  searchWrapper: {
    position: 'relative',
    maxWidth: 640,
    margin: '0 auto',
    zIndex: 30,
  },
  dropdownBackdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 40,
  },
  searchInput: {
    width: '100%',
    padding: '14px 20px',
    fontSize: 15,
    borderRadius: theme.radii.md,
    border: `1px solid ${theme.colors.borderDefault}`,
    background: theme.colors.bgInput,
    color: theme.colors.textHighlight,
    outline: 'none',
    boxSizing: 'border-box',
    position: 'relative',
    zIndex: 45,
  },
  searchIndicator: {
    position: 'absolute',
    right: 16,
    top: 16,
    fontSize: 12,
    color: theme.colors.textMuted,
    zIndex: 46,
  },
  autocompleteBox: {
    position: 'absolute',
    top: 'calc(100% + 6px)',
    left: 0,
    right: 0,
    background: theme.colors.bgCard,
    border: `1px solid ${theme.colors.borderStrong}`,
    borderRadius: theme.radii.md,
    boxShadow: theme.shadows.lg,
    maxHeight: 420,
    overflowY: 'auto',
    textAlign: 'left',
    zIndex: 50,
  },
  autocompleteRow: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    padding: '10px 16px',
    border: 'none',
    background: 'none',
    borderBottom: `1px solid ${theme.colors.borderSubtle}`,
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background-color 0.15s ease',
  },
  itemTitle: {
    color: theme.colors.textHighlight,
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 2,
  },
  itemSnippet: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    lineHeight: 1.3,
  },
  quickTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  quickTagLabel: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: 600,
  },
  shuffleButton: {
    background: theme.colors.accentBg,
    border: `1px solid ${theme.colors.accentBorder}`,
    borderRadius: theme.radii.sm,
    color: theme.colors.accent,
    padding: '2px 8px',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  tagButton: {
    background: theme.colors.bgCard,
    border: `1px solid ${theme.colors.borderDefault}`,
    borderRadius: theme.radii.sm,
    color: theme.colors.textSecondary,
    padding: '4px 10px',
    fontSize: 12,
    cursor: 'pointer',
  },
  historyContainer: {
    maxWidth: 640,
    margin: '16px auto 0',
    padding: '12px 16px',
    background: theme.colors.bgCard,
    border: `1px solid ${theme.colors.borderStrong}`,
    borderRadius: theme.radii.md,
    textAlign: 'left',
  },
  historyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyLabel: {
    fontSize: 12,
    color: theme.colors.accent,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  clearHistoryBtn: {
    fontSize: 11,
    color: theme.colors.textMuted,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '2px 4px',
    textDecoration: 'underline',
  },
  historyList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  },
  historyButton: {
    background: theme.colors.bgCardElevated,
    border: `1px solid ${theme.colors.borderDefault}`,
    borderRadius: theme.radii.sm,
    color: theme.colors.textPrimary,
    padding: '4px 10px',
    fontSize: 12,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    transition: 'all 0.15s ease',
  },
  historyCatBadge: {
    fontSize: 10,
    color: theme.colors.accent,
    backgroundColor: theme.colors.accentBg,
    padding: '1px 5px',
    borderRadius: 3,
    fontWeight: 600,
    textTransform: 'uppercase',
  },
  featuredSection: {
    marginTop: 32,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 600,
    color: theme.colors.textHighlight,
    marginBottom: 16,
  },
  resourceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 16,
  },
  resourceCard: {
    background: theme.colors.bgCard,
    border: `1px solid ${theme.colors.borderDefault}`,
    borderRadius: theme.radii.lg,
    padding: 16,
    cursor: 'pointer',
    transition: 'border-color 0.15s, transform 0.15s',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardName: {
    fontSize: 15,
    fontWeight: 600,
    color: theme.colors.textHighlight,
  },
  categoryBadge: {
    fontSize: 11,
    padding: '2px 6px',
    background: theme.colors.bgCardElevated,
    color: theme.colors.textSecondary,
    borderRadius: theme.radii.sm,
  },
  cardDesc: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 1.4,
    marginBottom: 12,
  },
  topNodeBox: {
    display: 'flex',
    justifyContent: 'space-between',
    background: theme.colors.bgInput,
    padding: '6px 10px',
    borderRadius: theme.radii.sm,
    fontSize: 12,
  },
  topNodeLabel: {
    color: theme.colors.textMuted,
  },
  topNodeValue: {
    color: theme.colors.green,
    fontWeight: 500,
  },
};
