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
import { usePageMeta } from '../../shared/utils/usePageMeta';
import { theme } from '../styles/theme';
import { directoryStyles } from '../styles/directoryPageStyles';

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

export function getGearCardBorderStyle(item: { name: string; subType?: string }): React.CSSProperties {
  const nameLower = item.name.toLowerCase();
  const subLower = (item.subType || '').toLowerCase();
  const lin = getWeaponLineage(item.name, item.subType);

  if (lin === 'Incarnon' || nameLower.includes('incarnon') || subLower.includes('incarnon')) {
    return {
      borderColor: theme.colors.lineageIncarnonBorder,
      borderTop: `2px solid ${theme.colors.lineageIncarnon}`,
    };
  }
  if (lin === 'Kuva' || nameLower.includes('kuva') || subLower.includes('kuva')) {
    return {
      borderColor: theme.colors.lineageKuvaBorder,
      borderTop: `2px solid ${theme.colors.lineageKuva}`,
    };
  }
  if (lin === 'Tenet' || nameLower.includes('tenet') || subLower.includes('tenet')) {
    return {
      borderColor: theme.colors.lineageTenetBorder,
      borderTop: `2px solid ${theme.colors.lineageTenet}`,
    };
  }
  if (lin === 'Coda' || nameLower.includes('coda') || subLower.includes('coda')) {
    return {
      borderColor: theme.colors.lineageCodaBorder,
      borderTop: `2px solid ${theme.colors.lineageCoda}`,
    };
  }
  if (nameLower.includes('prime') || subLower.includes('prime')) {
    return {
      borderColor: theme.colors.goldBorder,
      borderTop: `2px solid ${theme.colors.gold}`,
    };
  }
  if (nameLower.includes('prisma') || subLower.includes('prisma')) {
    return {
      borderColor: '#205468',
      borderTop: '2px solid #52e0e0',
    };
  }
  if (nameLower.includes('vandal') || subLower.includes('vandal')) {
    return {
      borderColor: '#244c68',
      borderTop: '2px solid #68b8e0',
    };
  }
  if (nameLower.includes('wraith') || subLower.includes('wraith')) {
    return {
      borderColor: '#682020',
      borderTop: '2px solid #e05050',
    };
  }
  if (nameLower.includes('archon') || subLower.includes('archon')) {
    return {
      borderColor: theme.colors.goldBorder,
      borderTop: `2px solid ${theme.colors.orange}`,
    };
  }

  return {
    borderColor: theme.colors.borderDefault,
  };
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
  const [searchParams, setSearchParams] = useSearchParams();
  const paramTab = searchParams.get('tab') as GearTab | null;
  const paramLineage = searchParams.get('lineage') as SpecialLineage | null;

  usePageMeta({
    title: 'Warframes, Weapons & Gear Directory',
    description: 'Explore all Warframes, Primary, Secondary, and Melee weapons, companions, Archwing gear, and Kuva/Tenet/Incarnon variants.',
    keywords: 'warframe weapons, warframes directory, kuva weapons, tenet weapons, incarnon genesis, prime warframes, companion builds',
    canonicalPath: '/gear',
  });

  const [activeTab, setActiveTab] = useState<GearTab>(
    paramLineage && paramLineage !== 'All' ? 'Weapons' : paramTab || 'Warframes'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAcquisition, setSelectedAcquisition] = useState('All');
  const [selectedWeaponType, setSelectedWeaponType] = useState('All');
  const [selectedLineage, setSelectedLineage] = useState<SpecialLineage>(paramLineage || 'All');
  const [weaponSort, setWeaponSort] = useState<WeaponSortOption>('Default');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [targetIds, setTargetIds] = useState<Set<string>>(new Set());
  const [visibleCount, setVisibleCount] = useState<number>(36);

  const activeFilterCount =
    (selectedAcquisition !== 'All' ? 1 : 0) +
    (activeTab === 'Weapons' && selectedLineage !== 'All' ? 1 : 0) +
    (activeTab === 'Weapons' && selectedWeaponType !== 'All' ? 1 : 0) +
    (activeTab === 'Weapons' && weaponSort !== 'Default' ? 1 : 0);

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
    <div className="page-container-responsive" style={styles.container}>
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

      {/* Search Controls */}
      <div style={styles.searchControlsRow}>
        <div style={styles.searchBarWrapper}>
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
              setSelectedAcquisition('All');
              setSelectedLineage('All');
              setSelectedWeaponType('All');
              setWeaponSort('Default');
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
            <span style={styles.filterDrawerTitle}>Filter {activeTab}</span>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Acquisition Type:</label>
            <div style={styles.filterPills}>
              {acquisitionTypes.map((type) => (
                <button
                  key={type}
                  type="button"
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
                <div style={styles.filterPills}>
                  {(['All', 'Incarnon', 'Coda', 'Tenet', 'Kuva'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedLineage(type)}
                      style={{
                        ...styles.filterPill,
                        ...(selectedLineage === type ? styles.filterPillActive : {}),
                        ...(type === 'Incarnon' && selectedLineage === type ? { borderColor: theme.colors.lineageIncarnonBorder, color: theme.colors.lineageIncarnon, background: theme.colors.lineageIncarnonBg } : {}),
                        ...(type === 'Coda' && selectedLineage === type ? { borderColor: theme.colors.lineageCodaBorder, color: theme.colors.lineageCoda, background: theme.colors.lineageCodaBg } : {}),
                        ...(type === 'Tenet' && selectedLineage === type ? { borderColor: theme.colors.lineageTenetBorder, color: theme.colors.lineageTenet, background: theme.colors.lineageTenetBg } : {}),
                        ...(type === 'Kuva' && selectedLineage === type ? { borderColor: theme.colors.lineageKuvaBorder, color: theme.colors.lineageKuva, background: theme.colors.lineageKuvaBg } : {}),
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
                <div style={styles.filterPills}>
                  {weaponTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
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

          <div style={styles.filterDrawerFooter}>
            <span style={{ fontSize: 12, color: theme.colors.textSecondary }}>
              {activeFilterCount > 0 ? `${activeFilterCount} active filters applied` : 'Showing all items'}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAcquisition('All');
                    setSelectedLineage('All');
                    setSelectedWeaponType('All');
                    setWeaponSort('Default');
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

      {/* Results Header */}
      <div style={styles.resultsInfoBar}>
        <span style={styles.resultsCount}>
          Showing <strong>{Math.min(visibleCount, filteredItems.length)}</strong> of {filteredItems.length} {activeTab.toLowerCase()}
          {activeTab === 'Weapons' && selectedLineage !== 'All' && ` (${selectedLineage})`}
        </span>
        {(selectedAcquisition !== 'All' || (activeTab === 'Weapons' && (selectedWeaponType !== 'All' || selectedLineage !== 'All' || weaponSort !== 'Default')) || searchQuery) && (
          <button
            type="button"
            style={styles.resetFiltersBtn}
            onClick={() => {
              setSearchQuery('');
              setSelectedAcquisition('All');
              setSelectedLineage('All');
              setSelectedWeaponType('All');
              setWeaponSort('Default');
            }}
          >
            Reset All Filters
          </button>
        )}
      </div>

      {/* Catalog Grid */}
      <div className="card-grid-responsive" style={styles.cardGrid}>
        {filteredItems.slice(0, visibleCount).map((item) => {
          const isTargeted = targetIds.has(item.id);
          const wikiUrl = `https://wiki.warframe.com/w/${encodeURIComponent(item.name.replace(/ /g, '_'))}`;

          return (
            <article key={item.id} style={{ ...styles.card, ...getGearCardBorderStyle(item) }}>
              <div style={styles.cardHeader}>
                <ItemThumbnail name={item.name} size={56} style={{ marginRight: 12 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 style={styles.cardTitle}>{item.name}</h2>
                  <div style={styles.cardMetaRow}>
                    {activeTab === 'Weapons' && (() => {
                      const lin = getWeaponLineage(item.name, item.subType);
                      if (!lin) return null;
                      return (
                        <span style={theme.helpers.getLineageBadgeStyle(lin)}>
                          {lin}
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
                  Official Wiki
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
  ...directoryStyles,
  cardGrid: directoryStyles.cardGrid3Col,
  tabBar: directoryStyles.categoryPillsStrip,
  tabButton: directoryStyles.categoryPill,
  tabButtonActive: directoryStyles.categoryPillActive,
  emptyState: directoryStyles.emptyNoticeBox,
  emptyTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: theme.colors.textHighlight,
    margin: '0 0 8px 0',
  },
  emptyText: directoryStyles.emptyNoticeText,
  resultsMeta: directoryStyles.resultsInfoBar,
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
    padding: '10px 18px',
    background: theme.colors.bgInput,
    border: `1px solid ${theme.colors.borderDefault}`,
    borderRadius: theme.radii.sm,
    color: theme.colors.textSecondary,
    fontSize: 13,
    cursor: 'pointer',
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
    background: theme.colors.bgCardElevated,
    border: `1px solid ${theme.colors.borderDefault}`,
    color: theme.colors.textSecondary,
    borderRadius: theme.radii.sm,
  },
  acquisitionBadge: {
    fontSize: 11,
    padding: '2px 6px',
    background: theme.colors.goldBg,
    border: `1px solid ${theme.colors.goldBorder}`,
    color: theme.colors.gold,
    borderRadius: theme.radii.sm,
  },
  mrBadge: {
    fontSize: 11,
    padding: '2px 6px',
    background: theme.colors.bgCardElevated,
    border: `1px solid ${theme.colors.borderDefault}`,
    color: theme.colors.textMuted,
    borderRadius: theme.radii.sm,
  },
  locationSection: {
    background: theme.colors.bgNavbar,
    border: `1px solid ${theme.colors.borderSubtle}`,
    borderRadius: theme.radii.sm,
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
    color: theme.colors.textSecondary,
    fontWeight: 600,
    minWidth: 70,
  },
  locationValue: {
    color: theme.colors.textPrimary,
  },
  generalDropInfo: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    margin: '4px 0 0 0',
    lineHeight: 1.4,
    borderTop: `1px dashed ${theme.colors.borderSubtle}`,
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
    color: theme.colors.textSecondary,
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  componentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    background: theme.colors.bgNavbar,
    border: `1px solid ${theme.colors.borderSubtle}`,
    borderRadius: theme.radii.sm,
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
    color: theme.colors.textPrimary,
    fontWeight: 500,
  },
  componentSourceWrap: {
    display: 'flex',
    gap: 4,
    alignItems: 'baseline',
    textAlign: 'right',
  },
  componentSource: {
    color: theme.colors.textSecondary,
    fontSize: 11,
  },
  componentChance: {
    color: theme.colors.gold,
    fontSize: 11,
    fontWeight: 600,
  },
  combatSection: {
    background: theme.colors.bgNavbar,
    border: `1px solid ${theme.colors.borderSubtle}`,
    borderRadius: theme.radii.sm,
    padding: '6px 10px',
  },
  combatGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '4px 12px',
    fontSize: 12,
  },
  statLabel: {
    color: theme.colors.textSecondary,
  },
  statVal: {
    color: theme.colors.textPrimary,
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
    color: theme.colors.textSecondary,
    fontWeight: 600,
  },
  variantPill: {
    background: theme.colors.bgCardElevated,
    border: `1px solid ${theme.colors.borderDefault}`,
    color: theme.colors.textSecondary,
    padding: '1px 6px',
    borderRadius: theme.radii.sm,
  },
  augmentPill: {
    background: theme.colors.catWeaponBg,
    border: `1px solid ${theme.colors.catWeaponBorder}`,
    color: theme.colors.catWeapon,
    padding: '1px 6px',
    borderRadius: theme.radii.sm,
    cursor: 'help',
  },
  cardActions: {
    marginTop: 'auto',
    paddingTop: 10,
    borderTop: `1px solid ${theme.colors.borderSubtle}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLink: {
    color: theme.colors.accent,
    textDecoration: 'none',
    fontSize: 13,
    fontWeight: 600,
  },
  wikiLink: {
    color: theme.colors.textSecondary,
    textDecoration: 'none',
    fontSize: 12,
  },
};
