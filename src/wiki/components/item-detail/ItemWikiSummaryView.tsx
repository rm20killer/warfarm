import React from 'react';
import { Link } from 'react-router-dom';
import { WikiArticleDetails } from '../../../shared/api/wiki-client';
import { ResourceFarmingGuide } from '../../../shared/data/resource-guide';
import { findNameFamilyItems, NameFamilyResult } from '../../../shared/utils/fuzzy-search';
import { ItemThumbnail } from '../../../shared/utils/item-images';
import { detailStyles as styles, getCategoryBadgeStyle, theme } from './itemDetailStyles';

interface ItemWikiSummaryViewProps {
  itemName: string;
  article: WikiArticleDetails | null;
  resourceGuide?: ResourceFarmingGuide;
  hasDedicatedCodexData?: boolean;
}

export function ItemWikiSummaryView({
  itemName,
  article,
  resourceGuide,
  hasDedicatedCodexData,
}: ItemWikiSummaryViewProps) {
  const isGenericOrMissing =
    !article?.extract ||
    article.extract.trim() === 'No article preview available.' ||
    article.extract.trim().startsWith('Could not load wiki summary');

  // If the item has dedicated codex data (mod, weapon, warframe, component, arcane, etc.)
  // and no wiki extract exists, suppress generic name family fallback.
  const showFamilyOrShortcut = !hasDedicatedCodexData && isGenericOrMissing;
  const familyResult: NameFamilyResult = showFamilyOrShortcut
    ? findNameFamilyItems(itemName, 12)
    : { query: itemName, familyItems: [] };
  const hasFamilyItems = familyResult.familyItems.length > 0;
  const hasCategoryShortcut = Boolean(familyResult.categoryShortcut);

  if (isGenericOrMissing && !hasFamilyItems && !hasCategoryShortcut && !resourceGuide?.specialMechanics) {
    return null;
  }

  return (
    <section style={styles.sectionCard}>
      <h2 style={styles.sectionTitle}>
        {!isGenericOrMissing ? 'Wiki Summary' : `${itemName} · Codex Family & Related Entries`}
      </h2>

      {!isGenericOrMissing && (
        <>
          {article?.thumbnailUrl && (
            <img
              src={article.thumbnailUrl}
              alt={itemName}
              style={styles.itemImage}
            />
          )}
          <p style={styles.extractText}>{article?.extract}</p>
        </>
      )}

      {resourceGuide?.specialMechanics && (
        <div style={styles.mechanicCallout}>
          <strong>Special Mechanics:</strong> {resourceGuide.specialMechanics}
        </div>
      )}

      {/* Category Directory Shortcut (e.g. when searching "Arcanes", "Mods", "Relics") */}
      {familyResult.categoryShortcut && (
        <div
          style={{
            marginTop: 14,
            padding: '14px 16px',
            background: 'linear-gradient(135deg, #141b2a 0%, #101420 100%)',
            border: '1px solid #28446c',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: theme.colors.textHighlight, marginBottom: 2 }}>
              {familyResult.categoryShortcut.title}
            </div>
            <div style={{ fontSize: 12, color: theme.colors.textSecondary }}>
              {familyResult.categoryShortcut.description}
            </div>
          </div>
          <Link
            to={familyResult.categoryShortcut.path}
            style={{
              padding: '6px 14px',
              background: '#1a3048',
              border: '1px solid #386088',
              borderRadius: 4,
              color: theme.colors.accent,
              textDecoration: 'none',
              fontSize: 12,
              fontWeight: 700,
              whiteSpace: 'nowrap',
            }}
          >
            Open Directory &rarr;
          </Link>
        </div>
      )}

      {/* Name Family / Related Items Grid (e.g. for "Molt", "Torid", "Arcanes") */}
      {isGenericOrMissing && hasFamilyItems && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#9aa4c0', marginBottom: 10 }}>
            Matching items in the <strong>{itemName}</strong> name family:
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 10,
            }}
          >
            {familyResult.familyItems.map((item, idx) => (
              <Link
                key={idx}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  background: '#12141e',
                  border: '1px solid #202436',
                  borderRadius: 6,
                  textDecoration: 'none',
                  color: '#e0e4f4',
                  transition: 'border-color 0.15s ease, background 0.15s ease',
                }}
              >
                <ItemThumbnail name={item.name} size={36} />
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#e4e8f8',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    title={item.name}
                  >
                    {item.name}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <span style={getCategoryBadgeStyle(item.category)}>
                      {item.subType || item.category}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
