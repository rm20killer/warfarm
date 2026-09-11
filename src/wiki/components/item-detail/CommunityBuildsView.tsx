import React from 'react';
import { Link } from 'react-router-dom';
import { RecommendedBuild } from '../../../shared/data/recommended-builds';
import { detailStyles as styles } from './itemDetailStyles';

interface CommunityBuildsViewProps {
  itemName: string;
  recommendedBuilds: RecommendedBuild[];
  selectedBuildIndex: number;
  isCombatItem: boolean;
  onSelectBuildIndex: (index: number) => void;
}

export function CommunityBuildsView({
  itemName,
  recommendedBuilds,
  selectedBuildIndex,
  isCombatItem,
  onSelectBuildIndex,
}: CommunityBuildsViewProps) {
  if (!isCombatItem) return null;

  if (recommendedBuilds.length === 0) {
    return (
      <section style={styles.sectionCard}>
        <h2 style={styles.sectionTitle}>Recommended Community Builds &amp; Mod Loadouts</h2>
        <p style={{ margin: '6px 0 16px 0', fontSize: 13, color: '#8888a2' }}>
          No builds submitted yet. Check the community or be the first to contribute one.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a
            href={`https://www.reddit.com/r/Warframe/search/?q=${encodeURIComponent(itemName)}+build`}
            target="_blank"
            rel="noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: '#281a18', color: '#ff6644', border: '1px solid #582820', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}
          >
            Reddit /r/Warframe
          </a>
          <a
            href={`https://overframe.gg/search?q=${encodeURIComponent(itemName)}`}
            target="_blank"
            rel="noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: '#242018', color: '#ffd700', border: '1px solid #504420', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}
          >
            Overframe
          </a>
          <a
            href={`https://www.tiktok.com/search?q=${encodeURIComponent(itemName + ' warframe build')}`}
            target="_blank"
            rel="noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: '#182024', color: '#00e5ff', border: '1px solid #204050', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}
          >
            TikTok Builds
          </a>
        </div>
      </section>
    );
  }

  const b = recommendedBuilds[selectedBuildIndex] || recommendedBuilds[0];

  return (
    <section style={styles.sectionCard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div>
          <h2 style={styles.sectionTitle}>Recommended Community Builds &amp; Mod Loadouts</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#8888a2' }}>
            Optimized configurations with full mod setups, Arcanes, Archon Shards, and playstyles.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {recommendedBuilds.map((build, bIdx) => (
            <button
              key={build.id || bIdx}
              type="button"
              onClick={() => onSelectBuildIndex(bIdx)}
              style={{
                backgroundColor: selectedBuildIndex === bIdx ? '#2c334d' : '#141622',
                color: selectedBuildIndex === bIdx ? '#ffd700' : '#8e9ec4',
                border: `1px solid ${selectedBuildIndex === bIdx ? '#ffd700' : '#222638'}`,
                borderRadius: 6,
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {build.title.split(' ')[0]} ({build.archetype})
            </button>
          ))}
        </div>
      </div>

      {b && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f0f0f8', margin: 0 }}>
              {b.title}
            </h3>
            <span style={{ backgroundColor: '#222b44', color: '#ffd700', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4 }}>
              {b.archetype}
            </span>
          </div>

          <p style={{ fontSize: 13, color: '#9baacf', lineHeight: 1.5, margin: '0 0 14px 0' }}>
            {b.description}
          </p>

          <div style={{ backgroundColor: '#131828', border: '1px solid #232c48', borderRadius: 6, padding: '12px 16px', marginBottom: 18 }}>
            <strong style={{ color: '#8e9ec4', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Playstyle Strategy:</strong>
            <p style={{ margin: '6px 0 0 0', fontSize: 13, color: '#d0d4e8', lineHeight: 1.5 }}>
              {b.playstyle}
            </p>
          </div>

          <div style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={styles.componentsHeading}>Mod Slots Configuration:</span>
              <div style={{ display: 'flex', gap: 10 }}>
                {b.auraOrStance && (
                  <span style={{ fontSize: 12, color: '#00e676', backgroundColor: '#00e67615', border: '1px solid #00e67644', padding: '2px 8px', borderRadius: 4 }}>
                    <strong>Aura / Stance:</strong> {b.auraOrStance}
                  </span>
                )}
                {b.exilus && (
                  <span style={{ fontSize: 12, color: '#ffbb33', backgroundColor: '#ffbb3315', border: '1px solid #ffbb3344', padding: '2px 8px', borderRadius: 4 }}>
                    <strong>Exilus:</strong> {b.exilus}
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
              {b.mods.map((m, mIdx) => (
                <Link
                  key={mIdx}
                  to={`/item/${encodeURIComponent(m.modName)}`}
                  style={{
                    display: 'block',
                    backgroundColor: '#141624',
                    border: '1px solid #242940',
                    borderRadius: 6,
                    padding: '10px 12px',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: '#68708c', fontWeight: 600 }}>Slot {m.slot + 1}</span>
                    {m.drain && (
                      <span style={{ fontSize: 11, color: '#ffd700', backgroundColor: '#ffd70018', padding: '1px 5px', borderRadius: 3 }}>
                        {m.drain} Drain
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#e0e4f4' }}>
                    {m.modName}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, marginBottom: 18 }}>
            {b.arcanes && b.arcanes.length > 0 && (
              <div style={{ backgroundColor: '#131520', border: '1px solid #202434', borderRadius: 6, padding: '12px 14px' }}>
                <strong style={{ fontSize: 12, color: '#cc88ff', display: 'block', marginBottom: 6 }}>
                  Recommended Arcanes:
                </strong>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#c8c8dc' }}>
                  {b.arcanes.map((arc, aIdx) => (
                    <li key={aIdx} style={{ marginBottom: 4 }}>
                      <Link
                        to={`/item/${encodeURIComponent(arc)}`}
                        style={{ color: '#dca8ff', textDecoration: 'none', fontWeight: 600 }}
                      >
                        {arc}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {b.archonShards && b.archonShards.length > 0 && (
              <div style={{ backgroundColor: '#131520', border: '1px solid #202434', borderRadius: 6, padding: '12px 14px' }}>
                <strong style={{ fontSize: 12, color: '#ff5544', display: 'block', marginBottom: 6 }}>
                  Archon Shards:
                </strong>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#c8c8dc' }}>
                  {b.archonShards.map((shard, sIdx) => (
                    <li key={sIdx}>{shard}</li>
                  ))}
                </ul>
              </div>
            )}

            {b.helminth && (
              <div style={{ backgroundColor: '#131520', border: '1px solid #202434', borderRadius: 6, padding: '12px 14px' }}>
                <strong style={{ fontSize: 12, color: '#44dd88', display: 'block', marginBottom: 6 }}>
                  Helminth Subsume:
                </strong>
                <div style={{ fontSize: 13, color: '#d0d4e8', marginBottom: 4 }}>
                  <strong>{b.helminth.ability}</strong> replacing <em>{b.helminth.replacedAbility}</em>
                </div>
                <div style={{ fontSize: 12, color: '#7e88a4' }}>
                  {b.helminth.description}
                </div>
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid #202434', paddingTop: 14 }}>
            <span style={{ fontSize: 12, color: '#8888a2', display: 'block', marginBottom: 8, fontWeight: 600 }}>
              Explore More Community Builds &amp; Guides:
            </span>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {b.externalLinks?.redditUrl && (
                <a
                  href={b.externalLinks.redditUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    backgroundColor: '#281a18',
                    color: '#ff6644',
                    border: '1px solid #582820',
                    borderRadius: 6,
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  Reddit /r/Warframe
                </a>
              )}
              {b.externalLinks?.tiktokUrl && (
                <a
                  href={b.externalLinks.tiktokUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    backgroundColor: '#182024',
                    color: '#00e5ff',
                    border: '1px solid #204050',
                    borderRadius: 6,
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  TikTok Builds &amp; Clips
                </a>
              )}
              {b.externalLinks?.overframeUrl && (
                <a
                  href={b.externalLinks.overframeUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    backgroundColor: '#242018',
                    color: '#ffd700',
                    border: '1px solid #504420',
                    borderRadius: 6,
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  Overframe Community
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

