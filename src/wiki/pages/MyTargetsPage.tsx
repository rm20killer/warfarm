import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getPersonalTargets,
  savePersonalTarget,
  removePersonalTarget,
  PersonalTarget,
} from '../storage';
import { getResourceGuide } from '../../shared/data/resource-guide';
import { usePageMeta } from '../../shared/utils/usePageMeta';
import { theme } from '../styles/theme';
import { directoryStyles } from '../styles/directoryPageStyles';

export function MyTargetsPage() {
  const [targets, setTargets] = useState<PersonalTarget[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  usePageMeta({
    title: 'My Farm Targets & Priority Route Planner',
    description: 'Track your personal Warframe farming goals, resources, craftable blueprints, and compute optimal multi-item farming routes.',
    keywords: 'warframe target tracker, farm planner, optimal farming routes, crafting checklist',
    canonicalPath: '/targets',
  });

  useEffect(() => {
    setTargets(getPersonalTargets());

    const handleUpdate = () => {
      setTargets(getPersonalTargets());
    };
    window.addEventListener('personal-targets-updated', handleUpdate);
    return () => window.removeEventListener('personal-targets-updated', handleUpdate);
  }, []);

  const handleUpdateCurrent = (target: PersonalTarget, delta: number) => {
    const nextCurrent = Math.max(0, target.currentQuantity + delta);
    const updated = { ...target, currentQuantity: nextCurrent };
    setTargets(savePersonalTarget(updated));
  };

  const handleUpdateNotes = (target: PersonalTarget, notes: string) => {
    const updated = { ...target, notes };
    setTargets(savePersonalTarget(updated));
  };

  const handleRemove = (id: string) => {
    setTargets(removePersonalTarget(id));
  };

  const filteredTargets = targets.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      t.name.toLowerCase().includes(q) ||
      (t.category && t.category.toLowerCase().includes(q)) ||
      (t.notes && t.notes.toLowerCase().includes(q))
    );
  });

  // Find overlapping farming nodes for active targets
  const recommendedNodesMap = new Map<string, { node: string; planet: string; missionType: string; forTargets: string[] }>();

  targets.forEach((t) => {
    const guide = getResourceGuide(t.name);
    if (guide && guide.optimalNodes.length > 0) {
      const topNode = guide.optimalNodes[0];
      const key = `${topNode.planet} - ${topNode.node}`;
      const existing = recommendedNodesMap.get(key);
      if (existing) {
        if (!existing.forTargets.includes(t.name)) {
          existing.forTargets.push(t.name);
        }
      } else {
        recommendedNodesMap.set(key, {
          node: topNode.node,
          planet: topNode.planet,
          missionType: topNode.missionType,
          forTargets: [t.name],
        });
      }
    }
  });

  const combinedNodes = Array.from(recommendedNodesMap.values()).sort(
    (a, b) => b.forTargets.length - a.forTargets.length
  );

  return (
    <div className="page-container-responsive" style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>My Farming Targets & Notes</h1>
        <p style={styles.subtitle}>
          Track items and resources you are currently hunting, update collected quantities, and view consolidated farming routes.
        </p>
      </header>

      {/* Search Bar if targets exist */}
      {targets.length > 0 && (
        <div style={styles.searchControlsRow}>
          <div style={styles.searchBarWrapper}>
            <input
              type="text"
              placeholder="Search your tracked targets (e.g. Tellurium, Neurodes, Rhino)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
              aria-label="Search targets"
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
        </div>
      )}

      {combinedNodes.length > 0 && (
        <section style={styles.compositeSection}>
          <h2 style={styles.sectionTitle}>Recommended Route for Your Targets</h2>
          <p style={styles.compositeHelp}>
            Missions where you can farm multiple of your tracked targets simultaneously:
          </p>
          <div style={styles.compositeGrid}>
            {combinedNodes.map((item, idx) => (
              <div key={idx} style={styles.compositeCard}>
                <div style={styles.compositeTop}>
                  <span style={styles.compositeNode}>{item.node} ({item.planet})</span>
                  <span style={styles.compositeType}>{item.missionType}</span>
                </div>
                <div style={styles.compositeTargetsRow}>
                  <span style={styles.targetsLabel}>Targets:</span>
                  <span style={styles.targetsList}>{item.forTargets.join(', ')}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section style={styles.targetsSection}>
        {targets.length > 0 && (
          <div style={styles.resultsInfoBar}>
            <span style={styles.resultsCount}>
              Showing <strong>{filteredTargets.length}</strong> of {targets.length} Tracked Targets
            </span>
            {searchQuery && (
              <button
                type="button"
                style={styles.resetFiltersBtn}
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </button>
            )}
          </div>
        )}

        {targets.length === 0 ? (
          <div style={styles.emptyCard}>
            <p style={styles.emptyText}>You do not have any items in your farming targets list.</p>
            <p style={styles.emptySubText}>
              Browse the wiki or resource locator and click &quot;+ Target&quot; on any item or mod.
            </p>
            <Link to="/" style={styles.browseBtn}>Browse Items</Link>
          </div>
        ) : filteredTargets.length === 0 ? (
          <div style={styles.emptyCard}>
            <p style={styles.emptyText}>No tracked targets matched your search query.</p>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={styles.browseBtn}
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div style={styles.targetsList}>
            {filteredTargets.map((t) => {
              const progressPct = Math.min(100, Math.round((t.currentQuantity / t.targetQuantity) * 100));
              const isCompleted = t.currentQuantity >= t.targetQuantity;

              return (
                <div key={t.id} style={styles.targetCard}>
                  <div style={styles.cardMain}>
                    <div style={styles.cardHeader}>
                      <div>
                        <Link to={`/item/${encodeURIComponent(t.name)}`} style={styles.itemNameLink}>
                          {t.name}
                        </Link>
                        <span style={styles.categoryBadge}>{t.category}</span>
                      </div>
                      <button
                        onClick={() => handleRemove(t.id)}
                        style={styles.removeBtn}
                        aria-label={`Remove ${t.name} from targets`}
                      >
                        &#x2715; Remove
                      </button>
                    </div>

                    <div style={styles.progressRow}>
                      <div style={styles.progressBarBg}>
                        <div
                          style={{
                            ...styles.progressBarFill,
                            width: `${progressPct}%`,
                            backgroundColor: isCompleted ? theme.colors.green : theme.colors.accent,
                          }}
                        />
                      </div>
                      <span style={styles.progressText}>
                        {t.currentQuantity} / {t.targetQuantity} ({progressPct}%)
                      </span>
                    </div>

                    <div style={styles.counterRow}>
                      <span style={styles.counterLabel}>Update Count:</span>
                      <button
                        onClick={() => handleUpdateCurrent(t, -1)}
                        style={styles.countBtn}
                        aria-label="Decrease quantity"
                      >
                        -1
                      </button>
                      <button
                        onClick={() => handleUpdateCurrent(t, 1)}
                        style={styles.countBtn}
                        aria-label="Increase quantity"
                      >
                        +1
                      </button>
                      <button
                        onClick={() => handleUpdateCurrent(t, 5)}
                        style={styles.countBtn}
                        aria-label="Increase by 5"
                      >
                        +5
                      </button>
                    </div>

                    <div style={styles.notesSection}>
                      <input
                        type="text"
                        placeholder="Add a reminder or note..."
                        value={t.notes || ''}
                        onChange={(e) => handleUpdateNotes(t, e.target.value)}
                        style={styles.targetNoteInput}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  ...directoryStyles,
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: theme.colors.textHighlight,
    marginBottom: 12,
  },
  compositeSection: {
    background: theme.colors.bgCard,
    border: `1px solid ${theme.colors.borderDefault}`,
    borderRadius: theme.radii.lg,
    padding: 16,
    marginBottom: 16,
  },
  compositeHelp: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  compositeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: 12,
  },
  compositeCard: {
    background: theme.colors.bgCardElevated,
    border: `1px solid ${theme.colors.borderSubtle}`,
    borderRadius: theme.radii.md,
    padding: 12,
  },
  compositeTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  compositeNode: {
    fontSize: 13,
    fontWeight: 600,
    color: theme.colors.textHighlight,
  },
  compositeType: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  compositeTargetsRow: {
    fontSize: 12,
  },
  targetsLabel: {
    color: theme.colors.textMuted,
    marginRight: 6,
  },
  targetsList: {
    color: theme.colors.green,
    fontWeight: 500,
  },
  targetsSection: {
    marginTop: 10,
  },
  emptyCard: directoryStyles.emptyNoticeBox,
  emptyText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    marginBottom: 6,
  },
  emptySubText: directoryStyles.emptyNoticeText,
  browseBtn: {
    display: 'inline-block',
    padding: '8px 16px',
    background: theme.colors.accentBg,
    border: `1px solid ${theme.colors.accentBorder}`,
    borderRadius: theme.radii.sm,
    color: theme.colors.accent,
    fontWeight: 600,
    textDecoration: 'none',
    fontSize: 13,
  },
  targetCard: {
    background: theme.colors.bgCard,
    border: `1px solid ${theme.colors.borderDefault}`,
    borderRadius: theme.radii.lg,
    padding: 16,
    marginBottom: 12,
  },
  cardMain: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemNameLink: {
    fontSize: 16,
    fontWeight: 600,
    color: theme.colors.textHighlight,
    textDecoration: 'none',
    marginRight: 8,
  },
  categoryBadge: {
    fontSize: 11,
    padding: '2px 6px',
    background: theme.colors.purpleBg,
    color: theme.colors.purple,
    borderRadius: theme.radii.sm,
    border: `1px solid ${theme.colors.purpleBorder}`,
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    color: theme.colors.red,
    fontSize: 12,
    cursor: 'pointer',
  },
  progressRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    background: theme.colors.bgInput,
    borderRadius: theme.radii.sm,
    overflow: 'hidden',
    border: `1px solid ${theme.colors.borderSubtle}`,
  },
  progressBarFill: {
    height: '100%',
    transition: 'width 0.2s',
  },
  progressText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    minWidth: 100,
    textAlign: 'right',
  },
  counterRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  counterLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  countBtn: {
    padding: '3px 10px',
    background: theme.colors.bgCardElevated,
    border: `1px solid ${theme.colors.borderSubtle}`,
    borderRadius: theme.radii.sm,
    color: theme.colors.textPrimary,
    fontSize: 12,
    cursor: 'pointer',
  },
  notesSection: {
    marginTop: 4,
  },
  targetNoteInput: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '8px 12px',
    background: theme.colors.bgInput,
    border: `1px solid ${theme.colors.borderDefault}`,
    borderRadius: theme.radii.sm,
    color: theme.colors.textHighlight,
    fontSize: 12,
    outline: 'none',
  },
};

