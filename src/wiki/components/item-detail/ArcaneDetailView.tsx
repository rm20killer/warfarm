import React from 'react';
import { Link } from 'react-router-dom';
import { ArcaneData, ArcaneSynergy } from '../../../shared/data/arcanes';
import { detailStyles as styles, getRarityBadgeStyle } from './itemDetailStyles';

interface ArcaneDetailViewProps {
  arcaneData: ArcaneData;
  selectedArcaneRank: number;
  arcaneSynergies: ArcaneSynergy[];
  onSelectRank: (rank: number) => void;
}

export function ArcaneDetailView({
  arcaneData,
  selectedArcaneRank,
  arcaneSynergies,
  onSelectRank,
}: ArcaneDetailViewProps) {
  const currentStat =
    arcaneData.stats.find((s) => s.rank === selectedArcaneRank) ||
    arcaneData.stats[arcaneData.stats.length - 1];

  return (
    <section style={styles.sectionCard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h2 style={styles.sectionTitle}>{arcaneData.name} Progression &amp; Stats</h2>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
            <span style={getRarityBadgeStyle(arcaneData.rarity)}>{arcaneData.rarity}</span>
            <span style={{ fontSize: 12, color: '#a0a0b8', backgroundColor: '#1c1c28', padding: '2px 8px', borderRadius: 4, border: '1px solid #282838' }}>
              {arcaneData.slot} Arcane
            </span>
          </div>
        </div>
        <span style={{ fontSize: 12, color: '#8ec48e', fontWeight: 600 }}>
          Max Rank: {arcaneData.maxRank} (21 copies total)
        </span>
      </div>

      {/* Interactive Rank Selector */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 12, color: '#a0a0b8', marginBottom: 6, fontWeight: 600 }}>
          Select Rank to Preview:
        </label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {arcaneData.stats.map((st) => {
            const isSelected = selectedArcaneRank === st.rank;
            return (
              <button
                key={st.rank}
                type="button"
                onClick={() => onSelectRank(st.rank)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 4,
                  border: isSelected ? '1px solid #68d4ff' : '1px solid #282838',
                  backgroundColor: isSelected ? '#162838' : '#14141e',
                  color: isSelected ? '#ffffff' : '#a0a0b8',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                Rank {st.rank} ({st.requiredCopies} {st.requiredCopies === 1 ? 'copy' : 'copies'})
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Rank Effect Card */}
      {currentStat && (
        <div
          style={{
            padding: '14px 16px',
            backgroundColor: '#161826',
            borderRadius: 6,
            border: '1px solid #2b3046',
            marginBottom: 16,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
            <strong style={{ color: '#68d4ff', fontSize: 13 }}>
              Rank {currentStat.rank} Effect
            </strong>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {currentStat.revives !== undefined && currentStat.revives > 0 && (
                <span style={{ fontSize: 11, backgroundColor: '#2e1c44', color: '#dca8ff', padding: '2px 8px', borderRadius: 4, fontWeight: 600, border: '1px solid #502c80' }}>
                  +{currentStat.revives} Arcane Revive
                </span>
              )}
              <span style={{ fontSize: 12, color: '#8ec48e' }}>
                {currentStat.requiredCopies} total copies required
              </span>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: 13.5, color: '#f0f0f8', lineHeight: 1.5 }}>
            {currentStat.effect}
          </p>
        </div>
      )}

      {/* Complete Rank Progression Matrix */}
      <div style={{ marginBottom: 18 }}>
        <span style={{ fontSize: 12, color: '#b0b0c4', fontWeight: 600, display: 'block', marginBottom: 8 }}>
          Full Rank Progression Matrix:
        </span>
        <div style={styles.rankTableWrapper}>
          <table style={styles.rankTable}>
            <thead>
              <tr>
                <th style={styles.rankTh}>Rank</th>
                <th style={styles.rankTh}>Effect Description</th>
                <th style={styles.rankTh}>Revives</th>
                <th style={styles.rankTh}>Copies Needed</th>
              </tr>
            </thead>
            <tbody>
              {arcaneData.stats.map((st) => (
                <tr
                  key={st.rank}
                  style={st.rank === selectedArcaneRank ? { backgroundColor: '#182032' } : undefined}
                >
                  <td style={styles.rankTd}>
                    <span style={styles.rankBadge}>Rank {st.rank}</span>
                  </td>
                  <td style={styles.effectTd}>{st.effect}</td>
                  <td style={styles.rankTd}>{st.revives ? `+${st.revives}` : 'None'}</td>
                  <td style={styles.rankTd}>
                    <span style={{ color: '#8ec48e', fontWeight: 600 }}>{st.requiredCopies}</span>
                    {st.arcanesToUpgrade > 0 && (
                      <span style={{ color: '#7a7a94', fontSize: 11, marginLeft: 4 }}>
                        (+{st.arcanesToUpgrade})
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Arcane Dissolution Vosfor Pack */}
      {arcaneData.dissolutionPack && (
        <div
          style={{
            padding: '12px 14px',
            backgroundColor: '#121620',
            border: '1px solid #1c283c',
            borderRadius: 6,
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <div>
            <strong style={{ color: '#68d4ff', fontSize: 12.5, display: 'block' }}>
              Arcane Dissolution (Sanctum Anatomica)
            </strong>
            <span style={{ fontSize: 12, color: '#a0a8c0' }}>
              Can be acquired from Albrecht's Laboratories / Loid via the <strong>{arcaneData.dissolutionPack}</strong> (200 Vosfor).
            </span>
          </div>
          <span style={{ fontSize: 11, color: '#dca8ff', backgroundColor: '#281c3c', padding: '3px 8px', borderRadius: 4, border: '1px solid #48286c' }}>
            Vosfor Transmutation
          </span>
        </div>
      )}

      {/* Vendor Acquisition If Any */}
      {arcaneData.vendorSource && (
        <div
          style={{
            padding: '12px 14px',
            backgroundColor: '#161a1e',
            border: '1px solid #2a343c',
            borderRadius: 6,
            marginBottom: 16,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <strong style={{ color: '#ffd700', fontSize: 12.5 }}>
              Direct Vendor Purchase: {arcaneData.vendorSource.vendorName} ({arcaneData.vendorSource.factionOrSyndicate})
            </strong>
            <span style={{ fontSize: 12, color: '#8ec48e', fontWeight: 600 }}>
              {arcaneData.vendorSource.standingCost}
            </span>
          </div>
          <div style={{ fontSize: 12, color: '#a0a8c0', lineHeight: 1.4 }}>
            <div><strong>Location:</strong> {arcaneData.vendorSource.location}</div>
            {arcaneData.vendorSource.rankRequirement && (
              <div><strong>Rank Requirement:</strong> {arcaneData.vendorSource.rankRequirement}</div>
            )}
            {arcaneData.vendorSource.notes && (
              <div style={{ marginTop: 4, color: '#8a94b0' }}>{arcaneData.vendorSource.notes}</div>
            )}
          </div>
        </div>
      )}

      {/* Drop Sources List */}
      {arcaneData.drops && arcaneData.drops.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <span style={{ fontSize: 12, color: '#b0b0c4', fontWeight: 600, display: 'block', marginBottom: 8 }}>
            Drop Sources ({arcaneData.drops.length} documented):
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 8 }}>
            {arcaneData.drops.slice(0, 12).map((drop, dIdx) => (
              <div
                key={dIdx}
                style={{
                  backgroundColor: '#141622',
                  border: '1px solid #202434',
                  borderRadius: 4,
                  padding: '8px 12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#d0d4e8' }}>
                    {drop.source}
                  </div>
                  {drop.rotation && (
                    <div style={{ fontSize: 11, color: '#7a809c' }}>
                      Rotation {drop.rotation}
                    </div>
                  )}
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#8ec48e' }}>
                  {typeof drop.chance === 'number' ? `${(drop.chance * 100).toFixed(2)}%` : drop.chance}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Arcane Synergies & Recommendations */}
      {arcaneSynergies.length > 0 && (
        <div style={{ borderTop: '1px solid #202434', paddingTop: 14 }}>
          <span style={{ fontSize: 12, color: '#cc88ff', fontWeight: 600, display: 'block', marginBottom: 10 }}>
            Recommended Warframe &amp; Weapon Synergies:
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
            {arcaneSynergies.map((syn, sIdx) => (
              <div
                key={sIdx}
                style={{
                  backgroundColor: '#141422',
                  border: '1px solid #24243c',
                  borderRadius: 6,
                  padding: '10px 12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <Link
                    to={`/item/${encodeURIComponent(syn.itemName)}`}
                    style={{ color: '#68d4ff', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}
                  >
                    {syn.itemName}
                  </Link>
                  <span style={{ fontSize: 10, color: '#cc88ff', backgroundColor: '#261836', padding: '1px 6px', borderRadius: 3 }}>
                    {syn.buildRole}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: '#a0a8c0', lineHeight: 1.4 }}>
                  {syn.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

