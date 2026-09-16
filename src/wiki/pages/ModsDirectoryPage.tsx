import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllMods, DetailedModData, ModRarity, ModPolarity } from '../../shared/data/mod-database';
import { getAllLootMods, LootSourceItem } from '../../shared/data/loot-sources';
import { ItemThumbnail } from '../../shared/utils/item-images';
import { usePageMeta } from '../../shared/utils/usePageMeta';
import { theme } from '../styles/theme';
import { directoryStyles } from '../styles/directoryPageStyles';
import { formatWarframeText } from '../utils/format-text';


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
      borderColor: theme.colors.rarityLegendaryBorder,
      frameGradient: `linear-gradient(180deg, ${theme.colors.rarityLegendaryBg} 0%, ${theme.colors.bgApp} 100%)`,
      accentColor: theme.colors.rarityLegendary,
      pipColor: theme.colors.rarityLegendary,
      nameColor: theme.colors.textHighlight,
    };
  }
  if (r.includes('rare')) {
    return {
      borderColor: theme.colors.rarityRareBorder,
      frameGradient: `linear-gradient(180deg, ${theme.colors.rarityRareBg} 0%, ${theme.colors.bgApp} 100%)`,
      accentColor: theme.colors.rarityRare,
      pipColor: theme.colors.rarityRare,
      nameColor: theme.colors.rarityRare,
    };
  }
  if (r.includes('uncommon')) {
    return {
      borderColor: theme.colors.rarityUncommonBorder,
      frameGradient: `linear-gradient(180deg, ${theme.colors.rarityUncommonBg} 0%, ${theme.colors.bgApp} 100%)`,
      accentColor: theme.colors.rarityUncommon,
      pipColor: theme.colors.rarityUncommon,
      nameColor: theme.colors.textPrimary,
    };
  }
  // Common / Default
  return {
    borderColor: theme.colors.rarityCommonBorder,
    frameGradient: `linear-gradient(180deg, ${theme.colors.rarityCommonBg} 0%, ${theme.colors.bgApp} 100%)`,
    accentColor: theme.colors.rarityCommon,
    pipColor: theme.colors.rarityCommon,
    nameColor: theme.colors.textPrimary,
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
  return formatWarframeText(text);
}

export function ModsDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedRarity, setSelectedRarity] = useState<string>('All');
  const [selectedPolarity, setSelectedPolarity] = useState<string>('All');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [visibleCount, setVisibleCount] = useState<number>(48);

  const [sortParam, setSortParam] = useState<'name_asc' | 'name_desc' | 'rarity_high' | 'drain_desc' | 'drain_asc'>('name_asc');

  const activeFilterCount =
    (selectedCategory !== 'All' ? 1 : 0) +
    (selectedRarity !== 'All' ? 1 : 0) +
    (selectedPolarity !== 'All' ? 1 : 0) +
    (sortParam !== 'name_asc' ? 1 : 0);

  usePageMeta({
    title: 'Warframe Mods Database, Drops & Polarities',
    description: 'Browse 1,800+ Warframe mods, Primed mods, Galvanized mods, Archon mods, and augment mods with drain stats and drop sources.',
    keywords: 'warframe mods, primed mods, galvanized mods, augment mods, archon mods, mod drop locations, polarity',
    canonicalPath: '/mods',
  });

  useEffect(() => {
    setVisibleCount(48);
  }, [searchQuery, selectedCategory, selectedRarity, selectedPolarity, sortParam]);

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
        // fallback
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

    // 2. Add loot mods not already covered
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
    const result = catalog.filter((m) => {
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

    return [...result].sort((a, b) => {
      if (sortParam === 'name_desc') return b.name.localeCompare(a.name);
      if (sortParam === 'rarity_high') {
        const weight: Record<string, number> = { Legendary: 4, Rare: 3, Uncommon: 2, Common: 1 };
        const diff = (weight[b.rarity] || 0) - (weight[a.rarity] || 0);
        return diff !== 0 ? diff : a.name.localeCompare(b.name);
      }
      if (sortParam === 'drain_desc') {
        const dA = typeof a.drain === 'number' ? a.drain : parseInt(String(a.drain), 10) || 0;
        const dB = typeof b.drain === 'number' ? b.drain : parseInt(String(b.drain), 10) || 0;
        const diff = dB - dA;
        return diff !== 0 ? diff : a.name.localeCompare(b.name);
      }
      if (sortParam === 'drain_asc') {
        const dA = typeof a.drain === 'number' ? a.drain : parseInt(String(a.drain), 10) || 0;
        const dB = typeof b.drain === 'number' ? b.drain : parseInt(String(b.drain), 10) || 0;
        const diff = dA - dB;
        return diff !== 0 ? diff : a.name.localeCompare(b.name);
      }
      return a.name.localeCompare(b.name);
    });
  }, [catalog, searchQuery, selectedCategory, selectedRarity, selectedPolarity, sortParam]);

  return (
    <div className="page-container-responsive" style={styles.container}>
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
        @media (max-width: 600px) {
          .mods-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)) !important;
            gap: 10px !important;
          }
        }
      `}</style>
      {/* Standardized Header Banner */}
      <header style={styles.header}>
        <h1 style={styles.title}>Warframe & Companion Codex Mods</h1>
        <p style={styles.subtitle}>
          Browse all {catalog.length} Codex mod cards with polarity drains, upgrade progression, rank pips, and acquisition sources.
        </p>
      </header>

      {/* Search Controls */}
      <div style={styles.searchControlsRow}>
        <div style={styles.searchBarWrapper}>
          <input
            type="text"
            placeholder="Search mods by name, effect, polarity, or source (e.g. Contagious Bond, Son, Status, Drift)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
            aria-label="Search mods"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={styles.clearSearchBtn}
              aria-label="Clear search"
            >
              Clear
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowFilters((prev) => !prev)}
          style={{
            ...styles.filterToggleBtn,
            backgroundColor: showFilters || activeFilterCount > 0 ? theme.colors.accentBg : theme.colors.bgInput,
            borderColor: showFilters || activeFilterCount > 0 ? theme.colors.accentBorder : theme.colors.borderDefault,
            color: showFilters || activeFilterCount > 0 ? theme.colors.textHighlight : theme.colors.textSecondary,
          }}
          aria-expanded={showFilters}
        >
          <span style={{ fontSize: 13 }}>⚙</span>
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span style={styles.filterCountBadge}>{activeFilterCount}</span>
          )}
          <span style={{ fontSize: 10, color: theme.colors.textMuted }}>
            {showFilters ? '▲' : '▼'}
          </span>
        </button>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('All');
              setSelectedRarity('All');
              setSelectedPolarity('All');
              setSortParam('name_asc');
            }}
            style={styles.resetFiltersQuickBtn}
          >
            Reset
          </button>
        )}
      </div>

      {/* Collapsible Filter Drawer */}
      {showFilters && (
        <div style={styles.filterDrawerCard}>
          <div style={styles.filterDrawerHeader}>
            <span style={styles.filterDrawerTitle}>Filter Mod Catalog</span>
          </div>

          {/* Category Filter */}
          <div style={styles.filterGroup}>
            <span style={styles.filterLabel}>Category:</span>
            <div style={styles.filterPills}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    ...styles.filterPill,
                    ...(selectedCategory === cat ? styles.filterPillActive : {}),
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Rarity & Polarity Filters */}
          <div style={styles.filterRowDouble}>
            <div style={styles.filterGroup}>
              <span style={styles.filterLabel}>Rarity:</span>
              <div style={styles.filterPills}>
                {rarities.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSelectedRarity(r)}
                    style={{
                      ...styles.filterPill,
                      ...(selectedRarity === r ? styles.filterPillActive : {}),
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.filterGroup}>
              <span style={styles.filterLabel}>Polarity:</span>
              <div style={styles.filterPills}>
                {polarities.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSelectedPolarity(p)}
                    style={{
                      ...styles.filterPill,
                      ...(selectedPolarity === p ? styles.filterPillActive : {}),
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sort Control */}
          <div style={styles.secondaryFilterRow}>
            <div style={styles.sortWrapper}>
              <label htmlFor="mod-sort-select" style={styles.sortLabel}>
                Sort:
              </label>
              <select
                id="mod-sort-select"
                style={styles.sortSelect}
                value={sortParam}
                onChange={(e) => setSortParam(e.target.value as any)}
              >
                <option value="name_asc">Alphabetical (A - Z)</option>
                <option value="name_desc">Alphabetical (Z - A)</option>
                <option value="rarity_high">Rarity (Legendary First)</option>
                <option value="drain_desc">Drain (High - Low)</option>
                <option value="drain_asc">Drain (Low - High)</option>
              </select>
            </div>
          </div>

          <div style={styles.filterDrawerFooter}>
            <span style={{ fontSize: 12, color: theme.colors.textSecondary }}>
              {activeFilterCount > 0 ? `${activeFilterCount} active filters applied` : 'Showing all mod categories'}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedRarity('All');
                    setSelectedPolarity('All');
                    setSortParam('name_asc');
                  }}
                  style={styles.resetFiltersBtn}
                >
                  Reset All
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                style={styles.applyFiltersBtn}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.resultsInfoBar}>
        <span style={styles.resultsCount}>
          Showing <strong>{Math.min(visibleCount, filteredMods.length)}</strong> of {filteredMods.length} Mods
        </span>
        {(selectedCategory !== 'All' || selectedRarity !== 'All' || selectedPolarity !== 'All' || searchQuery || sortParam !== 'name_asc') && (
          <button
            type="button"
            style={styles.resetFiltersBtn}
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedRarity('All');
              setSelectedPolarity('All');
              setSortParam('name_asc');
            }}
          >
            Reset All Filters
          </button>
        )}
      </div>

      {/* Grid of In-Game Styled Mod Cards */}
      <main className="mods-grid" style={styles.modsGrid}>
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
  ...directoryStyles,
  filterRowDouble: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 20,
  },
  modsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(185px, 1fr))',
    gap: 14,
  },
  emptyNotice: directoryStyles.emptyNoticeBox,
  modCardInGame: {
    background: theme.colors.bgCard,
    border: '1.5px solid',
    borderRadius: theme.radii.md,
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
    borderBottom: `1px solid ${theme.colors.borderSubtle}`,
  },
  drainPolarityBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    padding: '1px 5px',
    borderRadius: theme.radii.sm,
    border: `1px solid ${theme.colors.borderSubtle}`,
  },
  drainNumber: {
    fontSize: 10,
    fontWeight: 700,
    color: theme.colors.textHighlight,
  },
  polarityGlyph: {
    fontSize: 10,
    fontWeight: 700,
    color: theme.colors.gold,
    fontFamily: theme.typography.monoFontFamily,
  },
  inGameRarityBadge: {
    fontSize: 8.5,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    padding: '1px 4px',
    borderRadius: theme.radii.sm,
    border: '1px solid',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  artworkContainer: {
    height: 64,
    backgroundColor: theme.colors.bgNavbar,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottom: `1px solid ${theme.colors.borderSubtle}`,
    padding: 2,
  },
  modNameBanner: {
    padding: '3px 4px 1px 4px',
    textAlign: 'center',
    backgroundColor: theme.colors.bgCardElevated,
    borderBottom: `1px solid ${theme.colors.borderSubtle}`,
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
    backgroundColor: theme.colors.bgInput,
  },
  compatibilityText: {
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: '0.1em',
    color: theme.colors.textMuted,
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
    color: theme.colors.textPrimary,
    lineHeight: 1.45,
    margin: 0,
  },
  sourceRowCompact: {
    padding: '2px 6px',
    backgroundColor: theme.colors.bgInput,
    borderTop: `1px solid ${theme.colors.borderSubtle}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 8.5,
  },
  sourceLabelCompact: {
    color: theme.colors.textMuted,
    fontWeight: 600,
    textTransform: 'uppercase',
    fontSize: 8,
  },
  sourceValCompact: {
    color: theme.colors.gold,
    fontWeight: 500,
    maxWidth: 80,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  rankPipsFooter: {
    padding: '3px 6px',
    backgroundColor: theme.colors.bgNavbar,
    borderTop: `1px solid ${theme.colors.borderSubtle}`,
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
    color: theme.colors.accent,
    textDecoration: 'none',
    padding: '1px 5px',
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.accentBg,
    border: `1px solid ${theme.colors.accentBorder}`,
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
  loadAllBtn: {
    padding: '8px 14px',
    background: theme.colors.bgCard,
    border: `1px solid ${theme.colors.borderDefault}`,
    borderRadius: theme.radii.md,
    color: theme.colors.textSecondary,
    fontSize: 12,
    cursor: 'pointer',
  },
};


