import React from 'react';
import { Link } from 'react-router-dom';
import { ItemVariantComparison } from '../../../shared/data/item-database';
import { theme } from '../../styles/theme';
import { detailStyles as styles } from './itemDetailStyles';

interface VariantComparisonViewProps {
  variantComparison?: ItemVariantComparison;
  isVariantCompOpen: boolean;
  onToggleOpen: () => void;
  onSelectVariant: (variantName: string) => void;
}

export function VariantComparisonView({
  variantComparison,
  isVariantCompOpen,
  onToggleOpen,
  onSelectVariant,
}: VariantComparisonViewProps) {
  if (!variantComparison || variantComparison.variants.length <= 1) return null;

  return (
    <section style={styles.variantComparisonCard}>
      <div style={styles.variantHeader}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
            <span style={styles.variantBadge}>VARIANT COMPARISON</span>
            <span style={styles.variantFamilyText}>
              Family: <strong style={{ color: theme.colors.textHighlight }}>{variantComparison.baseItemName}</strong> ({variantComparison.variants.length} versions)
            </span>
          </div>
          <p style={styles.variantSubtitle}>
            Compare stats side-by-side against other editions in this item family.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={onToggleOpen}
            style={styles.variantToggleBtn}
          >
            {isVariantCompOpen ? 'Hide Stats Comparison ▲' : 'Show Stats Comparison ▼'}
          </button>
          <Link
            to={`/item/${encodeURIComponent(variantComparison.selectedVariantName)}`}
            style={styles.openVariantBtn}
          >
            Open {variantComparison.selectedVariantName} Page
          </Link>
        </div>
      </div>

      {isVariantCompOpen && (
        <>
          <div style={styles.variantTabsRow}>
            <span style={styles.variantTabsLabel}>Select Variant to Compare:</span>
            <div style={styles.variantTabsList}>
              {variantComparison.variants.map((v) => {
                const isSelected = v.name.toLowerCase() === variantComparison.selectedVariantName.toLowerCase();
                const isCurrent = v.isCurrent;
                return (
                  <button
                    key={v.name}
                    type="button"
                    onClick={() => !isCurrent && onSelectVariant(v.name)}
                    disabled={isCurrent}
                    style={{
                      ...styles.variantTabBtn,
                      ...(isSelected ? styles.variantTabBtnSelected : {}),
                      ...(isCurrent ? styles.variantTabBtnCurrent : {}),
                    }}
                    title={isCurrent ? 'Currently viewing this item' : `Compare stats with ${v.name}`}
                  >
                    <span style={styles.variantTypeTag}>{v.variantType}</span>
                    <span style={styles.variantNameText}>{v.name}</span>
                    {isCurrent && <span style={styles.currentIndicator}>(Current)</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={styles.comparisonTableWrapper}>
            <table style={styles.comparisonTable}>
              <thead>
                <tr>
                  <th style={styles.compTh}>Attribute</th>
                  <th style={styles.compThCurrent}>
                    <span style={styles.compThSub}>Current Item</span>
                    <div style={styles.compThTitle}>{variantComparison.currentItemName}</div>
                  </th>
                  <th style={styles.compThCounterpart}>
                    <span style={styles.compThSub}>Compared Variant</span>
                    <div style={styles.compThTitle}>{variantComparison.selectedVariantName}</div>
                  </th>
                  <th style={styles.compThDelta}>Difference / Delta</th>
                </tr>
              </thead>
              <tbody>
                {variantComparison.comparisonRows.map((row, rIdx) => {
                  let deltaColor = theme.colors.textSecondary;
                  let deltaBg = theme.colors.bgCardElevated;
                  let deltaBorder = theme.colors.borderDefault;
                  if (row.isImprovement === true) {
                    deltaColor = theme.colors.green;
                    deltaBg = '#142a1a';
                    deltaBorder = '#23582e';
                  } else if (row.isImprovement === false) {
                    deltaColor = '#ff8282';
                    deltaBg = '#2d1818';
                    deltaBorder = '#542222';
                  }

                  return (
                    <tr key={rIdx} style={styles.compTr}>
                      <td style={styles.compTdLabel}>{row.label}</td>
                      <td style={styles.compTdCurrent}>{row.currentVal}</td>
                      <td style={styles.compTdCounterpart}>{row.counterpartVal}</td>
                      <td style={styles.compTdDelta}>
                        <span
                          style={{
                            ...styles.deltaBadge,
                            color: deltaColor,
                            backgroundColor: deltaBg,
                            borderColor: deltaBorder,
                          }}
                        >
                          {row.deltaText}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

