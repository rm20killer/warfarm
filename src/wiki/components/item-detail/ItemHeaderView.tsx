import React from 'react';
import { Link } from 'react-router-dom';
import { ItemThumbnail } from '../../../shared/utils/item-images';
import { WikiArticleDetails } from '../../../shared/api/wiki-client';
import { ResourceFarmingGuide } from '../../../shared/data/resource-guide';
import { ArcaneData } from '../../../shared/data/arcanes';
import { DetailedModData } from '../../../shared/data/mod-database';
import { RelicEntry } from '../../../shared/data/relic-database';
import {
  WarframeCombatStats,
  WeaponCombatStats,
  ItemGeneralInfo,
} from '../../../shared/data/item-database';
import { SpecialChallengeGuide } from '../../../shared/data/special-mechanics';
import { ItemComponentInfo } from '../../../shared/data/item-components';
import { PageVisitHistory, PersonalTarget } from '../../storage';
import { detailStyles as styles } from './itemDetailStyles';

interface ItemHeaderViewProps {
  itemName: string;
  article: WikiArticleDetails | null;
  resourceGuide?: ResourceFarmingGuide;
  arcaneData?: ArcaneData;
  detailedMod?: DetailedModData;
  relicData?: RelicEntry;
  relicMatch?: RegExpMatchArray | null;
  warframeStats?: WarframeCombatStats;
  weaponStats?: WeaponCombatStats;
  componentInfo?: ItemComponentInfo;
  weaponLineage?: string | null;
  specialChallenge?: SpecialChallengeGuide;
  itemGeneralInfo?: ItemGeneralInfo;
  target?: PersonalTarget;
  targetQty: number;
  previousPage?: PageVisitHistory;
  onToggleTarget: () => void;
  onUpdateQty: (qty: number) => void;
}

export function ItemHeaderView({
  itemName,
  article,
  resourceGuide,
  arcaneData,
  detailedMod,
  relicData,
  relicMatch,
  warframeStats,
  weaponStats,
  componentInfo,
  weaponLineage,
  specialChallenge,
  itemGeneralInfo,
  target,
  targetQty,
  previousPage,
  onToggleTarget,
  onUpdateQty,
}: ItemHeaderViewProps) {
  return (
    <>
      <nav style={styles.breadcrumbNav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <Link to="/" style={styles.backLink}>&larr; Back to Search</Link>
          {previousPage && (
            <Link
              to={previousPage.path}
              style={{
                ...styles.backLink,
                color: '#68d4ff',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
              title={`Return to ${previousPage.title}`}
            >
              &larr; Back to {previousPage.title}
              {previousPage.category && (
                <span
                  style={{
                    fontSize: 10,
                    color: '#8ec4f4',
                    textTransform: 'uppercase',
                    padding: '1px 6px',
                    borderRadius: 3,
                    backgroundColor: '#1c2838',
                    border: '1px solid #28446c',
                  }}
                >
                  {previousPage.category}
                </span>
              )}
            </Link>
          )}
        </div>
      </nav>

      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <ItemThumbnail name={itemName} size={84} />
          <div style={styles.headerInfo}>
            <h1 style={styles.title}>{itemName}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {resourceGuide && (
                <span style={styles.categoryBadge}>{resourceGuide.category} Resource</span>
              )}
              {arcaneData && (
                <span style={{ ...styles.categoryBadge, backgroundColor: 'rgba(255, 215, 0, 0.15)', color: '#ffd700', borderColor: '#d4af37' }}>
                  {arcaneData.rarity} {arcaneData.slot} Arcane
                </span>
              )}
              {detailedMod && (
                <span style={{ ...styles.categoryBadge, backgroundColor: '#1a2234', color: '#90b4e0', borderColor: '#2c3e60' }}>
                  {detailedMod.rarity} {detailedMod.type || 'Mod'}
                </span>
              )}
              {relicData ? (
                <>
                  <span style={{ ...styles.categoryBadge, backgroundColor: '#2a2216', color: '#f0c060', borderColor: '#5c4820' }}>
                    {relicData.era.toUpperCase()} Relic
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: 3,
                      backgroundColor: relicData.vaulted ? '#2d2218' : '#142a1a',
                      color: relicData.vaulted ? '#e0a060' : '#7ae08a',
                      border: `1px solid ${relicData.vaulted ? '#543820' : '#23582e'}`,
                    }}
                  >
                    {relicData.vaulted ? 'VAULTED' : 'UNVAULTED'}
                  </span>
                </>
              ) : relicMatch ? (
                <span style={{ ...styles.categoryBadge, backgroundColor: '#2a2216', color: '#f0c060', borderColor: '#5c4820' }}>
                  {relicMatch[1].toUpperCase()} Relic
                </span>
              ) : null}
              {warframeStats && (
                <span style={{ ...styles.categoryBadge, backgroundColor: '#182436', color: '#8ecbfc', borderColor: '#204064' }}>
                  Warframe
                </span>
              )}
              {weaponStats && (
                <span style={{ ...styles.categoryBadge, backgroundColor: '#20182c', color: '#dca8ff', borderColor: '#482868' }}>
                  {itemGeneralInfo?.type || 'Weapon'}
                </span>
              )}
              {componentInfo && (
                <span style={{ ...styles.categoryBadge, backgroundColor: '#2d2218', color: '#ffd700', borderColor: '#5c4820' }}>
                  {componentInfo.isPrime ? 'Prime ' : ''}{componentInfo.parentCategory} Component
                </span>
              )}
              {weaponLineage && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.4px',
                    padding: '2px 7px',
                    borderRadius: 3,
                    background:
                      weaponLineage === 'Incarnon'
                        ? '#2d1a44'
                        : weaponLineage === 'Coda'
                        ? '#36151d'
                        : weaponLineage === 'Tenet'
                        ? '#10283c'
                        : '#351414',
                    color:
                      weaponLineage === 'Incarnon'
                        ? '#e4b8ff'
                        : weaponLineage === 'Coda'
                        ? '#ffb3c0'
                        : weaponLineage === 'Tenet'
                        ? '#8ecbfc'
                        : '#ff9e9e',
                    border: `1px solid ${
                      weaponLineage === 'Incarnon'
                        ? '#5b328a'
                        : weaponLineage === 'Coda'
                        ? '#782637'
                        : weaponLineage === 'Tenet'
                        ? '#235178'
                        : '#782828'
                    }`,
                  }}
                >
                  {weaponLineage.toUpperCase()}
                </span>
              )}
              {specialChallenge && !resourceGuide && !arcaneData && !detailedMod && (
                <span style={styles.categoryBadge}>{specialChallenge.category}</span>
              )}
              {itemGeneralInfo?.type &&
                !resourceGuide &&
                !arcaneData &&
                !detailedMod &&
                !warframeStats &&
                !weaponStats &&
                !relicMatch && (
                  <span style={styles.categoryBadge}>{itemGeneralInfo.type}</span>
                )}
              {article?.canonicalUrl && (
                <a
                  href={article.canonicalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.wikiLink}
                >
                  Open on Official Wiki &#8599;
                </a>
              )}
            </div>
          </div>
        </div>

        <div style={styles.targetWidget}>
          <div style={styles.targetControls}>
            <button
              type="button"
              onClick={onToggleTarget}
              style={{
                ...styles.targetButton,
                backgroundColor: target ? '#263a26' : '#1e1e2c',
                borderColor: target ? '#406040' : '#2e2e42',
                color: target ? '#92d492' : '#c8c8dc',
              }}
            >
              {target ? 'In Farming Targets' : '+ Add to Targets'}
            </button>
            {target && (
              <div style={styles.qtyBox}>
                <label style={styles.qtyLabel}>Target Qty:</label>
                <input
                  type="number"
                  min="1"
                  value={targetQty}
                  onChange={(e) => onUpdateQty(parseInt(e.target.value, 10) || 1)}
                  style={styles.qtyInput}
                />
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}

