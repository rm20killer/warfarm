import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { RelicEra } from '../../shared/types/warframe';
import { getBestRelicSpots, BEST_RELIC_SPOTS } from '../../shared/api/drop-data';

const ERAS: RelicEra[] = ['Lith', 'Meso', 'Neo', 'Axi', 'Requiem'];

export function RelicFinderPage() {
  const [selectedEra, setSelectedEra] = useState<RelicEra>('Axi');
  const [relicQuery, setRelicQuery] = useState('');

  const currentSpots = getBestRelicSpots(selectedEra);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Relic & Prime Parts Finder</h1>
        <p style={styles.subtitle}>
          Locate the fastest Star Chart missions to stockpile Void Relics by era, with rotation targets and squad tips.
        </p>
      </header>

      <section style={styles.filterSection}>
        <div style={styles.eraSelector}>
          {ERAS.map((era) => (
            <button
              key={era}
              onClick={() => setSelectedEra(era)}
              style={{
                ...styles.eraButton,
                backgroundColor: selectedEra === era ? '#242b3d' : '#12141d',
                borderColor: selectedEra === era ? '#4d648d' : '#1f2334',
                color: selectedEra === era ? '#f0f0f8' : '#888ca8',
              }}
            >
              {era} Relics
            </button>
          ))}
        </div>
      </section>

      <section style={styles.spotsSection}>
        <h2 style={styles.sectionTitle}>
          Top Speedrun Spots: <span style={styles.highlightEra}>{selectedEra} Relics</span>
        </h2>

        <div style={styles.spotsGrid}>
          {currentSpots.map((spot, i) => (
            <div key={i} style={styles.spotCard}>
              <div style={styles.spotCardTop}>
                <div>
                  <span style={styles.spotNode}>{spot.node}</span>
                  <span style={styles.spotPlanet}> - {spot.planet}</span>
                </div>
                <span style={styles.dropRate}>{spot.dropRateText}</span>
              </div>

              <div style={styles.metaRow}>
                <span style={styles.metaBadge}>{spot.missionType}</span>
                <span style={styles.metaBadge}>Rotation: {spot.rotation}</span>
                <span style={styles.timeBadge}>{spot.expectedTime}</span>
              </div>

              <p style={styles.strategyTip}>{spot.strategyTip}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={styles.searchRelicSection}>
        <h2 style={styles.sectionTitle}>Look Up Specific Relic or Part</h2>
        <p style={styles.searchDesc}>
          Type any relic code (e.g. Lith C10, Axi A17) or Prime part to jump directly to its drop table details.
        </p>
        <div style={styles.searchBar}>
          <input
            type="text"
            placeholder="e.g. Axi A17 Relic, Wisp Prime Chassis..."
            value={relicQuery}
            onChange={(e) => setRelicQuery(e.target.value)}
            style={styles.relicInput}
            aria-label="Search relic"
          />
          {relicQuery.trim() && (
            <Link
              to={`/item/${encodeURIComponent(relicQuery.trim())}`}
              style={styles.lookupBtn}
            >
              Search Wiki
            </Link>
          )}
        </div>
      </section>

      <section style={styles.rotationHelpSection}>
        <h3 style={styles.rotationHelpTitle}>Warframe Mission Rotation Reference</h3>
        <p style={styles.rotationHelpText}>
          Most endless missions (Survival, Defense, Interception, Defection) follow the <strong>A-A-B-C</strong> rotation cycle:
        </p>
        <ul style={styles.rotationList}>
          <li><strong>Survival:</strong> 5m (A), 10m (A), 15m (B), 20m (C) (repeats)</li>
          <li><strong>Defense:</strong> 5 waves (A), 10 waves (A), 15 waves (B), 20 waves (C) (repeats)</li>
          <li><strong>Disruption:</strong> Variable rotation depending on round number and conduits defended (Round 3+ with 4 conduits awards Tier C indefinitely).</li>
        </ul>
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
  filterSection: {
    backgroundColor: '#12141d',
    border: '1px solid #1f2334',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  eraSelector: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  eraButton: {
    padding: '8px 16px',
    border: '1px solid',
    borderRadius: 4,
    fontSize: 13,
    cursor: 'pointer',
    fontWeight: 500,
    transition: 'all 0.15s',
  },
  spotsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#d8d8e6',
    marginBottom: 14,
  },
  highlightEra: {
    color: '#90b0e0',
  },
  spotsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 16,
  },
  spotCard: {
    background: '#12141d',
    border: '1px solid #1f2334',
    borderRadius: 8,
    padding: 16,
  },
  spotCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  spotNode: {
    fontSize: 15,
    fontWeight: 600,
    color: '#eaeaf4',
  },
  spotPlanet: {
    fontSize: 13,
    color: '#888ca8',
  },
  dropRate: {
    fontSize: 12,
    color: '#8ec48e',
    fontWeight: 500,
  },
  metaRow: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  metaBadge: {
    fontSize: 11,
    padding: '2px 6px',
    background: '#181826',
    color: '#888ca8',
    borderRadius: 3,
  },
  timeBadge: {
    fontSize: 11,
    padding: '2px 6px',
    background: '#222218',
    color: '#d0c484',
    borderRadius: 3,
  },
  strategyTip: {
    fontSize: 12,
    color: '#888ca8',
    lineHeight: 1.4,
    margin: 0,
  },
  searchRelicSection: {
    background: '#12141d',
    border: '1px solid #1f2334',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  searchDesc: {
    fontSize: 13,
    color: '#888ca8',
    marginBottom: 12,
  },
  searchBar: {
    display: 'flex',
    gap: 10,
    maxWidth: 500,
  },
  relicInput: {
    flex: 1,
    padding: '8px 12px',
    background: '#0e0e12',
    border: '1px solid #2a2a3c',
    borderRadius: 5,
    color: '#e4e4ee',
    fontSize: 13,
    outline: 'none',
  },
  lookupBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '8px 14px',
    background: '#1a1d2c',
    border: '1px solid #29304a',
    borderRadius: 4,
    color: '#8ea0d4',
    fontWeight: 600,
    textDecoration: 'none',
    fontSize: 13,
  },
  rotationHelpSection: {
    padding: 16,
    background: '#12141d',
    border: '1px solid #1f2334',
    borderRadius: 8,
  },
  rotationHelpTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#c0c0d4',
    marginBottom: 6,
  },
  rotationHelpText: {
    fontSize: 12,
    color: '#888ca8',
    marginBottom: 8,
  },
  rotationList: {
    fontSize: 12,
    color: '#888ca8',
    paddingLeft: 20,
    margin: 0,
    lineHeight: 1.6,
  },
};

