import React from 'react';
import { Link } from 'react-router-dom';
import { ItemThumbnail } from '../../../shared/utils/item-images';
import {
  RelicEntry,
  RelicRefinement,
  REFINEMENT_TRACES,
  getRewardRefinementChances,
  calculateSquadSuccessProbability,
} from '../../../shared/data/relic-database';
import { RelicFarmingSpot } from '../../../shared/api/drop-data';
import { theme } from '../../styles/theme';
import { detailStyles as styles, getRarityBadgeStyle } from './itemDetailStyles';

interface RelicDetailViewProps {
  relicData: RelicEntry;
  selectedRelicRefinement: RelicRefinement;
  relicSpots: RelicFarmingSpot[];
  onSelectRefinement: (tier: RelicRefinement) => void;
}

export function RelicDetailView({
  relicData,
  selectedRelicRefinement,
  relicSpots,
  onSelectRefinement,
}: RelicDetailViewProps) {
  return (
    <>
      <section style={styles.sectionCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 4,
                background: theme.colors.relicLithBg,
                color: theme.colors.catRelic,
                border: '1px solid #5c4820',
              }}>
                {relicData.era.toUpperCase()} ERA RELIC
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 4,
                  backgroundColor: relicData.vaulted ? theme.colors.vaultedBg : theme.colors.unvaultedBg,
                  color: relicData.vaulted ? theme.colors.vaulted : theme.colors.unvaulted,
                  border: `1px solid ${relicData.vaulted ? theme.colors.vaultedBorder : theme.colors.unvaultedBorder}`,
                }}
              >
                {relicData.vaulted ? 'VAULTED (Prime Vault Sealed)' : 'UNVAULTED (Active Star Chart Drop)'}
              </span>
            </div>
            <h2 style={styles.sectionTitle}>{relicData.fullName} Drops & Refinement</h2>
            <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#a0a4c0' }}>
              Select a refinement tier to inspect drop chances for solo runs and 4-player Radshare squad runs.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {(['Intact', 'Exceptional', 'Flawless', 'Radiant'] as RelicRefinement[]).map((tier) => {
              const isSelected = selectedRelicRefinement === tier;
              const traces = REFINEMENT_TRACES[tier];
              return (
                <button
                  key={tier}
                  type="button"
                  onClick={() => onSelectRefinement(tier)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '6px 12px',
                    background: isSelected ? '#252b42' : '#141624',
                    border: `1px solid ${isSelected ? theme.colors.gold : '#23273c'}`,
                    borderRadius: 6,
                    cursor: 'pointer',
                    color: isSelected ? theme.colors.gold : '#9ea4c4',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{tier}</span>
                  <span style={{ fontSize: 10, color: isSelected ? '#eed8a0' : '#787c94' }}>
                    {traces === 0 ? '0 Traces' : `+${traces} Traces`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginBottom: 20 }}>
          {relicData.rewards.map((rw, rIdx) => {
            const chances = getRewardRefinementChances(rw.rarity);
            const currentRate = chances[selectedRelicRefinement.toLowerCase() as keyof typeof chances] as number;
            const squadRate = calculateSquadSuccessProbability(currentRate, 4);

            let rarityBg = '#221e18';
            let rarityColor = theme.colors.vaulted;
            let rarityBorder = theme.colors.vaultedBorder;
            if (rw.rarity === 'Rare') {
              rarityBg = '#2c2616';
              rarityColor = theme.colors.gold;
              rarityBorder = '#6e5820';
            } else if (rw.rarity === 'Uncommon') {
              rarityBg = '#1c222c';
              rarityColor = theme.colors.rarityUncommon;
              rarityBorder = '#28446c';
            }

            return (
              <div
                key={rIdx}
                style={{
                  background: '#151724',
                  border: `1px solid ${rw.rarity === 'Rare' ? '#4a3820' : '#222638'}`,
                  borderRadius: 6,
                  padding: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 10,
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '2px 6px',
                        borderRadius: 3,
                        background: rarityBg,
                        color: rarityColor,
                        border: `1px solid ${rarityBorder}`,
                      }}
                    >
                      {rw.rarity}
                    </span>
                    <span style={{ fontSize: 15, fontWeight: 800, color: rarityColor }}>
                      {currentRate}%
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <ItemThumbnail name={rw.itemName} size={36} />
                    <Link
                      to={`/item/${encodeURIComponent(rw.itemName)}`}
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#e0e4f4',
                        textDecoration: 'none',
                        lineHeight: 1.35,
                      }}
                    >
                      {rw.itemName}
                    </Link>
                  </div>
                </div>

                <div style={{ padding: '6px 8px', background: '#10121c', borderRadius: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
                  <span style={{ color: '#7c829c' }}>4-Player Squad:</span>
                  <strong style={{ color: '#8ec48e' }}>{squadRate}%</strong>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f0f0f8', margin: '0 0 10px 0' }}>
            Refinement Probability Matrix (All Tiers Comparison)
          </h3>
          <div style={styles.comparisonTableWrapper}>
            <table style={styles.comparisonTable}>
              <thead>
                <tr>
                  <th style={styles.compTh}>Reward Item</th>
                  <th style={styles.compTh}>Rarity</th>
                  <th style={{ ...styles.compTh, background: selectedRelicRefinement === 'Intact' ? '#242a42' : undefined }}>
                    Intact (0)
                  </th>
                  <th style={{ ...styles.compTh, background: selectedRelicRefinement === 'Exceptional' ? '#242a42' : undefined }}>
                    Exceptional (25)
                  </th>
                  <th style={{ ...styles.compTh, background: selectedRelicRefinement === 'Flawless' ? '#242a42' : undefined }}>
                    Flawless (50)
                  </th>
                  <th style={{ ...styles.compTh, background: selectedRelicRefinement === 'Radiant' ? '#242a42' : undefined }}>
                    Radiant (100)
                  </th>
                  <th style={styles.compTh}>Upgrade Delta</th>
                </tr>
              </thead>
              <tbody>
                {relicData.rewards.map((rw, idx) => {
                  const chances = getRewardRefinementChances(rw.rarity);
                  const delta = Number((chances.radiant - chances.intact).toFixed(2));
                  const isBoost = delta > 0;
                  return (
                    <tr key={idx} style={styles.compTr}>
                      <td style={styles.compTdLabel}>
                        <Link
                          to={`/item/${encodeURIComponent(rw.itemName)}`}
                          style={{ color: '#d0d4e8', textDecoration: 'none', fontWeight: 600 }}
                        >
                          {rw.itemName}
                        </Link>
                      </td>
                      <td style={styles.compTdCurrent}>
                        <span style={getRarityBadgeStyle(rw.rarity)}>
                          {rw.rarity}
                        </span>
                      </td>
                      <td style={{ ...styles.compTdCounterpart, background: selectedRelicRefinement === 'Intact' ? '#1f243c' : undefined }}>
                        {chances.intact}%
                      </td>
                      <td style={{ ...styles.compTdCounterpart, background: selectedRelicRefinement === 'Exceptional' ? '#1f243c' : undefined }}>
                        {chances.exceptional}%
                      </td>
                      <td style={{ ...styles.compTdCounterpart, background: selectedRelicRefinement === 'Flawless' ? '#1f243c' : undefined }}>
                        {chances.flawless}%
                      </td>
                      <td style={{ ...styles.compTdCounterpart, background: selectedRelicRefinement === 'Radiant' ? '#1f243c' : undefined }}>
                        <strong style={{ color: theme.colors.gold }}>{chances.radiant}%</strong>
                      </td>
                      <td style={styles.compTdDelta}>
                        <span
                          style={{
                            ...styles.deltaBadge,
                            color: isBoost ? theme.colors.unvaulted : '#ff8282',
                            backgroundColor: isBoost ? theme.colors.unvaultedBg : '#2d1818',
                            borderColor: isBoost ? theme.colors.unvaultedBorder : '#542222',
                          }}
                        >
                          {isBoost ? `+${delta}% (boost)` : `${delta}%`}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {relicData.drops && relicData.drops.length > 0 && (
        <section style={styles.sectionCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
            <h2 style={styles.sectionTitle}>Direct Mission Drops for {relicData.fullName}</h2>
            <span style={{ fontSize: 12, color: theme.colors.green, fontWeight: 600 }}>
              {relicData.drops.length} Active Drop Locations
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
            {relicData.drops.slice(0, 12).map((drop, idx) => (
              <div
                key={idx}
                style={{
                  padding: '10px 12px',
                  background: '#12141e',
                  border: `1px solid ${theme.colors.borderDefault}`,
                  borderRadius: theme.radii.sm,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: 12.5, color: '#d0d4e8', fontWeight: 500 }}>{drop.location}</span>
                {drop.chance !== undefined && (
                  <span style={{ fontSize: 12, fontWeight: 700, color: theme.colors.green, whiteSpace: 'nowrap', marginLeft: 8 }}>
                    {drop.chance}%
                  </span>
                )}
              </div>
            ))}
          </div>
          {relicData.drops.length > 12 && (
            <p style={{ fontSize: 12, color: theme.colors.textMuted, margin: '10px 0 0 0', textAlign: 'center' }}>
              + {relicData.drops.length - 12} more mission drop rotations
            </p>
          )}
        </section>
      )}

      {relicSpots.length > 0 && (
        <section style={styles.sectionCard}>
          <h2 style={styles.sectionTitle}>Fastest Relic Farming Spots ({relicData.era} Era)</h2>
          <div style={styles.nodeList}>
            {relicSpots.map((spot, i) => (
              <div key={i} style={styles.nodeCard}>
                <div style={styles.nodeCardTop}>
                  <div>
                    <span style={styles.nodeName}>{spot.node}</span>
                    <span style={styles.nodePlanet}> ({spot.planet})</span>
                    <span style={styles.missionTypeBadge}>{spot.missionType}</span>
                  </div>
                  <span style={styles.dropRateBadge}>{spot.dropRateText}</span>
                </div>
                <p style={styles.strategyText}>
                  <strong>Time:</strong> {spot.expectedTime} | {spot.strategyTip}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

