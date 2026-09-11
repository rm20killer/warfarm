import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  SPECIAL_CHALLENGES,
  SpecialChallengeGuide,
} from '../../shared/data/special-mechanics';
import { usePageMeta } from '../../shared/utils/usePageMeta';

export function SpecialMechanicsPage() {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>(SPECIAL_CHALLENGES[0].id);

  usePageMeta({
    title: 'Lua Puzzle Solutions, Halls of Ascension & Vaults',
    description: 'Walkthroughs for the 7 Lua Halls of Ascension Drift mod puzzles, Orokin Derelict Dragon Key Vaults, and Granum Void mechanics.',
    keywords: 'warframe lua puzzles, halls of ascension, drift mods, dragon key vaults, corrupted mods, granum void, puzzle guide',
    canonicalPath: '/mechanics',
  });

  const categories = ['All', 'Lua Principle', 'Vault System', 'Special Dimension'];

  const filteredChallenges = SPECIAL_CHALLENGES.filter((c) => {
    return activeCategory === 'All' || c.category === activeCategory;
  });

  const activeChallenge =
    SPECIAL_CHALLENGES.find((c) => c.id === selectedChallengeId) || SPECIAL_CHALLENGES[0];

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Lua Challenges & Special Mechanics</h1>
        <p style={styles.subtitle}>
          Step-by-step puzzle solutions and room recognition cues for the 7 Lua Halls of Ascension (Drift Mods), Orokin Dragon Key Vaults, and the Granum Void.
        </p>
      </header>

      <section style={styles.filterSection}>
        <div style={styles.catTabBar}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                ...styles.catTab,
                backgroundColor: activeCategory === cat ? '#242b3d' : '#12141d',
                borderColor: activeCategory === cat ? '#4d648d' : '#1f2334',
                color: activeCategory === cat ? '#f0f0fa' : '#888ca8',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      <div style={styles.layoutGrid}>
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
                  backgroundColor: isSelected ? '#1e2436' : '#12141d',
                  borderColor: isSelected ? '#42557e' : '#1f2334',
                }}
              >
                <span
                  style={{
                    ...styles.challengeBtnTitle,
                    color: isSelected ? '#e4e4f0' : '#9a9aa8',
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

            <section style={styles.infoBlock}>
              <strong style={styles.blockHeading}>Room Recognition Cue:</strong>
              <p style={styles.blockText}>{activeChallenge.roomVisualCue}</p>
            </section>

            <section style={styles.infoBlock}>
              <strong style={styles.blockHeading}>Recommended Squad & Warframe Setups:</strong>
              <div style={styles.framesBadgeRow}>
                {activeChallenge.recommendedFrames.map((frame, i) => (
                  <span key={i} style={styles.frameBadge}>
                    {frame}
                  </span>
                ))}
              </div>
            </section>

            <section style={styles.infoBlock}>
              <strong style={styles.blockHeading}>Step-by-Step Puzzle Solution:</strong>
              <ol style={styles.solutionList}>
                {activeChallenge.stepByStepSolution.map((step, i) => (
                  <li key={i} style={styles.solutionStep}>
                    {step}
                  </li>
                ))}
              </ol>
            </section>

            {activeChallenge.tipsAndTricks && activeChallenge.tipsAndTricks.length > 0 && (
              <section style={styles.tipsBlock}>
                <strong style={styles.tipsHeading}>Pro-Tips & Ability Shortcuts:</strong>
                <ul style={styles.tipsList}>
                  {activeChallenge.tipsAndTricks.map((tip, i) => (
                    <li key={i} style={styles.tipItem}>
                      &#8226; {tip}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </article>
        </main>
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
  catTabBar: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  },
  catTab: {
    padding: '6px 14px',
    borderRadius: 4,
    border: '1px solid',
    fontSize: 12,
    cursor: 'pointer',
    fontWeight: 500,
  },
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
    color: '#888ca8',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  challengeItemBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '12px 14px',
    border: '1px solid',
    borderRadius: 6,
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
    color: '#8ec48e',
  },
  detailPane: {
    minWidth: 0,
  },
  detailCard: {
    background: '#12141d',
    border: '1px solid #1f2334',
    borderRadius: 8,
    padding: 24,
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid #1f2334',
    paddingBottom: 16,
    marginBottom: 20,
    gap: 12,
  },
  challengeCategory: {
    fontSize: 11,
    padding: '2px 6px',
    background: '#1c1c2c',
    color: '#9090b8',
    borderRadius: 3,
    display: 'inline-block',
    marginBottom: 6,
  },
  challengeMainTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: '#eaeaf4',
    margin: 0,
  },
  rewardLink: {
    fontSize: 12,
    fontWeight: 600,
    color: '#8ea0d4',
    textDecoration: 'none',
    padding: '4px 10px',
    backgroundColor: '#1a1d2c',
    border: '1px solid #29304a',
    borderRadius: 4,
    whiteSpace: 'nowrap',
  },
  infoBlock: {
    marginBottom: 20,
  },
  blockHeading: {
    fontSize: 13,
    fontWeight: 600,
    color: '#c8c8dc',
    display: 'block',
    marginBottom: 6,
  },
  blockText: {
    fontSize: 13,
    color: '#8e8ea4',
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
    background: '#181826',
    border: '1px solid #242436',
    borderRadius: 4,
    color: '#b0b0cc',
  },
  solutionList: {
    paddingLeft: 20,
    margin: 0,
    fontSize: 13,
    color: '#9898ae',
    lineHeight: 1.6,
  },
  solutionStep: {
    padding: '3px 0',
  },
  tipsBlock: {
    padding: 14,
    background: '#161622',
    borderLeft: '3px solid #8e9ec4',
    borderRadius: 4,
  },
  tipsHeading: {
    fontSize: 12,
    color: '#d0d0e2',
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
    color: '#8ec48e',
    padding: '2px 0',
    lineHeight: 1.4,
  },
};

