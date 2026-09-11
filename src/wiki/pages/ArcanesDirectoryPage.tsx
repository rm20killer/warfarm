import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  getAllArcanes,
  ArcaneData,
  ArcaneSlot,
  ArcaneRarity,
} from '../../shared/data/arcanes';
import {
  getPersonalTargets,
  savePersonalTarget,
  removePersonalTarget,
} from '../storage';
import { usePageMeta } from '../../shared/utils/usePageMeta';

const SLOT_TABS: Array<{ slot: string; label: string }> = [
  { slot: 'All', label: 'All Slots' },
  { slot: 'Warframe', label: 'Warframe' },
  { slot: 'Primary', label: 'Primary' },
  { slot: 'Secondary', label: 'Secondary' },
  { slot: 'Melee', label: 'Melee' },
  { slot: 'Operator', label: 'Operator' },
  { slot: 'Amp', label: 'Amp' },
  { slot: 'Kitgun', label: 'Kitgun' },
  { slot: 'Zaw', label: 'Zaw' },
];

const SOURCE_FILTERS: Array<{ id: string; label: string }> = [
  { id: 'All', label: 'All Sources' },
  { id: 'eidolon', label: 'Eidolon Hunts' },
  { id: 'steel path', label: 'Steel Path / Acolytes' },
  { id: 'zariman', label: 'Zariman (Cavalero / Angels)' },
  { id: 'sanctum', label: 'Sanctum / Netracells (Bird 3)' },
  { id: 'duviri', label: 'Duviri Circuit' },
  { id: 'vendors', label: 'Syndicate Vendors' },
];

const RARITY_FILTERS: Array<{ id: string; label: string }> = [
  { id: 'All', label: 'All Rarities' },
  { id: 'Legendary', label: 'Legendary' },
  { id: 'Rare', label: 'Rare' },
  { id: 'Uncommon', label: 'Uncommon' },
  { id: 'Common', label: 'Common' },
];

function getRarityTheme(rarity: string) {
  const r = rarity.toLowerCase();
  if (r.includes('legendary')) {
    return {
      border: '#ffd700',
      badgeBg: 'rgba(255, 215, 0, 0.15)',
      badgeText: '#ffd700',
      tagBorder: '#ffd700',
    };
  }
  if (r.includes('rare')) {
    return {
      border: '#d4af37',
      badgeBg: 'rgba(212, 175, 55, 0.15)',
      badgeText: '#ffd700',
      tagBorder: '#d4af37',
    };
  }
  if (r.includes('uncommon')) {
    return {
      border: '#7090b8',
      badgeBg: 'rgba(112, 144, 184, 0.15)',
      badgeText: '#90caf9',
      tagBorder: '#7090b8',
    };
  }
  return {
    border: '#a67042',
    badgeBg: 'rgba(166, 112, 66, 0.15)',
    badgeText: '#d49b6a',
    tagBorder: '#a67042',
  };
}

export function ArcanesDirectoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const allArcanes = useMemo(() => getAllArcanes(), []);

  usePageMeta({
    title: 'Arcanes Database, Drop Locations & Dissolution',
    description: 'Explore Warframe Arcanes across Warframes, Primary, Secondary, and Melee weapons with drop sources, syndicate costs, and Vosfor dissolution packs.',
    keywords: 'warframe arcanes, arcane energize, arcane avenger, melee duplicate, melee exposure, vosfor dissolution, eidolon arcanes',
    canonicalPath: '/arcanes',
  });

  const slotParam = searchParams.get('slot') || 'All';
  const rarityParam = searchParams.get('rarity') || 'All';
  const sourceParam = searchParams.get('source') || 'All';
  const sortParam = searchParams.get('sort') || 'name_asc';
  const queryParam = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [targetIds, setTargetIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const updateTargets = () => {
      const targets = getPersonalTargets();
      setTargetIds(new Set(targets.map((t) => t.id)));
    };
    updateTargets();
    window.addEventListener('personal-targets-updated', updateTargets);
    return () => window.removeEventListener('personal-targets-updated', updateTargets);
  }, []);

  const handleToggleTarget = (arcane: ArcaneData) => {
    const isTarget = targetIds.has(arcane.id);
    if (isTarget) {
      removePersonalTarget(arcane.id);
    } else {
      savePersonalTarget({
        id: arcane.id,
        name: arcane.name,
        category: 'Arcane',
        targetQuantity: 21,
        currentQuantity: 0,
        notes: `${arcane.rarity} ${arcane.slot} Arcane (Max Rank ${arcane.maxRank})`,
      });
    }
  };

  const countsBySlot = useMemo(() => {
    const counts: Record<string, number> = { All: allArcanes.length };
    for (const a of allArcanes) {
      counts[a.slot] = (counts[a.slot] || 0) + 1;
    }
    return counts;
  }, [allArcanes]);

  const filteredArcanes = useMemo(() => {
    let result = allArcanes;

    if (slotParam !== 'All') {
      result = result.filter((a) => a.slot.toLowerCase() === slotParam.toLowerCase());
    }

    if (rarityParam !== 'All') {
      result = result.filter((a) => a.rarity.toLowerCase() === rarityParam.toLowerCase());
    }

    if (sourceParam !== 'All') {
      const sp = sourceParam.toLowerCase();
      result = result.filter((a) => {
        const dropText = a.drops.map((d) => d.location.toLowerCase()).join(' ');
        const vendorText = a.vendorSource
          ? `${a.vendorSource.vendorName} ${a.vendorSource.syndicate} ${a.vendorSource.location}`.toLowerCase()
          : '';
        const combined = `${dropText} ${vendorText} ${a.dissolutionPack || ''}`.toLowerCase();

        if (sp === 'eidolon') {
          return combined.includes('eidolon') || combined.includes('hydrolyst') || combined.includes('teralyst') || combined.includes('gantulyst');
        }
        if (sp === 'steel path') {
          return combined.includes('acolyte') || combined.includes('steel path') || combined.includes('merciless') || combined.includes('deadhead') || combined.includes('dexterity');
        }
        if (sp === 'zariman') {
          return combined.includes('zariman') || combined.includes('holdfasts') || combined.includes('cavalero') || combined.includes('thrax') || combined.includes('void angel');
        }
        if (sp === 'sanctum') {
          return combined.includes('sanctum') || combined.includes('cavia') || combined.includes('netracell') || combined.includes('archimedea') || combined.includes('bird 3') || combined.includes('fragmented');
        }
        if (sp === 'duviri') {
          return combined.includes('duviri') || combined.includes('undercroft');
        }
        if (sp === 'vendors') {
          return !!a.vendorSource;
        }
        return combined.includes(sp);
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((a) => {
        if (a.name.toLowerCase().includes(q)) return true;
        if (a.type.toLowerCase().includes(q)) return true;
        if (a.slot.toLowerCase().includes(q)) return true;
        if (a.description.toLowerCase().includes(q)) return true;
        if (a.dissolutionPack?.toLowerCase().includes(q)) return true;
        if (a.vendorSource?.vendorName.toLowerCase().includes(q)) return true;
        if (a.vendorSource?.syndicate.toLowerCase().includes(q)) return true;
        return a.drops.some((d) => d.location.toLowerCase().includes(q));
      });
    }

    return [...result].sort((a, b) => {
      if (sortParam === 'name_desc') {
        return b.name.localeCompare(a.name);
      }
      if (sortParam === 'rarity_high') {
        const weight: Record<string, number> = { Legendary: 4, Rare: 3, Uncommon: 2, Common: 1 };
        const diff = (weight[b.rarity] || 0) - (weight[a.rarity] || 0);
        return diff !== 0 ? diff : a.name.localeCompare(b.name);
      }
      if (sortParam === 'rarity_low') {
        const weight: Record<string, number> = { Legendary: 4, Rare: 3, Uncommon: 2, Common: 1 };
        const diff = (weight[a.rarity] || 0) - (weight[b.rarity] || 0);
        return diff !== 0 ? diff : a.name.localeCompare(b.name);
      }
      if (sortParam === 'ranks_desc') {
        const diff = b.maxRank - a.maxRank;
        return diff !== 0 ? diff : a.name.localeCompare(b.name);
      }
      // default: name_asc
      return a.name.localeCompare(b.name);
    });
  }, [allArcanes, slotParam, rarityParam, sourceParam, searchQuery, sortParam]);

  const updateFilterParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === 'All' || !value) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next, { replace: true });
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerBadge}>Warframe Upgrades</div>
        <h1 style={styles.title}>Arcanes & Enhancements Directory</h1>
        <p style={styles.subtitle}>
          Browse all {allArcanes.length} Arcanes across Warframes, Weapons, Operators, and Amps. Find exact drop chances from Eidolon hunts, Steel Path Acolytes, Zariman, Sanctum Netracells, and syndicate vendors.
        </p>
      </header>

      <div style={styles.searchBarWrapper}>
        <input
          type="text"
          style={styles.searchInput}
          placeholder="Search Arcanes by name, perk, or effect (e.g. Energize, Ability Strength, Overguard, Multishot)..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            updateFilterParam('q', e.target.value);
          }}
          aria-label="Search Arcanes"
        />
        {searchQuery && (
          <button
            type="button"
            style={styles.clearSearchBtn}
            onClick={() => {
              setSearchQuery('');
              updateFilterParam('q', '');
            }}
          >
            Clear
          </button>
        )}
      </div>

      <div style={styles.filterSection}>
        <div style={styles.filterGroup}>
          <span style={styles.filterLabel}>Slot:</span>
          <div style={styles.pillRow}>
            {SLOT_TABS.map((t) => {
              const active = slotParam.toLowerCase() === t.slot.toLowerCase();
              return (
                <button
                  key={t.slot}
                  type="button"
                  onClick={() => updateFilterParam('slot', t.slot)}
                  style={{
                    ...styles.filterPill,
                    ...(active ? styles.filterPillActive : {}),
                  }}
                >
                  {t.label} ({countsBySlot[t.slot] || 0})
                </button>
              );
            })}
          </div>
        </div>

        <div style={styles.filterGroup}>
          <span style={styles.filterLabel}>Acquisition Source:</span>
          <div style={styles.pillRow}>
            {SOURCE_FILTERS.map((s) => {
              const active = sourceParam.toLowerCase() === s.id.toLowerCase();
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => updateFilterParam('source', s.id)}
                  style={{
                    ...styles.filterPill,
                    ...(active ? styles.filterPillActive : {}),
                  }}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        <div style={styles.secondaryFilterRow}>
          <div style={styles.filterGroupInline}>
            <span style={styles.filterLabelInline}>Rarity:</span>
            <div style={styles.pillRowSmall}>
              {RARITY_FILTERS.map((r) => {
                const active = rarityParam.toLowerCase() === r.id.toLowerCase();
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => updateFilterParam('rarity', r.id)}
                    style={{
                      ...styles.filterPillSmall,
                      ...(active ? styles.filterPillActive : {}),
                    }}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={styles.sortWrapper}>
            <label htmlFor="arcane-sort-select" style={styles.sortLabel}>
              Sort:
            </label>
            <select
              id="arcane-sort-select"
              style={styles.sortSelect}
              value={sortParam}
              onChange={(e) => updateFilterParam('sort', e.target.value)}
            >
              <option value="name_asc">Alphabetical (A - Z)</option>
              <option value="name_desc">Alphabetical (Z - A)</option>
              <option value="rarity_high">Rarity (Legendary First)</option>
              <option value="rarity_low">Rarity (Common First)</option>
              <option value="ranks_desc">Max Rank (High - Low)</option>
            </select>
          </div>
        </div>
      </div>

      <div style={styles.resultsInfoBar}>
        <span style={styles.resultsCount}>
          Showing <strong>{filteredArcanes.length}</strong> of {allArcanes.length} Arcanes
        </span>
        {(slotParam !== 'All' || rarityParam !== 'All' || sourceParam !== 'All' || searchQuery) && (
          <button
            type="button"
            style={styles.resetFiltersBtn}
            onClick={() => {
              setSearchQuery('');
              setSearchParams({}, { replace: true });
            }}
          >
            Reset All Filters
          </button>
        )}
      </div>

      <div style={styles.arcaneGrid}>
        {filteredArcanes.map((arcane) => {
          const theme = getRarityTheme(arcane.rarity);
          const isTarget = targetIds.has(arcane.id);
          const cleanDesc = arcane.description.replace(/\\n/g, ' ').trim();

          const topDrop = arcane.drops[0];
          const hasMoreDrops = arcane.drops.length > 1;

          return (
            <div
              key={arcane.id}
              style={{
                ...styles.arcaneCard,
                borderColor: theme.border,
              }}
            >
              <div style={styles.cardHeader}>
                <div style={styles.thumbArea}>
                  {arcane.wikiaThumbnail ? (
                    <img
                      src={arcane.wikiaThumbnail}
                      alt={arcane.name}
                      style={styles.thumbImg}
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div style={styles.thumbFallback}>⬡</div>
                  )}
                </div>

                <div style={styles.headerTitles}>
                  <div style={styles.badgeRow}>
                    <span
                      style={{
                        ...styles.rarityBadge,
                        backgroundColor: theme.badgeBg,
                        color: theme.badgeText,
                        borderColor: theme.tagBorder,
                      }}
                    >
                      {arcane.rarity}
                    </span>
                    <span style={styles.slotBadge}>{arcane.slot}</span>
                    <span style={styles.rankBadge}>Max Rank {arcane.maxRank}</span>
                  </div>

                  <Link to={`/item/${encodeURIComponent(arcane.name)}`} style={styles.arcaneTitleLink}>
                    {arcane.name}
                  </Link>
                </div>

                <button
                  type="button"
                  style={{
                    ...styles.targetBtn,
                    backgroundColor: isTarget ? '#ffd700' : '#1e1f2b',
                    color: isTarget ? '#101118' : '#8888a2',
                  }}
                  onClick={() => handleToggleTarget(arcane)}
                  title={isTarget ? 'Remove from My Targets' : 'Add to My Targets'}
                >
                  {isTarget ? '★ Tracked' : '+ Target'}
                </button>
              </div>

              <div style={styles.cardBody}>
                <p style={styles.effectText}>
                  {cleanDesc || 'Provides unique specialized stat enhancements.'}
                </p>

                <div style={styles.acquisitionSection}>
                  <div style={styles.acquisitionHeader}>Acquisition & Drop Table</div>
                  {arcane.vendorSource ? (
                    <div style={styles.vendorSourceCard}>
                      <span style={styles.vendorStoreTag}>Vendor Offering</span>
                      <div style={styles.vendorDetails}>
                        <strong>{arcane.vendorSource.vendorName}</strong> ({arcane.vendorSource.location})
                        {arcane.vendorSource.standingCost && (
                          <span style={styles.standingBadge}> {arcane.vendorSource.standingCost}</span>
                        )}
                      </div>
                      {arcane.vendorSource.notes && (
                        <div style={styles.vendorNotes}>{arcane.vendorSource.notes}</div>
                      )}
                    </div>
                  ) : topDrop ? (
                    <div style={styles.dropItemRow}>
                      <div style={styles.dropLocationText}>
                        <span style={{ color: '#00e676', marginRight: 6 }}>●</span>
                        {topDrop.location}
                      </div>
                      {topDrop.chance !== undefined && (
                        <span style={styles.dropChanceBadge}>{topDrop.chance}%</span>
                      )}
                    </div>
                  ) : (
                    <div style={styles.dropFallbackText}>Special In-Game / Event Acquisition</div>
                  )}

                  {hasMoreDrops && (
                    <div style={styles.moreDropsHint}>
                      +{arcane.drops.length - 1} additional mission / rotation drops
                    </div>
                  )}

                  {arcane.dissolutionPack && (
                    <div style={styles.dissolutionRow}>
                      <span style={styles.dissolutionLabel}>Arcane Dissolution:</span> {arcane.dissolutionPack}
                    </div>
                  )}
                </div>
              </div>

              <div style={styles.cardFooter}>
                <Link to={`/item/${encodeURIComponent(arcane.name)}`} style={styles.inspectBtn}>
                  Inspect Ranks & Synergies →
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {filteredArcanes.length === 0 && (
        <div style={styles.noResultsBox}>
          <h3 style={styles.noResultsTitle}>No Arcanes matched your filters</h3>
          <p style={styles.noResultsText}>
            Try clearing search keywords or changing the slot, rarity, or acquisition filters.
          </p>
          <button
            type="button"
            style={styles.resetFiltersBtn}
            onClick={() => {
              setSearchQuery('');
              setSearchParams({}, { replace: true });
            }}
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '24px 16px 64px 16px',
    color: '#e4e4eb',
  },
  header: {
    marginBottom: 24,
  },
  headerBadge: {
    display: 'inline-block',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    padding: '3px 8px',
    borderRadius: 4,
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    color: '#ffd700',
    border: '1px solid rgba(255, 215, 0, 0.25)',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 800,
    color: '#f4f4fa',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: 14,
    color: '#9898b0',
    lineHeight: 1.5,
    margin: 0,
    maxWidth: 820,
  },
  searchBarWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#161722',
    border: '1px solid #2d2e3f',
    borderRadius: 6,
    padding: '12px 16px',
    fontSize: 14,
    color: '#f0f0f8',
    outline: 'none',
  },
  clearSearchBtn: {
    backgroundColor: '#262738',
    border: '1px solid #3d3e52',
    color: '#c0c0d8',
    borderRadius: 6,
    padding: '12px 16px',
    cursor: 'pointer',
    fontSize: 13,
  },
  filterSection: {
    backgroundColor: '#12131c',
    border: '1px solid #232433',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#8e8ea6',
  },
  pillRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  },
  filterPill: {
    backgroundColor: '#1b1c28',
    border: '1px solid #2e3044',
    color: '#c0c0d8',
    padding: '6px 12px',
    borderRadius: 4,
    fontSize: 12,
    cursor: 'pointer',
    fontWeight: 500,
    transition: 'all 0.15s ease',
  },
  filterPillActive: {
    backgroundColor: '#2b304c',
    borderColor: '#7a8ebd',
    color: '#ffffff',
    fontWeight: 700,
  },
  secondaryFilterRow: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingTop: 10,
    borderTop: '1px solid #1e1f2d',
  },
  filterGroupInline: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  filterLabelInline: {
    fontSize: 12,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#8e8ea6',
  },
  pillRowSmall: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
  },
  filterPillSmall: {
    backgroundColor: '#1b1c28',
    border: '1px solid #2e3044',
    color: '#c0c0d8',
    padding: '6px 12px',
    borderRadius: 4,
    fontSize: 12,
    cursor: 'pointer',
    fontWeight: 500,
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: 34,
  },
  sortWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  sortLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: '#8e8ea6',
  },
  sortSelect: {
    backgroundColor: '#1b1c28',
    border: '1px solid #2e3044',
    color: '#f0f0f8',
    padding: '6px 10px',
    borderRadius: 4,
    fontSize: 12,
    cursor: 'pointer',
    minHeight: 34,
  },
  resultsInfoBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    fontSize: 13,
    color: '#8888a2',
  },
  resultsCount: {},
  resetFiltersBtn: {
    backgroundColor: 'transparent',
    border: '1px solid #3b3c50',
    color: '#8e9ec4',
    padding: '6px 12px',
    borderRadius: 4,
    fontSize: 12,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: 34,
  },
  arcaneGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: 16,
  },
  arcaneCard: {
    backgroundColor: '#14151f',
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 8,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  cardHeader: {
    padding: '12px 14px',
    backgroundColor: '#181926',
    borderBottom: '1px solid #232435',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  thumbArea: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: '#0e0f17',
    border: '1px solid #26273a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  thumbImg: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  thumbFallback: {
    fontSize: 22,
    color: '#8e9ec4',
  },
  headerTitles: {
    flex: 1,
    minWidth: 0,
  },
  badgeRow: {
    display: 'flex',
    gap: 6,
    alignItems: 'center',
    marginBottom: 4,
  },
  rarityBadge: {
    fontSize: 10,
    fontWeight: 700,
    padding: '1px 6px',
    borderRadius: 3,
    borderWidth: 1,
    borderStyle: 'solid',
    textTransform: 'uppercase',
  },
  slotBadge: {
    fontSize: 10,
    fontWeight: 600,
    padding: '1px 6px',
    borderRadius: 3,
    backgroundColor: '#202233',
    color: '#a0b0d0',
    border: '1px solid #30334a',
  },
  rankBadge: {
    fontSize: 10,
    fontWeight: 600,
    color: '#8e9ec4',
  },
  arcaneTitleLink: {
    fontSize: 16,
    fontWeight: 700,
    color: '#f0f0f8',
    textDecoration: 'none',
    display: 'block',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  targetBtn: {
    padding: '5px 9px',
    borderRadius: 4,
    border: '1px solid #36374c',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  cardBody: {
    padding: '14px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  effectText: {
    fontSize: 13,
    color: '#e4e4ee',
    lineHeight: 1.45,
    margin: 0,
    backgroundColor: '#0f1018',
    padding: '10px 12px',
    borderRadius: 6,
    border: '1px solid #1e1f2e',
  },
  acquisitionSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  acquisitionHeader: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: '#7e7e98',
  },
  vendorSourceCard: {
    backgroundColor: '#1b1d2c',
    border: '1px solid #2e3148',
    borderRadius: 6,
    padding: '8px 10px',
  },
  vendorStoreTag: {
    fontSize: 9,
    fontWeight: 700,
    textTransform: 'uppercase',
    padding: '1px 5px',
    borderRadius: 3,
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    color: '#00e676',
    border: '1px solid rgba(0, 230, 118, 0.25)',
    display: 'inline-block',
    marginBottom: 4,
  },
  vendorDetails: {
    fontSize: 12,
    color: '#e0e0f0',
  },
  standingBadge: {
    color: '#ffd700',
    fontWeight: 600,
  },
  vendorNotes: {
    fontSize: 11,
    color: '#8e8ea6',
    marginTop: 4,
  },
  dropItemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#13141f',
    border: '1px solid #202233',
    borderRadius: 6,
    padding: '8px 10px',
  },
  dropLocationText: {
    fontSize: 12,
    color: '#d0d0e2',
    fontWeight: 500,
  },
  dropChanceBadge: {
    fontSize: 11,
    fontWeight: 700,
    color: '#00e676',
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    border: '1px solid rgba(0, 230, 118, 0.2)',
    padding: '1px 6px',
    borderRadius: 3,
  },
  dropFallbackText: {
    fontSize: 12,
    color: '#8e8ea6',
    fontStyle: 'italic',
  },
  moreDropsHint: {
    fontSize: 11,
    color: '#8e9ec4',
  },
  dissolutionRow: {
    fontSize: 11,
    color: '#a0a0be',
    backgroundColor: '#10111a',
    padding: '4px 8px',
    borderRadius: 4,
    border: '1px solid #1c1d2b',
  },
  dissolutionLabel: {
    color: '#8e9ec4',
    fontWeight: 600,
  },
  cardFooter: {
    padding: '10px 14px',
    borderTop: '1px solid #1e1f2d',
    backgroundColor: '#12131d',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  inspectBtn: {
    color: '#8e9ec4',
    textDecoration: 'none',
    fontSize: 12,
    fontWeight: 600,
  },
  noResultsBox: {
    textAlign: 'center',
    padding: '48px 16px',
    backgroundColor: '#12131c',
    borderRadius: 8,
    border: '1px solid #232433',
    marginTop: 24,
  },
  noResultsTitle: {
    fontSize: 18,
    color: '#f0f0f8',
    margin: '0 0 8px 0',
  },
  noResultsText: {
    fontSize: 13,
    color: '#8888a2',
    margin: '0 0 16px 0',
  },
};
