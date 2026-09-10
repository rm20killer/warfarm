import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  getAllWarframes,
  getAllWeapons,
  getAllGear,
  LootSourceItem,
  LootCategory,
  ComponentDrop,
} from '../../shared/data/loot-sources';
import {
  getItemGeneralInfo,
  getWeaponCombatStats,
  getWeaponExtraInfo,
  ItemGeneralInfo,
  WeaponCombatStats,
  WeaponExtraInfo,
} from '../../shared/data/item-database';
import {
  getIncarnonGenesisWeek,
  getIncarnonGenesisDetails,
  INCARNON_ORIGINALS,
} from '../../shared/data/vendor-sources';
import {
  getPersonalTargets,
  savePersonalTarget,
  removePersonalTarget,
} from '../storage';
import { ItemThumbnail } from '../../shared/utils/item-images';

export type GearTab = 'Warframes' | 'Weapons' | 'Gear' | 'Companions' | 'Archwing';

export type SpecialLineage = 'All' | 'Incarnon' | 'Coda' | 'Tenet' | 'Kuva';

export type WeaponSortOption =
  | 'Default'
  | 'Name (Z - A)'
  | 'Incarnon First'
  | 'Coda First'
  | 'Tenet First'
  | 'Kuva First'
  | 'Special First'
  | 'Mastery Rank (High - Low)'
  | 'Mastery Rank (Low - High)';

export function getWeaponLineage(name: string, subType?: string): 'Incarnon' | 'Coda' | 'Tenet' | 'Kuva' | null {
  const lower = name.toLowerCase().trim();
  const sub = (subType || '').toLowerCase();

  if (lower.startsWith('coda ') || sub.includes('coda')) {
    return 'Coda';
  }
  if (lower.startsWith('tenet ') || sub.includes('tenet')) {
    return 'Tenet';
  }
  if (lower.startsWith('kuva ') || sub.includes('kuva')) {
    return 'Kuva';
  }
  if (
    lower.includes('incarnon') ||
    sub.includes('incarnon') ||
    INCARNON_ORIGINALS.some((o) => o.toLowerCase() === lower) ||
    Boolean(getIncarnonGenesisWeek(name)) ||
    Boolean(getIncarnonGenesisDetails(name))
  ) {
    return 'Incarnon';
  }
  return null;
}

interface GearCardItem {
  id: string;
  name: string;
  category: LootCategory;
  subType?: string;
  acquisitionType: string;
  bossOrEnemyName?: string;
  locationNode?: string;
  planet?: string;
  description: string;
  components?: ComponentDrop[];
  generalDropInfo?: string;
  generalInfo?: ItemGeneralInfo;
  combatStats?: WeaponCombatStats;
  extraInfo?: WeaponExtraInfo;
}

export function GearDirectoryPage() {
  const [searchParams] = useSearchParams();
  const paramTab = searchParams.get('tab') as GearTab | null;
  const paramLineage = searchParams.get('lineage') as SpecialLineage | null;

  const [activeTab, setActiveTab] = useState<GearTab>(
    paramLineage && paramLineage !== 'All' ? 'Weapons' : paramTab || 'Warframes'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAcquisition, setSelectedAcquisition] = useState('All');
  const [selectedWeaponType, setSelectedWeaponType] = useState('All');
  const [selectedLineage, setSelectedLineage] = useState<SpecialLineage>(paramLineage || 'All');
  const [weaponSort, setWeaponSort] = useState<WeaponSortOption>('Default');
  const [targetIds, setTargetIds] = useState<Set<string>>(new Set());
  const [visibleCount, setVisibleCount] = useState<number>(36);

  useEffect(() => {
    setVisibleCount(36);
  }, [activeTab, searchQuery, selectedAcquisition, selectedWeaponType, selectedLineage, weaponSort]);

  useEffect(() => {
    const update = () => {
      const targets = getPersonalTargets();
      setTargetIds(new Set(targets.map((t) => t.id)));
    };
    update();
    window.addEventListener('personal-targets-updated', update);
    return () => window.removeEventListener('personal-targets-updated', update);
  }, []);

  const rawWarframes = useMemo(() => getAllWarframes(), []);
  const rawWeapons = useMemo(() => getAllWeapons(), []);
  const rawAllGear = useMemo(() => getAllGear(), []);
  const rawGear = useMemo(() => rawAllGear.filter((g) => g.category === 'Gear'), [rawAllGear]);
  const rawCompanions = useMemo(() => rawAllGear.filter((g) => g.category === 'Companions'), [rawAllGear]);
  const rawArchwing = useMemo(() => rawAllGear.filter((g) => g.category === 'Archwing'), [rawAllGear]);

  const gearCatalog = useMemo<GearCardItem[]>(() => {
    let sourceList: LootSourceItem[];
    if (activeTab === 'Warframes') sourceList = rawWarframes;
    else if (activeTab === 'Weapons') sourceList = rawWeapons;
    else if (activeTab === 'Companions') sourceList = rawCompanions;
    else if (activeTab === 'Archwing') sourceList = rawArchwing;
    else sourceList = rawGear;

    return sourceList.map((item) => ({
      ...item,
      generalInfo: getItemGeneralInfo(item.name) || getItemGeneralInfo(item.id),
      combatStats: getWeaponCombatStats(item.name) || getWeaponCombatStats(item.id),
      extraInfo: getWeaponExtraInfo(item.name) || getWeaponExtraInfo(item.id),
    }));
  }, [activeTab, rawWarframes, rawWeapons, rawGear, rawCompanions, rawArchwing]);

  const lineageCounts = useMemo(() => {
    if (activeTab !== 'Weapons') return { Incarnon: 0, Coda: 0, Tenet: 0, Kuva: 0 };
    let inc = 0;
    let coda = 0;
    let tenet = 0;
    let kuva = 0;
    for (const item of rawWeapons) {
      const lin = getWeaponLineage(item.name, item.subType);
      if (lin === 'Incarnon') inc++;
      else if (lin === 'Coda') coda++;
      else if (lin === 'Tenet') tenet++;
      else if (lin === 'Kuva') kuva++;
    }
    return { Incarnon: inc, Coda: coda, Tenet: tenet, Kuva: kuva };
  }, [rawWeapons, activeTab]);

  const acquisitionTypes = useMemo(() => {
    const types = new Set<string>();
    for (const item of gearCatalog) {
      if (item.acquisitionType) types.add(item.acquisitionType);
    }
    return ['All', ...Array.from(types).sort()];
  }, [gearCatalog]);

  const weaponTypes = useMemo(() => {
    if (activeTab !== 'Weapons') return [];
    return ['All', 'Primary', 'Secondary', 'Melee', 'Bow', 'Shotgun', 'Gunblade', 'Scythe'];
  }, [activeTab]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const filtered = gearCatalog.filter((item) => {
      if (selectedAcquisition !== 'All' && item.acquisitionType !== selectedAcquisition) {
        return false;
      }
      if (activeTab === 'Weapons') {
        if (selectedWeaponType !== 'All') {
          const sub = (item.subType || '').toLowerCase();
          if (!sub.includes(selectedWeaponType.toLowerCase())) return false;
        }
        if (selectedLineage !== 'All') {
          const lineage = getWeaponLineage(item.name, item.subType);
          if (lineage !== selectedLineage) return false;
        }
      }
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        (item.subType && item.subType.toLowerCase().includes(q)) ||
        (item.bossOrEnemyName && item.bossOrEnemyName.toLowerCase().includes(q)) ||
        (item.locationNode && item.locationNode.toLowerCase().includes(q)) ||
        (item.planet && item.planet.toLowerCase().includes(q)) ||
        item.description.toLowerCase().includes(q) ||
        (item.components && item.components.some((c) => c.partName.toLowerCase().includes(q) || c.sourceText.toLowerCase().includes(q)))
      );
    });

    if (activeTab === 'Weapons') {
      return [...filtered].sort((a, b) => {
        const linA = getWeaponLineage(a.name, a.subType);
        const linB = getWeaponLineage(b.name, b.subType);

        if (weaponSort === 'Incarnon First') {
          const isA = linA === 'Incarnon';
          const isB = linB === 'Incarnon';
          if (isA && !isB) return -1;
          if (!isA && isB) return 1;
        } else if (weaponSort === 'Coda First') {
          const isA = linA === 'Coda';
          const isB = linB === 'Coda';
          if (isA && !isB) return -1;
          if (!isA && isB) return 1;
        } else if (weaponSort === 'Tenet First') {
          const isA = linA === 'Tenet';
          const isB = linB === 'Tenet';
          if (isA && !isB) return -1;
          if (!isA && isB) return 1;
        } else if (weaponSort === 'Kuva First') {
          const isA = linA === 'Kuva';
          const isB = linB === 'Kuva';
          if (isA && !isB) return -1;
          if (!isA && isB) return 1;
        } else if (weaponSort === 'Special First') {
          const priority: Record<string, number> = { Incarnon: 1, Coda: 2, Tenet: 3, Kuva: 4 };
          const pA = linA ? priority[linA] || 99 : 99;
          const pB = linB ? priority[linB] || 99 : 99;
          if (pA !== pB) return pA - pB;
        } else if (weaponSort === 'Mastery Rank (High - Low)') {
          const mrA = a.generalInfo?.masteryReq ?? 0;
          const mrB = b.generalInfo?.masteryReq ?? 0;
          if (mrA !== mrB) return mrB - mrA;
        } else if (weaponSort === 'Mastery Rank (Low - High)') {
          const mrA = a.generalInfo?.masteryReq ?? 0;
          const mrB = b.generalInfo?.masteryReq ?? 0;
          if (mrA !== mrB) return mrA - mrB;
        } else if (weaponSort === 'Name (Z - A)') {
          return b.name.localeCompare(a.name);
        }

        return a.name.localeCompare(b.name);
      });
    }

    return filtered;
  }, [gearCatalog, searchQuery, selectedAcquisition, selectedWeaponType, selectedLineage, weaponSort, activeTab]);

  const handleToggleTarget = (item: GearCardItem) => {
    if (targetIds.has(item.id)) {
      removePersonalTarget(item.id);
    } else {
      savePersonalTarget({
        id: item.id,
        name: item.name,
        category: item.category,
        targetQuantity: 1,
        currentQuantity: 0,
        notes: `Source: ${item.bossOrEnemyName || item.locationNode || 'Official Drops'}`,
      });
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Warframes & Weapons Directory</h1>
        <p style={styles.subtitle}>
          Browse official acquisition routes, component drop rates, boss encounters, and combat specs.
        </p>
      </header>

      {/* Mode Tabs */}
      <div style={styles.tabBar} role="tablist" aria-label="Gear categories">
        <button
          role="tab"
          aria-selected={activeTab === 'Warframes'}
          onClick={() => {
            setActiveTab('Warframes');
            setSelectedAcquisition('All');
          }}
          style={{
            ...styles.tabButton,
            ...(activeTab === 'Warframes' ? styles.tabButtonActive : {}),
          }}
        >
          Warframes ({rawWarframes.length})
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'Weapons'}
          onClick={() => {
            setActiveTab('Weapons');
            setSelectedAcquisition('All');
            setSelectedWeaponType('All');
          }}
          style={{
            ...styles.tabButton,
            ...(activeTab === 'Weapons' ? styles.tabButtonActive : {}),
          }}
        >
          Weapons ({rawWeapons.length})
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'Gear'}
          onClick={() => {
            setActiveTab('Gear');
            setSelectedAcquisition('All');
          }}
          style={{
            ...styles.tabButton,
            ...(activeTab === 'Gear' ? styles.tabButtonActive : {}),
          }}
        >
          Gear & Upgrades ({rawGear.length})
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'Companions'}
          onClick={() => {
            setActiveTab('Companions');
            setSelectedAcquisition('All');
          }}
          style={{
            ...styles.tabButton,
            ...(activeTab === 'Companions' ? styles.tabButtonActive : {}),
          }}
        >
          Companions ({rawCompanions.length})
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'Archwing'}
          onClick={() => {
            setActiveTab('Archwing');
            setSelectedAcquisition('All');
          }}
          style={{
            ...styles.tabButton,
            ...(activeTab === 'Archwing' ? styles.tabButtonActive : {}),
          }}
        >
          Archwing ({rawArchwing.length})
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div style={styles.filterSection}>
        <div style={styles.searchRow}>
          <input
            type="text"
            placeholder={`Search ${activeTab.toLowerCase()} by name, boss, node, component...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
            aria-label={`Search ${activeTab}`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={styles.clearButton}
              aria-label="Clear search"
            >
              Clear
            </button>
          )}
        </div>

        <div style={styles.filterRow}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Acquisition Type:</label>
            <div style={styles.pillContainer}>
              {acquisitionTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedAcquisition(type)}
                  style={{
                    ...styles.filterPill,
                    ...(selectedAcquisition === type ? styles.filterPillActive : {}),
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'Weapons' && (
            <>
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Special Lineage:</label>
                <div style={styles.pillContainer}>
                  {(['All', 'Incarnon', 'Coda', 'Tenet', 'Kuva'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedLineage(type)}
                      style={{
                        ...styles.filterPill,
                        ...(selectedLineage === type ? styles.filterPillActive : {}),
                        ...(type === 'Incarnon' && selectedLineage === type ? { borderColor: '#b877f0', color: '#e8d4ff', background: '#2c1844' } : {}),
                        ...(type === 'Coda' && selectedLineage === type ? { borderColor: '#ff6b81', color: '#ffd6dc', background: '#38161e' } : {}),
                        ...(type === 'Tenet' && selectedLineage === type ? { borderColor: '#4fc3f7', color: '#e1f5fe', background: '#102a3a' } : {}),
                        ...(type === 'Kuva' && selectedLineage === type ? { borderColor: '#e53935', color: '#ffebee', background: '#361414' } : {}),
                      }}
                    >
                      {type === 'All'
                        ? 'All Lineages'
                        : `${type} (${lineageCounts[type]})`}
                    </button>
                  ))}
                </div>
              </div>

              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Weapon Class:</label>
                <div style={styles.pillContainer}>
                  {weaponTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedWeaponType(type)}
                      style={{
                        ...styles.filterPill,
                        ...(selectedWeaponType === type ? styles.filterPillActive : {}),
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Sort Order:</label>
                <select
                  value={weaponSort}
                  onChange={(e) => setWeaponSort(e.target.value as WeaponSortOption)}
                  style={styles.sortSelect}
                  aria-label="Sort weapons"
                >
                  <option value="Default">Alphabetical (A - Z)</option>
                  <option value="Name (Z - A)">Alphabetical (Z - A)</option>
                  <option value="Incarnon First">Incarnon First</option>
                  <option value="Coda First">Coda First</option>
                  <option value="Tenet First">Tenet First</option>
                  <option value="Kuva First">Kuva First</option>
                  <option value="Special First">Special Lineages First (Incarnon, Coda, Tenet, Kuva)</option>
                  <option value="Mastery Rank (High - Low)">Mastery Rank (High - Low)</option>
                  <option value="Mastery Rank (Low - High)">Mastery Rank (Low - High)</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div style={styles.resultsMeta}>
        <span>
          Showing {Math.min(visibleCount, filteredItems.length)} of {filteredItems.length} {activeTab.toLowerCase()}
          {activeTab === 'Weapons' && selectedLineage !== 'All' && ` (${selectedLineage})`}
        </span>
      </div>

      {/* Catalog Grid */}
      <div style={styles.cardGrid}>
        {filteredItems.slice(0, visibleCount).map((item) => {
          const isTargeted = targetIds.has(item.id);
          const wikiUrl = `https://wiki.warframe.com/w/${encodeURIComponent(item.name.replace(/ /g, '_'))}`;

          return (
            <article key={item.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <ItemThumbnail name={item.name} size={56} style={{ marginRight: 12 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 style={styles.cardTitle}>{item.name}</h2>
                  <div style={styles.cardMetaRow}>
                    {activeTab === 'Weapons' && (() => {
                      const lin = getWeaponLineage(item.name, item.subType);
                      if (!lin) return null;
                      const badgeColors: Record<string, { bg: string; color: string; border: string }> = {
                        Incarnon: { bg: '#2d1a44', color: '#e4b8ff', border: '#5b328a' },
                        Coda: { bg: '#36151d', color: '#ffb3c0', border: '#782637' },
                        Tenet: { bg: '#10283c', color: '#8ecbfc', border: '#235178' },
                        Kuva: { bg: '#351414', color: '#ff9e9e', border: '#782828' },
                      };
                      const bStyle = badgeColors[lin];
                      return (
                        <span
                          style={{
                            display: 'inline-block',
                            fontSize: 10.5,
                            fontWeight: 700,
                            letterSpacing: '0.4px',
                            padding: '2px 7px',
                            borderRadius: 3,
                            background: bStyle.bg,
                            color: bStyle.color,
                            border: `1px solid ${bStyle.border}`,
                          }}
                        >
                          {lin.toUpperCase()}
                        </span>
                      );
                    })()}
                    {item.subType && <span style={styles.subTypeBadge}>{item.subType}</span>}
                    <span style={styles.acquisitionBadge}>{item.acquisitionType}</span>
                    {item.generalInfo && (
                      <span style={styles.mrBadge}>MR {item.generalInfo.masteryReq}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleToggleTarget(item)}
                  style={{
                    ...styles.targetBtn,
                    ...(isTargeted ? styles.targetBtnActive : {}),
                  }}
                  title={isTargeted ? 'Remove from My Targets' : 'Add to My Targets'}
                >
                  {isTargeted ? 'Targeted' : '+ Target'}
                </button>
              </div>

              <p style={styles.cardDescription}>{item.description}</p>

              {/* Location & Boss info */}
              <div style={styles.locationSection}>
                <div style={styles.locationRow}>
                  <span style={styles.locationLabel}>Encounter:</span>
                  <span style={styles.locationValue}>
                    {item.bossOrEnemyName || 'Standard Missions'}
                  </span>
                </div>
                {(item.locationNode || item.planet) && (
                  <div style={styles.locationRow}>
                    <span style={styles.locationLabel}>Location:</span>
                    <span style={styles.locationValue}>
                      {[item.locationNode, item.planet].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
                {item.generalDropInfo && (
                  <p style={styles.generalDropInfo}>{item.generalDropInfo}</p>
                )}
              </div>

              {/* Components List */}
              {item.components && item.components.length > 0 && (
                <div style={styles.componentsSection}>
                  <h3 style={styles.componentsTitle}>Blueprints & Parts Acquisition:</h3>
                  <div style={styles.componentsList}>
                    {item.components.map((comp, idx) => (
                      <div key={idx} style={styles.componentItem}>
                        <span style={styles.componentName}>{comp.partName}</span>
                        <div style={styles.componentSourceWrap}>
                          <span style={styles.componentSource}>{comp.sourceText}</span>
                          {comp.dropChance !== undefined && (
                            <span style={styles.componentChance}>({comp.dropChance}%)</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Combat Specs Preview (for Weapons) */}
              {item.combatStats && (
                <div style={styles.combatSection}>
                  <div style={styles.combatGrid}>
                    <div>
                      <span style={styles.statLabel}>Crit Chance:</span>{' '}
                      <span style={styles.statVal}>{item.combatStats.critChance}</span>
                    </div>
                    <div>
                      <span style={styles.statLabel}>Crit Multi:</span>{' '}
                      <span style={styles.statVal}>{item.combatStats.critMultiplier}</span>
                    </div>
                    <div>
                      <span style={styles.statLabel}>Status:</span>{' '}
                      <span style={styles.statVal}>{item.combatStats.statusChance}</span>
                    </div>
                    <div>
                      <span style={styles.statLabel}>Fire Rate:</span>{' '}
                      <span style={styles.statVal}>{item.combatStats.fireRate}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Variants / Augments info */}
              {item.extraInfo && (
                <div style={styles.variantsSection}>
                  {item.extraInfo.variants.length > 0 && (
                    <div style={styles.variantRow}>
                      <span style={styles.variantLabel}>Variants:</span>
                      {item.extraInfo.variants.map((v) => (
                        <span key={v.variantName} style={styles.variantPill}>
                          {v.variantName}
                        </span>
                      ))}
                    </div>
                  )}
                  {item.extraInfo.augments.length > 0 && (
                    <div style={styles.variantRow}>
                      <span style={styles.variantLabel}>Augments:</span>
                      {item.extraInfo.augments.map((a) => (
                        <span key={a.name} style={styles.augmentPill} title={a.effect}>
                          {a.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Action Links */}
              <div style={styles.cardActions}>
                <Link
                  to={`/item/${encodeURIComponent(item.name)}`}
                  style={styles.detailLink}
                >
                  View Full Wiki Page
                </Link>
                <a
                  href={wikiUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  style={styles.wikiLink}
                >
                  Official Wiki ↗
                </a>
              </div>
            </article>
          );
        })}
      </div>

      {visibleCount < filteredItems.length && (
        <div style={styles.paginationArea}>
          <button
            onClick={() => setVisibleCount((prev) => prev + 36)}
            style={styles.loadMoreBtn}
          >
            Load Next 36 {activeTab} ({filteredItems.length - visibleCount} remaining)
          </button>
          <button
            onClick={() => setVisibleCount(filteredItems.length)}
            style={styles.loadAllBtn}
          >
            Show All ({filteredItems.length})
          </button>
        </div>
      )}

      {filteredItems.length === 0 && (
        <div style={styles.emptyState}>
          <p style={styles.emptyTitle}>No matching {activeTab.toLowerCase()} found.</p>
          <p style={styles.emptyText}>
            Try clearing filters or search for another term like Rhino, Wisp, Dread, or Drakgoon.
          </p>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
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
    padding: '10px 20px',
    background: '#1d2334',
    border: '1px solid #3c4f74',
    borderRadius: 4,
    color: '#a0c0f0',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  loadAllBtn: {
    padding: '10px 18px',
    background: '#14141e',
    border: '1px solid #28283c',
    borderRadius: 4,
    color: '#8888a4',
    fontSize: 13,
    cursor: 'pointer',
  },
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
  tabBar: {
    display: 'flex',
    gap: 8,
    borderBottom: '1px solid #1e1e2c',
    marginBottom: 16,
  },
  tabButton: {
    background: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    color: '#8888a2',
    padding: '10px 18px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  tabButtonActive: {
    color: '#ffd700',
    borderBottom: '2px solid #ffd700',
  },
  filterSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    padding: 16,
    background: '#12141d',
    border: '1px solid #1f2334',
    borderRadius: 8,
    marginBottom: 16,
  },
  searchRow: {
    display: 'flex',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    padding: '10px 14px',
    background: '#0e0e12',
    border: '1px solid #2a2a3c',
    borderRadius: 4,
    color: '#f0f0f8',
    fontSize: 14,
    outline: 'none',
  },
  clearButton: {
    padding: '0 14px',
    background: '#1a1a24',
    border: '1px solid #2a2a3c',
    borderRadius: 4,
    color: '#a0a0b8',
    fontSize: 13,
    cursor: 'pointer',
  },
  filterRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 16,
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: '#8888a2',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  pillContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  },
  filterPill: {
    background: '#1a1a24',
    border: '1px solid #2a2a3c',
    borderRadius: 3,
    color: '#a0a0b8',
    padding: '4px 10px',
    fontSize: 12,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  filterPillActive: {
    background: '#242b3d',
    borderColor: '#4d648d',
    color: '#f0f0f8',
    fontWeight: 600,
  },
  sortSelect: {
    padding: '6px 12px',
    background: '#1a1a24',
    border: '1px solid #2a2a3c',
    borderRadius: 4,
    color: '#e4e4f0',
    fontSize: 12.5,
    fontWeight: 500,
    outline: 'none',
    cursor: 'pointer',
  },
  resultsMeta: {
    fontSize: 13,
    color: '#707086',
    marginBottom: 16,
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
    gap: 16,
  },
  card: {
    background: '#12141d',
    border: '1px solid #1f2334',
    borderRadius: 8,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#f0f0f8',
    margin: '0 0 6px 0',
  },
  cardMetaRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  subTypeBadge: {
    fontSize: 11,
    padding: '2px 6px',
    background: '#1d2130',
    border: '1px solid #2e3852',
    color: '#8e9ec4',
    borderRadius: 2,
  },
  acquisitionBadge: {
    fontSize: 11,
    padding: '2px 6px',
    background: '#201f16',
    border: '1px solid #4a4524',
    color: '#d4c264',
    borderRadius: 2,
  },
  mrBadge: {
    fontSize: 11,
    padding: '2px 6px',
    background: '#1b1b26',
    border: '1px solid #2f2f45',
    color: '#a0a0b8',
    borderRadius: 2,
  },
  targetBtn: {
    background: '#181c26',
    border: '1px solid #2f3e5e',
    color: '#8e9ec4',
    borderRadius: 3,
    padding: '4px 10px',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  targetBtnActive: {
    background: '#233221',
    borderColor: '#4d7547',
    color: '#86d979',
  },
  cardDescription: {
    fontSize: 13,
    color: '#b0b0c4',
    margin: 0,
    lineHeight: 1.45,
  },
  locationSection: {
    background: '#0e0e14',
    border: '1px solid #1a1a24',
    borderRadius: 3,
    padding: '8px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  locationRow: {
    display: 'flex',
    fontSize: 12,
    gap: 6,
  },
  locationLabel: {
    color: '#707086',
    fontWeight: 600,
    minWidth: 70,
  },
  locationValue: {
    color: '#d8d8e6',
  },
  generalDropInfo: {
    fontSize: 11,
    color: '#a0a0b4',
    margin: '4px 0 0 0',
    lineHeight: 1.4,
    borderTop: '1px dashed #1a1a24',
    paddingTop: 4,
  },
  componentsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  componentsTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: '#8888a2',
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  componentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    background: '#0a0a0e',
    border: '1px solid #1a1a24',
    borderRadius: 3,
    padding: 8,
  },
  componentItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    fontSize: 12,
    gap: 8,
  },
  componentName: {
    color: '#e0e0ec',
    fontWeight: 500,
  },
  componentSourceWrap: {
    display: 'flex',
    gap: 4,
    alignItems: 'baseline',
    textAlign: 'right',
  },
  componentSource: {
    color: '#8888a2',
    fontSize: 11,
  },
  componentChance: {
    color: '#d4c264',
    fontSize: 11,
    fontWeight: 600,
  },
  combatSection: {
    background: '#0e0e14',
    border: '1px solid #1a1a24',
    borderRadius: 3,
    padding: '6px 10px',
  },
  combatGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '4px 12px',
    fontSize: 12,
  },
  statLabel: {
    color: '#707086',
  },
  statVal: {
    color: '#d8d8e6',
    fontWeight: 600,
  },
  variantsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    fontSize: 11,
  },
  variantRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  variantLabel: {
    color: '#707086',
    fontWeight: 600,
  },
  variantPill: {
    background: '#181b24',
    border: '1px solid #2a3142',
    color: '#8e9ec4',
    padding: '1px 6px',
    borderRadius: 2,
  },
  augmentPill: {
    background: '#241a20',
    border: '1px solid #4a2839',
    color: '#c9789b',
    padding: '1px 6px',
    borderRadius: 2,
    cursor: 'help',
  },
  cardActions: {
    marginTop: 'auto',
    paddingTop: 10,
    borderTop: '1px solid #1a1a26',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLink: {
    color: '#8e9ec4',
    textDecoration: 'none',
    fontSize: 13,
    fontWeight: 600,
  },
  wikiLink: {
    color: '#707086',
    textDecoration: 'none',
    fontSize: 12,
  },
  emptyState: {
    textAlign: 'center',
    padding: '48px 24px',
    background: '#12121a',
    border: '1px solid #1e1e2c',
    borderRadius: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#e0e0ec',
    margin: '0 0 8px 0',
  },
  emptyText: {
    fontSize: 13,
    color: '#707086',
    margin: 0,
  },
};
