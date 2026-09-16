import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  getAllResourceGuides,
  ResourceCategory,
  ResourceFarmingGuide,
} from '../../shared/data/resource-guide';
import { savePersonalTarget, getPersonalTargets, removePersonalTarget } from '../storage';
import { usePageMeta } from '../../shared/utils/usePageMeta';
import { theme } from '../styles/theme';
import { directoryStyles } from '../styles/directoryPageStyles';
import { ItemThumbnail } from '../../shared/utils/item-images';

const CATEGORIES: Array<{ id: ResourceCategory | 'All'; label: string }> = [
  { id: 'All', label: 'All Resources' },
  { id: 'Rare', label: 'Rare' },
  { id: 'Uncommon', label: 'Uncommon' },
  { id: 'Common', label: 'Common' },
  { id: 'OpenWorld', label: 'Open World' },
];

function getResourceRarityTheme(category: ResourceCategory) {
  if (category === 'Rare') {
    return {
      border: theme.colors.rarityRareBorder,
      borderTop: `2px solid ${theme.colors.gold}`,
      badgeBg: theme.colors.rarityRareBg,
      badgeText: theme.colors.rarityRare,
      tagBorder: theme.colors.rarityRareBorder,
    };
  }
  if (category === 'Uncommon') {
    return {
      border: theme.colors.rarityUncommonBorder,
      borderTop: `2px solid ${theme.colors.rarityUncommon}`,
      badgeBg: theme.colors.rarityUncommonBg,
      badgeText: theme.colors.rarityUncommon,
      tagBorder: theme.colors.rarityUncommonBorder,
    };
  }
  if (category === 'OpenWorld') {
    return {
      border: theme.colors.greenBorder,
      borderTop: `2px solid ${theme.colors.green}`,
      badgeBg: theme.colors.greenBg,
      badgeText: theme.colors.green,
      tagBorder: theme.colors.greenBorder,
    };
  }
  if (category === 'Special') {
    return {
      border: theme.colors.purpleBorder,
      borderTop: `2px solid ${theme.colors.purple}`,
      badgeBg: theme.colors.purpleBg,
      badgeText: theme.colors.purple,
      tagBorder: theme.colors.purpleBorder,
    };
  }
  return {
    border: theme.colors.rarityCommonBorder,
    borderTop: `2px solid ${theme.colors.rarityCommon}`,
    badgeBg: theme.colors.rarityCommonBg,
    badgeText: theme.colors.rarityCommon,
    tagBorder: theme.colors.rarityCommonBorder,
  };
}

export function ResourceLocatorPage() {
  const [activeCategory, setActiveCategory] = useState<ResourceCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [trackedIds, setTrackedIds] = useState<Set<string>>(() => {
    return new Set(getPersonalTargets().map((t) => t.id));
  });

  const activeFilterCount = activeCategory !== 'All' ? 1 : 0;

  usePageMeta({
    title: 'Resource Farming Directory & Node Guide',
    description: 'Find optimal farming locations and nodes for Argon Crystals, Tellurium, Orokin Cells, Plastids, and all Warframe resources.',
    keywords: 'warframe resources, argon crystal farm, orokin cell farm, tellurium farm, plastids farm, polymer bundle, open world mining',
    canonicalPath: '/resources',
  });

  const allGuides = useMemo(() => getAllResourceGuides(), []);

  const filteredResources = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allGuides.filter((item) => {
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.planets.some((p) => p.toLowerCase().includes(q)) ||
        item.optimalNodes.some((n) => n.node.toLowerCase().includes(q) || n.planet.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [allGuides, activeCategory, searchQuery]);

  const handleToggleTarget = (guide: ResourceFarmingGuide) => {
    const isTracked = trackedIds.has(guide.id);
    if (isTracked) {
      removePersonalTarget(guide.id);
      setTrackedIds((prev) => {
        const next = new Set(prev);
        next.delete(guide.id);
        return next;
      });
    } else {
      savePersonalTarget({
        id: guide.id,
        name: guide.name,
        category: guide.category,
        targetQuantity: 10,
        currentQuantity: 0,
        notes: `Optimal node: ${guide.optimalNodes[0]?.node || 'Star Chart'} (${guide.optimalNodes[0]?.planet || ''})`,
      });
      setTrackedIds((prev) => new Set([...prev, guide.id]));
    }
  };

  return (
    <div className="page-container-responsive" style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerBadge}>Star Chart Materials</div>
        <h1 style={styles.title}>Resource Farming & Drop Locator</h1>
        <p style={styles.subtitle}>
          Find optimal nodes, mission types, and squad compositions for rare, uncommon, and open-world Warframe materials.
        </p>
      </header>

      {/* Search & Category Controls */}
      <div style={styles.searchControlsRow}>
        <div style={styles.searchBarWrapper}>
          <input
            type="text"
            placeholder="Filter by resource or planet (e.g. Saturn, Tellurium, Mot)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
            aria-label="Filter resources"
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
            onClick={() => setActiveCategory('All')}
            style={styles.resetFiltersQuickBtn}
          >
            Reset
          </button>
        )}
      </div>

      {/* Category Pills Strip */}
      <div style={styles.categoryPillsStrip}>
        {CATEGORIES.map(({ id, label }) => {
          const active = activeCategory === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveCategory(id)}
              style={{
                ...styles.categoryPill,
                ...(active ? styles.categoryPillActive : {}),
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Collapsible Filter Drawer for Mobile / Advanced */}
      {showFilters && (
        <div style={styles.filterDrawerCard}>
          <div style={styles.filterDrawerHeader}>
            <span style={styles.filterDrawerTitle}>Filter Resources Catalog</span>
            <button
              type="button"
              onClick={() => setShowFilters(false)}
              style={styles.closeDrawerBtn}
            >
              &times; Close
            </button>
          </div>

          <div style={styles.filterGroup}>
            <span style={styles.filterLabel}>Rarity & Category:</span>
            <div style={styles.categoryButtons}>
              {CATEGORIES.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveCategory(id)}
                  style={{
                    ...styles.catButton,
                    backgroundColor: activeCategory === id ? theme.colors.accentBg : theme.colors.bgInput,
                    borderColor: activeCategory === id ? theme.colors.accentBorder : theme.colors.borderDefault,
                    color: activeCategory === id ? theme.colors.textHighlight : theme.colors.textSecondary,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.filterDrawerFooter}>
            <span style={{ fontSize: 12, color: theme.colors.textSecondary }}>
              {activeFilterCount > 0 ? `${activeFilterCount} active filter applied` : 'Showing all resource categories'}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveCategory('All')}
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

      {/* Results Info Bar */}
      <div style={styles.resultsInfoBar}>
        <span style={styles.resultsCount}>
          Showing <strong>{filteredResources.length}</strong> of {allGuides.length} Resources
        </span>
        {(activeCategory !== 'All' || searchQuery) && (
          <button
            type="button"
            style={styles.resetFiltersBtn}
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('All');
            }}
          >
            Reset All Filters
          </button>
        )}
      </div>

      {/* Resource Cards Grid */}
      {filteredResources.length === 0 ? (
        <div style={styles.emptyNoticeBox}>
          <p style={styles.emptyNotice}>No resources matched your search filter.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('All');
            }}
            style={styles.resetFiltersBtn}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="card-grid-responsive" style={styles.resourceGrid}>
          {filteredResources.map((resource) => {
            const isTracked = trackedIds.has(resource.id);
            const rarityTheme = getResourceRarityTheme(resource.category);

            return (
              <article
                key={resource.id}
                style={{
                  ...styles.card,
                  borderColor: rarityTheme.border,
                  borderTop: rarityTheme.borderTop,
                }}
              >
                <div style={styles.cardHeader}>
                  <div style={styles.thumbArea}>
                    <ItemThumbnail name={resource.name} size={48} />
                  </div>

                  <div style={styles.headerTitles}>
                    <div style={styles.badgeRow}>
                      <span
                        style={{
                          ...styles.categoryBadge,
                          backgroundColor: rarityTheme.badgeBg,
                          color: rarityTheme.badgeText,
                          borderColor: rarityTheme.tagBorder,
                        }}
                      >
                        {resource.category === 'OpenWorld' ? 'Open World' : resource.category}
                      </span>
                      {resource.tradable && (
                        <span style={styles.tradableBadge}>Tradable</span>
                      )}
                    </div>

                    <Link
                      to={`/item/${encodeURIComponent(resource.name)}`}
                      style={styles.resourceTitleLink}
                    >
                      {resource.name}
                    </Link>
                  </div>

                  <button
                    type="button"
                    style={{
                      ...styles.trackButton,
                      backgroundColor: isTracked ? theme.colors.gold : theme.colors.bgInput,
                      color: isTracked ? theme.colors.textInverse : theme.colors.textSecondary,
                      borderColor: isTracked ? theme.colors.goldBorder : theme.colors.borderDefault,
                    }}
                    onClick={() => handleToggleTarget(resource)}
                    title={isTracked ? 'Remove from My Targets' : 'Add to My Targets'}
                  >
                    {isTracked ? '★ Tracked' : '+ Target'}
                  </button>
                </div>

                <div style={styles.cardBody}>
                  {resource.planets && resource.planets.length > 0 && (
                    <div style={styles.planetsRow}>
                      <span style={styles.planetsLabel}>Found on:</span>
                      <div style={styles.planetPills}>
                        {resource.planets.map((p, pIdx) => (
                          <span key={pIdx} style={styles.planetPill}>{p}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <p style={styles.descriptionText}>{resource.description}</p>

                  {resource.specialMechanics && (
                    <div style={styles.mechanicNote}>
                      <strong>Note:</strong> {resource.specialMechanics}
                    </div>
                  )}

                  <div style={styles.nodesSection}>
                    <div style={styles.nodesHeader}>Top Farming Locations</div>
                    <div style={styles.nodesGrid}>
                      {resource.optimalNodes.map((node, i) => (
                        <div key={i} style={styles.nodeItem}>
                          <div style={styles.nodeItemTop}>
                            <span style={styles.nodeName}>
                              {node.node} <span style={{ color: theme.colors.textMuted }}>({node.planet})</span>
                            </span>
                            <span
                              style={{
                                ...styles.nodeRating,
                                color: node.efficiencyRating === 'Best' ? theme.colors.green : theme.colors.gold,
                                backgroundColor: node.efficiencyRating === 'Best' ? theme.colors.greenBg : theme.colors.goldBg,
                                borderColor: node.efficiencyRating === 'Best' ? theme.colors.greenBorder : theme.colors.goldBorder,
                              }}
                            >
                              {node.efficiencyRating}
                            </span>
                          </div>
                          <span style={styles.nodeMission}>{node.missionType} • {node.faction}</span>
                          <p style={styles.nodeStrategy}>{node.strategyNote}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {resource.recommendedFrames && resource.recommendedFrames.length > 0 && (
                    <div style={styles.footerRow}>
                      <span style={styles.recommendedTitle}>Recommended Squad:</span>
                      <div style={styles.framesPills}>
                        {resource.recommendedFrames.map((frame, fIdx) => (
                          <span key={fIdx} style={styles.framePill}>{frame}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  ...directoryStyles,
  headerBadge: {
    ...directoryStyles.headerBadge,
    backgroundColor: theme.colors.catResourceBg,
    color: theme.colors.catResource,
    border: `1px solid ${theme.colors.catResourceBorder}`,
  },
  resourceGrid: directoryStyles.cardGrid,
  planetsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    fontSize: 12,
  },
  planetsLabel: {
    color: theme.colors.textMuted,
    fontWeight: 600,
    fontSize: 11.5,
  },
  planetPills: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 4,
  },
  planetPill: {
    fontSize: 11,
    padding: '1px 6px',
    backgroundColor: theme.colors.bgCardElevated,
    color: theme.colors.textSecondary,
    borderRadius: theme.radii.sm,
    border: `1px solid ${theme.colors.borderSubtle}`,
  },
  tradableBadge: {
    fontSize: 10,
    fontWeight: 600,
    padding: '2px 5px',
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.accentBg,
    color: theme.colors.accent,
    border: `1px solid ${theme.colors.accentBorder}`,
  },
  resourceTitleLink: directoryStyles.cardTitleLink,
  trackButton: directoryStyles.targetBtn,
  descriptionText: {
    fontSize: 12.5,
    color: theme.colors.textSecondary,
    lineHeight: 1.45,
    margin: 0,
  },
  mechanicNote: {
    padding: '8px 10px',
    background: theme.colors.goldBg,
    borderLeft: `3px solid ${theme.colors.gold}`,
    borderRadius: theme.radii.sm,
    fontSize: 11.5,
    color: theme.colors.goldLight,
    lineHeight: 1.4,
  },
  nodesSection: {
    marginTop: 4,
  },
  nodesHeader: {
    fontSize: 11,
    fontWeight: 700,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 6,
  },
  nodesGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  nodeItem: {
    background: theme.colors.bgCardElevated,
    border: `1px solid ${theme.colors.borderSubtle}`,
    borderRadius: theme.radii.sm,
    padding: '8px 10px',
  },
  nodeItemTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  nodeName: {
    fontSize: 12.5,
    fontWeight: 600,
    color: theme.colors.textHighlight,
  },
  nodeRating: {
    fontSize: 10,
    fontWeight: 700,
    padding: '1px 5px',
    borderRadius: theme.radii.sm,
    border: '1px solid',
  },
  nodeMission: {
    fontSize: 11,
    color: theme.colors.textMuted,
    display: 'block',
    marginBottom: 4,
  },
  nodeStrategy: {
    fontSize: 11.5,
    color: theme.colors.textSecondary,
    margin: 0,
    lineHeight: 1.35,
  },
  footerRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    paddingTop: 8,
    marginTop: 'auto',
    borderTop: `1px solid ${theme.colors.borderSubtle}`,
    fontSize: 11.5,
  },
  recommendedTitle: {
    color: theme.colors.textMuted,
    fontWeight: 600,
  },
  framesPills: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 4,
  },
  framePill: {
    fontSize: 11,
    padding: '1px 6px',
    backgroundColor: theme.colors.accentBg,
    color: theme.colors.accentLight,
    borderRadius: theme.radii.sm,
    border: `1px solid ${theme.colors.accentBorder}`,
  },
};
