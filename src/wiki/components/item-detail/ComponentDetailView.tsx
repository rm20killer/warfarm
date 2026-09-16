import React from 'react';
import { Link } from 'react-router-dom';
import { ItemThumbnail } from '../../../shared/utils/item-images';
import { ItemComponentInfo } from '../../../shared/data/item-components';
import { theme } from '../../styles/theme';
import { detailStyles as styles } from './itemDetailStyles';

interface ComponentDetailViewProps {
  componentInfo: ItemComponentInfo;
}

export function ComponentDetailView({ componentInfo }: ComponentDetailViewProps) {
  return (
    <section style={styles.componentParentCard}>
      <div style={styles.componentParentHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <ItemThumbnail name={componentInfo.parentItemName} size={48} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
              <span style={styles.componentBadge}>
                {componentInfo.isPrime ? 'PRIME ' : ''}{componentInfo.parentCategory.toUpperCase()} COMPONENT
              </span>
              <span style={{ fontSize: 13, color: theme.colors.textSecondary }}>
                Part of:
              </span>
              <Link
                to={`/item/${encodeURIComponent(componentInfo.parentItemName)}`}
                style={styles.parentItemLink}
              >
                {componentInfo.parentItemName}
              </Link>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: theme.colors.textPrimary, lineHeight: 1.45 }}>
              {componentInfo.isPreCraftedDrop
                ? `Pre-crafted part obtained directly from Void Relics. Used in the Foundry to build ${componentInfo.parentItemName}.`
                : componentInfo.isBlueprint
                ? `Foundry manufacturing blueprint required to assemble ${componentInfo.parentItemName}.`
                : `Component blueprint for ${componentInfo.parentItemName}. Requires crafting before final assembly.`}
            </p>
          </div>
        </div>
      </div>

      {componentInfo.siblingComponents.length > 1 && (
        <div style={styles.siblingStrip}>
          <span style={styles.siblingStripLabel}>
            All Components for {componentInfo.parentItemName}:
          </span>
          <div style={styles.siblingList}>
            {componentInfo.siblingComponents.map((sib) => (
              <Link
                key={sib.name}
                to={sib.path}
                style={{
                  ...styles.siblingChip,
                  ...(sib.isCurrent ? styles.siblingChipActive : {}),
                }}
                title={sib.isCurrent ? `Currently viewing ${sib.name}` : `View ${sib.name} details and drop sources`}
              >
                <ItemThumbnail name={sib.name} size={18} />
                <span>{sib.shortName}</span>
                {sib.isCurrent && <span style={styles.viewingIndicator}>(Viewing)</span>}
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

