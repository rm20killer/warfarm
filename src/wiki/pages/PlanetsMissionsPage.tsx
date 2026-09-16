import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  PLANETS_DATA,
  searchPlanetMissions,
  PlanetData,
  PlanetNodeMission,
  SpawnableEnemy,
} from '../../shared/data/planet-missions';
import { usePageMeta } from '../../shared/utils/usePageMeta';
import { theme } from '../styles/theme';
import { directoryStyles } from '../styles/directoryPageStyles';

export function PlanetsMissionsPage() {
  const [selectedPlanet, setSelectedPlanet] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMission, setSelectedMission] = useState<PlanetNodeMission | null>(null);
  const [inspectorTab, setInspectorTab] = useState<'drops' | 'enemies'>('drops');
  const [enemySearch, setEnemySearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedPlanet !== 'All') count++;
    if (selectedType !== 'All') count++;
    return count;
  }, [selectedPlanet, selectedType]);

  usePageMeta({
    title: 'Star Chart Missions, Drop Tables & Enemy Spawns',
    description: 'Explore Warframe Star Chart nodes, mission types, rotation drop tables, and spawnable enemy pools across all planets.',
    keywords: 'warframe star chart, mission drops, rotation A B C, spy missions, survival rewards, excavation rewards, enemy drop tables',
    canonicalPath: '/missions',
  });

  const activePlanetData = PLANETS_DATA.find((p) => p.id === selectedPlanet);

  const displayedMissions = searchPlanetMissions(
    searchQuery,
    selectedPlanet === 'All' ? undefined : selectedPlanet,
    selectedType === 'All' ? undefined : selectedType
  );

  const missionTypes = ['All', 'Assassination', 'Survival', 'Defense', 'Excavation', 'Disruption', 'Capture', 'Spy'];

  // Handle escape key to close mission inspector modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedMission(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Find planetary resource drops for the selected mission
  const selectedMissionPlanet = selectedMission
    ? PLANETS_DATA.find((p) => p.name.toLowerCase() === (selectedMission.planet || '').toLowerCase()) ||
      PLANETS_DATA.find((p) => p.missions.some((m) => m.node.toLowerCase() === selectedMission.node.toLowerCase()))
    : null;

  return (
    <div className="page-container-responsive" style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerBadge}>Star Chart Codex</div>
        <h1 style={styles.title}>Star Chart Mission & Planet Drops</h1>
        <p style={styles.subtitle}>
          Browse drop tables, boss blueprints, spawnable enemies, and endless rotation loot (Rot A, B, C) across Star Chart planets.
        </p>
      </header>

      {/* Search Controls */}
      <div style={styles.searchControlsRow}>
        <div style={styles.searchBarWrapper}>
          <input
            type="text"
            placeholder="Search missions, items, bosses (e.g. Sargas Ruk, Axi Relic, Fossa, Kela)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
            aria-label="Search missions and drops"
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
              setSelectedPlanet('All');
              setSelectedType('All');
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
            <span style={styles.filterDrawerTitle}>Filter Star Chart Missions</span>
          </div>

          <div style={styles.filterGroup}>
            <span style={styles.filterLabel}>Planet:</span>
            <div style={styles.filterPills}>
              <button
                type="button"
                onClick={() => setSelectedPlanet('All')}
                style={{
                  ...styles.filterPill,
                  ...(selectedPlanet === 'All' ? styles.filterPillActive : {}),
                }}
              >
                All Planets
              </button>
              {PLANETS_DATA.map((planet) => (
                <button
                  key={planet.id}
                  type="button"
                  onClick={() => setSelectedPlanet(planet.id)}
                  style={{
                    ...styles.filterPill,
                    ...(selectedPlanet === planet.id ? styles.filterPillActive : {}),
                  }}
                >
                  {planet.name}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.filterGroup}>
            <span style={styles.filterLabel}>Mission Type:</span>
            <div style={styles.filterPills}>
              {missionTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  style={{
                    ...styles.filterPill,
                    ...(selectedType === type ? styles.filterPillActive : {}),
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.filterDrawerFooter}>
            <span style={{ fontSize: 12, color: theme.colors.textSecondary }}>
              {activeFilterCount > 0 ? `${activeFilterCount} active filters applied` : 'Showing all Star Chart planets & mission types'}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPlanet('All');
                    setSelectedType('All');
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
          Showing <strong>{displayedMissions.length}</strong> Missions & Nodes
        </span>
        {(selectedPlanet !== 'All' || selectedType !== 'All' || searchQuery) && (
          <button
            type="button"
            style={styles.resetFiltersBtn}
            onClick={() => {
              setSearchQuery('');
              setSelectedPlanet('All');
              setSelectedType('All');
            }}
          >
            Reset All Filters
          </button>
        )}
      </div>

      {activePlanetData && (
        <section style={styles.planetOverviewCard}>
          <div style={styles.planetOverviewTop}>
            <div>
              <h2 style={styles.planetName}>{activePlanetData.name}</h2>
              <span style={styles.planetFaction}>Dominant Faction: {activePlanetData.faction}</span>
            </div>
            {activePlanetData.bossName && (
              <span style={styles.bossBadge}>Assassination: {activePlanetData.bossName}</span>
            )}
          </div>
          <div style={styles.resourceRow}>
            <span style={styles.resourceLabel}>Planetary Resource Drops:</span>
            <span style={styles.resourceList}>{activePlanetData.resourceDrops.join(', ')}</span>
          </div>
        </section>
      )}

      <main style={styles.missionsList}>
        {displayedMissions.length === 0 ? (
          <p style={styles.emptyNotice}>No missions or drops matched your filter criteria.</p>
        ) : (
          displayedMissions.map((mission, idx) => (
            <article key={idx} style={styles.missionCard}>
              <div style={styles.missionCardHeader}>
                <div style={styles.nodeTitleRow}>
                  <h2 style={styles.nodeTitle}>{mission.node}</h2>
                  {mission.planet && <span style={styles.planetTag}>{mission.planet}</span>}
                  <span style={styles.typeBadge}>{mission.missionType}</span>
                  <span style={styles.levelBadge}>Level {mission.levelRange}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={styles.factionText}>{mission.faction}</span>
                  <button
                    onClick={() => {
                      setSelectedMission(mission);
                      setInspectorTab('drops');
                      setEnemySearch('');
                    }}
                    style={styles.inspectBtn}
                    aria-label={`Inspect all drops and enemies for ${mission.node}`}
                  >
                    Select Mission &rarr;
                  </button>
                </div>
              </div>

              {mission.notes && <p style={styles.missionNotes}>{mission.notes}</p>}

              {mission.specialDrops && mission.specialDrops.length > 0 && (
                <div style={styles.specialDropsBlock}>
                  <strong style={styles.blockTitle}>Guaranteed / Boss / Special Drops:</strong>
                  <ul style={styles.specialDropsList}>
                    {mission.specialDrops.map((drop, i) => (
                      <li key={i} style={styles.specialDropItem}>
                        &#8226; {drop}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {(mission.rotationA || mission.rotationB || mission.rotationC) && (
                <div style={styles.rotationsSection}>
                  <strong style={styles.blockTitle}>Endless Mission Rotation Tables:</strong>
                  <div style={styles.rotationsGrid}>
                    {mission.rotationA && (
                      <div style={styles.rotationCol}>
                        <span style={styles.rotHeader}>Rotation A</span>
                        {mission.rotationA.map((r, i) => (
                          <div key={i} style={styles.rotRow}>
                            <Link to={`/item/${encodeURIComponent(r.itemName)}`} style={styles.itemLink}>
                              {r.itemName}
                            </Link>
                            <span style={styles.chanceText}>{r.chance.toFixed(1)}%</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {mission.rotationB && (
                      <div style={styles.rotationCol}>
                        <span style={styles.rotHeader}>Rotation B</span>
                        {mission.rotationB.map((r, i) => (
                          <div key={i} style={styles.rotRow}>
                            <Link to={`/item/${encodeURIComponent(r.itemName)}`} style={styles.itemLink}>
                              {r.itemName}
                            </Link>
                            <span style={styles.chanceText}>{r.chance.toFixed(1)}%</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {mission.rotationC && (
                      <div style={styles.rotationCol}>
                        <span style={styles.rotHeader}>Rotation C</span>
                        {mission.rotationC.map((r, i) => (
                          <div key={i} style={styles.rotRow}>
                            <Link to={`/item/${encodeURIComponent(r.itemName)}`} style={styles.itemLink}>
                              {r.itemName}
                            </Link>
                            <span style={styles.chanceText}>{r.chance.toFixed(1)}%</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {mission.spawnableEnemies && mission.spawnableEnemies.length > 0 && (
                <div style={styles.enemiesPreviewBlock}>
                  <span style={styles.enemiesPreviewLabel}>
                    Spawnable Enemies ({mission.spawnableEnemies.length}):
                  </span>
                  <div style={styles.enemiesPreviewChips}>
                    {mission.spawnableEnemies.map((e, eIdx) => (
                      <span key={eIdx} style={styles.enemyPreviewChip}>
                        {e.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </article>
          ))
        )}
      </main>

      {/* DETAILED MISSION INSPECTOR MODAL */}
      {selectedMission && (
        <div
          style={styles.modalBackdrop}
          onClick={() => setSelectedMission(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="mission-inspector-title"
        >
          <div className="modal-dialog-responsive" style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <h2 id="mission-inspector-title" style={styles.modalTitle}>
                    {selectedMission.node}
                  </h2>
                  {selectedMission.planet && (
                    <span style={styles.modalPlanetBadge}>{selectedMission.planet}</span>
                  )}
                  <span style={styles.typeBadge}>{selectedMission.missionType}</span>
                  <span style={styles.levelBadge}>Level {selectedMission.levelRange}</span>
                </div>
                <span style={styles.modalFaction}>Dominant Faction: {selectedMission.faction}</span>
              </div>
              <button
                onClick={() => setSelectedMission(null)}
                style={styles.modalCloseBtn}
                aria-label="Close mission inspector"
              >
                &times;
              </button>
            </div>

            <div style={styles.modalTabs}>
              <button
                onClick={() => setInspectorTab('drops')}
                style={{
                  ...styles.modalTabBtn,
                  borderBottomColor: inspectorTab === 'drops' ? theme.colors.accent : 'transparent',
                  color: inspectorTab === 'drops' ? theme.colors.textHighlight : theme.colors.textSecondary,
                }}
              >
                All Drops & Rewards
              </button>
              <button
                onClick={() => setInspectorTab('enemies')}
                style={{
                  ...styles.modalTabBtn,
                  borderBottomColor: inspectorTab === 'enemies' ? theme.colors.accent : 'transparent',
                  color: inspectorTab === 'enemies' ? theme.colors.textHighlight : theme.colors.textSecondary,
                }}
              >
                Spawnable Enemies ({selectedMission.spawnableEnemies?.length || 0})
              </button>
            </div>

            <div style={styles.modalBody}>
              {inspectorTab === 'drops' ? (
                <div>
                  {selectedMissionPlanet && (
                    <div style={styles.inspectorSectionBox}>
                      <strong style={styles.blockTitle}>
                        Planetary Resources Obtainable on {selectedMissionPlanet.name} (Lockers, Crates & Drops):
                      </strong>
                      <div style={styles.resourcesChipRow}>
                        {selectedMissionPlanet.resourceDrops.map((res) => (
                          <Link
                            key={res}
                            to={`/item/${encodeURIComponent(res)}`}
                            style={styles.resourceChip}
                          >
                            {res} &rarr;
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedMission.specialDrops && selectedMission.specialDrops.length > 0 && (
                    <div style={styles.inspectorSectionBox}>
                      <strong style={styles.blockTitle}>Guaranteed / Boss / Special Drops:</strong>
                      <ul style={styles.specialDropsList}>
                        {selectedMission.specialDrops.map((drop, i) => (
                          <li key={i} style={styles.specialDropItem}>
                            &#8226; {drop}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {(selectedMission.rotationA || selectedMission.rotationB || selectedMission.rotationC) && (
                    <div style={styles.inspectorSectionBox}>
                      <strong style={styles.blockTitle}>Mission Completion Reward Rotations:</strong>
                      <div style={styles.rotationsGrid}>
                        {selectedMission.rotationA && (
                          <div style={styles.rotationCol}>
                            <span style={styles.rotHeader}>Rotation A</span>
                            {selectedMission.rotationA.map((r, i) => (
                              <div key={i} style={styles.rotRow}>
                                <Link
                                  to={`/item/${encodeURIComponent(r.itemName)}`}
                                  style={styles.itemLink}
                                >
                                  {r.itemName}
                                </Link>
                                <span style={styles.chanceText}>{r.chance}%</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {selectedMission.rotationB && (
                          <div style={styles.rotationCol}>
                            <span style={styles.rotHeader}>Rotation B</span>
                            {selectedMission.rotationB.map((r, i) => (
                              <div key={i} style={styles.rotRow}>
                                <Link
                                  to={`/item/${encodeURIComponent(r.itemName)}`}
                                  style={styles.itemLink}
                                >
                                  {r.itemName}
                                </Link>
                                <span style={styles.chanceText}>{r.chance}%</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {selectedMission.rotationC && (
                          <div style={styles.rotationCol}>
                            <span style={styles.rotHeader}>Rotation C</span>
                            {selectedMission.rotationC.map((r, i) => (
                              <div key={i} style={styles.rotRow}>
                                <Link
                                  to={`/item/${encodeURIComponent(r.itemName)}`}
                                  style={styles.itemLink}
                                >
                                  {r.itemName}
                                </Link>
                                <span style={styles.chanceText}>{r.chance}%</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedMission.notes && (
                    <div style={{ ...styles.inspectorSectionBox, borderLeft: '3px solid #8ec48e' }}>
                      <strong style={{ fontSize: 12, color: '#90d490', display: 'block', marginBottom: 4 }}>
                        Mission Strategy & Notes:
                      </strong>
                      <p style={{ fontSize: 13, color: '#d0d0e2', margin: 0, lineHeight: 1.5 }}>
                        {selectedMission.notes}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div style={{ marginBottom: 12 }}>
                    <input
                      type="text"
                      placeholder="Filter enemies by name or category (e.g. Grineer, Heavy Gunner, Eximus)..."
                      value={enemySearch}
                      onChange={(e) => setEnemySearch(e.target.value)}
                      style={styles.modalFilterInput}
                    />
                  </div>

                  {selectedMission.spawnableEnemies && selectedMission.spawnableEnemies.length > 0 ? (
                    <div style={styles.enemiesList}>
                      {selectedMission.spawnableEnemies
                        .filter((enemy) => {
                          if (!enemySearch.trim()) return true;
                          const q = enemySearch.toLowerCase();
                          return (
                            enemy.name.toLowerCase().includes(q) ||
                            (enemy.unitCategory && enemy.unitCategory.toLowerCase().includes(q)) ||
                            (enemy.armorOrHealthType && enemy.armorOrHealthType.toLowerCase().includes(q))
                          );
                        })
                        .map((enemy, idx) => (
                          <div key={idx} style={styles.enemyCard}>
                            <div style={styles.enemyCardHeader}>
                              <div>
                                <span style={styles.enemyName}>{enemy.name}</span>
                                {enemy.armorOrHealthType && (
                                  <span style={styles.enemyArmorText}>
                                    Armor / Type: {enemy.armorOrHealthType}
                                  </span>
                                )}
                              </div>
                              {enemy.unitCategory && (
                                <span style={styles.enemyCategoryBadge}>{enemy.unitCategory}</span>
                              )}
                            </div>

                            {enemy.drops && enemy.drops.length > 0 && (
                              <div style={styles.enemyDropsBlock}>
                                <span style={styles.enemyDropsTitle}>
                                  Verified Drop Pool ({enemy.drops.length} items):
                                </span>
                                <div style={styles.enemyDropsGrid}>
                                  {enemy.drops.map((drop, dIdx) => (
                                    <div key={dIdx} style={styles.enemyDropItem}>
                                      <Link
                                        to={`/item/${encodeURIComponent(drop.itemName)}`}
                                        style={styles.enemyDropLink}
                                      >
                                        {drop.itemName}
                                      </Link>
                                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                        {drop.category && (
                                          <span style={styles.dropCategoryTag}>
                                            {drop.category}
                                          </span>
                                        )}
                                        <span style={styles.dropChanceTag}>
                                          {drop.chanceText}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div style={styles.fallbackEnemiesBox}>
                      <p style={{ color: theme.colors.textSecondary, margin: 0 }}>
                        Specific spawn list not cataloged for this node yet.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  ...directoryStyles,
  emptyNotice: directoryStyles.emptyNoticeBox,
  planetOverviewCard: {
    background: theme.colors.bgCard,
    border: `1px solid ${theme.colors.borderDefault}`,
    borderRadius: theme.radii.lg,
    padding: 16,
    marginBottom: 16,
  },
  planetOverviewTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planetName: {
    fontSize: 18,
    fontWeight: 600,
    color: theme.colors.textHighlight,
    margin: 0,
  },
  planetFaction: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  bossBadge: {
    fontSize: 12,
    padding: '3px 8px',
    background: theme.colors.redBg,
    color: theme.colors.red,
    borderRadius: theme.radii.sm,
    border: `1px solid ${theme.colors.redBorder}`,
  },
  resourceRow: {
    fontSize: 12,
  },
  resourceLabel: {
    color: theme.colors.textMuted,
    marginRight: 6,
  },
  resourceList: {
    color: theme.colors.green,
  },
  missionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  missionCard: {
    background: theme.colors.bgCard,
    border: `1px solid ${theme.colors.borderDefault}`,
    borderRadius: theme.radii.lg,
    padding: 16,
  },
  missionCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  nodeTitleRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  nodeTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: theme.colors.textHighlight,
    margin: 0,
  },
  planetTag: {
    fontSize: 11,
    padding: '2px 6px',
    background: theme.colors.accentBg,
    color: theme.colors.accent,
    borderRadius: theme.radii.sm,
    border: `1px solid ${theme.colors.accentBorder}`,
    fontWeight: 600,
  },
  typeBadge: {
    fontSize: 11,
    padding: '2px 6px',
    background: theme.colors.purpleBg,
    color: theme.colors.purple,
    borderRadius: theme.radii.sm,
    border: `1px solid ${theme.colors.purpleBorder}`,
  },
  levelBadge: {
    fontSize: 11,
    padding: '2px 6px',
    background: theme.colors.bgCardElevated,
    color: theme.colors.textSecondary,
    borderRadius: theme.radii.sm,
    border: `1px solid ${theme.colors.borderSubtle}`,
  },
  factionText: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  inspectBtn: {
    background: theme.colors.accentBg,
    color: theme.colors.accent,
    border: `1px solid ${theme.colors.accentBorder}`,
    borderRadius: theme.radii.sm,
    padding: '5px 12px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  missionNotes: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    margin: '0 0 10px 0',
    lineHeight: 1.4,
  },
  specialDropsBlock: {
    background: theme.colors.bgCardElevated,
    borderRadius: theme.radii.sm,
    padding: 10,
    marginBottom: 10,
    border: `1px solid ${theme.colors.borderSubtle}`,
  },
  blockTitle: {
    fontSize: 12,
    color: theme.colors.textPrimary,
    display: 'block',
    marginBottom: 6,
  },
  specialDropsList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  specialDropItem: {
    fontSize: 12,
    color: theme.colors.green,
    padding: '2px 0',
  },
  rotationsSection: {
    marginTop: 10,
  },
  rotationsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 8,
    marginTop: 6,
  },
  rotationCol: {
    background: theme.colors.bgInput,
    borderRadius: theme.radii.sm,
    padding: 10,
    border: `1px solid ${theme.colors.borderSubtle}`,
  },
  rotHeader: {
    fontSize: 11,
    fontWeight: 600,
    color: theme.colors.textSecondary,
    display: 'block',
    borderBottom: `1px solid ${theme.colors.borderSubtle}`,
    paddingBottom: 4,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  rotRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 12,
    padding: '3px 0',
  },
  itemLink: {
    color: theme.colors.textPrimary,
    textDecoration: 'none',
  },
  chanceText: {
    color: theme.colors.green,
    fontWeight: 500,
    marginLeft: 8,
  },
  enemiesPreviewBlock: {
    marginTop: 12,
    paddingTop: 10,
    borderTop: `1px solid ${theme.colors.borderSubtle}`,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  enemiesPreviewLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: 600,
  },
  enemiesPreviewChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  },
  enemyPreviewChip: {
    fontSize: 11,
    background: theme.colors.bgCardElevated,
    border: `1px solid ${theme.colors.borderSubtle}`,
    color: theme.colors.textSecondary,
    padding: '2px 6px',
    borderRadius: theme.radii.sm,
  },
  modalBackdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: theme.colors.bgModalBackdrop,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: 16,
  },
  modalContent: {
    background: theme.colors.bgCard,
    border: `1px solid ${theme.colors.borderStrong}`,
    borderRadius: theme.radii.lg,
    maxWidth: 780,
    width: '100%',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: theme.shadows.lg,
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '16px 20px',
    borderBottom: `1px solid ${theme.colors.borderSubtle}`,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: theme.colors.textHighlight,
    margin: 0,
  },
  modalPlanetBadge: {
    fontSize: 12,
    padding: '2px 8px',
    background: theme.colors.accentBg,
    color: theme.colors.accent,
    borderRadius: theme.radii.sm,
    fontWeight: 600,
    border: `1px solid ${theme.colors.accentBorder}`,
  },
  modalFaction: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
    display: 'block',
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    color: theme.colors.textSecondary,
    fontSize: 24,
    cursor: 'pointer',
    padding: '0 4px',
  },
  modalTabs: {
    display: 'flex',
    borderBottom: `1px solid ${theme.colors.borderSubtle}`,
    padding: '0 20px',
    gap: 16,
  },
  modalTabBtn: {
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    padding: '12px 4px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  modalBody: {
    padding: 20,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  inspectorSectionBox: {
    background: theme.colors.bgCardElevated,
    border: `1px solid ${theme.colors.borderSubtle}`,
    borderRadius: theme.radii.md,
    padding: 12,
    marginBottom: 12,
  },
  resourcesChipRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  resourceChip: {
    fontSize: 12,
    background: theme.colors.greenBg,
    color: theme.colors.green,
    border: `1px solid ${theme.colors.greenBorder}`,
    padding: '4px 10px',
    borderRadius: theme.radii.sm,
    textDecoration: 'none',
    fontWeight: 500,
  },
  modalFilterInput: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '8px 12px',
    background: theme.colors.bgInput,
    border: `1px solid ${theme.colors.borderDefault}`,
    borderRadius: theme.radii.sm,
    color: theme.colors.textHighlight,
    fontSize: 13,
    outline: 'none',
  },
  enemiesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  enemyCard: {
    background: theme.colors.bgCardElevated,
    border: `1px solid ${theme.colors.borderSubtle}`,
    borderRadius: theme.radii.md,
    padding: 12,
  },
  enemyCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  enemyName: {
    fontSize: 14,
    fontWeight: 600,
    color: theme.colors.textHighlight,
    display: 'block',
  },
  enemyArmorText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
    display: 'block',
  },
  enemyCategoryBadge: {
    fontSize: 10,
    padding: '2px 6px',
    background: theme.colors.purpleBg,
    color: theme.colors.purple,
    borderRadius: theme.radii.sm,
    fontWeight: 600,
    textTransform: 'uppercase',
    border: `1px solid ${theme.colors.purpleBorder}`,
  },
  enemyDropsBlock: {
    marginTop: 8,
    borderTop: `1px solid ${theme.colors.borderSubtle}`,
    paddingTop: 8,
  },
  enemyDropsTitle: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: 600,
    display: 'block',
    marginBottom: 6,
  },
  enemyDropsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  enemyDropItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: theme.colors.bgInput,
    padding: '5px 8px',
    borderRadius: theme.radii.sm,
    fontSize: 12,
    border: `1px solid ${theme.colors.borderSubtle}`,
  },
  enemyDropLink: {
    color: theme.colors.textPrimary,
    textDecoration: 'none',
  },
  dropCategoryTag: {
    fontSize: 10,
    background: theme.colors.bgCardElevated,
    color: theme.colors.textMuted,
    padding: '1px 5px',
    borderRadius: theme.radii.sm,
    border: `1px solid ${theme.colors.borderSubtle}`,
  },
  dropChanceTag: {
    fontSize: 11,
    color: theme.colors.green,
    fontWeight: 600,
  },
  fallbackEnemiesBox: {
    background: theme.colors.bgCardElevated,
    border: `1px solid ${theme.colors.borderSubtle}`,
    borderRadius: theme.radii.md,
    padding: 16,
    textAlign: 'center',
  },
};
