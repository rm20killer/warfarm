import React from 'react';
import { WarframeCombatStats } from '../../../shared/data/item-database';
import { theme } from '../../styles/theme';
import { formatWarframeText } from '../../utils/format-text';
import { detailStyles as styles } from './itemDetailStyles';

interface WarframeDetailViewProps {
  warframeStats: WarframeCombatStats;
}

export function WarframeDetailView({ warframeStats }: WarframeDetailViewProps) {
  return (
    <>
      <section style={styles.sectionCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h2 style={styles.sectionTitle}>Warframe Base & Defensive Attributes</h2>
          {warframeStats.sex && (
            <span style={{ fontSize: 12, color: theme.colors.green, fontWeight: 600 }}>
              {warframeStats.sex} Exosuit
            </span>
          )}
        </div>

        <div style={styles.statsSummaryGrid}>
          <div style={styles.statsSummaryCard}>
            <span style={styles.statsSummaryLabel}>Health</span>
            <span style={styles.statsSummaryVal}>{warframeStats.health}</span>
          </div>
          <div style={styles.statsSummaryCard}>
            <span style={styles.statsSummaryLabel}>Shield</span>
            <span style={styles.statsSummaryVal}>{warframeStats.shield}</span>
          </div>
          <div style={styles.statsSummaryCard}>
            <span style={styles.statsSummaryLabel}>Armor</span>
            <span style={styles.statsSummaryVal}>{warframeStats.armor}</span>
          </div>
          <div style={styles.statsSummaryCard}>
            <span style={styles.statsSummaryLabel}>Energy (Power)</span>
            <span style={styles.statsSummaryVal}>{warframeStats.power}</span>
          </div>
          <div style={styles.statsSummaryCard}>
            <span style={styles.statsSummaryLabel}>Sprint Speed</span>
            <span style={styles.statsSummaryVal}>{warframeStats.sprintSpeed}</span>
          </div>
          <div style={styles.statsSummaryCard}>
            <span style={styles.statsSummaryLabel}>Mastery Rank</span>
            <span style={styles.statsSummaryVal}>MR {warframeStats.masteryReq}</span>
          </div>
          <div style={styles.statsSummaryCard}>
            <span style={styles.statsSummaryLabel}>Polarities</span>
            <span style={styles.statsSummaryVal}>
              {warframeStats.polarities.length > 0 ? warframeStats.polarities.join(', ') : 'None'}
            </span>
          </div>
          <div style={styles.statsSummaryCard}>
            <span style={styles.statsSummaryLabel}>Aura Polarity</span>
            <span style={styles.statsSummaryVal}>{warframeStats.aura || 'None'}</span>
          </div>
        </div>

        {warframeStats.passiveDescription && (
          <div style={{ ...styles.mechanicCallout, marginTop: 14 }}>
            <strong>Passive Ability:</strong> {formatWarframeText(warframeStats.passiveDescription)}
          </div>
        )}
      </section>

      {warframeStats.abilities.length > 0 && (
        <section style={styles.sectionCard}>
          <h2 style={styles.sectionTitle}>Warframe Abilities</h2>
          <div style={styles.abilitiesList}>
            {warframeStats.abilities.map((ability, index) => (
              <div key={index} style={styles.abilityCard}>
                <div style={styles.abilityHeader}>
                  <span style={styles.abilityIndexBadge}>Ability {index + 1}</span>
                  <span style={styles.abilityName}>{ability.name}</span>
                </div>
                <p style={styles.abilityDescription}>{formatWarframeText(ability.description)}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

