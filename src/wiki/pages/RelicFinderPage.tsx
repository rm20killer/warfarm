import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { RelicEra, DropRarity } from '../../shared/types/warframe';
import { getBestRelicSpots } from '../../shared/api/drop-data';
import { getAllRelics, RelicEntry, RelicRewardEntry, RelicVaultFilter } from '../../shared/data/relic-database';
import { usePageMeta } from '../../shared/utils/usePageMeta';

const ERAS: (RelicEra | 'All')[] = ['All', 'Lith', 'Meso', 'Neo', 'Axi', 'Requiem'];
const VAULT_FILTERS: { label: string; value: RelicVaultFilter }[] = [
  { label: 'All Status', value: 'All' },
  { label: 'Unvaulted (Active Drop)', value: 'Unvaulted' },
  { label: 'Vaulted (No Drop)', value: 'Vaulted' },
];

function getRarityBadgeStyle(rarity?: DropRarity): React.CSSProperties {
  const r = (rarity || '').toLowerCase();
  if (r.includes('rare')) {
    return {
      display: 'inline-block',
      padding: '2px 7px',
      borderRadius: 4,
      fontSize: 11,
      fontWeight: 600,
      backgroundColor: '#ffd70018',
      border: '1px solid #ffd70044',
      color: '#ffd700',
    };
  }
  if (r.includes('uncommon')) {
    return {
      display: 'inline-block',
      padding: '2px 7px',
      borderRadius: 4,
      fontSize: 11,
      fontWeight: 600,
      backgroundColor: '#90caf918',
      border: '1px solid #90caf944',
      color: '#90caf9',
    };
  }
  return {
    display: 'inline-block',
    padding: '2px 7px',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 600,
    backgroundColor: '#a0a4c018',
    border: '1px solid #a0a4c033',
    color: '#c0c4dc',
  };
}

export function RelicFinderPage() {
  const [selectedSpeedrunEra, setSelectedSpeedrunEra] = useState<RelicEra>('Axi');
  const [catalogEra, setCatalogEra] = useState<RelicEra | 'All'>('All');
  const [vaultFilter, setVaultFilter] = useState<RelicVaultFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [displayLimit, setDisplayLimit] = useState(24);

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
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Relic &amp; Prime Parts Finder</h1>
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
                  backgroundColor: selectedSpeedrunEra === era ? '#242b3d' : '#141622',
                  borderColor: selectedSpeedrunEra === era ? '#4d648d' : '#222638',
                  color: selectedSpeedrunEra === era ? '#f0f0f8' : '#888ca8',
                }}
              >
                {era}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.spotsGrid}>
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
          <div style={styles.vaultNoticeIcon}>ℹ️</div>
          <div>
            <strong style={styles.vaultNoticeTitle}>Vaulted Relics Drop Policy:</strong>
            <p style={styles.vaultNoticeText}>
              Vaulted Relics do not drop in standard Star Chart missions or reward rotations. Unvaulted relics are actively droppable in game missions.
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div style={styles.filterControlsBox}>
          <div style={styles.searchBar}>
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
                onClick={() => setSearchQuery('')}
                style={styles.clearSearchBtn}
                title="Clear search"
              >
                Clear
              </button>
            )}
          </div>

          <div style={styles.filterRow}>
            {/* Era Tabs */}
            <div style={styles.eraSelector}>
              {ERAS.map((era) => (
                <button
                  key={era}
                  onClick={() => {
                    setCatalogEra(era);
                    setDisplayLimit(24);
                  }}
                  style={{
                    ...styles.eraButton,
                    backgroundColor: catalogEra === era ? '#28324a' : '#141624',
                    borderColor: catalogEra === era ? '#546b9e' : '#22263a',
                    color: catalogEra === era ? '#f0f4ff' : '#8e94b2',
                  }}
                >
                  {era === 'All' ? 'All Tiers' : `${era}`}
                </button>
              ))}
            </div>

            {/* Vault Status Selector */}
            <div style={styles.vaultSelector}>
              {VAULT_FILTERS.map((vf) => (
                <button
                  key={vf.value}
                  onClick={() => {
                    setVaultFilter(vf.value);
                    setDisplayLimit(24);
                  }}
                  style={{
                    ...styles.vaultBtn,
                    backgroundColor: vaultFilter === vf.value ? (vf.value === 'Unvaulted' ? '#162e1c' : vf.value === 'Vaulted' ? '#2e2016' : '#28324a') : '#141624',
                    borderColor: vaultFilter === vf.value ? (vf.value === 'Unvaulted' ? '#2e6b3c' : vf.value === 'Vaulted' ? '#6b482e' : '#546b9e') : '#22263a',
                    color: vaultFilter === vf.value ? (vf.value === 'Unvaulted' ? '#7ae08a' : vf.value === 'Vaulted' ? '#e0a868' : '#f0f4ff') : '#8e94b2',
                  }}
                >
                  {vf.label}
                </button>
              ))}
            </div>
          </div>
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
          <div style={styles.relicsGrid}>
            {displayedRelics.map((relic) => {
              let eraBg = '#1b2234';
              let eraColor = '#90caf9';
              if (relic.era === 'Lith') { eraBg = '#2a2216'; eraColor = '#e0a868'; }
              else if (relic.era === 'Meso') { eraBg = '#1a2624'; eraColor = '#70c8b0'; }
              else if (relic.era === 'Neo') { eraBg = '#281a28'; eraColor = '#d088d8'; }
              else if (relic.era === 'Axi') { eraBg = '#2c2616'; eraColor = '#e8c458'; }
              else if (relic.era === 'Requiem') { eraBg = '#2c1414'; eraColor = '#e86868'; }

              return (
                <div key={relic.id} style={styles.relicCard}>
                  <div style={styles.relicCardHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ ...styles.eraBadge, backgroundColor: eraBg, color: eraColor }}>
                        {relic.era}
                      </span>
                      <span style={styles.relicNameTitle}>{relic.name} Relic</span>
                      <span
                        style={{
                          ...styles.vaultStatusBadge,
                          backgroundColor: relic.vaulted ? '#261814' : '#142818',
                          borderColor: relic.vaulted ? '#4a2c20' : '#234828',
                          color: relic.vaulted ? '#d09870' : '#7ae08a',
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

                  <div style={styles.rewardsTableWrapper}>
                    <table style={styles.rewardsTable}>
                      <thead>
                        <tr>
                          <th style={styles.rwThItem}>Reward Item</th>
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
                            <td style={styles.rwTdRate}>{rw.intactChance}%</td>
                            <td style={styles.rwTdRateRadiant}>{rw.radiantChance}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load More Button */}
        {filteredRelics.length > displayLimit && (
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

      {/* Rotation Reference Help */}
      <section style={styles.rotationHelpSection}>
        <h3 style={styles.rotationHelpTitle}>Warframe Mission Rotation Reference</h3>
        <p style={styles.rotationHelpText}>
          Most endless missions (Survival, Defense, Interception, Defection, Excavation) follow the <strong>A-A-B-C</strong> rotation cycle:
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
  container: {
    padding: '16px 18px 60px 18px',
    maxWidth: 1200,
    margin: '0 auto',
  },
  header: {
    backgroundColor: '#151722',
    border: '1px solid #232738',
    borderRadius: 8,
    padding: '18px 22px',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: '#f0f0f8',
    margin: '0 0 4px 0',
  },
  subtitle: {
    fontSize: 13,
    color: '#888ca8',
    margin: 0,
    lineHeight: 1.4,
  },
  speedrunSection: {
    backgroundColor: '#12141d',
    border: '1px solid #1f2334',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
  },
  sectionHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#f0f0f8',
    margin: '0 0 4px 0',
  },
  sectionDesc: {
    fontSize: 12.5,
    color: '#888ca8',
    margin: 0,
  },
  highlightEra: {
    color: '#90caf9',
  },
  eraMiniSelector: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
  },
  speedrunEraBtn: {
    padding: '6px 12px',
    border: '1px solid',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    minHeight: 34,
  },
  spotsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 12,
  },
  spotCard: {
    backgroundColor: '#171a26',
    border: '1px solid #252a3d',
    borderRadius: 6,
    padding: 14,
  },
  spotCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  spotNode: {
    fontSize: 14,
    fontWeight: 700,
    color: '#f0f0f8',
  },
  spotPlanet: {
    fontSize: 13,
    color: '#888ca8',
  },
  dropRate: {
    fontSize: 11.5,
    fontWeight: 600,
    color: '#7ae08a',
    backgroundColor: '#132818',
    padding: '2px 7px',
    borderRadius: 3,
    border: '1px solid #234828',
  },
  metaRow: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  metaBadge: {
    fontSize: 11,
    padding: '2px 6px',
    backgroundColor: '#12141e',
    color: '#a0a4c0',
    borderRadius: 3,
    border: '1px solid #222638',
  },
  timeBadge: {
    fontSize: 11,
    padding: '2px 6px',
    backgroundColor: '#241e14',
    color: '#e0b870',
    borderRadius: 3,
    border: '1px solid #443420',
    fontWeight: 600,
  },
  strategyTip: {
    fontSize: 12,
    color: '#b0b4cc',
    lineHeight: 1.4,
    margin: 0,
  },
  catalogSection: {
    backgroundColor: '#12141d',
    border: '1px solid #1f2334',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
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
    color: '#8ec48e',
    backgroundColor: '#142418',
    border: '1px solid #234428',
    padding: '4px 10px',
    borderRadius: 4,
  },
  vaultNoticeBanner: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#161926',
    border: '1px solid #283048',
    borderLeft: '4px solid #68a8ff',
    borderRadius: 6,
    padding: '12px 16px',
    marginBottom: 18,
  },
  vaultNoticeIcon: {
    fontSize: 18,
    lineHeight: 1,
    marginTop: 2,
  },
  vaultNoticeTitle: {
    fontSize: 13,
    color: '#90caf9',
    display: 'block',
    marginBottom: 4,
  },
  vaultNoticeText: {
    fontSize: 12.5,
    color: '#c0c8e0',
    margin: 0,
    lineHeight: 1.5,
  },
  filterControlsBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    marginBottom: 18,
  },
  searchBar: {
    display: 'flex',
    position: 'relative',
    alignItems: 'center',
  },
  searchInput: {
    width: '100%',
    padding: '10px 14px',
    backgroundColor: '#171926',
    border: '1px solid #282d42',
    borderRadius: 6,
    color: '#f0f0f8',
    fontSize: 13.5,
    outline: 'none',
    boxSizing: 'border-box',
    minHeight: 40,
  },
  clearSearchBtn: {
    position: 'absolute',
    right: 10,
    padding: '4px 10px',
    backgroundColor: '#242838',
    border: '1px solid #3d445c',
    borderRadius: 4,
    color: '#a0a4c0',
    fontSize: 12,
    cursor: 'pointer',
  },
  filterRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  eraSelector: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  eraButton: {
    padding: '7px 14px',
    border: '1px solid',
    borderRadius: 4,
    fontSize: 12.5,
    fontWeight: 600,
    cursor: 'pointer',
    minHeight: 34,
  },
  vaultSelector: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  vaultBtn: {
    padding: '7px 14px',
    border: '1px solid',
    borderRadius: 4,
    fontSize: 12.5,
    fontWeight: 600,
    cursor: 'pointer',
    minHeight: 34,
  },
  emptyNoticeBox: {
    padding: '30px 20px',
    textAlign: 'center',
    backgroundColor: '#171926',
    borderRadius: 6,
    border: '1px solid #23273a',
  },
  emptyNoticeText: {
    fontSize: 14,
    color: '#8e94b2',
    margin: '0 0 12px 0',
  },
  resetFiltersBtn: {
    padding: '8px 16px',
    backgroundColor: '#242b3d',
    border: '1px solid #4d648d',
    borderRadius: 4,
    color: '#f0f0f8',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    minHeight: 36,
  },
  relicsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: 14,
  },
  relicCard: {
    backgroundColor: '#161824',
    border: '1px solid #23273a',
    borderRadius: 6,
    padding: 14,
    display: 'flex',
    flexDirection: 'column',
  },
  relicCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottom: '1px solid #202436',
  },
  eraBadge: {
    fontSize: 11.5,
    fontWeight: 700,
    padding: '2px 7px',
    borderRadius: 3,
    letterSpacing: '0.3px',
  },
  relicNameTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#f0f0f8',
  },
  vaultStatusBadge: {
    fontSize: 10.5,
    fontWeight: 600,
    padding: '2px 6px',
    borderRadius: 3,
    border: '1px solid',
  },
  wikiLinkSmall: {
    fontSize: 12,
    color: '#70b4ff',
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
    color: '#8e94b2',
    fontWeight: 600,
    fontSize: 11,
    borderBottom: '1px solid #202436',
  },
  rwThRarity: {
    padding: '6px 6px',
    color: '#8e94b2',
    fontWeight: 600,
    fontSize: 11,
    borderBottom: '1px solid #202436',
    textAlign: 'center',
  },
  rwThRate: {
    padding: '6px 6px',
    color: '#8e94b2',
    fontWeight: 600,
    fontSize: 11,
    borderBottom: '1px solid #202436',
    textAlign: 'right',
  },
  rwRow: {
    borderBottom: '1px solid #1a1c2a',
  },
  rwTdItem: {
    padding: '6px 6px 6px 0',
    color: '#e0e4f4',
  },
  rewardItemLink: {
    color: '#d0d8f0',
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
    color: '#a0a4c0',
  },
  rwTdRateRadiant: {
    padding: '6px 6px',
    textAlign: 'right',
    color: '#7ae08a',
    fontWeight: 600,
  },
  loadMoreContainer: {
    textAlign: 'center',
    marginTop: 20,
  },
  loadMoreBtn: {
    padding: '10px 22px',
    backgroundColor: '#1e2436',
    border: '1px solid #3d4a6a',
    borderRadius: 4,
    color: '#70b4ff',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    minHeight: 40,
  },
  rotationHelpSection: {
    backgroundColor: '#12141d',
    border: '1px solid #1f2334',
    borderRadius: 8,
    padding: 20,
  },
  rotationHelpTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: '#f0f0f8',
    margin: '0 0 8px 0',
  },
  rotationHelpText: {
    fontSize: 13,
    color: '#888ca8',
    margin: '0 0 10px 0',
    lineHeight: 1.4,
  },
  rotationList: {
    margin: 0,
    paddingLeft: 18,
    fontSize: 13,
    color: '#b0b4cc',
    lineHeight: 1.6,
  },
};
