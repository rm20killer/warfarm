import React from 'react';
import { WikiArticleDetails } from '../../../shared/api/wiki-client';
import { ResourceFarmingGuide } from '../../../shared/data/resource-guide';
import { detailStyles as styles } from './itemDetailStyles';

interface ItemWikiSummaryViewProps {
  itemName: string;
  article: WikiArticleDetails | null;
  resourceGuide?: ResourceFarmingGuide;
}

export function ItemWikiSummaryView({ itemName, article, resourceGuide }: ItemWikiSummaryViewProps) {
  if (!article?.extract) return null;

  return (
    <section style={styles.sectionCard}>
      <h2 style={styles.sectionTitle}>Wiki Summary</h2>
      {article.thumbnailUrl && (
        <img
          src={article.thumbnailUrl}
          alt={itemName}
          style={styles.itemImage}
        />
      )}
      <p style={styles.extractText}>{article.extract}</p>
      {resourceGuide?.specialMechanics && (
        <div style={styles.mechanicCallout}>
          <strong>Special Mechanics:</strong> {resourceGuide.specialMechanics}
        </div>
      )}
    </section>
  );
}

