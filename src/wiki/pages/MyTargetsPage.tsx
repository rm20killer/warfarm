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

export function MyTargetsPage() {
  const [targets, setTargets] = useState<PersonalTarget[]>([]);

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
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>My Farming Targets & Notes</h1>
        <p style={styles.subtitle}>
          Track items and resources you are currently hunting, update collected quantities, and view consolidated farming routes.
        </p>
      </header>

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
        <h2 style={styles.sectionTitle}>Active Tracked Items ({targets.length})</h2>

        {targets.length === 0 ? (
          <div style={styles.emptyCard}>
            <p style={styles.emptyText}>You do not have any items in your farming targets list.</p>
            <p style={styles.emptySubText}>
              Browse the wiki or resource locator and click &quot;+ Add to Targets&quot; on any item.
            </p>
            <Link to="/" style={styles.browseBtn}>Browse Items</Link>
          </div>
        ) : (
          <div style={styles.targetsList}>
            {targets.map((t) => {
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
                            backgroundColor: isCompleted ? '#78b878' : '#6888b8',
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
  container: {
    padding: '16px 18px 60px 18px',
    maxWidth: 1180,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#d8d8e6',
    marginBottom: 12,
  },
  compositeSection: {
    background: '#12141d',
    border: '1px solid #1f2334',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  compositeHelp: {
    fontSize: 12,
    color: '#888ca8',
    marginBottom: 12,
  },
  compositeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: 12,
  },
  compositeCard: {
    background: '#161824',
    border: '1px solid #232738',
    borderRadius: 6,
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
    color: '#e0e0ec',
  },
  compositeType: {
    fontSize: 11,
    color: '#888ca8',
  },
  compositeTargetsRow: {
    fontSize: 12,
  },
  targetsLabel: {
    color: '#888ca8',
    marginRight: 6,
  },
  targetsList: {
    color: '#90c490',
    fontWeight: 500,
  },
  targetsSection: {
    marginTop: 10,
  },
  emptyCard: {
    padding: 32,
    background: '#12141d',
    border: '1px solid #1f2334',
    borderRadius: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#d0d0dc',
    marginBottom: 6,
  },
  emptySubText: {
    fontSize: 12,
    color: '#888ca8',
    marginBottom: 18,
  },
  browseBtn: {
    display: 'inline-block',
    padding: '8px 16px',
    background: '#1a1d2c',
    border: '1px solid #29304a',
    borderRadius: 4,
    color: '#8ea0d4',
    fontWeight: 600,
    textDecoration: 'none',
    fontSize: 13,
  },
  targetCard: {
    background: '#12141d',
    border: '1px solid #1f2334',
    borderRadius: 8,
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
    color: '#e4e4f0',
    textDecoration: 'none',
    marginRight: 8,
  },
  categoryBadge: {
    fontSize: 11,
    padding: '2px 6px',
    background: '#1c1c2c',
    color: '#9090b8',
    borderRadius: 3,
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    color: '#a06060',
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
    background: '#181824',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    transition: 'width 0.2s',
  },
  progressText: {
    fontSize: 12,
    color: '#9a9ab0',
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
    color: '#7a7a90',
  },
  countBtn: {
    padding: '3px 10px',
    background: '#181824',
    border: '1px solid #262638',
    borderRadius: 3,
    color: '#c0c0d4',
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
    background: '#0e0e12',
    border: '1px solid #2a2a3c',
    borderRadius: 4,
    color: '#d0d0e0',
    fontSize: 12,
    outline: 'none',
  },
};

