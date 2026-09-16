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
import { getMarketItemUrl, getItemMarketSlug } from '../../../shared/api/market-client';
import { detailStyles as styles } from './itemDetailStyles';
import { theme } from '../../styles/theme';

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
  isTradeable?: boolean;
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
  isTradeable = true,
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
                color: theme.colors.accent,
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

      <header className="detail-header" style={styles.header}>
        <div className="detail-header-left" style={styles.headerLeft}>
          <ItemThumbnail name={itemName} size={84} />
          <div style={styles.headerInfo}>
            <h1 style={styles.title}>{itemName}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {resourceGuide && (
                <span style={styles.categoryBadge}>{resourceGuide.category} Resource</span>
              )}
              {arcaneData && (
                <span style={{ ...styles.categoryBadge, backgroundColor: theme.colors.catArcaneBg, color: theme.colors.catArcane, borderColor: theme.colors.catArcaneBorder }}>
                  {arcaneData.rarity} {arcaneData.slot} Arcane
                </span>
              )}
              {detailedMod && (
                <span style={{ ...styles.categoryBadge, backgroundColor: theme.colors.catModBg, color: theme.colors.catMod, borderColor: theme.colors.catModBorder }}>
                  {detailedMod.rarity} {detailedMod.type || 'Mod'}
                </span>
              )}
              {relicData ? (
                <>
                  <span style={{ ...styles.categoryBadge, backgroundColor: theme.colors.catRelicBg, color: theme.colors.catRelic, borderColor: theme.colors.catRelicBorder }}>
                    {relicData.era.toUpperCase()} Relic
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: 3,
                      backgroundColor: relicData.vaulted ? theme.colors.vaultedBg : theme.colors.unvaultedBg,
                      color: relicData.vaulted ? theme.colors.vaulted : theme.colors.unvaulted,
                      border: `1px solid ${relicData.vaulted ? theme.colors.vaultedBorder : theme.colors.unvaultedBorder}`,
                    }}
                  >
                    {relicData.vaulted ? 'VAULTED' : 'UNVAULTED'}
                  </span>
                </>
              ) : relicMatch ? (
                <span style={{ ...styles.categoryBadge, backgroundColor: theme.colors.catRelicBg, color: theme.colors.catRelic, borderColor: theme.colors.catRelicBorder }}>
                  {relicMatch[1].toUpperCase()} Relic
                </span>
              ) : null}
              {warframeStats && (
                <span style={{ ...styles.categoryBadge, backgroundColor: theme.colors.catWarframeBg, color: theme.colors.catWarframe, borderColor: theme.colors.catWarframeBorder }}>
                  Warframe
                </span>
              )}
              {weaponStats && (
                <span style={{ ...styles.categoryBadge, backgroundColor: theme.colors.catWeaponBg, color: theme.colors.catWeapon, borderColor: theme.colors.catWeaponBorder }}>
                  {itemGeneralInfo?.type || 'Weapon'}
                </span>
              )}
              {componentInfo && (
                <span style={{ ...styles.categoryBadge, backgroundColor: theme.colors.goldBg, color: theme.colors.gold, borderColor: theme.colors.goldBorder }}>
                  {componentInfo.isPrime ? 'Prime ' : ''}{componentInfo.parentCategory} Component
                </span>
              )}
              {weaponLineage && (
                <span style={theme.helpers.getLineageBadgeStyle(weaponLineage)}>
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
                  Open on Official Wiki
                </a>
              )}
              {isTradeable && getItemMarketSlug(itemName) && (
                <a
                  href={getMarketItemUrl(itemName)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    ...styles.wikiLink,
                    backgroundColor: theme.colors.accentBg,
                    color: theme.colors.accent,
                    borderColor: theme.colors.accentBorder,
                  }}
                >
                  Warframe.market
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="detail-target-widget" style={styles.targetWidget}>
          <div className="detail-target-controls" style={styles.targetControls}>
            <button
              type="button"
              onClick={onToggleTarget}
              style={{
                ...styles.targetButton,
                backgroundColor: target ? theme.colors.greenBg : theme.colors.bgInput,
                borderColor: target ? theme.colors.greenBorder : theme.colors.borderDefault,
                color: target ? theme.colors.green : theme.colors.textSecondary,
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

