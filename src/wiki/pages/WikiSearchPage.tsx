import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchWiki, WikiSearchResult } from '../../shared/api/wiki-client';
import { RESOURCE_GUIDES } from '../../shared/data/resource-guide';
import { getVisitHistory, clearVisitHistory, PageVisitHistory } from '../storage';

const LOOKUP_POOL = [
  // User's core items
  'Argon Crystal',
  'Orokin Cell',
  'Tellurium',
  'Plastids',
  'Meso N15 Relic',
  'Axi A17 Relic',
  'Wisp Prime',
  'Toroid',
  // Popular Warframes & Primes
  'Rhino Prime',
  'Saryn Prime',
  'Volt Prime',
  'Mesa Prime',
  'Dante',
  'Kullervo',
  'Protea Prime',
  // Top Weapons & Incarnons
  'Torid',
  'Burston Prime',
  'Dual Toxocyst',
  'Laetum',
  'Praedos',
  'Kuva Bramma',
  'Tenet Arca Plasmor',
  'Coda Caustacyst',
  // Top Arcanes
  'Arcane Energize',
  'Arcane Avenger',
  'Secondary Merciless',
  'Molt Augmented',
  'Melee Duplicate',
  'Melee Exposure',
  // Key Resources & Components
  'Pathos Clamp',
  'Entrati Lanthorn',
  'Lua Thrax Plasm',
  'Nitain Extract',
  'Cryotic',
  'Oxium',
  'Morphics',
  'Neural Sensors',
  'Control Module',
];

export function getRandomLookups(count = 8): string[] {
  const poolCopy = [...LOOKUP_POOL];
  for (let i = poolCopy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [poolCopy[i], poolCopy[j]] = [poolCopy[j], poolCopy[i]];
  }
  return poolCopy.slice(0, count);
}

export function WikiSearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<WikiSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [quickLookups, setQuickLookups] = useState<string[]>(() => getRandomLookups(8));
  const [history, setHistory] = useState<PageVisitHistory[]>(getVisitHistory);

  useEffect(() => {
    const syncHistory = () => setHistory(getVisitHistory());
    syncHistory();
    window.addEventListener('wiki-history-updated', syncHistory);
    return () => window.removeEventListener('wiki-history-updated', syncHistory);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const res = await searchWiki(query, 8);
      setResults(res);
      setIsSearching(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (title: string) => {
    navigate(`/item/${encodeURIComponent(title)}`);
  };

  const handleShuffle = () => {
    setQuickLookups(getRandomLookups(8));
  };

  return (
    <div style={styles.container}>
      <header style={styles.heroSection}>
        <h1 style={styles.heroTitle}>Warframe Personal Wiki</h1>
        <p style={styles.heroSubtitle}>
          Search items, consult official wiki data, and discover optimal farming locations across the Star Chart.
        </p>

        <div style={styles.searchWrapper}>
          <input
            type="text"
            placeholder="Search items, resources, warframes, relics (e.g. Argon Crystal)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={styles.searchInput}
            aria-label="Search personal wiki"
            autoFocus
          />
          {isSearching && <span style={styles.searchIndicator}>Searching...</span>}
        </div>

        {results.length > 0 && (
          <div style={styles.autocompleteBox}>
            {results.map((item) => (
              <button
                key={item.title}
                onClick={() => handleSelect(item.title)}
                style={styles.autocompleteRow}
              >
                <span style={styles.itemTitle}>{item.title}</span>
                {item.snippet && <span style={styles.itemSnippet}>{item.snippet}</span>}
              </button>
            ))}
          </div>
        )}

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
            style={{ ...styles.tagButton, borderColor: '#d4af37', color: '#ffd700' }}
          >
            Arcanes (172)
          </button>
          <button
            onClick={() => navigate('/gear?tab=Weapons&lineage=Incarnon')}
            style={{ ...styles.tagButton, borderColor: '#58338a', color: '#dca8ff' }}
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
        <h2 style={styles.sectionHeader}>Rare Resource Quick Access</h2>
        <div style={styles.resourceGrid}>
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
    padding: '16px 18px 60px 18px',
    maxWidth: 1040,
    margin: '0 auto',
  },
  heroSection: {
    marginBottom: 40,
    textAlign: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 700,
    color: '#e8e8ee',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#8c8ca0',
    maxWidth: 620,
    margin: '0 auto 24px',
    lineHeight: 1.5,
  },
  searchWrapper: {
    position: 'relative',
    maxWidth: 640,
    margin: '0 auto',
  },
  searchInput: {
    width: '100%',
    padding: '14px 20px',
    fontSize: 15,
    borderRadius: 6,
    border: '1px solid #2a2a38',
    background: '#12121a',
    color: '#f0f0f4',
    outline: 'none',
    boxSizing: 'border-box',
  },
  searchIndicator: {
    position: 'absolute',
    right: 16,
    top: 16,
    fontSize: 12,
    color: '#8a8aa0',
  },
  autocompleteBox: {
    maxWidth: 640,
    margin: '6px auto 0',
    background: '#12121a',
    border: '1px solid #252535',
    borderRadius: 6,
    overflow: 'hidden',
    textAlign: 'left',
  },
  autocompleteRow: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    padding: '10px 16px',
    border: 'none',
    background: 'none',
    borderBottom: '1px solid #1c1c28',
    cursor: 'pointer',
    textAlign: 'left',
  },
  itemTitle: {
    color: '#dcdce8',
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 2,
  },
  itemSnippet: {
    color: '#7a7a90',
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
    color: '#8e9ec4',
    fontSize: 12,
    fontWeight: 600,
  },
  shuffleButton: {
    background: '#162238',
    border: '1px solid #28446c',
    borderRadius: 4,
    color: '#68d4ff',
    padding: '2px 8px',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  tagButton: {
    background: '#181824',
    border: '1px solid #262638',
    borderRadius: 4,
    color: '#b0b0c4',
    padding: '4px 10px',
    fontSize: 12,
    cursor: 'pointer',
  },
  historyContainer: {
    maxWidth: 640,
    margin: '16px auto 0',
    padding: '12px 16px',
    background: '#131520',
    border: '1px solid #232840',
    borderRadius: 6,
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
    color: '#8ec4c4',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  clearHistoryBtn: {
    fontSize: 11,
    color: '#8888a4',
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
    background: '#1a1d2e',
    border: '1px solid #2d334e',
    borderRadius: 4,
    color: '#d0d4e8',
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
    color: '#68d4ff',
    backgroundColor: '#102030',
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
    color: '#dcdce8',
    marginBottom: 16,
  },
  resourceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 16,
  },
  resourceCard: {
    background: '#12141d',
    border: '1px solid #1f2334',
    borderRadius: 8,
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
    color: '#e4e4ee',
  },
  categoryBadge: {
    fontSize: 11,
    padding: '2px 6px',
    background: '#222232',
    color: '#9090b0',
    borderRadius: 3,
  },
  cardDesc: {
    fontSize: 12,
    color: '#7c7c90',
    lineHeight: 1.4,
    marginBottom: 12,
  },
  topNodeBox: {
    display: 'flex',
    justifyContent: 'space-between',
    background: '#181824',
    padding: '6px 10px',
    borderRadius: 4,
    fontSize: 12,
  },
  topNodeLabel: {
    color: '#7a7a90',
  },
  topNodeValue: {
    color: '#8ec48e',
    fontWeight: 500,
  },
};

