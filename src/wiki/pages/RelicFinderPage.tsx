import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { RelicEra, DropRarity } from '../../shared/types/warframe';
import { getBestRelicSpots } from '../../shared/api/drop-data';
import { getAllRelics, RelicEntry, RelicRewardEntry, RelicVaultFilter } from '../../shared/data/relic-database';
import { usePageMeta } from '../../shared/utils/usePageMeta';
import { theme } from '../styles/theme';
import { directoryStyles } from '../styles/directoryPageStyles';

const ERAS: (RelicEra | 'All')[] = ['All', 'Lith', 'Meso', 'Neo', 'Axi', 'Requiem'];
const VAULT_FILTERS: { label: string; value: RelicVaultFilter }[] = [
  { label: 'All Status', value: 'All' },
  { label: 'Unvaulted (Active Drop)', value: 'Unvaulted' },
  { label: 'Vaulted (No Drop)', value: 'Vaulted' },
];

function getRarityBadgeStyle(rarity?: DropRarity): React.CSSProperties {
  return theme.helpers.getRarityBadgeStyle(rarity);
}

export function getRelicCardBorderStyle(era: string): React.CSSProperties {
  const e = (era || '').toLowerCase();
  let border = theme.colors.borderDefault;
  let topBorder = theme.colors.accent;

  if (e === 'lith') {
    border = theme.colors.relicLithBorder;
    topBorder = theme.colors.relicLith;
  } else if (e === 'meso') {
    border = theme.colors.relicMesoBorder;
    topBorder = theme.colors.relicMeso;
  } else if (e === 'neo') {
    border = theme.colors.relicNeoBorder;
    topBorder = theme.colors.relicNeo;
  } else if (e === 'axi') {
    border = theme.colors.relicAxiBorder;
    topBorder = theme.colors.relicAxi;
  } else if (e === 'requiem') {
    border = theme.colors.relicRequiemBorder;
    topBorder = theme.colors.relicRequiem;
  }

  return {
    borderColor: border,
    borderTop: `2px solid ${topBorder}`,
  };
}

export function RelicFinderPage() {
  const [selectedSpeedrunEra, setSelectedSpeedrunEra] = useState<RelicEra>('Axi');
  const [catalogEra, setCatalogEra] = useState<RelicEra | 'All'>('All');
  const [vaultFilter, setVaultFilter] = useState<RelicVaultFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [displayLimit, setDisplayLimit] = useState(24);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedDropIds, setExpandedDropIds] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  });

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (catalogEra !== 'All') count++;
    if (vaultFilter !== 'All') count++;
    return count;
  }, [catalogEra, vaultFilter]);

  usePageMeta({
    title: 'Void Relic Drop Rates & Farming Guide',
    description: 'Explore 770+ Warframe Void Relics across Lith, Meso, Neo, Axi, and Requiem eras with drop rates, refinement chances, and speedrun nodes.',
    keywords: 'warframe void relics, lith relic, meso relic, neo relic, axi relic, requiem relic, radiant drop rate, prime parts',
    canonicalPath: '/relics',
  });

  const speedrunSpots = getBestRelicSpots(selectedSpeedrunEra);
  const allRelics = useMemo(() => getAllRelics(), []);

  const filteredRelics = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allRelics.filter((relic) => {
      if (catalogEra !== 'All' && relic.era.toLowerCase() !== catalogEra.toLowerCase()) {
        return false;
      }
      if (vaultFilter === 'Unvaulted' && relic.vaulted) {
        return false;
      }
      if (vaultFilter === 'Vaulted' && !relic.vaulted) {
        return false;
      }
      if (!q) return true;
      if (relic.fullName.toLowerCase().includes(q)) return true;
      if (relic.name.toLowerCase().includes(q)) return true;
      if (relic.era.toLowerCase().includes(q)) return true;
      return relic.rewards.some((rw) => rw.itemName.toLowerCase().includes(q));
    });
  }, [allRelics, catalogEra, vaultFilter, searchQuery]);

  const displayedRelics = useMemo(() => {
    return filteredRelics.slice(0, displayLimit);
  }, [filteredRelics, displayLimit]);

  return (
    <div className="page-container-responsive" style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerBadge}>Void Relics & Prime Vault</div>
        <h1 style={styles.title}>Relic & Prime Parts Finder</h1>
        <p style={styles.subtitle}>
          Locate the fastest Star Chart missions to stockpile Void Relics by era, search the full Relics catalog, and inspect reward drop rates.
        </p>
      </header>

      {/* Speedrun Spots Section */}
      <section style={styles.speedrunSection}>
        <div style={styles.sectionHeaderRow}>
          <div>
            <h2 style={styles.sectionTitle}>
              Fastest Star Chart Relic Farms: <span style={styles.highlightEra}>{selectedSpeedrunEra} Relics</span>
            </h2>
            <p style={styles.sectionDesc}>
              Optimal mission nodes for high-speed relic acquisition and endless rotation cycling.
            </p>
          </div>
          <div style={styles.eraMiniSelector}>
            {(['Lith', 'Meso', 'Neo', 'Axi', 'Requiem'] as RelicEra[]).map((era) => (
              <button
                key={era}
                onClick={() => setSelectedSpeedrunEra(era)}
                style={{
                  ...styles.speedrunEraBtn,
                  backgroundColor: selectedSpeedrunEra === era ? theme.colors.accentBg : theme.colors.bgInput,
                  borderColor: selectedSpeedrunEra === era ? theme.colors.accentBorder : theme.colors.borderDefault,
                  color: selectedSpeedrunEra === era ? theme.colors.textHighlight : theme.colors.textSecondary,
                }}
              >
                {era}
              </button>
            ))}
          </div>
        </div>

        <div className="card-grid-responsive" style={styles.spotsGrid}>
          {speedrunSpots.map((spot, i) => (
            <div key={i} style={styles.spotCard}>
              <div style={styles.spotCardTop}>
                <div>
                  <span style={styles.spotNode}>{spot.node}</span>
                  <span style={styles.spotPlanet}> ({spot.planet})</span>
                </div>
                <span style={styles.dropRate}>{spot.dropRateText}</span>
              </div>

              <div style={styles.metaRow}>
                <span style={styles.metaBadge}>{spot.missionType}</span>
                <span style={styles.metaBadge}>Rot: {spot.rotation}</span>
                <span style={styles.timeBadge}>{spot.expectedTime}</span>
              </div>

              <p style={styles.strategyTip}>{spot.strategyTip}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Full Void Relics Catalog */}
      <section style={styles.catalogSection}>
        <div style={styles.catalogHeader}>
          <div>
            <h2 style={styles.sectionTitle}>Full Void Relics Directory</h2>
            <p style={styles.sectionDesc}>
              Browse all 700+ Void Relics across Lith, Meso, Neo, Axi, and Requiem tiers with complete Intact and Radiant reward tables.
            </p>
          </div>
          <span style={styles.resultsCountBadge}>
            {filteredRelics.length} Relic{filteredRelics.length === 1 ? '' : 's'} Found
          </span>
        </div>

        {/* Vault Notice Banner */}
        <div style={styles.vaultNoticeBanner}>
          <div>
            <strong style={styles.vaultNoticeTitle}>Vaulted Relics Drop Policy:</strong>
            <p style={styles.vaultNoticeText}>
              Vaulted Relics do not drop in standard Star Chart missions or reward rotations. Unvaulted relics are actively droppable in game missions.
            </p>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div style={styles.searchControlsRow}>
          <div style={styles.searchBarWrapper}>
            <input
              type="text"
              placeholder="Search relic code or reward (e.g. A18, Wisp Prime, Acceltra, Forma)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setDisplayLimit(24);
              }}
              style={styles.searchInput}
              aria-label="Search void relics"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={styles.clearSearchBtn}
                title="Clear search"
              >
                Clear
              </button>
            )}
          </div>

          {isMobile ? (
            <>
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
                    setCatalogEra('All');
                    setVaultFilter('All');
                    setDisplayLimit(24);
                  }}
                  style={styles.resetFiltersQuickBtn}
                >
                  Reset
                </button>
              )}
            </>
          ) : (
            /* Desktop Direct Filter Bar - No toggle button required */
            <div style={styles.desktopFilterBar}>
              <div style={styles.desktopFilterGroup}>
                <span style={styles.desktopFilterLabel}>Era:</span>
                <div style={styles.filterPills}>
                  {ERAS.map((era) => (
                    <button
                      key={era}
                      type="button"
                      onClick={() => {
                        setCatalogEra(era);
                        setDisplayLimit(24);
                      }}
                      style={{
                        ...styles.filterPill,
                        ...(catalogEra === era ? styles.filterPillActive : {}),
                      }}
                    >
                      {era === 'All' ? 'All' : era}
                    </button>
                  ))}
                </div>
              </div>

              <div style={styles.desktopFilterGroup}>
                <span style={styles.desktopFilterLabel}>Status:</span>
                <div style={styles.filterPills}>
                  {VAULT_FILTERS.map((vf) => (
                    <button
                      key={vf.value}
                      type="button"
                      onClick={() => {
                        setVaultFilter(vf.value);
                        setDisplayLimit(24);
                      }}
                      style={{
                        ...styles.filterPill,
                        ...(vaultFilter === vf.value ? styles.filterPillActive : {}),
                        ...(vf.value === 'Unvaulted' && vaultFilter === vf.value ? { backgroundColor: theme.colors.greenBg, borderColor: theme.colors.greenBorder, color: theme.colors.green } : {}),
                        ...(vf.value === 'Vaulted' && vaultFilter === vf.value ? { backgroundColor: theme.colors.orangeBg, borderColor: theme.colors.orangeBorder, color: theme.colors.orange } : {}),
                      }}
                    >
                      {vf.value === 'All' ? 'All Status' : vf.value}
                    </button>
                  ))}
                </div>
              </div>

              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setCatalogEra('All');
                    setVaultFilter('All');
                    setDisplayLimit(24);
                  }}
                  style={styles.resetFiltersQuickBtn}
                >
                  Reset
                </button>
              )}
            </div>
          )}
        </div>

        {/* Mobile Collapsible Filter Drawer */}
        {isMobile && showFilters && (
          <div style={styles.filterDrawerCard}>
            <div style={styles.filterDrawerHeader}>
              <span style={styles.filterDrawerTitle}>Filter Relics Catalog</span>
            </div>

            <div style={styles.filterGroup}>
              <span style={styles.filterLabel}>Relic Era:</span>
              <div style={styles.filterPills}>
                {ERAS.map((era) => (
                  <button
                    key={era}
                    type="button"
                    onClick={() => {
                      setCatalogEra(era);
                      setDisplayLimit(24);
                    }}
                    style={{
                      ...styles.filterPill,
                      ...(catalogEra === era ? styles.filterPillActive : {}),
                    }}
                  >
                    {era === 'All' ? 'All Tiers' : `${era}`}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.filterGroup}>
              <span style={styles.filterLabel}>Vault Status:</span>
              <div style={styles.filterPills}>
                {VAULT_FILTERS.map((vf) => (
                  <button
                    key={vf.value}
                    type="button"
                    onClick={() => {
                      setVaultFilter(vf.value);
                      setDisplayLimit(24);
                    }}
                    style={{
                      ...styles.filterPill,
                      ...(vaultFilter === vf.value ? styles.filterPillActive : {}),
                      ...(vf.value === 'Unvaulted' && vaultFilter === vf.value ? { backgroundColor: theme.colors.greenBg, borderColor: theme.colors.greenBorder, color: theme.colors.green } : {}),
                      ...(vf.value === 'Vaulted' && vaultFilter === vf.value ? { backgroundColor: theme.colors.orangeBg, borderColor: theme.colors.orangeBorder, color: theme.colors.orange } : {}),
                    }}
                  >
                    {vf.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.filterDrawerFooter}>
              <span style={{ fontSize: 12, color: theme.colors.textSecondary }}>
                {activeFilterCount > 0 ? `${activeFilterCount} active filters applied` : 'Showing all relic tiers and drop states'}
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setCatalogEra('All');
                      setVaultFilter('All');
                      setDisplayLimit(24);
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
            Showing <strong>{displayedRelics.length}</strong> of {filteredRelics.length} Relics
          </span>
          {(catalogEra !== 'All' || vaultFilter !== 'All' || searchQuery) && (
            <button
              type="button"
              style={styles.resetFiltersBtn}
              onClick={() => {
                setSearchQuery('');
                setCatalogEra('All');
                setVaultFilter('All');
                setDisplayLimit(24);
              }}
            >
              Reset All Filters
            </button>
          )}
        </div>

        {/* Relic Grid */}
        {displayedRelics.length === 0 ? (
          <div style={styles.emptyNoticeBox}>
            <p style={styles.emptyNoticeText}>No relics matched your search criteria.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setCatalogEra('All');
                setVaultFilter('All');
              }}
              style={styles.resetFiltersBtn}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="card-grid-responsive" style={styles.relicsGrid}>
            {displayedRelics.map((relic) => {
              let eraBg = theme.colors.accentBg;
              let eraColor = theme.colors.accent;
              if (relic.era === 'Lith') { eraBg = theme.colors.goldBg; eraColor = theme.colors.gold; }
              else if (relic.era === 'Meso') { eraBg = theme.colors.greenBg; eraColor = theme.colors.green; }
              else if (relic.era === 'Neo') { eraBg = theme.colors.purpleBg; eraColor = theme.colors.purple; }
              else if (relic.era === 'Axi') { eraBg = theme.colors.goldBg; eraColor = theme.colors.goldLight; }
              else if (relic.era === 'Requiem') { eraBg = theme.colors.redBg; eraColor = theme.colors.red; }

              const isDropExpanded = expandedDropIds.has(relic.id);
              const relicDrops = relic.drops || [];

              return (
                <div key={relic.id} style={{ ...styles.relicCard, ...getRelicCardBorderStyle(relic.era) }}>
                  <div style={styles.relicCardHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ ...styles.eraBadge, backgroundColor: eraBg, color: eraColor }}>
                        {relic.era}
                      </span>
                      <span style={styles.relicNameTitle}>{relic.name} Relic</span>
                      <span
                        style={{
                          ...styles.vaultStatusBadge,
                          backgroundColor: relic.vaulted ? theme.colors.orangeBg : theme.colors.greenBg,
                          borderColor: relic.vaulted ? theme.colors.orangeBorder : theme.colors.greenBorder,
                          color: relic.vaulted ? theme.colors.orange : theme.colors.green,
                        }}
                      >
                        {relic.vaulted ? 'Vaulted' : 'Unvaulted'}
                      </span>
                    </div>
                    <Link
                      to={`/item/${encodeURIComponent(relic.fullName)}`}
                      style={styles.wikiLinkSmall}
                    >
                      Wiki
                    </Link>
                  </div>

                  {/* Rewards Table */}
                  <div style={styles.rewardsTableWrapper}>
                    <table style={styles.rewardsTable}>
                      <thead>
                        <tr>
                          <th style={styles.rwThItem}>Item Reward</th>
                          <th style={styles.rwThRarity}>Rarity</th>
                          <th style={styles.rwThRate}>Intact</th>
                          <th style={styles.rwThRate}>Radiant</th>
                        </tr>
                      </thead>
                      <tbody>
                        {relic.rewards.map((rw: RelicRewardEntry, idx: number) => (
                          <tr key={idx} style={styles.rwRow}>
                            <td style={styles.rwTdItem}>
                              <Link
                                to={`/item/${encodeURIComponent(rw.itemName)}`}
                                style={styles.rewardItemLink}
                              >
                                {rw.itemName}
                              </Link>
                            </td>
                            <td style={styles.rwTdRarity}>
                              <span style={getRarityBadgeStyle(rw.rarity)}>
                                {rw.rarity}
                              </span>
                            </td>
                            <td style={styles.rwTdRate}>
                              {rw.intactChance}%
                            </td>
                            <td style={styles.rwTdRateRadiant}>
                              {rw.radiantChance}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Active Drop Locations or Vaulted Notice */}
                  {!relic.vaulted && relicDrops.length > 0 ? (
                    <div style={styles.dropsSection}>
                      <div style={styles.dropsHeaderRow}>
                        <span style={styles.dropsTitle}>
                          Drops ({relicDrops.length} locations):
                        </span>
                        {relicDrops.length > 2 && (
                          <button
                            type="button"
                            onClick={() => {
                              setExpandedDropIds((prev) => {
                                const next = new Set(prev);
                                if (next.has(relic.id)) next.delete(relic.id);
                                else next.add(relic.id);
                                return next;
                              });
                            }}
                            style={styles.expandDropsBtn}
                          >
                            {isDropExpanded ? 'Show Less' : `+${relicDrops.length - 2} More`}
                          </button>
                        )}
                      </div>
                      <div style={styles.dropsList}>
                        {(isDropExpanded ? relicDrops : relicDrops.slice(0, 2)).map((d, dIdx) => (
                          <div key={dIdx} style={styles.dropItem}>
                            <span style={styles.dropLocation}>{d.location}</span>
                            {d.chance !== undefined && (
                              <span style={styles.dropRateVal}>{d.chance}%</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : relic.vaulted ? (
                    <div style={styles.vaultNoticeSmall}>
                      Vaulted — Not dropping in Star Chart rotations.
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}

        {/* Load More Button */}
        {displayLimit < filteredRelics.length && (
          <div style={styles.loadMoreContainer}>
            <button
              onClick={() => setDisplayLimit((prev) => prev + 24)}
              style={styles.loadMoreBtn}
            >
              Load More Relics ({filteredRelics.length - displayLimit} remaining)
            </button>
          </div>
        )}
      </section>

      {/* Rotation Mechanics Help */}
      <section style={styles.rotationHelpSection}>
        <h3 style={styles.rotationHelpTitle}>Understanding Star Chart Rotation Mechanics (A, A, B, C)</h3>
        <p style={styles.rotationHelpText}>
          Endless missions cycle through reward pools in a predetermined sequence:
        </p>
        <ul style={styles.rotationList}>
          <li><strong>Survival:</strong> 5m (A), 10m (A), 15m (B), 20m (C) (repeats indefinitely)</li>
          <li><strong>Defense:</strong> 5 waves (A), 10 waves (A), 15 waves (B), 20 waves (C) (repeats indefinitely)</li>
          <li><strong>Disruption:</strong> Flexible rotation based on round number and conduits saved (Round 3+ with 4 conduits awards Tier C continuously).</li>
          <li><strong>Excavation:</strong> Every 100 Cryotic extracted advances rotation: Extractor 1 (A), 2 (A), 3 (B), 4 (C).</li>
        </ul>
      </section>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  ...directoryStyles,
  headerBadge: {
    ...directoryStyles.headerBadge,
    backgroundColor: theme.colors.catRelicBg,
    color: theme.colors.catRelic,
    border: `1px solid ${theme.colors.catRelicBorder}`,
  },
  relicsGrid: directoryStyles.cardGrid,
  relicCard: directoryStyles.card,
  relicCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottom: `1px solid ${theme.colors.borderSubtle}`,
  },
  eraBadge: {
    fontSize: 11.5,
    fontWeight: 700,
    padding: '2px 7px',
    borderRadius: theme.radii.sm,
    letterSpacing: '0.3px',
  },
  relicNameTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: theme.colors.textHighlight,
  },
  vaultStatusBadge: {
    fontSize: 10.5,
    fontWeight: 600,
    padding: '2px 6px',
    borderRadius: theme.radii.sm,
    border: '1px solid',
  },
  wikiLinkSmall: {
    fontSize: 12,
    color: theme.colors.accent,
    textDecoration: 'none',
    fontWeight: 600,
  },
  rewardsTableWrapper: {
    overflowX: 'auto',
  },
  rewardsTable: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: 12,
  },
  rwThItem: {
    padding: '6px 6px 6px 0',
    color: theme.colors.textSecondary,
    fontWeight: 600,
    fontSize: 11,
    borderBottom: `1px solid ${theme.colors.borderSubtle}`,
  },
  rwThRarity: {
    padding: '6px 6px',
    color: theme.colors.textSecondary,
    fontWeight: 600,
    fontSize: 11,
    borderBottom: `1px solid ${theme.colors.borderSubtle}`,
    textAlign: 'center',
  },
  rwThRate: {
    padding: '6px 6px',
    color: theme.colors.textSecondary,
    fontWeight: 600,
    fontSize: 11,
    borderBottom: `1px solid ${theme.colors.borderSubtle}`,
    textAlign: 'right',
  },
  rwRow: {
    borderBottom: `1px solid ${theme.colors.borderSubtle}`,
  },
  rwTdItem: {
    padding: '6px 6px 6px 0',
    color: theme.colors.textPrimary,
  },
  rewardItemLink: {
    color: theme.colors.textPrimary,
    textDecoration: 'none',
    fontWeight: 500,
  },
  rwTdRarity: {
    padding: '6px 6px',
    textAlign: 'center',
  },
  rwTdRate: {
    padding: '6px 6px',
    textAlign: 'right',
    color: theme.colors.textSecondary,
  },
  rwTdRateRadiant: {
    padding: '6px 6px',
    textAlign: 'right',
    color: theme.colors.green,
    fontWeight: 600,
  },
  speedrunSection: {
    marginBottom: 32,
    backgroundColor: theme.colors.bgCard,
    border: `1px solid ${theme.colors.borderDefault}`,
    borderRadius: theme.radii.lg,
    padding: '18px 20px',
  },
  sectionHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottom: `1px solid ${theme.colors.borderSubtle}`,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: theme.colors.textHighlight,
    margin: '0 0 4px 0',
  },
  highlightEra: {
    color: theme.colors.accent,
  },
  sectionDesc: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    margin: 0,
  },
  eraMiniSelector: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
  },
  speedrunEraBtn: {
    padding: '5px 12px',
    borderRadius: theme.radii.sm,
    border: '1px solid',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  spotsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: 12,
  },
  spotCard: {
    backgroundColor: theme.colors.bgCardElevated,
    border: `1px solid ${theme.colors.borderSubtle}`,
    borderRadius: theme.radii.md,
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  spotCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  spotNode: {
    fontSize: 14,
    fontWeight: 700,
    color: theme.colors.textHighlight,
  },
  spotPlanet: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  dropRate: {
    fontSize: 12,
    fontWeight: 700,
    color: theme.colors.green,
  },
  metaRow: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  metaBadge: {
    fontSize: 10.5,
    padding: '2px 6px',
    backgroundColor: theme.colors.bgCard,
    color: theme.colors.textSecondary,
    borderRadius: theme.radii.sm,
    border: `1px solid ${theme.colors.borderSubtle}`,
  },
  timeBadge: {
    fontSize: 10.5,
    padding: '2px 6px',
    backgroundColor: theme.colors.accentBg,
    color: theme.colors.accent,
    borderRadius: theme.radii.sm,
    border: `1px solid ${theme.colors.accentBorder}`,
  },
  strategyTip: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    margin: 0,
    lineHeight: 1.35,
  },
  catalogSection: {
    marginBottom: 32,
  },
  catalogHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  resultsCountBadge: {
    fontSize: 12,
    fontWeight: 600,
    padding: '4px 10px',
    backgroundColor: theme.colors.bgCardElevated,
    borderRadius: theme.radii.sm,
    color: theme.colors.textSecondary,
    border: `1px solid ${theme.colors.borderDefault}`,
  },
  vaultNoticeBanner: {
    padding: '12px 14px',
    backgroundColor: theme.colors.orangeBg,
    borderLeft: `4px solid ${theme.colors.orange}`,
    borderRadius: theme.radii.md,
    marginBottom: 16,
  },
  vaultNoticeTitle: {
    fontSize: 13,
    color: theme.colors.orange,
    display: 'block',
    marginBottom: 2,
  },
  vaultNoticeText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    margin: 0,
    lineHeight: 1.4,
  },
  rotationHelpSection: {
    backgroundColor: theme.colors.bgCard,
    border: `1px solid ${theme.colors.borderDefault}`,
    borderRadius: theme.radii.lg,
    padding: 20,
  },
  rotationHelpTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: theme.colors.textHighlight,
    margin: '0 0 8px 0',
  },
  rotationHelpText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    margin: '0 0 10px 0',
    lineHeight: 1.4,
  },
  rotationList: {
    margin: 0,
    paddingLeft: 18,
    fontSize: 13,
    color: theme.colors.textPrimary,
    lineHeight: 1.6,
  },
};
