import React from 'react';
import { Link } from 'react-router-dom';
import {
  DetailedModData,
  generateModRankStats,
  calculateModEndoToMax,
  calculateModCreditsToMax,
  calculateTradingTax,
} from '../../../shared/data/mod-database';
import { theme } from '../../styles/theme';
import { formatWarframeText } from '../../utils/format-text';
import { detailStyles as styles } from './itemDetailStyles';

interface ModDetailViewProps {
  detailedMod: DetailedModData;
  startingPrice?: number | null;
}

export function ModStatsProgressionView({ detailedMod }: ModDetailViewProps) {
  const isSingleEffect =
    detailedMod.statLabels.length === 1 &&
    (detailedMod.statLabels[0] === 'Effect' || detailedMod.statLabels[0] === 'Description');

  return (
    <section style={styles.sectionCard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h2 style={styles.sectionTitle}>Stats Progression by Rank</h2>
        <span style={{ fontSize: 12, color: theme.colors.green, fontWeight: 600 }}>Max Rank: {detailedMod.maxRank}</span>
      </div>
      <div style={styles.rankTableWrapper}>
        <table style={styles.rankTable}>
          <thead>
            <tr>
              <th style={styles.rankTh}>Rank</th>
              <th style={styles.rankTh}>Drain</th>
              {isSingleEffect ? (
                <th style={styles.rankTh}>Effect</th>
              ) : (
                <>
                  {detailedMod.statLabels.map((lbl) => (
                    <th key={lbl} style={styles.rankTh}>{lbl}</th>
                  ))}
                  <th style={styles.rankTh}>Full Effect</th>
                </>
              )}
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
                {isSingleEffect ? (
                  <td style={styles.effectTd}>{formatWarframeText(row.description)}</td>
                ) : (
                  <>
                    {detailedMod.statLabels.map((lbl, idx) => (
                      <td key={lbl} style={styles.statTd}>
                        {formatWarframeText(Object.values(row.statValues)[idx] || '-')}
                      </td>
                    ))}
                    <td style={styles.effectTd}>{formatWarframeText(row.description)}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function ModGeneralInfoView({ detailedMod, startingPrice }: ModDetailViewProps) {
  return (
    <section style={styles.sectionCard}>
      <h3 style={styles.sectionSubTitle}>General Information</h3>
      <div style={styles.infoBox}>
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>Type</span>
          <span style={styles.infoVal}>{detailedMod.type}</span>
        </div>
        {startingPrice !== undefined && startingPrice !== null && (
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Starting Price</span>
            <span style={{ ...styles.infoVal, color: theme.colors.platinumBuy, fontWeight: 700 }}>
              {startingPrice}p
            </span>
          </div>
        )}
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
                  ? theme.colors.rarityRare
                  : detailedMod.rarity === 'Legendary'
                  ? theme.colors.rarityLegendary
                  : theme.colors.rarityCommon,
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
          <span style={{ ...styles.infoVal, color: theme.colors.accent, fontWeight: 600 }}>
            {calculateModEndoToMax(detailedMod.rarity, detailedMod.maxRank).toLocaleString()}
          </span>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>Credits Required To Max</span>
          <span style={{ ...styles.infoVal, color: theme.colors.gold, fontWeight: 600 }}>
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
              Official Drop Tables;
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
        <Link
          to={`/vendor/${encodeURIComponent(detailedMod.vendorSource.factionOrSyndicate || detailedMod.vendorSource.vendorName)}`}
          style={{
            ...styles.vendorStoreTag,
            textDecoration: 'none',
            color: theme.colors.accent,
          }}
        >
          {detailedMod.vendorSource.factionOrSyndicate} &rarr;
        </Link>
      </div>
      <p style={styles.acquisitionSentence}>
        The mod can be bought from{' '}
        <Link
          to={`/vendor/${encodeURIComponent(detailedMod.vendorSource.vendorName)}`}
          style={{ color: theme.colors.accent, fontWeight: 700, textDecoration: 'underline' }}
        >
          {detailedMod.vendorSource.vendorName}
        </Link>{' '}
        for <span style={styles.standingHighlight}>{detailedMod.vendorSource.standingCost}</span>
        {detailedMod.vendorSource.rankRequirement
          ? ` after reaching ${detailedMod.vendorSource.rankRequirement} with ${detailedMod.vendorSource.factionOrSyndicate}.`
          : ` at ${detailedMod.vendorSource.location}.`}
      </p>
      {detailedMod.vendorSource.notes && (
        <p style={styles.vendorNotes}>{detailedMod.vendorSource.notes}</p>
      )}
    </section>
  );
}

