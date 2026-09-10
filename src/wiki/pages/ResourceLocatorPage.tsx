import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  getAllResourceGuides,
  ResourceCategory,
  ResourceFarmingGuide,
} from '../../shared/data/resource-guide';
import { savePersonalTarget, getPersonalTargets, removePersonalTarget } from '../storage';

const CATEGORIES: Array<{ id: ResourceCategory | 'All'; label: string }> = [
  { id: 'All', label: 'All Resources' },
  { id: 'Rare', label: 'Rare' },
  { id: 'Uncommon', label: 'Uncommon' },
  { id: 'Common', label: 'Common' },
  { id: 'OpenWorld', label: 'Open World' },
];

export function ResourceLocatorPage() {
  const [activeCategory, setActiveCategory] = useState<ResourceCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [trackedIds, setTrackedIds] = useState<Set<string>>(() => {
    return new Set(getPersonalTargets().map((t) => t.id));
  });

  const allGuides = useMemo(() => getAllResourceGuides(), []);

  const filteredResources = allGuides.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.planets.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.optimalNodes.some((n) => n.node.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

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
        notes: '',
      });
      setTrackedIds((prev) => new Set(prev).add(guide.id));
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Star Chart Resource Locator</h1>
        <p style={styles.subtitle}>
          Find where to farm all Warframe crafting components with recommended squad builds and high-yield nodes.
        </p>
      </header>

      <section style={styles.filterSection}>
        <div style={styles.filterRow}>
          <input
            type="text"
            placeholder="Filter by resource or planet (e.g. Saturn, Tellurium)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
            aria-label="Filter resources"
          />
          <div style={styles.categoryButtons}>
            {CATEGORIES.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActiveCategory(id)}
                style={{
                  ...styles.catButton,
                  backgroundColor: activeCategory === id ? '#222234' : '#14141c',
                  borderColor: activeCategory === id ? '#3c3c56' : '#222230',
                  color: activeCategory === id ? '#eaeaf4' : '#8a8aa0',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div style={styles.resourceList}>
        {filteredResources.length === 0 ? (
          <p style={styles.emptyNotice}>No resources matched your search filter.</p>
        ) : (
          filteredResources.map((resource) => {
            const isTracked = trackedIds.has(resource.id);
            return (
              <article key={resource.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div>
                    <div style={styles.nameRow}>
                      <h2 style={styles.resourceName}>{resource.name}</h2>
                      <span style={styles.categoryBadge}>{resource.category}</span>
                    </div>
                    <span style={styles.planetsList}>
                      Found on: {resource.planets.join(', ')}
                    </span>
                  </div>

                  <div style={styles.cardActions}>
                    <button
                      onClick={() => handleToggleTarget(resource)}
                      style={{
                        ...styles.trackButton,
                        backgroundColor: isTracked ? '#223822' : '#1a1a26',
                        borderColor: isTracked ? '#3a623a' : '#28283a',
                        color: isTracked ? '#92d492' : '#b0b0c4',
                      }}
                    >
                      {isTracked ? 'Tracking' : '+ Track'}
                    </button>
                    <Link to={`/item/${encodeURIComponent(resource.name)}`} style={styles.viewLink}>
                      Wiki Guide
                    </Link>
                  </div>
                </div>

                <p style={styles.descriptionText}>{resource.description}</p>
                {resource.specialMechanics && (
                  <div style={styles.mechanicNote}>
                    <strong>Note:</strong> {resource.specialMechanics}
                  </div>
                )}

                <div style={styles.nodesSection}>
                  <span style={styles.nodesHeader}>Top Farming Locations:</span>
                  <div style={styles.nodesGrid}>
                    {resource.optimalNodes.map((node, i) => (
                      <div key={i} style={styles.nodeItem}>
                        <div style={styles.nodeItemTop}>
                          <span style={styles.nodeName}>
                            {node.node} ({node.planet})
                          </span>
                          <span
                            style={{
                              ...styles.nodeRating,
                              color: node.efficiencyRating === 'Best' ? '#90c890' : '#d2c884',
                            }}
                          >
                            {node.efficiencyRating}
                          </span>
                        </div>
                        <span style={styles.nodeMission}>{node.missionType}</span>
                        <p style={styles.nodeStrategy}>{node.strategyNote}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={styles.footerRow}>
                  <span style={styles.recommendedTitle}>Recommended Squad Frames:</span>
                  <span style={styles.recommendedFrames}>{resource.recommendedFrames.join(', ')}</span>
                </div>
              </article>
            );
          })
        )}
      </div>
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
  filterRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  searchInput: {
    padding: '10px 14px',
    background: '#0e0e12',
    border: '1px solid #2a2a3c',
    borderRadius: 5,
    color: '#e2e2ec',
    fontSize: 14,
    outline: 'none',
  },
  categoryButtons: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  },
  catButton: {
    padding: '6px 12px',
    borderRadius: 4,
    border: '1px solid',
    fontSize: 12,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  resourceList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  emptyNotice: {
    color: '#888ca8',
    fontSize: 14,
    padding: '24px 0',
  },
  card: {
    background: '#12141d',
    border: '1px solid #1f2334',
    borderRadius: 8,
    padding: 16,
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 10,
  },
  nameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  resourceName: {
    fontSize: 18,
    fontWeight: 600,
    color: '#e8e8f0',
    margin: 0,
  },
  categoryBadge: {
    fontSize: 11,
    padding: '2px 6px',
    background: '#1c1c2a',
    color: '#9090b8',
    borderRadius: 3,
  },
  planetsList: {
    fontSize: 12,
    color: '#7e7e94',
  },
  cardActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  trackButton: {
    padding: '5px 12px',
    border: '1px solid',
    borderRadius: 4,
    fontSize: 12,
    cursor: 'pointer',
  },
  viewLink: {
    fontSize: 12,
    fontWeight: 600,
    color: '#8ea0d4',
    textDecoration: 'none',
    padding: '4px 10px',
    backgroundColor: '#1a1d2c',
    border: '1px solid #29304a',
    borderRadius: 4,
  },
  descriptionText: {
    fontSize: 13,
    color: '#9898ae',
    lineHeight: 1.4,
    margin: '0 0 10px 0',
  },
  mechanicNote: {
    padding: '8px 12px',
    background: '#1c1a20',
    borderLeft: '3px solid #a88c58',
    borderRadius: 3,
    fontSize: 12,
    color: '#c8bc9e',
    marginBottom: 14,
  },
  nodesSection: {
    marginTop: 10,
    marginBottom: 14,
  },
  nodesHeader: {
    fontSize: 12,
    fontWeight: 600,
    color: '#b0b0c4',
    display: 'block',
    marginBottom: 8,
  },
  nodesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: 10,
  },
  nodeItem: {
    background: '#161824',
    border: '1px solid #232738',
    borderRadius: 6,
    padding: 10,
  },
  nodeItemTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  nodeName: {
    fontSize: 13,
    fontWeight: 600,
    color: '#dcdce8',
  },
  nodeRating: {
    fontSize: 11,
    fontWeight: 600,
  },
  nodeMission: {
    fontSize: 11,
    color: '#7a7a92',
    display: 'block',
    marginBottom: 6,
  },
  nodeStrategy: {
    fontSize: 12,
    color: '#8a8aa4',
    margin: 0,
    lineHeight: 1.3,
  },
  footerRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    paddingTop: 10,
    borderTop: '1px solid #181824',
    fontSize: 12,
  },
  recommendedTitle: {
    color: '#7a7a90',
  },
  recommendedFrames: {
    color: '#8ea0c4',
  },
};

