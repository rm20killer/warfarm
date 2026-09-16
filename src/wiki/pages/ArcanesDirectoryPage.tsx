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
import { theme } from '../styles/theme';
import { directoryStyles } from '../styles/directoryPageStyles';
import { formatWarframeText } from '../utils/format-text';

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
      border: theme.colors.rarityLegendaryBorder,
      badgeBg: theme.colors.rarityLegendaryBg,
      badgeText: theme.colors.rarityLegendary,
      tagBorder: theme.colors.rarityLegendaryBorder,
    };
  }
  if (r.includes('rare')) {
    return {
      border: theme.colors.rarityRareBorder,
      badgeBg: theme.colors.rarityRareBg,
      badgeText: theme.colors.rarityRare,
      tagBorder: theme.colors.rarityRareBorder,
    };
  }
  if (r.includes('uncommon')) {
    return {
      border: theme.colors.rarityUncommonBorder,
      badgeBg: theme.colors.rarityUncommonBg,
      badgeText: theme.colors.rarityUncommon,
      tagBorder: theme.colors.rarityUncommonBorder,
    };
  }
  return {
    border: theme.colors.rarityCommonBorder,
    badgeBg: theme.colors.rarityCommonBg,
    badgeText: theme.colors.rarityCommon,
    tagBorder: theme.colors.rarityCommonBorder,
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
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [targetIds, setTargetIds] = useState<Set<string>>(new Set());

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (slotParam !== 'All') count++;
    if (rarityParam !== 'All') count++;
    if (sourceParam !== 'All') count++;
    if (sortParam !== 'name_asc') count++;
    return count;
  }, [slotParam, rarityParam, sourceParam, sortParam]);

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
    <div className="page-container-responsive" style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Arcanes & Enhancements Directory</h1>
        <p style={styles.subtitle}>
          Browse all {allArcanes.length} Arcanes across Warframes, Weapons, Operators, and Amps. Find exact drop chances from Eidolon hunts, Steel Path Acolytes, Zariman, Sanctum Netracells, and syndicate vendors.
        </p>
      </header>

      <div style={styles.searchControlsRow}>
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
              setSearchParams({}, { replace: true });
            }}
            style={styles.resetFiltersQuickBtn}
          >
            Reset
          </button>
        )}
      </div>

      {showFilters && (
        <div style={styles.filterDrawerCard}>
          <div style={styles.filterDrawerHeader}>
            <span style={styles.filterDrawerTitle}>Filter Arcanes Catalog</span>
            <button
              type="button"
              onClick={() => setShowFilters(false)}
              style={styles.closeDrawerBtn}
            >
              &times; Close
            </button>
          </div>

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

          <div style={styles.filterDrawerFooter}>
            <span style={{ fontSize: 12, color: theme.colors.textSecondary }}>
              {activeFilterCount > 0 ? `${activeFilterCount} active filters applied` : 'Showing all arcanes'}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchParams({}, { replace: true });
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

      <div className="card-grid-responsive" style={styles.arcaneGrid}>
        {filteredArcanes.map((arcane) => {
          const rarityTheme = getRarityTheme(arcane.rarity);
          const isTarget = targetIds.has(arcane.id);
          const cleanDesc = arcane.description.replace(/\\n/g, ' ').trim();

          const topDrop = arcane.drops[0];
          const hasMoreDrops = arcane.drops.length > 1;

          return (
            <div
              key={arcane.id}
              style={{
                ...styles.arcaneCard,
                borderColor: rarityTheme.border,
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
                        backgroundColor: rarityTheme.badgeBg,
                        color: rarityTheme.badgeText,
                        borderColor: rarityTheme.tagBorder,
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
                    backgroundColor: isTarget ? theme.colors.gold : theme.colors.bgInput,
                    color: isTarget ? theme.colors.textInverse : theme.colors.textSecondary,
                  }}
                  onClick={() => handleToggleTarget(arcane)}
                  title={isTarget ? 'Remove from My Targets' : 'Add to My Targets'}
                >
                  {isTarget ? '★ Tracked' : '+ Target'}
                </button>
              </div>

              <div style={styles.cardBody}>
                <p style={styles.effectText}>
                  {cleanDesc ? formatWarframeText(cleanDesc) : 'Provides unique specialized stat enhancements.'}
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
                        <span style={{ color: theme.colors.green, marginRight: 6 }}>●</span>
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
  ...directoryStyles,
  arcaneGrid: directoryStyles.cardGrid3Col,
  arcaneCard: directoryStyles.card,
  arcaneTitleLink: directoryStyles.cardTitleLink,
  sortWrapper: directoryStyles.sortWrapper,
  sortLabel: directoryStyles.sortLabel,
  sortSelect: directoryStyles.sortSelect,
  noResultsBox: directoryStyles.emptyNoticeBox,
  noResultsTitle: {
    fontSize: 18,
    color: theme.colors.textHighlight,
    margin: '0 0 8px 0',
  },
  noResultsText: directoryStyles.emptyNoticeText,
  rarityBadge: {
    fontSize: 10,
    fontWeight: 700,
    padding: '1px 6px',
    borderRadius: theme.radii.sm,
    borderWidth: 1,
    borderStyle: 'solid',
    textTransform: 'uppercase',
  },
  slotBadge: {
    fontSize: 10,
    fontWeight: 600,
    padding: '1px 6px',
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.bgCardElevated,
    color: theme.colors.textSecondary,
    border: `1px solid ${theme.colors.borderDefault}`,
  },
  rankBadge: {
    fontSize: 10,
    fontWeight: 600,
    color: theme.colors.textSecondary,
  },
  effectText: {
    fontSize: 13,
    color: theme.colors.textPrimary,
    lineHeight: 1.45,
    margin: 0,
    backgroundColor: theme.colors.bgInput,
    padding: '10px 12px',
    borderRadius: theme.radii.md,
    border: `1px solid ${theme.colors.borderSubtle}`,
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
    color: theme.colors.textMuted,
  },
  vendorSourceCard: {
    backgroundColor: theme.colors.bgCardElevated,
    border: `1px solid ${theme.colors.borderSubtle}`,
    borderRadius: theme.radii.md,
    padding: '8px 10px',
  },
  vendorStoreTag: {
    fontSize: 9,
    fontWeight: 700,
    textTransform: 'uppercase',
    padding: '1px 5px',
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.greenBg,
    color: theme.colors.green,
    border: `1px solid ${theme.colors.greenBorder}`,
    display: 'inline-block',
    marginBottom: 4,
  },
  vendorDetails: {
    fontSize: 12,
    color: theme.colors.textPrimary,
  },
  standingBadge: {
    color: theme.colors.gold,
    fontWeight: 600,
  },
  vendorNotes: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  dropItemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.bgInput,
    border: `1px solid ${theme.colors.borderSubtle}`,
    borderRadius: theme.radii.md,
    padding: '8px 10px',
  },
  dropLocationText: {
    fontSize: 12,
    color: theme.colors.textPrimary,
    fontWeight: 500,
  },
  dropChanceBadge: {
    fontSize: 11,
    fontWeight: 700,
    color: theme.colors.green,
    backgroundColor: theme.colors.greenBg,
    border: `1px solid ${theme.colors.greenBorder}`,
    padding: '1px 6px',
    borderRadius: theme.radii.sm,
  },
  dropFallbackText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },
  moreDropsHint: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  dissolutionRow: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    backgroundColor: theme.colors.bgInput,
    padding: '4px 8px',
    borderRadius: theme.radii.sm,
    border: `1px solid ${theme.colors.borderSubtle}`,
  },
  dissolutionLabel: {
    color: theme.colors.accent,
    fontWeight: 600,
  },
  cardFooter: {
    padding: '10px 14px',
    borderTop: `1px solid ${theme.colors.borderSubtle}`,
    backgroundColor: theme.colors.bgCardElevated,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  inspectBtn: {
    color: theme.colors.accent,
    textDecoration: 'none',
    fontSize: 12,
    fontWeight: 600,
  },
};
