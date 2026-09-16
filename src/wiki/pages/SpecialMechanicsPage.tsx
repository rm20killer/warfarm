import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  SPECIAL_CHALLENGES,
  SpecialChallengeGuide,
} from '../../shared/data/special-mechanics';
import { usePageMeta } from '../../shared/utils/usePageMeta';
import { theme } from '../styles/theme';
import { directoryStyles } from '../styles/directoryPageStyles';

export function SpecialMechanicsPage() {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>(SPECIAL_CHALLENGES[0].id);

  usePageMeta({
    title: 'Lua Puzzle Solutions, Halls of Ascension & Vaults',
    description: 'Walkthroughs for the 7 Lua Halls of Ascension Drift mod puzzles, Orokin Derelict Dragon Key Vaults, and Granum Void mechanics.',
    keywords: 'warframe lua puzzles, halls of ascension, drift mods, dragon key vaults, corrupted mods, granum void, puzzle guide',
    canonicalPath: '/mechanics',
  });

  const categories = ['All', 'Lua Principle', 'Vault System', 'Special Dimension'];
  const activeFilterCount = activeCategory !== 'All' ? 1 : 0;

  const filteredChallenges = SPECIAL_CHALLENGES.filter((c) => {
    const matchesCategory = activeCategory === 'All' || c.category === activeCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      c.title.toLowerCase().includes(q) ||
      c.rewardItem.toLowerCase().includes(q) ||
      c.roomVisualCue.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  const activeChallenge =
    filteredChallenges.find((c) => c.id === selectedChallengeId) ||
    filteredChallenges[0] ||
    SPECIAL_CHALLENGES[0];

  return (
    <div className="page-container-responsive" style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Lua Challenges & Special Mechanics</h1>
        <p style={styles.subtitle}>
          Step-by-step puzzle solutions and room recognition cues for the 7 Lua Halls of Ascension (Drift Mods), Orokin Dragon Key Vaults, and the Granum Void.
        </p>
      </header>

      {/* Search Controls */}
      <div style={styles.searchControlsRow}>
        <div style={styles.searchBarWrapper}>
          <input
            type="text"
            placeholder="Search puzzles, drift mods, vaults (e.g. Agility, Power Drift, Dragon Key, Granum)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
            aria-label="Search puzzles"
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

      {/* Collapsible Filter Drawer */}
      {showFilters && (
        <div style={styles.filterDrawerCard}>
          <div style={styles.filterDrawerHeader}>
            <span style={styles.filterDrawerTitle}>Filter Special Challenges</span>
            <button
              type="button"
              onClick={() => setShowFilters(false)}
              style={styles.closeDrawerBtn}
            >
              &times; Close
            </button>
          </div>

          <div style={styles.filterGroup}>
            <span style={styles.filterLabel}>Challenge Category:</span>
            <div style={styles.filterPills}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    ...styles.filterPill,
                    ...(activeCategory === cat ? styles.filterPillActive : {}),
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.filterDrawerFooter}>
            <span style={{ fontSize: 12, color: theme.colors.textSecondary }}>
              {activeFilterCount > 0 ? `${activeFilterCount} active filter applied` : 'Showing all challenge types'}
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

      <div style={styles.resultsInfoBar}>
        <span style={styles.resultsCount}>
          Showing <strong>{filteredChallenges.length}</strong> of {SPECIAL_CHALLENGES.length} Special Challenges
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

      <div className="detail-content-grid" style={styles.layoutGrid}>
        <aside style={styles.sidebarList}>
          <span style={styles.sidebarHeader}>Select Puzzle Challenge:</span>
          {filteredChallenges.map((challenge) => {
            const isSelected = challenge.id === activeChallenge.id;
            return (
              <button
                key={challenge.id}
                onClick={() => setSelectedChallengeId(challenge.id)}
                style={{
                  ...styles.challengeItemBtn,
                  backgroundColor: isSelected ? theme.colors.bgCardElevated : theme.colors.bgCard,
                  borderColor: isSelected ? theme.colors.accentBorder : theme.colors.borderDefault,
                }}
              >
                <span
                  style={{
                    ...styles.challengeBtnTitle,
                    color: isSelected ? theme.colors.textHighlight : theme.colors.textSecondary,
                  }}
                >
                  {challenge.title}
                </span>
                <span style={styles.rewardBadge}>Reward: {challenge.rewardItem}</span>
              </button>
            );
          })}
        </aside>

        <main style={styles.detailPane}>
          <article style={styles.detailCard}>
            <div style={styles.cardHeader}>
              <div>
                <span style={styles.challengeCategory}>{activeChallenge.category}</span>
                <h2 style={styles.challengeMainTitle}>{activeChallenge.title}</h2>
              </div>
              <Link
                to={`/item/${encodeURIComponent(activeChallenge.rewardItem)}`}
                style={styles.rewardLink}
              >
                View Reward Item
              </Link>
            </div>

            <div style={styles.infoBlock}>
              <strong style={styles.blockHeading}>Room Recognition Cue:</strong>
              <p style={styles.blockText}>{activeChallenge.roomVisualCue}</p>
            </div>

            <div style={styles.infoBlock}>
              <strong style={styles.blockHeading}>Recommended Warframes / Tools:</strong>
              <div style={styles.framesBadgeRow}>
                {activeChallenge.recommendedFrames.map((frame, i) => (
                  <span key={i} style={styles.frameBadge}>
                    {frame}
                  </span>
                ))}
              </div>
            </div>

            <div style={styles.infoBlock}>
              <strong style={styles.blockHeading}>Step-by-Step Solution:</strong>
              <ol style={styles.solutionList}>
                {activeChallenge.stepByStepSolution.map((step, i) => (
                  <li key={i} style={styles.solutionStep}>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            {activeChallenge.tipsAndTricks && activeChallenge.tipsAndTricks.length > 0 && (
              <div style={styles.tipsBlock}>
                <strong style={styles.tipsHeading}>Solo Player Tips & Shortcuts:</strong>
                <ul style={styles.tipsList}>
                  {activeChallenge.tipsAndTricks.map((tip, i) => (
                    <li key={i} style={styles.tipItem}>
                      &#8226; {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </article>
        </main>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  ...directoryStyles,
  filterSection: directoryStyles.filterDrawerCard,
  catTabBar: directoryStyles.categoryPillsStrip,
  catTab: directoryStyles.categoryPill,
  layoutGrid: {
    display: 'grid',
    gridTemplateColumns: '320px 1fr',
    gap: 20,
  },
  sidebarList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  sidebarHeader: {
    fontSize: 12,
    fontWeight: 600,
    color: theme.colors.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  challengeItemBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '12px 14px',
    border: '1px solid',
    borderRadius: theme.radii.md,
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s',
  },
  challengeBtnTitle: {
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 4,
  },
  rewardBadge: {
    fontSize: 11,
    color: theme.colors.green,
  },
  detailPane: {
    minWidth: 0,
  },
  detailCard: {
    background: theme.colors.bgCard,
    border: `1px solid ${theme.colors.borderDefault}`,
    borderRadius: theme.radii.lg,
    padding: 24,
  },
  challengeCategory: {
    fontSize: 11,
    padding: '2px 6px',
    background: theme.colors.purpleBg,
    color: theme.colors.purple,
    borderRadius: theme.radii.sm,
    display: 'inline-block',
    marginBottom: 6,
    border: `1px solid ${theme.colors.purpleBorder}`,
  },
  challengeMainTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: theme.colors.textHighlight,
    margin: 0,
  },
  rewardLink: {
    fontSize: 12,
    fontWeight: 600,
    color: theme.colors.accent,
    textDecoration: 'none',
    padding: '4px 10px',
    backgroundColor: theme.colors.accentBg,
    border: `1px solid ${theme.colors.accentBorder}`,
    borderRadius: theme.radii.sm,
    whiteSpace: 'nowrap',
  },
  infoBlock: {
    marginBottom: 20,
  },
  blockHeading: {
    fontSize: 13,
    fontWeight: 600,
    color: theme.colors.textPrimary,
    display: 'block',
    marginBottom: 6,
  },
  blockText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 1.5,
    margin: 0,
  },
  framesBadgeRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  },
  frameBadge: {
    fontSize: 12,
    padding: '4px 10px',
    background: theme.colors.bgCardElevated,
    border: `1px solid ${theme.colors.borderSubtle}`,
    borderRadius: theme.radii.sm,
    color: theme.colors.textSecondary,
  },
  solutionList: {
    paddingLeft: 20,
    margin: 0,
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 1.6,
  },
  solutionStep: {
    padding: '3px 0',
  },
  tipsBlock: {
    padding: 14,
    background: theme.colors.bgCardElevated,
    borderLeft: `3px solid ${theme.colors.accent}`,
    borderRadius: theme.radii.sm,
    border: `1px solid ${theme.colors.borderSubtle}`,
  },
  tipsHeading: {
    fontSize: 12,
    color: theme.colors.textHighlight,
    display: 'block',
    marginBottom: 6,
  },
  tipsList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  tipItem: {
    fontSize: 12,
    color: theme.colors.green,
    padding: '2px 0',
    lineHeight: 1.4,
  },
};
