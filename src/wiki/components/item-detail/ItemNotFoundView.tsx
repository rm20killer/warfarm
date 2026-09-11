import React from 'react';
import { Link } from 'react-router-dom';
import { ItemThumbnail } from '../../../shared/utils/item-images';
import { SimilarItemSuggestion } from '../../../shared/utils/fuzzy-search';
import { detailStyles as styles } from './itemDetailStyles';

interface ItemNotFoundViewProps {
  itemName: string;
  similarItems: SimilarItemSuggestion[];
}

export function ItemNotFoundView({ itemName, similarItems }: ItemNotFoundViewProps) {
  return (
    <div style={styles.notFoundContainer}>
      <div style={styles.notFoundHeader}>
        <h2 style={styles.notFoundTitle}>Item Not Found: "{itemName}"</h2>
        <p style={styles.notFoundSub}>
          We could not find an exact match for this item in our local database or wiki archives.
        </p>
      </div>

      {similarItems.length > 0 && (
        <div style={styles.suggestionsSection}>
          <h3 style={styles.suggestionsTitle}>Did you mean one of these items?</h3>
          <div style={styles.suggestionsGrid}>
            {similarItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                style={styles.suggestionCard}
              >
                <ItemThumbnail name={item.name} size={48} />
                <div style={styles.suggestionDetails}>
                  <div style={styles.suggestionName}>{item.name}</div>
                  <div style={styles.suggestionCategory}>
                    <span style={styles.suggestionBadge}>{item.category}</span>
                    {item.subType && item.subType !== item.category && (
                      <span style={styles.suggestionSubtype}>{item.subType}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link to="/" style={styles.primarySearchLink}>
          Search Database
        </Link>
        <Link to="/relics" style={styles.secondarySearchLink}>
          Browse Relics
        </Link>
        <Link to="/gear" style={styles.secondarySearchLink}>
          Browse Gear Directory
        </Link>
      </div>
    </div>
  );
}

