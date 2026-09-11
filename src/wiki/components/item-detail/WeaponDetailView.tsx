import React from 'react';
import { Link } from 'react-router-dom';
import { WeaponCombatStats, WeaponExtraInfo } from '../../../shared/data/item-database';
import { detailStyles as styles } from './itemDetailStyles';

interface WeaponDetailViewProps {
  weaponStats?: WeaponCombatStats;
  weaponExtras?: WeaponExtraInfo;
}

export function WeaponDetailView({ weaponStats, weaponExtras }: WeaponDetailViewProps) {
  if (!weaponStats && !weaponExtras) return null;

  return (
    <>
      {weaponStats && (
        <section style={styles.sectionCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 style={styles.sectionTitle}>Weapon Combat & Damage Stats</h2>
            <span style={{ fontSize: 12, color: '#8ec48e', fontWeight: 600 }}>
              Riven Dispo: {weaponStats.dispositionText}
            </span>
          </div>

          <div style={styles.statsSummaryGrid}>
            <div style={styles.statsSummaryCard}>
              <span style={styles.statsSummaryLabel}>Critical Chance</span>
              <span style={styles.statsSummaryVal}>{weaponStats.critChance}</span>
            </div>
            <div style={styles.statsSummaryCard}>
              <span style={styles.statsSummaryLabel}>Critical Multiplier</span>
              <span style={styles.statsSummaryVal}>{weaponStats.critMultiplier}</span>
            </div>
            <div style={styles.statsSummaryCard}>
              <span style={styles.statsSummaryLabel}>Status Chance</span>
              <span style={styles.statsSummaryVal}>{weaponStats.statusChance}</span>
            </div>
            <div style={styles.statsSummaryCard}>
              <span style={styles.statsSummaryLabel}>Fire Rate</span>
              <span style={styles.statsSummaryVal}>{weaponStats.fireRate}</span>
            </div>
            <div style={styles.statsSummaryCard}>
              <span style={styles.statsSummaryLabel}>Magazine</span>
              <span style={styles.statsSummaryVal}>{weaponStats.magazine} rounds</span>
            </div>
            <div style={styles.statsSummaryCard}>
              <span style={styles.statsSummaryLabel}>Reload Time</span>
              <span style={styles.statsSummaryVal}>{weaponStats.reload}</span>
            </div>
            <div style={styles.statsSummaryCard}>
              <span style={styles.statsSummaryLabel}>Accuracy</span>
              <span style={styles.statsSummaryVal}>{weaponStats.accuracy}</span>
            </div>
            {weaponStats.pelletCount && (
              <div style={styles.statsSummaryCard}>
                <span style={styles.statsSummaryLabel}>Pellet Count</span>
                <span style={styles.statsSummaryVal}>{weaponStats.pelletCount} Pellets</span>
              </div>
            )}
          </div>

          <div style={{ marginTop: 14 }}>
            <span style={styles.componentsHeading}>Attack & Firing Modes:</span>
            <div style={styles.damageModesList}>
              {weaponStats.modes.map((mode, i) => (
                <div key={i} style={styles.damageModeBox}>
                  <div style={styles.damageModeHeader}>
                    <span style={styles.damageModeTitle}>{mode.modeName}</span>
                    <span style={styles.damageModeTotal}>Total Damage: {mode.damageTotal}</span>
                  </div>
                  <div style={styles.damageTypesRow}>
                    {Object.entries(mode.damageTypes).map(([dtype, val]) => (
                      <div key={dtype} style={styles.damageTypeChip}>
                        <span style={styles.damageTypeLabel}>{dtype}</span>
                        <span style={styles.damageTypeValue}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {weaponStats.mechanicsNote && (
            <div style={{ ...styles.mechanicCallout, marginTop: 12 }}>
              <strong>Firing Mechanic:</strong> {weaponStats.mechanicsNote}
            </div>
          )}
        </section>
      )}

      {weaponExtras && (weaponExtras.augments.length > 0 || weaponExtras.variants.length > 0) && (
        <section style={styles.sectionCard}>
          <h2 style={styles.sectionTitle}>Augment Mods & Known Variants</h2>
          {weaponExtras.augments.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <span style={styles.componentsHeading}>Exclusive Augment Mods:</span>
              <div style={styles.augmentsList}>
                {weaponExtras.augments.map((aug, i) => (
                  <div key={i} style={styles.augmentCard}>
                    <div style={styles.augmentHeader}>
                      <Link to={`/item/${encodeURIComponent(aug.name)}`} style={styles.augmentLink}>
                        {aug.name}
                      </Link>
                      <span style={styles.augmentSource}>{aug.source}</span>
                    </div>
                    <p style={styles.augmentEffect}>{aug.effect}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {weaponExtras.variants.length > 0 && (
            <div>
              <span style={styles.componentsHeading}>Known Variants:</span>
              <div style={styles.variantsList}>
                {weaponExtras.variants.map((v, i) => (
                  <div key={i} style={styles.variantCard}>
                    <span style={styles.variantName}>{v.variantName}</span>
                    <p style={styles.variantAcq}>{v.acquisition}</p>
                    {v.innateBonus && <p style={styles.variantBonus}><strong>Bonus:</strong> {v.innateBonus}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </>
  );
}

