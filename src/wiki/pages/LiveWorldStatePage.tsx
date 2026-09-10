import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchWorldState,
  WorldStateData,
  OpenWorldCycle,
  VoidFissure,
  SyndicateJob,
  WorldStateAlert,
} from '../../shared/api/worldstate-client';
import { ItemThumbnail } from '../../shared/utils/item-images';
import syncMetaJson from '../../shared/data/generated/sync-meta.json';

export type LiveSectionView = 'All' | 'Fissures' | 'Bounties' | 'Events' | 'Cycles';

export function LiveWorldStatePage() {
  const [worldState, setWorldState] = useState<WorldStateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFissureTier, setSelectedFissureTier] = useState<string>('All');
  const [selectedMissionType, setSelectedMissionType] = useState<string>('All');
  const [fissureSortBy, setFissureSortBy] = useState<'type' | 'tier' | 'eta'>('type');
  const [steelPathOnly, setSteelPathOnly] = useState<boolean>(false);
  const [activeSyndicateTab, setActiveSyndicateTab] = useState<string>('Ostrons');
  const [showBountyRewards, setShowBountyRewards] = useState<boolean>(false);
  const [expandedBountyIndices, setExpandedBountyIndices] = useState<Record<number, boolean>>({});
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('');
  const [activeSectionView, setActiveSectionView] = useState<LiveSectionView>('All');

  const loadData = async (force = false) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchWorldState(force);
      setWorldState(data);
      setLastUpdatedTime(new Date().toLocaleTimeString());
    } catch (err: any) {
      setError(err.message || 'Failed to fetch live WorldState data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData(true);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const cycles = worldState
    ? [
        {
          name: 'Plains of Eidolon',
          icon: '🌅',
          state: worldState.cetusCycle.isDay ? 'Day' : 'Night (Eidolons)',
          stateColor: worldState.cetusCycle.isDay ? '#ffbb33' : '#69b4ff',
          timeLeft: worldState.cetusCycle.timeLeft,
          hint: worldState.cetusCycle.isDay ? 'Daytime bounties' : 'Teralyst / Hydrolyst hunting',
        },
        {
          name: 'Orb Vallis',
          icon: '❄️',
          state: worldState.vallisCycle.isWarm ? 'Warm' : 'Cold',
          stateColor: worldState.vallisCycle.isWarm ? '#ff8844' : '#44ccff',
          timeLeft: worldState.vallisCycle.timeLeft,
          hint: worldState.vallisCycle.isWarm ? 'Warm servofish' : 'Cold servofish',
        },
        {
          name: 'Cambion Drift',
          icon: '🦠',
          state: worldState.cambionCycle.active === 'vome' ? 'Vome' : 'Fass',
          stateColor: worldState.cambionCycle.active === 'vome' ? '#33ddaa' : '#ff5522',
          timeLeft: worldState.cambionCycle.timeLeft,
          hint: worldState.cambionCycle.active === 'vome' ? 'Isolation Vaults' : 'Fass Spores active',
        },
        {
          name: 'Earth Day / Night',
          icon: '🌍',
          state: worldState.earthCycle.isDay ? 'Day' : 'Night',
          stateColor: worldState.earthCycle.isDay ? '#ffcc44' : '#7799cc',
          timeLeft: worldState.earthCycle.timeLeft,
          hint: worldState.earthCycle.isDay ? 'Sunlight Threshcone' : 'Moonlight Threshcone',
        },
        {
          name: 'Zariman Ten Zero',
          icon: '🚢',
          state: worldState.zarimanCycle?.isCorpus ? 'Corpus' : 'Grineer',
          stateColor: worldState.zarimanCycle?.isCorpus ? '#55aaff' : '#ff4444',
          timeLeft: worldState.zarimanCycle?.timeLeft || 'Active',
          hint: 'Holdfast Bounties',
        },
      ]
    : [];

  const rawFissures = worldState?.fissures || [];
  const uniqueMissionTypes = Array.from(new Set(rawFissures.map((f) => f.missionType))).sort();

  const filteredFissures = rawFissures.filter((f) => {
    if (selectedFissureTier !== 'All' && f.tier.toLowerCase() !== selectedFissureTier.toLowerCase()) {
      return false;
    }
    if (selectedMissionType !== 'All' && f.missionType !== selectedMissionType) {
      return false;
    }
    if (steelPathOnly && !f.isHard) {
      return false;
    }
    return true;
  });

  const sortedFissures = [...filteredFissures].sort((a, b) => {
    if (fissureSortBy === 'type') {
      const cmp = a.missionType.localeCompare(b.missionType);
      if (cmp !== 0) return cmp;
      return a.tierNum - b.tierNum;
    }
    if (fissureSortBy === 'tier') {
      const cmp = a.tierNum - b.tierNum;
      if (cmp !== 0) return cmp;
      return a.missionType.localeCompare(b.missionType);
    }
    // expiry / eta
    return new Date(a.expiry).getTime() - new Date(b.expiry).getTime();
  });

  const syndicates = worldState?.syndicateMissions || [];
  const activeSyndicate =
    syndicates.find((s) => s.syndicate.toLowerCase().includes(activeSyndicateTab.toLowerCase())) ||
    syndicates[0];

  const showCycles = activeSectionView === 'All' || activeSectionView === 'Cycles';
  const showFissures = activeSectionView === 'All' || activeSectionView === 'Fissures';
  const showBounties = activeSectionView === 'All' || activeSectionView === 'Bounties';
  const showEvents = activeSectionView === 'All' || activeSectionView === 'Events';

  return (
    <div style={styles.container}>
      <style>{`
        .live-dashboard-layout {
          display: grid;
          grid-template-columns: 360px minmax(0, 1fr);
          gap: 16px;
          align-items: start;
        }
        .live-main-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
          gap: 16px;
          align-items: start;
        }
        @media (max-width: 1100px) {
          .live-dashboard-layout {
            grid-template-columns: 1fr;
          }
          .live-main-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Top Banner with Compact Meta & Section Filter */}
      <div style={styles.headerBanner}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <h1 style={styles.mainTitle}>Star Chart Live Operations</h1>
          <p style={styles.subTitle}>
            Real-time open world environments, Void fissures, and syndicate bounty rewards.
          </p>
        </div>

        <div style={styles.headerControls}>
          <div style={styles.viewTabs}>
            {(['All', 'Fissures', 'Bounties', 'Events', 'Cycles'] as LiveSectionView[]).map((v) => (
              <button
                key={v}
                onClick={() => setActiveSectionView(v)}
                style={{
                  ...styles.viewTabBtn,
                  backgroundColor: activeSectionView === v ? '#2e3856' : '#141620',
                  color: activeSectionView === v ? '#ffd700' : '#888ca8',
                  borderColor: activeSectionView === v ? '#ffd70088' : '#252a3d',
                }}
              >
                {v === 'All' ? 'All Feeds' : v === 'Events' ? 'Operations & Trader' : v}
              </button>
            ))}
          </div>

          <div style={styles.refreshArea}>
            <button
              onClick={() => loadData(true)}
              disabled={loading}
              style={styles.refreshButton}
              title="Refresh Live Data"
            >
              {loading ? '↻ Syncing...' : '↻ Refresh'}
            </button>
            {lastUpdatedTime && (
              <span style={styles.lastUpdatedText}>Updated {lastUpdatedTime}</span>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div style={styles.errorBox}>
          <strong>Connection Error:</strong> {error}
        </div>
      )}

      {/* 1. Compact Horizontal Open World Cycles Strip */}
      {showCycles && (
        <section style={{ ...styles.panelSection, marginBottom: 16 }}>
          <div style={styles.panelHeader}>
            <div>
              <h2 style={styles.panelTitle}>Open World Environmental Cycles</h2>
              <span style={styles.panelSub}>Real-time solar, thermal, and planetary cycles</span>
            </div>
          </div>
          <div style={styles.cyclesStrip}>
            {cycles.map((c, idx) => (
              <div key={idx} style={styles.cycleCardCompact}>
                <div style={styles.cycleCardTop}>
                  <span style={styles.cycleIcon}>{c.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={styles.cycleNameRow}>
                      <span style={styles.cycleName}>{c.name}</span>
                      <span
                        style={{
                          ...styles.cycleStateBadge,
                          backgroundColor: `${c.stateColor}22`,
                          color: c.stateColor,
                          borderColor: `${c.stateColor}55`,
                        }}
                      >
                        {c.state}
                      </span>
                    </div>
                    <div style={styles.cycleBottomRow}>
                      <span style={styles.cycleTimeLeft}>{c.timeLeft}</span>
                      <span style={styles.cycleHint}>{c.hint}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main Dashboard Layout: Left = Operations, Alerts & Void Trader; Right = Void Fissures + Syndicate Bounties */}
      <div
        className="live-dashboard-layout"
        style={{
          gridTemplateColumns:
            activeSectionView === 'Events'
              ? '1fr'
              : !showEvents
              ? '1fr'
              : undefined,
        }}
      >
        {/* Left Column: Operations, Alerts & Void Trader */}
        {showEvents && (
          <aside style={styles.sidebarColumn}>
            {/* Void Trader (Baro Ki'Teer) */}
            {worldState?.voidTrader && (
              <div style={styles.panelSection}>
                <div style={styles.sidebarSectionHeader}>
                  <div style={styles.cardBadge}>Void Trader</div>
                  <span
                    style={{
                      ...styles.statusBadgeSmall,
                      backgroundColor: worldState.voidTrader.active ? '#1b4332' : '#232942',
                      color: worldState.voidTrader.active ? '#74c69d' : '#8fa0d0',
                      borderColor: worldState.voidTrader.active ? '#2d6a4f' : '#39446d',
                    }}
                  >
                    {worldState.voidTrader.active ? 'Active in Relay' : 'Scheduled Arrival'}
                  </span>
                </div>
                <h3 style={styles.traderTitle}>{worldState.voidTrader.character || "Baro Ki'Teer"}</h3>
                <p style={styles.traderLocation}>
                  {worldState.voidTrader.active
                    ? `Docked at ${worldState.voidTrader.location}!`
                    : `Arrives at ${worldState.voidTrader.location} in ${worldState.voidTrader.startString}`}
                </p>
                {worldState.voidTrader.inventory && worldState.voidTrader.inventory.length > 0 && (
                  <div style={styles.inventoryPreview}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <strong style={{ fontSize: 11, color: '#b0b8d8' }}>Featured Offerings:</strong>
                      <span style={{ fontSize: 10, color: '#ffd700' }}>
                        {worldState.voidTrader.inventory.length} items
                      </span>
                    </div>
                    <div style={styles.traderOfferingsGrid}>
                      {worldState.voidTrader.inventory.slice(0, 6).map((inv, idx) => (
                        <div key={idx} style={styles.traderItemChip}>
                          <ItemThumbnail name={inv.item} size={24} />
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <Link to={`/item/${encodeURIComponent(inv.item)}`} style={styles.itemLink}>
                              {inv.item}
                            </Link>
                            <span style={styles.traderItemCost}>
                              {inv.ducats} Ducats • {inv.credits.toLocaleString()} Cr
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Alerts & Lotus Gifts */}
            <div style={styles.panelSection}>
              <div style={styles.sidebarSectionHeader}>
                <div style={styles.cardBadge}>Alerts & Lotus Gifts</div>
                <span style={styles.countTag}>
                  {(worldState?.alerts || []).length} Active
                </span>
              </div>

              {worldState?.alerts && worldState.alerts.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {worldState.alerts.map((al: WorldStateAlert) => (
                    <div key={al.id} style={styles.alertCard}>
                      <div style={styles.alertTopRow}>
                        <span style={styles.alertMissionType}>{al.mission.type}</span>
                        <span style={styles.alertEta}>{al.eta}</span>
                      </div>
                      <div style={styles.alertNodeRow}>
                        <strong style={{ color: '#f0f0f8', fontSize: 12 }}>{al.mission.node}</strong>
                        <span style={styles.alertFaction}>
                          {al.mission.faction}
                          {al.mission.minEnemyLevel ? ` (Lv ${al.mission.minEnemyLevel}-${al.mission.maxEnemyLevel})` : ''}
                        </span>
                      </div>
                      {al.mission.reward && (
                        <div style={styles.alertRewardBox}>
                          {al.mission.reward.items?.map((item, iIdx) => (
                            <Link
                              key={iIdx}
                              to={`/item/${encodeURIComponent(item)}`}
                              style={styles.alertRewardChip}
                            >
                              <ItemThumbnail name={item} size={18} />
                              <span style={styles.alertRewardName}>{item}</span>
                            </Link>
                          ))}
                          {Boolean(al.mission.reward.credits && al.mission.reward.credits > 0) && (
                            <span style={styles.alertCreditBadge}>
                              {al.mission.reward.credits?.toLocaleString()} Cr
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={styles.emptySidebarNotice}>
                  No tactical alerts or Lotus gifts active right now.
                </div>
              )}
            </div>

            {/* Special Operations / Tactical Events */}
            <div style={styles.panelSection}>
              <div style={styles.sidebarSectionHeader}>
                <div style={styles.cardBadge}>Operations & Events</div>
                <span style={styles.countTag}>
                  {(worldState?.events || []).length} Active
                </span>
              </div>

              {worldState?.events && worldState.events.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {worldState.events.map((ev) => (
                    <div key={ev.id} style={styles.eventCard}>
                      <h3 style={styles.eventTitle}>{ev.description}</h3>
                      {ev.tooltip && <p style={styles.eventTooltip}>{ev.tooltip}</p>}
                      {ev.node && <div style={styles.eventNode}>Location: <strong>{ev.node}</strong></div>}
                      {ev.health !== undefined && (
                        <div style={styles.healthBarContainer}>
                          <div
                            style={{
                              ...styles.healthBarFill,
                              width: `${Math.max(0, Math.min(100, ev.health))}%`,
                            }}
                          />
                          <span style={styles.healthText}>{ev.health.toFixed(1)}% Health</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={styles.emptySidebarNotice}>
                  No ongoing special operations reported.
                </div>
              )}
            </div>

            {/* Daily Sortie (if active) */}
            {worldState?.sortie && (
              <div style={styles.panelSection}>
                <div style={styles.sidebarSectionHeader}>
                  <div style={styles.cardBadge}>Daily Sortie</div>
                  <span style={styles.fissureEta}>{worldState.sortie.eta}</span>
                </div>
                <h4 style={styles.sortieBoss}>{worldState.sortie.boss}</h4>
                <span style={styles.sortieFaction}>{worldState.sortie.faction}</span>
                <div style={styles.sortieVariantsList}>
                  {worldState.sortie.variants.map((v, sIdx) => (
                    <div key={sIdx} style={styles.sortieVariantRow}>
                      <span style={styles.sortieStageNum}>{sIdx + 1}</span>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={styles.sortieVariantMission}>{v.missionType} • {v.node}</div>
                        <span style={styles.sortieVariantMod} title={v.modifierDescription}>
                          {v.modifier}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        )}

        {/* Right Content Area: Void Fissures + Syndicate Bounties */}
        {(showFissures || showBounties) && (
          <main style={styles.mainContentArea}>
            <div
              className="live-main-grid"
              style={{
                gridTemplateColumns:
                  showFissures && showBounties
                    ? 'minmax(0, 1.15fr) minmax(0, 1fr)'
                    : '1fr',
              }}
            >
              {/* Void Fissures Column */}
              {showFissures && (
                <section style={styles.panelSection}>
                  <div style={styles.panelHeader}>
                    <div>
                      <h2 style={styles.panelTitle}>Void Fissures ({sortedFissures.length})</h2>
                      <span style={styles.panelSub}>Sorted by {fissureSortBy === 'type' ? 'Mission Type' : fissureSortBy === 'tier' ? 'Era Tier' : 'Time Left'}</span>
                    </div>

                    {/* Sort & Filter Controls */}
                    <div style={styles.filterBar}>
                      {/* Sort Selector */}
                      <div style={styles.sortButtonGroup}>
                        <span style={styles.sortGroupLabel}>Sort:</span>
                        <button
                          onClick={() => setFissureSortBy('type')}
                          style={{
                            ...styles.sortBtn,
                            backgroundColor: fissureSortBy === 'type' ? '#2e3856' : '#141620',
                            color: fissureSortBy === 'type' ? '#ffd700' : '#888ca8',
                            borderColor: fissureSortBy === 'type' ? '#ffd70088' : '#252a3d',
                          }}
                        >
                          Type
                        </button>
                        <button
                          onClick={() => setFissureSortBy('tier')}
                          style={{
                            ...styles.sortBtn,
                            backgroundColor: fissureSortBy === 'tier' ? '#2e3856' : '#141620',
                            color: fissureSortBy === 'tier' ? '#ffd700' : '#888ca8',
                            borderColor: fissureSortBy === 'tier' ? '#ffd70088' : '#252a3d',
                          }}
                        >
                          Tier
                        </button>
                        <button
                          onClick={() => setFissureSortBy('eta')}
                          style={{
                            ...styles.sortBtn,
                            backgroundColor: fissureSortBy === 'eta' ? '#2e3856' : '#141620',
                            color: fissureSortBy === 'eta' ? '#ffd700' : '#888ca8',
                            borderColor: fissureSortBy === 'eta' ? '#ffd70088' : '#252a3d',
                          }}
                        >
                          Time
                        </button>
                      </div>

                      {/* Tier Filter Buttons */}
                      <div style={styles.tierButtonGroup}>
                        {['All', 'Lith', 'Meso', 'Neo', 'Axi', 'Requiem', 'Omnia'].map((tier) => (
                          <button
                            key={tier}
                            onClick={() => setSelectedFissureTier(tier)}
                            style={{
                              ...styles.tierButton,
                              backgroundColor: selectedFissureTier === tier ? '#8e9ec4' : '#141620',
                              color: selectedFissureTier === tier ? '#0e0e12' : '#c8c8d8',
                            }}
                          >
                            {tier}
                          </button>
                        ))}
                      </div>

                      {/* Mission Type Dropdown Filter */}
                      {uniqueMissionTypes.length > 0 && (
                        <select
                          value={selectedMissionType}
                          onChange={(e) => setSelectedMissionType(e.target.value)}
                          style={styles.missionTypeSelect}
                          aria-label="Filter fissure by mission type"
                        >
                          <option value="All">All Types</option>
                          {uniqueMissionTypes.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      )}

                      <label style={styles.steelPathToggle}>
                        <input
                          type="checkbox"
                          checked={steelPathOnly}
                          onChange={(e) => setSteelPathOnly(e.target.checked)}
                          style={{ marginRight: 6 }}
                        />
                        Steel Path
                      </label>
                    </div>
                  </div>

                  <div style={styles.fissuresScrollList}>
                    {sortedFissures.length > 0 ? (
                      sortedFissures.map((f) => (
                        <div key={f.id} style={styles.fissureRow}>
                          <div style={styles.fissureRowLeft}>
                            <span
                              style={{
                                ...styles.fissureTierBadge,
                                backgroundColor:
                                  f.tier === 'Lith'
                                    ? '#665533'
                                    : f.tier === 'Meso'
                                    ? '#335566'
                                    : f.tier === 'Neo'
                                    ? '#663366'
                                    : f.tier === 'Axi'
                                    ? '#666622'
                                    : '#553344',
                              }}
                            >
                              {f.tier}
                            </span>
                            <span style={styles.missionTypeBadge}>
                              {f.missionType}
                            </span>
                            {f.isHard && <span style={styles.steelPathBadge}>SP</span>}
                            {f.isStorm && <span style={styles.stormBadge}>Storm</span>}
                            <div>
                              <h4 style={styles.fissureNode}>{f.node}</h4>
                              <span style={styles.fissureEnemyFaction}>
                                {f.enemy}
                              </span>
                            </div>
                          </div>
                          <span style={styles.fissureEta}>{f.eta}</span>
                        </div>
                      ))
                    ) : (
                      <div style={styles.emptyState}>No fissures matching filter.</div>
                    )}
                  </div>
                </section>
              )}

              {/* Syndicate Bounties Column */}
              {showBounties && (
                <section style={styles.panelSection}>
                  <div style={styles.panelHeader}>
                    <div>
                      <h2 style={styles.panelTitle}>Syndicate Bounties</h2>
                      <span style={styles.panelSub}>Active stages & rewards</span>
                    </div>

                    <div style={styles.bountyHeaderRight}>
                      {/* Hide / Show All Rewards Toggle */}
                      <button
                        type="button"
                        onClick={() => {
                          const nextState = !showBountyRewards;
                          setShowBountyRewards(nextState);
                          setExpandedBountyIndices({});
                        }}
                        style={{
                          ...styles.toggleRewardsBtn,
                          backgroundColor: showBountyRewards ? '#202538' : '#141620',
                          color: showBountyRewards ? '#ffd700' : '#888ca8',
                          borderColor: showBountyRewards ? '#ffd70066' : '#252a3d',
                        }}
                        title={showBountyRewards ? 'Hide all rewards to save space' : 'Show all reward pools'}
                      >
                        {showBountyRewards ? '👁 Hide Rewards' : '👁 Show Rewards'}
                      </button>

                      {/* Syndicate Tabs */}
                      <div style={styles.syndicateTabs}>
                        {['Ostrons', 'Solaris', 'Entrati', 'Holdfasts', 'Cavia'].map((syn) => (
                          <button
                            key={syn}
                            onClick={() => setActiveSyndicateTab(syn)}
                            style={{
                              ...styles.syndicateTabBtn,
                              backgroundColor: activeSyndicateTab === syn ? '#2c334d' : 'transparent',
                              color: activeSyndicateTab === syn ? '#ffd700' : '#888ca8',
                              borderColor: activeSyndicateTab === syn ? '#ffd700' : '#222534',
                            }}
                          >
                            {syn}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={styles.bountiesScrollList}>
                    {activeSyndicate && activeSyndicate.jobs.length > 0 ? (
                      activeSyndicate.jobs.map((job: SyndicateJob, jIdx: number) => {
                        const drops = job.rewardPoolDrops || [];
                        const rawPool = job.rewardPool || [];
                        const isRewardsOpen =
                          expandedBountyIndices[jIdx] !== undefined
                            ? expandedBountyIndices[jIdx]
                            : showBountyRewards;

                        return (
                          <div key={job.id || jIdx} style={styles.bountyCardCompact}>
                            <div style={styles.bountyHeaderCompact}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                <span style={styles.bountyTierBadge}>Tier {jIdx + 1}</span>
                                <h4 style={styles.bountyTitleCompact}>
                                  {job.type || `Stage ${jIdx + 1}`}
                                </h4>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={styles.bountyMetaCompact}>
                                  <span>Lv {job.enemyLevels[0]}-{job.enemyLevels[1]}</span>
                                  <span>{job.standingStages.reduce((a, b) => a + b, 0).toLocaleString()} Standing</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedBountyIndices((prev) => ({
                                      ...prev,
                                      [jIdx]: !isRewardsOpen,
                                    }))
                                  }
                                  style={styles.cardToggleBtn}
                                  aria-label={isRewardsOpen ? 'Hide stage rewards' : 'Show stage rewards'}
                                  title={isRewardsOpen ? 'Hide rewards' : 'Show rewards'}
                                >
                                  {isRewardsOpen ? 'Rewards ▴' : 'Rewards ▾'}
                                </button>
                              </div>
                            </div>

                            {/* Rewards Grid (Expandable) */}
                            {isRewardsOpen && (
                              <div style={styles.rewardsSectionCompact}>
                                <div style={styles.rewardsGridCompact}>
                                  {drops.length > 0 ? (
                                    drops.slice(0, 10).map((d, dIdx) => (
                                      <Link
                                        key={dIdx}
                                        to={`/item/${encodeURIComponent(d.item)}`}
                                        style={styles.rewardChipCompact}
                                        title={d.item}
                                      >
                                        <ItemThumbnail name={d.item} size={20} />
                                        <span style={styles.rewardNameCompact}>{d.item}</span>
                                        {d.chance !== undefined && (
                                          <span style={styles.rewardChance}>{d.chance}%</span>
                                        )}
                                      </Link>
                                    ))
                                  ) : (
                                    rawPool.slice(0, 8).map((itemName, rIdx) => (
                                      <Link
                                        key={rIdx}
                                        to={`/item/${encodeURIComponent(itemName)}`}
                                        style={styles.rewardChipCompact}
                                        title={itemName}
                                      >
                                        <ItemThumbnail name={itemName} size={20} />
                                        <span style={styles.rewardNameCompact}>{itemName}</span>
                                      </Link>
                                    ))
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div style={styles.emptyState}>
                        No active bounties reported for {activeSyndicateTab}.
                      </div>
                    )}
                  </div>
                </section>
              )}
            </div>
          </main>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    maxWidth: 'none',
    margin: 0,
    padding: '16px 24px 60px 24px',
    boxSizing: 'border-box',
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
  versionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  liveIndicator: {
    color: '#00e676',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
  },
  versionBadge: {
    backgroundColor: '#25293d',
    color: '#ffd700',
    fontSize: 11,
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: 4,
    border: '1px solid #ffd70044',
  },
  buildBadge: {
    backgroundColor: '#1d2130',
    color: '#8e9ec4',
    fontSize: 10,
    padding: '2px 6px',
    borderRadius: 4,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: '#f0f0f8',
    margin: '0 0 4px 0',
  },
  subTitle: {
    fontSize: 13,
    color: '#888ca8',
    margin: 0,
  },
  headerControls: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  viewTabs: {
    display: 'flex',
    backgroundColor: '#11131a',
    borderRadius: 6,
    padding: 3,
    border: '1px solid #232738',
    gap: 3,
    flexWrap: 'wrap',
  },
  viewTabBtn: {
    border: '1px solid transparent',
    borderRadius: 4,
    padding: '6px 12px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  refreshArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 4,
  },
  refreshButton: {
    backgroundColor: '#282d42',
    color: '#e0e0f0',
    border: '1px solid #3d4566',
    borderRadius: 6,
    padding: '8px 14px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  lastUpdatedText: {
    fontSize: 11,
    color: '#888ca8',
  },
  errorBox: {
    backgroundColor: '#38181e',
    color: '#ff8899',
    padding: '10px 14px',
    borderRadius: 6,
    border: '1px solid #662233',
    marginBottom: 16,
    fontSize: 13,
  },
  sectionCompact: {
    marginBottom: 18,
  },
  cyclesStrip: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 10,
  },
  cycleCardCompact: {
    backgroundColor: '#141620',
    border: '1px solid #232736',
    borderRadius: 6,
    padding: '10px 12px',
  },
  cycleCardTop: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  cycleIcon: {
    fontSize: 20,
  },
  cycleNameRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  cycleName: {
    fontSize: 13,
    fontWeight: 600,
    color: '#e0e0ec',
  },
  cycleStateBadge: {
    fontSize: 10,
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: 4,
    borderWidth: 1,
    borderStyle: 'solid',
  },
  cycleBottomRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cycleTimeLeft: {
    fontSize: 14,
    fontWeight: 700,
    color: '#ffd700',
  },
  cycleHint: {
    fontSize: 11,
    color: '#888ca8',
  },
  sidebarColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  sidebarHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  sidebarSectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadgeSmall: {
    fontSize: 10,
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: 4,
    border: '1px solid',
  },
  countTag: {
    fontSize: 10,
    color: '#888ca8',
    backgroundColor: '#1c1f2e',
    padding: '2px 6px',
    borderRadius: 3,
    fontWeight: 600,
  },
  mainContentArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    minWidth: 0,
  },
  panelSection: {
    backgroundColor: '#12141d',
    border: '1px solid #1f2334',
    borderRadius: 8,
    padding: 16,
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    flexWrap: 'wrap',
    gap: 10,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#f0f0f8',
    margin: '0 0 2px 0',
  },
  panelSub: {
    fontSize: 11,
    color: '#888ca8',
  },
  filterBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  sortButtonGroup: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#161824',
    borderRadius: 4,
    padding: 2,
    border: '1px solid #232738',
    gap: 2,
  },
  sortGroupLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: '#888ca8',
    padding: '0 4px',
    textTransform: 'uppercase',
  },
  sortBtn: {
    border: '1px solid transparent',
    borderRadius: 3,
    padding: '4px 8px',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  tierButtonGroup: {
    display: 'flex',
    backgroundColor: '#161824',
    borderRadius: 4,
    padding: 2,
    border: '1px solid #232738',
  },
  tierButton: {
    border: 'none',
    borderRadius: 4,
    padding: '6px 10px',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
  },
  missionTypeSelect: {
    backgroundColor: '#161824',
    color: '#d0d4e8',
    border: '1px solid #282f48',
    borderRadius: 4,
    padding: '5px 8px',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
  },
  steelPathToggle: {
    fontSize: 11,
    fontWeight: 600,
    color: '#ff7788',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  fissuresScrollList: {
    maxHeight: 560,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    paddingRight: 4,
  },
  fissureRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#161826',
    border: '1px solid #22263a',
    borderRadius: 6,
    padding: '8px 12px',
    transition: 'border-color 0.15s ease',
  },
  fissureRowLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  fissureTierBadge: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: 4,
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  missionTypeBadge: {
    backgroundColor: '#20263c',
    color: '#9baacf',
    fontSize: 10,
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: 4,
    border: '1px solid #2f3856',
  },
  steelPathBadge: {
    backgroundColor: '#661122',
    color: '#ff7788',
    fontSize: 9,
    fontWeight: 700,
    padding: '2px 4px',
    borderRadius: 4,
    border: '1px solid #ff445555',
  },
  stormBadge: {
    backgroundColor: '#332255',
    color: '#cc88ff',
    fontSize: 9,
    fontWeight: 700,
    padding: '2px 4px',
    borderRadius: 4,
    border: '1px solid #aa66ff55',
  },
  fissureNode: {
    fontSize: 13,
    fontWeight: 600,
    color: '#f0f0f8',
    margin: 0,
  },
  fissureEnemyFaction: {
    fontSize: 11,
    color: '#888ca8',
  },
  fissureEta: {
    fontSize: 11,
    color: '#ffd700',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    marginLeft: 8,
  },
  bountyHeaderRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  toggleRewardsBtn: {
    border: '1px solid',
    borderRadius: 4,
    padding: '5px 10px',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  syndicateTabs: {
    display: 'flex',
    gap: 4,
    flexWrap: 'wrap',
  },
  syndicateTabBtn: {
    border: '1px solid',
    borderRadius: 4,
    padding: '6px 10px',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
  },
  bountiesScrollList: {
    maxHeight: 560,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    paddingRight: 4,
  },
  bountyCardCompact: {
    backgroundColor: '#151722',
    border: '1px solid #232738',
    borderRadius: 6,
    padding: '8px 12px',
    transition: 'border-color 0.15s ease',
  },
  bountyHeaderCompact: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  bountyTierBadge: {
    backgroundColor: '#262a3f',
    color: '#90a0d0',
    border: '1px solid #3b4263',
    fontSize: 10,
    fontWeight: 700,
    padding: '2px 5px',
    borderRadius: 4,
  },
  bountyTitleCompact: {
    fontSize: 13,
    fontWeight: 600,
    color: '#f0f0f8',
    margin: 0,
    display: 'inline-block',
  },
  bountyMetaCompact: {
    display: 'flex',
    gap: 8,
    fontSize: 11,
    color: '#888ca8',
  },
  cardToggleBtn: {
    backgroundColor: '#1c1f2e',
    border: '1px solid #2d334a',
    borderRadius: 4,
    color: '#9baacf',
    fontSize: 10,
    fontWeight: 600,
    padding: '3px 8px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  rewardsSectionCompact: {
    borderTop: '1px solid #1c2030',
    paddingTop: 8,
    marginTop: 8,
  },
  rewardsGridCompact: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  },
  rewardChipCompact: {
    backgroundColor: '#1b1e2c',
    border: '1px solid #2b3046',
    borderRadius: 4,
    padding: '3px 6px',
    fontSize: 11,
    color: '#d0d4e8',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    transition: 'border-color 0.15s ease',
  },
  rewardNameCompact: {
    fontWeight: 500,
    maxWidth: 160,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  rewardChance: {
    color: '#ffd700',
    fontWeight: 700,
    fontSize: 10,
  },
  emptyState: {
    padding: 24,
    textAlign: 'center',
    color: '#888ca8',
    fontSize: 13,
    backgroundColor: '#141620',
    borderRadius: 6,
  },
  traderCard: {
    backgroundColor: '#141622',
    border: '1px solid #2a3048',
    borderRadius: 6,
    padding: 14,
  },
  eventCard: {
    backgroundColor: '#151824',
    border: '1px solid #242738',
    borderRadius: 6,
    padding: 12,
  },
  cardBadge: {
    fontSize: 10,
    fontWeight: 700,
    color: '#ffd700',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  traderTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: '#fff',
    margin: '0 0 4px 0',
  },
  traderLocation: {
    fontSize: 12,
    color: '#9baacf',
    marginBottom: 8,
  },
  inventoryPreview: {
    borderTop: '1px solid #23283c',
    paddingTop: 8,
  },
  traderOfferingsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  traderItemChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#171a28',
    border: '1px solid #282f48',
    borderRadius: 4,
    padding: '4px 8px',
  },
  itemLink: {
    color: '#ffd700',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: 12,
    display: 'block',
  },
  traderItemCost: {
    fontSize: 10,
    color: '#888ca8',
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#f0f0f8',
    margin: '0 0 4px 0',
  },
  eventTooltip: {
    fontSize: 11,
    color: '#888ca8',
    margin: '0 0 6px 0',
    lineHeight: 1.3,
  },
  eventNode: {
    fontSize: 11,
    color: '#8e9ec4',
    marginBottom: 8,
  },
  healthBarContainer: {
    backgroundColor: '#202434',
    borderRadius: 4,
    height: 14,
    position: 'relative',
    overflow: 'hidden',
  },
  healthBarFill: {
    backgroundColor: '#ff4455',
    height: '100%',
    transition: 'width 0.5s ease',
  },
  healthText: {
    position: 'absolute',
    top: 0,
    left: 6,
    fontSize: 9,
    fontWeight: 700,
    color: '#fff',
    lineHeight: '14px',
  },
  alertCard: {
    backgroundColor: '#161927',
    border: '1px solid #252a3d',
    borderRadius: 6,
    padding: 10,
  },
  alertTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  alertMissionType: {
    fontSize: 11,
    fontWeight: 700,
    color: '#74c69d',
    backgroundColor: '#1b3828',
    padding: '2px 5px',
    borderRadius: 3,
  },
  alertEta: {
    fontSize: 11,
    color: '#ffd700',
    fontWeight: 600,
  },
  alertNodeRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    fontSize: 11,
  },
  alertFaction: {
    color: '#888ca8',
    fontSize: 10,
  },
  alertRewardBox: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 4,
    alignItems: 'center',
  },
  alertRewardChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1d2133',
    border: '1px solid #2f3652',
    borderRadius: 3,
    padding: '2px 6px',
    textDecoration: 'none',
    color: '#e0e0ec',
    fontSize: 10,
  },
  alertRewardName: {
    fontWeight: 500,
  },
  alertCreditBadge: {
    fontSize: 10,
    fontWeight: 600,
    color: '#ffd700',
    backgroundColor: '#262419',
    padding: '2px 5px',
    borderRadius: 3,
  },
  emptySidebarNotice: {
    padding: 12,
    fontSize: 12,
    color: '#888ca8',
    backgroundColor: '#151722',
    borderRadius: 6,
    textAlign: 'center',
  },
  sortieBoss: {
    fontSize: 14,
    fontWeight: 700,
    color: '#f0f0f8',
    margin: '0 0 2px 0',
  },
  sortieFaction: {
    fontSize: 11,
    color: '#8e9ec4',
    display: 'block',
    marginBottom: 8,
  },
  sortieVariantsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  sortieVariantRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#161927',
    border: '1px solid #23283c',
    borderRadius: 4,
    padding: '6px 8px',
  },
  sortieStageNum: {
    fontSize: 10,
    fontWeight: 700,
    backgroundColor: '#282d45',
    color: '#90a0d0',
    borderRadius: 3,
    width: 16,
    height: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  sortieVariantMission: {
    fontSize: 11,
    fontWeight: 600,
    color: '#e0e0f0',
  },
  sortieVariantMod: {
    fontSize: 10,
    color: '#ff9988',
  },
};

