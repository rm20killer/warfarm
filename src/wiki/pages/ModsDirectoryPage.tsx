import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllMods, DetailedModData, ModRarity, ModPolarity } from '../../shared/data/mod-database';
import { getAllLootMods, LootSourceItem } from '../../shared/data/loot-sources';
import { ItemThumbnail } from '../../shared/utils/item-images';

interface UnifiedModCard {
  id: string;
  name: string;
  type: string;
  category: string;
  polarity: string;
  rarity: string;
  maxRank: number;
  drain: number | string;
  description: string;
  sourceText?: string;
  vendorName?: string;
}

function getPolaritySymbol(polarity: string): string {
  const p = polarity.toLowerCase();
  if (p.includes('madurai')) return 'V';
  if (p.includes('vazarin')) return 'D';
  if (p.includes('naramon')) return '-';
  if (p.includes('zenurik')) return '=';
  if (p.includes('penjaga')) return 'Y';
  if (p.includes('umbra')) return 'U';
  return '⬡';
}

function getModRarityTheme(rarity: string) {
  const r = rarity.toLowerCase();
  if (r.includes('legendary') || r.includes('primed')) {
    return {
      borderColor: '#f5f5f5',
      frameGradient: 'linear-gradient(180deg, #3d3e52 0%, #171822 100%)',
      accentColor: '#ffffff',
      pipColor: '#ffffff',
      nameColor: '#ffffff',
    };
  }
  if (r.includes('rare')) {
    return {
      borderColor: '#d4af37',
      frameGradient: 'linear-gradient(180deg, #3d3214 0%, #171822 100%)',
      accentColor: '#ffd700',
      pipColor: '#ffd700',
      nameColor: '#ffd700',
    };
  }
  if (r.includes('uncommon')) {
    return {
      borderColor: '#9aaec4',
      frameGradient: 'linear-gradient(180deg, #222d3d 0%, #171822 100%)',
      accentColor: '#90caf9',
      pipColor: '#90caf9',
      nameColor: '#e0e8f8',
    };
  }
  // Common / Default
  return {
    borderColor: '#a67042',
    frameGradient: 'linear-gradient(180deg, #362215 0%, #171822 100%)',
    accentColor: '#d49b6a',
    pipColor: '#d49b6a',
    nameColor: '#eed8c4',
  };
}

function renderRankPips(maxRank: number, pipColor: string) {
  const safeCount = Math.min(10, Math.max(1, maxRank || 5));
  const pips = [];
  for (let i = 0; i < safeCount; i++) {
    pips.push(
      <span
        key={i}
        style={{
          width: 4,
          height: 4,
          borderRadius: '50%',
          backgroundColor: pipColor,
          boxShadow: `0 0 2px ${pipColor}`,
          display: 'inline-block',
        }}
      />
    );
  }
  return pips;
}

function renderReadableModDescription(text: string) {
  if (!text) return null;
  const regex = /([+-]?\d+(?:\.\d+)?%|[+-]?\d+(?:\.\d+)?s|[+-]?\d+(?:\.\d+)?m)/g;
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) => {
        if (regex.test(part)) {
          return (
            <span key={i} style={{ color: '#68d4ff', fontWeight: 700 }}>
              {part}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export function ModsDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedRarity, setSelectedRarity] = useState<string>('All');
  const [selectedPolarity, setSelectedPolarity] = useState<string>('All');
  const [visibleCount, setVisibleCount] = useState<number>(48);

  useEffect(() => {
    setVisibleCount(48);
  }, [searchQuery, selectedCategory, selectedRarity, selectedPolarity]);

  const detailedMods = useMemo(() => getAllMods(), []);
  const lootMods = useMemo(() => getAllLootMods(), []);

  // Build unified mod catalog
  const catalog = useMemo<UnifiedModCard[]>(() => {
    const list: UnifiedModCard[] = [];
    const seenNames = new Set<string>();

    // 1. Add detailed mods (with rank formulas and full vendor info)
    for (const m of detailedMods) {
      seenNames.add(m.name.toLowerCase());
      let cat = 'Warframe';
      const t = m.type.toLowerCase();
      if (t.includes('companion')) cat = 'Companion';
      else if (t.includes('aura')) cat = 'Aura';
      else if (t.includes('shotgun')) cat = 'Shotgun';
      else if (t.includes('rifle') || t.includes('primary')) cat = 'Primary';
      else if (t.includes('pistol') || t.includes('secondary')) cat = 'Pistol';
      else if (t.includes('melee')) cat = 'Melee';
      else if (t.includes('exilus')) cat = 'Exilus';

      let readableDesc = m.descriptionTemplate;
      try {
        const maxStats = m.statGrowth ? m.statGrowth(m.maxRank) : {};
        readableDesc = m.descriptionTemplate.replace(/\{(\w+)\}/g, (_, k) => maxStats[k] || '');
      } catch {
        readableDesc = m.descriptionTemplate.replace(/\{(\w+)\}/g, '');
      }

      list.push({
        id: m.id,
        name: m.name,
        type: m.type,
        category: cat,
        polarity: m.polarity,
        rarity: m.rarity,
        maxRank: m.maxRank,
        drain: `${m.baseCost} to ${m.baseCost + m.maxRank}`,
        description: readableDesc,
        sourceText: m.vendorSource
          ? `${m.vendorSource.vendorName} (${m.vendorSource.location})`
          : undefined,
        vendorName: m.vendorSource?.vendorName,
      });
    }

    // 2. Add loot source mods not already present
    for (const lm of lootMods) {
      if (seenNames.has(lm.name.toLowerCase())) continue;
      seenNames.add(lm.name.toLowerCase());

      let cat = 'Warframe';
      const st = (lm.subType || '').toLowerCase();
      if (st.includes('companion')) cat = 'Companion';
      else if (st.includes('melee')) cat = 'Melee';
      else if (st.includes('drift')) cat = 'Exilus';
      else if (st.includes('augment')) cat = 'Augment';

      list.push({
        id: lm.id,
        name: lm.name,
        type: lm.subType || 'Mod',
        category: cat,
        polarity: 'Universal',
        rarity: 'Rare',
        maxRank: 5,
        drain: '4 to 9',
        description: lm.description,
        sourceText: lm.bossOrEnemyName
          ? `${lm.bossOrEnemyName} (${lm.locationNode || lm.planet || 'Star Chart'})`
          : lm.generalDropInfo,
        vendorName: lm.bossOrEnemyName,
      });
    }

    return list;
  }, [detailedMods, lootMods]);

  const categories = ['All', 'Companion', 'Warframe', 'Aura', 'Primary', 'Shotgun', 'Melee', 'Exilus', 'Augment'];
  const rarities = ['All', 'Common', 'Uncommon', 'Rare', 'Legendary'];
  const polarities = ['All', 'Madurai', 'Vazarin', 'Naramon', 'Zenurik', 'Penjaga'];

  const filteredMods = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return catalog.filter((m) => {
      if (selectedCategory !== 'All' && m.category !== selectedCategory) return false;
      if (selectedRarity !== 'All' && m.rarity !== selectedRarity) return false;
      if (selectedPolarity !== 'All' && m.polarity !== selectedPolarity) return false;
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.type.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        (m.sourceText && m.sourceText.toLowerCase().includes(q))
      );
    });
  }, [catalog, searchQuery, selectedCategory, selectedRarity, selectedPolarity]);

  return (
    <div style={styles.container}>
      <style>{`
        .mod-card-link {
          text-decoration: none;
          color: inherit;
          cursor: pointer;
        }
        .mod-card-link:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.65);
        }
        .mod-card-link:focus-visible {
          outline: 2px solid #60cdff;
          outline-offset: 2px;
        }
      `}</style>
      {/* Standardized Header Banner */}
      <div style={styles.headerBanner}>
        <div>
          <h1 style={styles.mainTitle}>Warframe & Companion Codex Mods</h1>
          <p style={styles.subTitle}>
            Authentic Codex mod cards with polarity drains, upgrade progression, rank pips, and acquisition sources.
          </p>
        </div>
      </div>

      {/* Standardized Search & Filter Section */}
      <section style={styles.panelSection}>
        <div style={styles.searchBar}>
          <input
            type="text"
            placeholder="Search mods by name, effect, polarity, or source (e.g. Contagious Bond, Son, Status, Drift)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
            aria-label="Search mods"
          />
        </div>

        {/* Category Filter */}
        <div style={styles.filterSection}>
          <span style={styles.filterLabel}>Category:</span>
          <div style={styles.filterPills}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  ...styles.filterPill,
                  backgroundColor: selectedCategory === cat ? '#2e3856' : '#141620',
                  borderColor: selectedCategory === cat ? '#ffd70088' : '#252a3d',
                  color: selectedCategory === cat ? '#ffd700' : '#888ca8',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Rarity & Polarity Filters */}
        <div style={styles.filterRowDouble}>
          <div style={styles.filterSection}>
            <span style={styles.filterLabel}>Rarity:</span>
            <div style={styles.filterPills}>
              {rarities.map((r) => (
                <button
                  key={r}
                  onClick={() => setSelectedRarity(r)}
                  style={{
                    ...styles.filterPill,
                    backgroundColor: selectedRarity === r ? '#2e3856' : '#141620',
                    borderColor: selectedRarity === r ? '#ffd70088' : '#252a3d',
                    color: selectedRarity === r ? '#ffd700' : '#888ca8',
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.filterSection}>
            <span style={styles.filterLabel}>Polarity:</span>
            <div style={styles.filterPills}>
              {polarities.map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPolarity(p)}
                  style={{
                    ...styles.filterPill,
                    backgroundColor: selectedPolarity === p ? '#2e3856' : '#141620',
                    borderColor: selectedPolarity === p ? '#ffd70088' : '#252a3d',
                    color: selectedPolarity === p ? '#ffd700' : '#888ca8',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div style={styles.resultsMeta}>
        <span>
          Showing {Math.min(visibleCount, filteredMods.length)} of {filteredMods.length} mods
        </span>
      </div>

      {/* Grid of In-Game Styled Mod Cards */}
      <main style={styles.modsGrid}>
        {filteredMods.length === 0 ? (
          <div style={styles.emptyNotice}>No mods matched your search and filter criteria.</div>
        ) : (
          filteredMods.slice(0, visibleCount).map((mod) => {
            const theme = getModRarityTheme(mod.rarity);
            const drainValue = typeof mod.drain === 'string' ? mod.drain.split(' ')[0] : mod.drain;

            return (
              <Link
                key={mod.id}
                to={`/item/${encodeURIComponent(mod.name)}`}
                style={{
                  ...styles.modCardInGame,
                  borderColor: theme.borderColor,
                }}
                className="mod-card-link"
                title={`Inspect stats, builds, and acquisition for ${mod.name}`}
              >
                {/* 1. In-Game Card Top Arc & Header: Drain, Polarity, Rarity */}
                <div style={{ ...styles.modCardTopArc, background: theme.frameGradient }}>
                  <div style={styles.drainPolarityBadge}>
                    <span style={styles.drainNumber}>{drainValue || '9'}</span>
                    <span
                      style={styles.polarityGlyph}
                      title={`Polarity: ${mod.polarity}`}
                    >
                      {getPolaritySymbol(mod.polarity)}
                    </span>
                  </div>
                  <span
                    style={{
                      ...styles.inGameRarityBadge,
                      color: theme.accentColor,
                      borderColor: `${theme.borderColor}55`,
                    }}
                  >
                    {mod.rarity}
                  </span>
                </div>

                {/* 2. Artwork Frame */}
                <div style={styles.artworkContainer}>
                  <ItemThumbnail name={mod.name} size={50} />
                </div>

                {/* 3. Mod Name Banner */}
                <div style={styles.modNameBanner}>
                  <span
                    style={{
                      ...styles.inGameModTitle,
                      color: theme.nameColor,
                    }}
                    title={mod.name}
                  >
                    {mod.name}
                  </span>
                </div>

                {/* 4. Compatibility Bar */}
                <div style={styles.compatibilityBar}>
                  <span style={styles.compatibilityText}>
                    {mod.category.toUpperCase()}
                  </span>
                </div>

                {/* 5. Stat / Description Box */}
                <div style={styles.statDescriptionBox}>
                  <p style={styles.statDescriptionText}>
                    {renderReadableModDescription(mod.description)}
                  </p>
                </div>

                {/* 6. Acquisition / Source Line */}
                {mod.sourceText ? (
                  <div style={styles.sourceRowCompact}>
                    <span style={styles.sourceLabelCompact}>Drop / Vendor:</span>
                    <span style={styles.sourceValCompact} title={mod.sourceText}>
                      {mod.sourceText}
                    </span>
                  </div>
                ) : (
                  <div style={styles.sourceRowCompact}>
                    <span style={styles.sourceLabelCompact}>Source:</span>
                    <span style={styles.sourceValCompact}>Star Chart / Codex</span>
                  </div>
                )}

                {/* 7. Bottom In-Game Rank Pips Row & Inspect Action */}
                <div style={styles.rankPipsFooter}>
                  <div
                    style={styles.pipsRow}
                    title={`Max Rank: ${mod.maxRank}`}
                  >
                    {renderRankPips(mod.maxRank, theme.pipColor)}
                  </div>
                  <span
                    style={styles.cardInspectBtn}
                    title={`Inspect stats and acquisition for ${mod.name}`}
                  >
                    Inspect
                  </span>
                </div>
              </Link>
            );
          })
        )}
      </main>

      {visibleCount < filteredMods.length && (
        <div style={styles.paginationArea}>
          <button
            onClick={() => setVisibleCount((prev) => prev + 48)}
            style={styles.loadMoreBtn}
          >
            Load Next 48 Mods ({filteredMods.length - visibleCount} remaining)
          </button>
          <button
            onClick={() => setVisibleCount(filteredMods.length)}
            style={styles.loadAllBtn}
          >
            Show All ({filteredMods.length})
          </button>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 1040,
    margin: '0 auto',
    padding: '16px 18px 60px 18px',
  },
  headerBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#151722',
    border: '1px solid #232738',
    borderRadius: 8,
    padding: '16px 20px',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 16,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: '#f0f0f8',
    margin: 0,
  },
  subTitle: {
    fontSize: 13,
    color: '#888ca8',
    margin: '4px 0 0 0',
  },
  panelSection: {
    backgroundColor: '#12141d',
    border: '1px solid #1f2334',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  searchBar: {
    marginBottom: 14,
  },
  searchInput: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '10px 14px',
    background: '#0e0e12',
    border: '1px solid #282f48',
    borderRadius: 6,
    color: '#f0f0f8',
    fontSize: 13,
    outline: 'none',
  },
  filterSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  filterRowDouble: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 20,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: '#888ca8',
    textTransform: 'uppercase',
  },
  filterPills: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  },
  filterPill: {
    padding: '6px 12px',
    border: '1px solid',
    borderRadius: 4,
    fontSize: 11.5,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: 32,
  },
  resultsMeta: {
    fontSize: 12,
    color: '#888ca8',
    marginBottom: 14,
  },
  modsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(185px, 1fr))',
    gap: 14,
  },
  emptyNotice: {
    gridColumn: '1 / -1',
    fontSize: 13,
    color: '#888ca8',
    padding: 24,
    textAlign: 'center',
    backgroundColor: '#141620',
    borderRadius: 6,
  },
  /* In-Game Warframe Mod Card Styling */
  modCardInGame: {
    background: '#141520',
    border: '1.5px solid',
    borderRadius: 6,
    height: 335,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    overflow: 'hidden',
    position: 'relative',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    textDecoration: 'none',
    color: 'inherit',
    cursor: 'pointer',
  },
  modCardTopArc: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '4px 6px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  drainPolarityBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    padding: '1px 5px',
    borderRadius: 4,
    border: '1px solid rgba(255, 255, 255, 0.12)',
  },
  drainNumber: {
    fontSize: 10,
    fontWeight: 700,
    color: '#f0f0f8',
  },
  polarityGlyph: {
    fontSize: 10,
    fontWeight: 700,
    color: '#ffd700',
    fontFamily: 'monospace',
  },
  inGameRarityBadge: {
    fontSize: 8.5,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    padding: '1px 4px',
    borderRadius: 4,
    border: '1px solid',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  artworkContainer: {
    height: 64,
    backgroundColor: '#0c0d14',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    padding: 2,
  },
  modNameBanner: {
    padding: '3px 4px 1px 4px',
    textAlign: 'center',
    backgroundColor: '#161826',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  inGameModTitle: {
    fontSize: 10.5,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    textDecoration: 'none',
    display: 'block',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  compatibilityBar: {
    textAlign: 'center',
    padding: '1px 4px',
    backgroundColor: '#11121c',
  },
  compatibilityText: {
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: '0.1em',
    color: '#888ca8',
  },
  statDescriptionBox: {
    padding: '6px 8px',
    minHeight: 65,
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  statDescriptionText: {
    fontSize: 11.5,
    color: '#e4e8fa',
    lineHeight: 1.45,
    margin: 0,
  },
  sourceRowCompact: {
    padding: '2px 6px',
    backgroundColor: '#11131c',
    borderTop: '1px solid #1a1c2a',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 8.5,
  },
  sourceLabelCompact: {
    color: '#888ca8',
    fontWeight: 600,
    textTransform: 'uppercase',
    fontSize: 8,
  },
  sourceValCompact: {
    color: '#ffd700',
    fontWeight: 500,
    maxWidth: 80,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  rankPipsFooter: {
    padding: '3px 6px',
    backgroundColor: '#0e1018',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pipsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
  },
  cardInspectBtn: {
    fontSize: 9.5,
    fontWeight: 600,
    color: '#8e9ec4',
    textDecoration: 'none',
    padding: '1px 5px',
    borderRadius: 4,
    backgroundColor: '#171a28',
    border: '1px solid #282f48',
  },
  paginationArea: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginTop: 28,
    marginBottom: 40,
    flexWrap: 'wrap',
  },
  loadMoreBtn: {
    padding: '8px 16px',
    background: '#282d42',
    border: '1px solid #3d4566',
    borderRadius: 6,
    color: '#f0f0f8',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  loadAllBtn: {
    padding: '8px 14px',
    background: '#141620',
    border: '1px solid #232738',
    borderRadius: 6,
    color: '#888ca8',
    fontSize: 12,
    cursor: 'pointer',
  },
};


