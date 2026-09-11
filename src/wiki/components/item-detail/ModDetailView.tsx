import React from 'react';
import {
  DetailedModData,
  generateModRankStats,
  calculateModEndoToMax,
  calculateModCreditsToMax,
  calculateTradingTax,
} from '../../../shared/data/mod-database';
import { detailStyles as styles } from './itemDetailStyles';

interface ModDetailViewProps {
  detailedMod: DetailedModData;
}

export function ModStatsProgressionView({ detailedMod }: ModDetailViewProps) {
  return (
    <section style={styles.sectionCard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h2 style={styles.sectionTitle}>Stats Progression by Rank</h2>
        <span style={{ fontSize: 12, color: '#8ec48e', fontWeight: 600 }}>Max Rank: {detailedMod.maxRank}</span>
      </div>
      <div style={styles.rankTableWrapper}>
        <table style={styles.rankTable}>
          <thead>
            <tr>
              <th style={styles.rankTh}>Rank</th>
              <th style={styles.rankTh}>Drain</th>
              {detailedMod.statLabels.map((lbl) => (
                <th key={lbl} style={styles.rankTh}>{lbl}</th>
              ))}
              <th style={styles.rankTh}>Full Effect</th>
            </tr>
          </thead>
          <tbody>
            {generateModRankStats(detailedMod).map((row) => (
              <tr key={row.rank} style={row.rank === detailedMod.maxRank ? styles.maxRankRow : undefined}>
                <td style={styles.rankTd}>
                  <span style={styles.rankBadge}>{row.rank}</span>
                </td>
                <td style={styles.rankTd}>
                  <span style={styles.costBadge}>{row.cost}</span>
                </td>
                {detailedMod.statLabels.map((lbl, idx) => (
                  <td key={lbl} style={styles.statTd}>
                    {Object.values(row.statValues)[idx] || '-'}
                  </td>
                ))}
                <td style={styles.effectTd}>{row.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function ModGeneralInfoView({ detailedMod }: ModDetailViewProps) {
  return (
    <section style={styles.sectionCard}>
      <h3 style={styles.sectionSubTitle}>General Information</h3>
      <div style={styles.infoBox}>
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>Type</span>
          <span style={styles.infoVal}>{detailedMod.type}</span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>Polarity</span>
          <span style={styles.infoVal}>{detailedMod.polarity}</span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>Rarity</span>
          <span
            style={{
              ...styles.infoVal,
              color:
                detailedMod.rarity === 'Rare'
                  ? '#d8c474'
                  : detailedMod.rarity === 'Legendary'
                  ? '#e0e0e8'
                  : '#a0a0b8',
            }}
          >
            {detailedMod.rarity}
          </span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>Max Rank</span>
          <span style={styles.infoVal}>{detailedMod.maxRank}</span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>Base Capacity Cost</span>
          <span style={styles.infoVal}>{detailedMod.baseCost}</span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>Endo Required To Max</span>
          <span style={{ ...styles.infoVal, color: '#8ec4c4', fontWeight: 600 }}>
            {calculateModEndoToMax(detailedMod.rarity, detailedMod.maxRank).toLocaleString()}
          </span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>Credits Required To Max</span>
          <span style={{ ...styles.infoVal, color: '#d8c474', fontWeight: 600 }}>
            {calculateModCreditsToMax(detailedMod.rarity, detailedMod.maxRank).toLocaleString()}
          </span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>Trading Tax</span>
          <span style={styles.infoVal}>
            {calculateTradingTax(detailedMod.rarity).toLocaleString()} Credits
          </span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>Introduced</span>
          <span style={styles.infoVal}>{detailedMod.introduced}</span>
        </div>
        {detailedMod.officialDropSourceUrl && (
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Vendor Sources</span>
            <a
              href={detailedMod.officialDropSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.dropTablesLink}
            >
              Official Drop Tables &#8599;
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

export function ModVendorAcquisitionView({ detailedMod }: ModDetailViewProps) {
  if (!detailedMod.vendorSource) return null;

  return (
    <section style={styles.acquisitionCard}>
      <div style={styles.acquisitionHeader}>
        <span style={styles.acquisitionBadge}>Acquisition</span>
        <span style={styles.vendorStoreTag}>{detailedMod.vendorSource.factionOrSyndicate}</span>
      </div>
      <p style={styles.acquisitionSentence}>
        The mod can be bought from <strong>[{detailedMod.vendorSource.vendorName}]</strong> for{' '}
        <span style={styles.standingHighlight}>{detailedMod.vendorSource.standingCost}</span>
        {detailedMod.vendorSource.rankRequirement
          ? ` after reaching ${detailedMod.vendorSource.rankRequirement} with the [${detailedMod.vendorSource.factionOrSyndicate}].`
          : ` at [${detailedMod.vendorSource.location}].`}
      </p>
      {detailedMod.vendorSource.notes && (
        <p style={styles.vendorNotes}>{detailedMod.vendorSource.notes}</p>
      )}
    </section>
  );
}

