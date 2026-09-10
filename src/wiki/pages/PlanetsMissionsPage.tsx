import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PLANETS_DATA,
  searchPlanetMissions,
  PlanetData,
  PlanetNodeMission,
  SpawnableEnemy,
} from '../../shared/data/planet-missions';

export function PlanetsMissionsPage() {
  const [selectedPlanet, setSelectedPlanet] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMission, setSelectedMission] = useState<PlanetNodeMission | null>(null);
  const [inspectorTab, setInspectorTab] = useState<'drops' | 'enemies'>('drops');
  const [enemySearch, setEnemySearch] = useState('');

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
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Star Chart Mission & Planet Drops</h1>
        <p style={styles.subtitle}>
          Browse drop tables, boss blueprints, spawnable enemies, and endless rotation loot (Rot A, B, C) across Star Chart planets.
        </p>
      </header>

      <section style={styles.filterSection}>
        <div style={styles.searchBar}>
          <input
            type="text"
            placeholder="Search missions, items, bosses (e.g. Sargas Ruk, Axi Relic, Fossa, Kela)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
            aria-label="Search missions and drops"
          />
        </div>

        <div style={styles.planetTabBar}>
          <button
            onClick={() => setSelectedPlanet('All')}
            style={{
              ...styles.planetTab,
              backgroundColor: selectedPlanet === 'All' ? '#222234' : '#14141c',
              borderColor: selectedPlanet === 'All' ? '#404060' : '#222230',
              color: selectedPlanet === 'All' ? '#f0f0fa' : '#8888a0',
            }}
          >
            All Planets
          </button>
          {PLANETS_DATA.map((planet) => (
            <button
              key={planet.id}
              onClick={() => setSelectedPlanet(planet.id)}
              style={{
                ...styles.planetTab,
                backgroundColor: selectedPlanet === planet.id ? '#222234' : '#14141c',
                borderColor: selectedPlanet === planet.id ? '#404060' : '#222230',
                color: selectedPlanet === planet.id ? '#f0f0fa' : '#8888a0',
              }}
            >
              {planet.name}
            </button>
          ))}
        </div>

        <div style={styles.typeFilterRow}>
          <span style={styles.filterLabel}>Mission Type:</span>
          {missionTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              style={{
                ...styles.typeBtn,
                backgroundColor: selectedType === type ? '#1e1e2c' : '#12121a',
                color: selectedType === type ? '#d0d0e8' : '#7a7a92',
                borderColor: selectedType === type ? '#34344c' : '#1c1c28',
              }}
            >
              {type}
            </button>
          ))}
        </div>
      </section>

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
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
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
                  borderBottomColor: inspectorTab === 'drops' ? '#8ec4f4' : 'transparent',
                  color: inspectorTab === 'drops' ? '#f0f0fa' : '#8888a0',
                }}
              >
                All Drops & Rewards
              </button>
              <button
                onClick={() => setInspectorTab('enemies')}
                style={{
                  ...styles.modalTabBtn,
                  borderBottomColor: inspectorTab === 'enemies' ? '#8ec4f4' : 'transparent',
                  color: inspectorTab === 'enemies' ? '#f0f0fa' : '#8888a0',
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
                                <Link to={`/item/${encodeURIComponent(r.itemName)}`} style={styles.itemLink}>
                                  {r.itemName}
                                </Link>
                                <span style={styles.chanceText}>{r.chance.toFixed(1)}%</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {selectedMission.rotationB && (
                          <div style={styles.rotationCol}>
                            <span style={styles.rotHeader}>Rotation B</span>
                            {selectedMission.rotationB.map((r, i) => (
                              <div key={i} style={styles.rotRow}>
                                <Link to={`/item/${encodeURIComponent(r.itemName)}`} style={styles.itemLink}>
                                  {r.itemName}
                                </Link>
                                <span style={styles.chanceText}>{r.chance.toFixed(1)}%</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {selectedMission.rotationC && (
                          <div style={styles.rotationCol}>
                            <span style={styles.rotHeader}>Rotation C</span>
                            {selectedMission.rotationC.map((r, i) => (
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
                      placeholder="Filter enemies or loot drops (e.g. Saryn, Vitality, Butcher)..."
                      value={enemySearch}
                      onChange={(e) => setEnemySearch(e.target.value)}
                      style={styles.modalFilterInput}
                      aria-label="Filter enemies and drops"
                    />
                  </div>

                  {selectedMission.spawnableEnemies && selectedMission.spawnableEnemies.length > 0 ? (
                    <div style={styles.enemiesList}>
                      {selectedMission.spawnableEnemies
                        .filter(
                          (enemy) =>
                            !enemySearch ||
                            enemy.name.toLowerCase().includes(enemySearch.toLowerCase()) ||
                            enemy.armorOrHealthType.toLowerCase().includes(enemySearch.toLowerCase()) ||
                            enemy.drops.some((d) =>
                              d.itemName.toLowerCase().includes(enemySearch.toLowerCase())
                            )
                        )
                        .map((enemy: SpawnableEnemy, idx) => (
                          <div key={idx} style={styles.enemyCard}>
                            <div style={styles.enemyCardHeader}>
                              <div>
                                <span style={styles.enemyName}>{enemy.name}</span>
                                <span style={styles.enemyArmorText}>
                                  Health/Armor: {enemy.armorOrHealthType}
                                </span>
                              </div>
                              <span style={styles.enemyCategoryBadge}>{enemy.unitCategory}</span>
                            </div>

                            <div style={styles.enemyDropsBlock}>
                              <span style={styles.enemyDropsTitle}>Drop Table & Loot:</span>
                              <div style={styles.enemyDropsGrid}>
                                {enemy.drops.map((drop, dIdx) => (
                                  <div key={dIdx} style={styles.enemyDropItem}>
                                    <Link
                                      to={`/item/${encodeURIComponent(drop.itemName)}`}
                                      style={styles.enemyDropLink}
                                    >
                                      {drop.itemName} &rarr;
                                    </Link>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                      <span style={styles.dropCategoryTag}>{drop.category}</span>
                                      <span style={styles.dropChanceTag}>{drop.chanceText}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div style={styles.fallbackEnemiesBox}>
                      <p style={{ margin: 0, fontSize: 13, color: '#9a9ab0', lineHeight: 1.5 }}>
                        Standard {selectedMission.faction} combat units spawn dynamically based on mission level ({selectedMission.levelRange}). Refer to the All Drops tab for node-specific drop tables and mission rewards.
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
  container: {
    padding: '16px 18px 60px 18px',
    maxWidth: 1040,
    margin: '0 auto',
  },
  header: {
    backgroundColor: '#151722',
    border: '1px solid #232738',
    borderRadius: 8,
    padding: '16px 20px',
    marginBottom: 16,
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
  filterSection: {
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
    border: '1px solid #2a2a3c',
    borderRadius: 5,
    color: '#e2e2ec',
    fontSize: 14,
    outline: 'none',
  },
  planetTabBar: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  planetTab: {
    padding: '6px 12px',
    borderRadius: 4,
    border: '1px solid',
    fontSize: 12,
    cursor: 'pointer',
    fontWeight: 500,
  },
  typeFilterRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  filterLabel: {
    fontSize: 12,
    color: '#888ca8',
    marginRight: 4,
  },
  typeBtn: {
    padding: '4px 10px',
    border: '1px solid',
    borderRadius: 3,
    fontSize: 11,
    cursor: 'pointer',
  },
  planetOverviewCard: {
    background: '#12141d',
    border: '1px solid #1f2334',
    borderRadius: 8,
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
    color: '#eaeaf4',
    margin: 0,
  },
  planetFaction: {
    fontSize: 12,
    color: '#8a8aa0',
  },
  bossBadge: {
    fontSize: 12,
    padding: '3px 8px',
    background: '#241a1a',
    color: '#d48888',
    borderRadius: 4,
  },
  resourceRow: {
    fontSize: 12,
  },
  resourceLabel: {
    color: '#7a7a90',
    marginRight: 6,
  },
  resourceList: {
    color: '#90c490',
  },
  missionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  emptyNotice: {
    color: '#8a8aa0',
    fontSize: 14,
    padding: '24px 0',
  },
  missionCard: {
    background: '#12141d',
    border: '1px solid #1f2334',
    borderRadius: 8,
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
    color: '#e4e4ee',
    margin: 0,
  },
  planetTag: {
    fontSize: 11,
    padding: '2px 6px',
    background: '#162230',
    color: '#8ec4f4',
    borderRadius: 3,
    fontWeight: 600,
  },
  typeBadge: {
    fontSize: 11,
    padding: '2px 6px',
    background: '#1c1c2c',
    color: '#9090b8',
    borderRadius: 3,
  },
  levelBadge: {
    fontSize: 11,
    padding: '2px 6px',
    background: '#181822',
    color: '#8a8aa0',
    borderRadius: 3,
  },
  factionText: {
    fontSize: 12,
    color: '#7a7a90',
  },
  inspectBtn: {
    background: '#1e2436',
    color: '#8ec4f4',
    border: '1px solid #2e3852',
    borderRadius: 4,
    padding: '5px 12px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  missionNotes: {
    fontSize: 12,
    color: '#9090a8',
    margin: '0 0 10px 0',
    lineHeight: 1.4,
  },
  specialDropsBlock: {
    background: '#161622',
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
  },
  blockTitle: {
    fontSize: 12,
    color: '#b0b0c4',
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
    color: '#a0c4a0',
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
    background: '#161622',
    borderRadius: 4,
    padding: 10,
    border: '1px solid #1e1e2c',
  },
  rotHeader: {
    fontSize: 11,
    fontWeight: 600,
    color: '#9292b0',
    display: 'block',
    borderBottom: '1px solid #222234',
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
    color: '#c8c8dc',
    textDecoration: 'none',
  },
  chanceText: {
    color: '#8ec48e',
    fontWeight: 500,
    marginLeft: 8,
  },
  enemiesPreviewBlock: {
    marginTop: 12,
    paddingTop: 10,
    borderTop: '1px solid #1c1c28',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  enemiesPreviewLabel: {
    fontSize: 11,
    color: '#7a7a92',
    fontWeight: 600,
  },
  enemiesPreviewChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  },
  enemyPreviewChip: {
    fontSize: 11,
    background: '#1a1a28',
    border: '1px solid #262638',
    color: '#b0b0c8',
    padding: '2px 6px',
    borderRadius: 3,
  },
  modalBackdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(5, 5, 10, 0.85)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: 16,
  },
  modalContent: {
    background: '#12121c',
    border: '1px solid #26263c',
    borderRadius: 8,
    maxWidth: 780,
    width: '100%',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.7)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '16px 20px',
    borderBottom: '1px solid #1e1e2c',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: '#f0f0fa',
    margin: 0,
  },
  modalPlanetBadge: {
    fontSize: 12,
    padding: '2px 8px',
    background: '#182438',
    color: '#8ec4f4',
    borderRadius: 3,
    fontWeight: 600,
  },
  modalFaction: {
    fontSize: 12,
    color: '#8a8aa0',
    marginTop: 4,
    display: 'block',
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    color: '#8a8aa0',
    fontSize: 24,
    cursor: 'pointer',
    padding: '0 4px',
  },
  modalTabs: {
    display: 'flex',
    borderBottom: '1px solid #1e1e2c',
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
    background: '#151522',
    border: '1px solid #1f1f30',
    borderRadius: 6,
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
    background: '#1a221a',
    color: '#90d490',
    border: '1px solid #253825',
    padding: '4px 10px',
    borderRadius: 4,
    textDecoration: 'none',
    fontWeight: 500,
  },
  modalFilterInput: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '8px 12px',
    background: '#161624',
    border: '1px solid #26263a',
    borderRadius: 4,
    color: '#e4e4f0',
    fontSize: 13,
    outline: 'none',
  },
  enemiesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  enemyCard: {
    background: '#151522',
    border: '1px solid #202034',
    borderRadius: 6,
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
    color: '#f0f0fa',
    display: 'block',
  },
  enemyArmorText: {
    fontSize: 11,
    color: '#8a8aa4',
    marginTop: 2,
    display: 'block',
  },
  enemyCategoryBadge: {
    fontSize: 10,
    padding: '2px 6px',
    background: '#241c2c',
    color: '#c490d4',
    borderRadius: 3,
    fontWeight: 600,
    textTransform: 'uppercase',
  },
  enemyDropsBlock: {
    marginTop: 8,
    borderTop: '1px solid #1c1c2c',
    paddingTop: 8,
  },
  enemyDropsTitle: {
    fontSize: 11,
    color: '#8a8aa0',
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
    background: '#111118',
    padding: '5px 8px',
    borderRadius: 3,
    fontSize: 12,
  },
  enemyDropLink: {
    color: '#c0c0d8',
    textDecoration: 'none',
  },
  dropCategoryTag: {
    fontSize: 10,
    background: '#1c1c28',
    color: '#8a8aa0',
    padding: '1px 5px',
    borderRadius: 2,
  },
  dropChanceTag: {
    fontSize: 11,
    color: '#8ec48e',
    fontWeight: 600,
  },
  fallbackEnemiesBox: {
    background: '#151522',
    border: '1px solid #1f1f30',
    borderRadius: 6,
    padding: 16,
    textAlign: 'center',
  },
};
