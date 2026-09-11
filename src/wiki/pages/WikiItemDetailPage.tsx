import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchWikiArticle, WikiArticleDetails } from '../../shared/api/wiki-client';
import { getResourceGuide, ResourceFarmingGuide } from '../../shared/data/resource-guide';
import { getBestRelicSpots, RelicFarmingSpot } from '../../shared/api/drop-data';
import { RelicEra } from '../../shared/types/warframe';
import { getLootSource, LootSourceItem } from '../../shared/data/loot-sources';
import {
  getSpecialChallenge,
  SPECIAL_CHALLENGES,
  SpecialChallengeGuide,
} from '../../shared/data/special-mechanics';
import {
  getDetailedMod,
  generateModRankStats,
  calculateModEndoToMax,
  calculateModCreditsToMax,
  calculateTradingTax,
  DetailedModData,
  ModRankStat,
} from '../../shared/data/mod-database';
import {
  getItemVendorAcquisition,
  ItemVendorAcquisition,
  getIncarnonGenesisWeek,
  getIncarnonGenesisDetails,
  IncarnonGenesisDetails,
} from '../../shared/data/vendor-sources';
import {
  getCraftingRecipe,
  FoundryCraftingRecipe,
} from '../../shared/data/crafting-recipes';
import {
  getItemGeneralInfo,
  getWeaponCombatStats,
  getWeaponExtraInfo,
  getWarframeCombatStats,
  getEnemyDropsForItem,
  getItemVariantFamily,
  ItemGeneralInfo,
  WeaponCombatStats,
  WeaponExtraInfo,
  WarframeCombatStats,
  EnemyDropEntry,
  ItemVariantComparison,
  StatComparisonRow,
} from '../../shared/data/item-database';
import {
  getRelicDropsForPrimeItem,
  getRelicById,
  RelicEntry,
  RelicRefinement,
  REFINEMENT_TRACES,
  getRewardRefinementChances,
  calculateSquadSuccessProbability,
  PrimeComponentRelicDrop,
} from '../../shared/data/relic-database';
import { RecommendedBuild, getRecommendedBuildsForItem } from '../../shared/data/recommended-builds';
import { ResourceFarmTooltip } from '../components/ResourceFarmTooltip';
import {
  getArcane,
  getArcaneSynergies,
  ArcaneData,
  ArcaneSynergy,
} from '../../shared/data/arcanes';
import {
  getPersonalTargets,
  savePersonalTarget,
  removePersonalTarget,
  getPersonalItemNote,
  savePersonalItemNote,
  PersonalTarget,
  addVisitHistory,
  getVisitHistory,
  PageVisitHistory,
} from '../storage';
import { ItemThumbnail } from '../../shared/utils/item-images';
import { getWeaponLineage } from './GearDirectoryPage';
import { findSimilarItems, SimilarItemSuggestion } from '../../shared/utils/fuzzy-search';
import {
  parseItemComponent,
  getParentItemComponents,
  resolveComponentFullName,
  ItemComponentInfo,
  SiblingComponent,
} from '../../shared/data/item-components';

function renderFormattedAcquisition(text: string) {
  const paragraphs = text.split(/\n\n+/);
  return (
    <div>
      {paragraphs.map((p, pIdx) => {
        const parts: React.ReactNode[] = [];
        let lastIndex = 0;
        const regex = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)|\*\*([^*]+)\*\*/g;
        let match: RegExpExecArray | null;
        while ((match = regex.exec(p)) !== null) {
          if (match.index > lastIndex) {
            parts.push(p.substring(lastIndex, match.index));
          }
          if (match[1] && match[2]) {
            parts.push(
              <a
                key={match.index}
                href={match[2]}
                target="_blank"
                rel="noreferrer"
                style={{ color: '#77aaff', textDecoration: 'none', fontWeight: 600 }}
              >
                {match[1]}
              </a>
            );
          } else if (match[3]) {
            parts.push(<strong key={match.index}>{match[3]}</strong>);
          }
          lastIndex = regex.lastIndex;
        }
        if (lastIndex < p.length) {
          parts.push(p.substring(lastIndex));
        }
        return (
          <p key={pIdx} style={{ margin: '0 0 12px 0', lineHeight: 1.6, color: '#d0d4e8', fontSize: 14 }}>
            {parts}
          </p>
        );
      })}
    </div>
  );
}

function getRarityBadgeStyle(rarity?: string): React.CSSProperties {
  const r = (rarity || '').toLowerCase();
  if (r.includes('legendary')) {
    return {
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 4,
      fontSize: 11,
      fontWeight: 600,
      backgroundColor: '#f5f5f518',
      border: '1px solid #ffffff44',
      color: '#ffffff',
    };
  }
  if (r.includes('rare')) {
    return {
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 4,
      fontSize: 11,
      fontWeight: 600,
      backgroundColor: '#ffd70018',
      border: '1px solid #ffd70044',
      color: '#ffd700',
    };
  }
  if (r.includes('uncommon')) {
    return {
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 4,
      fontSize: 11,
      fontWeight: 600,
      backgroundColor: '#90caf918',
      border: '1px solid #90caf944',
      color: '#90caf9',
    };
  }
  return {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 600,
    backgroundColor: '#d49b6a18',
    border: '1px solid #d49b6a44',
    color: '#eed8c4',
  };
}

export function WikiItemDetailPage() {
  const { title } = useParams<{ title: string }>();
  const itemName = decodeURIComponent(title || '');

  const [article, setArticle] = useState<WikiArticleDetails | null>(null);
  const [resourceGuide, setResourceGuide] = useState<ResourceFarmingGuide | undefined>(undefined);
  const [lootSource, setLootSource] = useState<LootSourceItem | undefined>(undefined);
  const [enemyDrops, setEnemyDrops] = useState<EnemyDropEntry[]>([]);
  const [specialChallenge, setSpecialChallenge] = useState<SpecialChallengeGuide | undefined>(undefined);
  const [detailedMod, setDetailedMod] = useState<DetailedModData | undefined>(undefined);
  const [vendorAcquisition, setVendorAcquisition] = useState<ItemVendorAcquisition | undefined>(undefined);
  const [incarnonGenesis, setIncarnonGenesis] = useState<IncarnonGenesisDetails | undefined>(undefined);
  const [craftingRecipe, setCraftingRecipe] = useState<FoundryCraftingRecipe | undefined>(undefined);
  const [itemGeneralInfo, setItemGeneralInfo] = useState<ItemGeneralInfo | undefined>(undefined);
  const [weaponStats, setWeaponStats] = useState<WeaponCombatStats | undefined>(undefined);
  const [warframeStats, setWarframeStats] = useState<WarframeCombatStats | undefined>(undefined);
  const [weaponExtras, setWeaponExtras] = useState<WeaponExtraInfo | undefined>(undefined);
  const [recommendedBuilds, setRecommendedBuilds] = useState<RecommendedBuild[]>([]);
  const [selectedBuildIndex, setSelectedBuildIndex] = useState(0);
  const [arcaneData, setArcaneData] = useState<ArcaneData | undefined>(undefined);
  const [selectedArcaneRank, setSelectedArcaneRank] = useState<number>(5);
  const [arcaneSynergies, setArcaneSynergies] = useState<ArcaneSynergy[]>([]);
  const [relicSpots, setRelicSpots] = useState<RelicFarmingSpot[]>([]);
  const [relicData, setRelicData] = useState<RelicEntry | undefined>(undefined);
  const [selectedRelicRefinement, setSelectedRelicRefinement] = useState<RelicRefinement>('Intact');
  const [variantComparison, setVariantComparison] = useState<ItemVariantComparison | undefined>(undefined);
  const [selectedVariantTarget, setSelectedVariantTarget] = useState<string | undefined>(undefined);
  const [isVariantCompOpen, setIsVariantCompOpen] = useState(false);
  const [primeRelicDrops, setPrimeRelicDrops] = useState<Record<string, PrimeComponentRelicDrop[]>>({});
  const [openRelicAccordions, setOpenRelicAccordions] = useState<Record<string, boolean>>({});
  const [componentInfo, setComponentInfo] = useState<ItemComponentInfo | undefined>(undefined);
  const [parentComponents, setParentComponents] = useState<SiblingComponent[]>([]);
  const [similarItems, setSimilarItems] = useState<SimilarItemSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [personalNote, setPersonalNote] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);
  const [target, setTarget] = useState<PersonalTarget | undefined>(undefined);
  const [targetQty, setTargetQty] = useState(1);
  const [previousPage, setPreviousPage] = useState<PageVisitHistory | undefined>(undefined);

  useEffect(() => {
    if (!itemName) return;

    setIsLoading(true);
    setSimilarItems(findSimilarItems(itemName));
    setPersonalNote(getPersonalItemNote(itemName));

    const comp = parseItemComponent(itemName);
    setComponentInfo(comp);

    if (comp) {
      setParentComponents(comp.siblingComponents);
    } else {
      setParentComponents(getParentItemComponents(itemName));
    }

    const targets = getPersonalTargets();
    const existingTarget = targets.find((t) => t.name.toLowerCase() === itemName.toLowerCase());
    setTarget(existingTarget);
    if (existingTarget) {
      setTargetQty(existingTarget.targetQuantity);
    }

    const relic = getRelicById(itemName);
    setRelicData(relic);
    if (relic) {
      setSelectedRelicRefinement('Intact');
    }

    const guide = getResourceGuide(itemName);
    setResourceGuide(guide);

    const loot = getLootSource(itemName);
    setLootSource(loot);

    const drops = getEnemyDropsForItem(itemName);
    setEnemyDrops(drops);

    const modDetails = getDetailedMod(itemName);
    setDetailedMod(modDetails);

    const vendorDetails = getItemVendorAcquisition(itemName);
    setVendorAcquisition(vendorDetails);

    const incarnonDetails = getIncarnonGenesisDetails(itemName);
    setIncarnonGenesis(incarnonDetails);

    let recipe: FoundryCraftingRecipe | undefined = undefined;
    if (comp) {
      if (!comp.isPreCraftedDrop) {
        recipe = comp.craftingRecipe || getCraftingRecipe(itemName);
      }
    } else {
      recipe = getCraftingRecipe(itemName);
    }
    setCraftingRecipe(recipe);

    const isComponentItem = Boolean(comp);

    const generalInfo = isComponentItem ? undefined : getItemGeneralInfo(itemName);
    setItemGeneralInfo(generalInfo);

    const wStats = isComponentItem ? undefined : getWeaponCombatStats(itemName);
    setWeaponStats(wStats);

    const wfStats = isComponentItem ? undefined : getWarframeCombatStats(itemName);
    setWarframeStats(wfStats);

    const wExtras = isComponentItem ? undefined : getWeaponExtraInfo(itemName);
    setWeaponExtras(wExtras);

    const vComp = isComponentItem ? undefined : getItemVariantFamily(itemName, selectedVariantTarget);
    setVariantComparison(vComp);

    const pDrops = getRelicDropsForPrimeItem(itemName);
    setPrimeRelicDrops(pDrops);

    const builds = isComponentItem ? [] : getRecommendedBuildsForItem(itemName, wfStats ? 'Warframe' : wStats ? 'Primary' : undefined);
    setRecommendedBuilds(builds);
    setSelectedBuildIndex(0);

    const arcane = getArcane(itemName);
    setArcaneData(arcane);
    if (arcane) {
      setSelectedArcaneRank(arcane.maxRank);
      setArcaneSynergies(getArcaneSynergies(arcane.name));
    }

    let challenge: SpecialChallengeGuide | undefined;
    if (loot?.specialRequirementKey) {
      challenge = getSpecialChallenge(loot.specialRequirementKey);
    }
    if (!challenge) {
      challenge = SPECIAL_CHALLENGES.find(
        (c) =>
          c.rewardItem.toLowerCase().includes(itemName.toLowerCase()) ||
          c.id.toLowerCase() === itemName.toLowerCase().replace(/[^a-z0-9]+/g, '_')
      );
    }
    setSpecialChallenge(challenge);

    const eraMatch = itemName.match(/^(Lith|Meso|Neo|Axi|Requiem)/i);
    const resolvedEra = relic ? relic.era : eraMatch ? (eraMatch[1].charAt(0).toUpperCase() + eraMatch[1].slice(1).toLowerCase()) as RelicEra : null;
    if (resolvedEra) {
      setRelicSpots(getBestRelicSpots(resolvedEra));
    } else {
      setRelicSpots([]);
    }

    const historyList = getVisitHistory();
    const prev = historyList.find(
      (h) => h.path !== `/item/${encodeURIComponent(itemName)}` && h.id.toLowerCase() !== itemName.toLowerCase()
    );
    setPreviousPage(prev);

    let itemCategory = 'Item';
    if (comp) itemCategory = `${comp.parentCategory} Part`;
    else if (arcane) itemCategory = 'Arcane';
    else if (modDetails) itemCategory = 'Mod';
    else if (guide) itemCategory = 'Resource';
    else if (wfStats) itemCategory = 'Warframe';
    else if (wStats) itemCategory = 'Weapon';
    else if (eraMatch) itemCategory = 'Relic';

    addVisitHistory({
      id: itemName,
      title: itemName,
      path: `/item/${encodeURIComponent(itemName)}`,
      category: itemCategory,
    });

    fetchWikiArticle(itemName)
      .then((data) => {
        if ((!data || !data.extract) && comp?.parentItemName) {
          return fetchWikiArticle(comp.parentItemName).then((parentData) => {
            if (parentData && parentData.extract) {
              setArticle({
                ...parentData,
                title: itemName,
              });
            } else {
              setArticle(data);
            }
          });
        }
        setArticle(data);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [itemName]);

  const handleSaveNote = () => {
    savePersonalItemNote(itemName, personalNote);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  const handleToggleTarget = () => {
    if (target) {
      removePersonalTarget(target.id);
      setTarget(undefined);
    } else {
      const newTarget = {
        id: itemName.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
        name: itemName,
        category: resourceGuide ? resourceGuide.category : 'Item',
        targetQuantity: targetQty,
        currentQuantity: 0,
        notes: personalNote,
      };
      savePersonalTarget(newTarget);
      setTarget({ ...newTarget, updatedAt: new Date().toISOString() });
    }
  };

  const handleUpdateQty = (qty: number) => {
    const valid = Math.max(1, qty);
    setTargetQty(valid);
    if (target) {
      savePersonalTarget({ ...target, targetQuantity: valid });
      setTarget({ ...target, targetQuantity: valid, updatedAt: new Date().toISOString() });
    }
  };

  const handleSelectVariant = (variantName: string) => {
    setSelectedVariantTarget(variantName);
    const updated = getItemVariantFamily(itemName, variantName);
    setVariantComparison(updated);
  };

  useEffect(() => {
    if (itemName) {
      document.title = `${itemName} - Warframe Wiki`;
    }
  }, [itemName]);

  const relicMatch = itemName ? itemName.match(/^(Lith|Meso|Neo|Axi|Requiem)/i) : null;
  const weaponLineage = itemName ? getWeaponLineage(itemName, itemGeneralInfo?.type) : null;

  const hasAnyData = Boolean(
    article ||
    resourceGuide ||
    lootSource ||
    relicData ||
    enemyDrops.length > 0 ||
    specialChallenge ||
    detailedMod ||
    vendorAcquisition ||
    incarnonGenesis ||
    craftingRecipe ||
    itemGeneralInfo ||
    weaponStats ||
    warframeStats ||
    weaponExtras ||
    arcaneData ||
    relicMatch ||
    componentInfo ||
    parentComponents.length > 0 ||
    Object.keys(primeRelicDrops).length > 0
  );

  if (!itemName) {
    return (
      <div style={styles.container}>
        <p style={styles.errorNotice}>No item specified.</p>
        <Link to="/" style={styles.backLink}>Return to Search</Link>
      </div>
    );
  }

  return (
    <div style={styles.container}>
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
              onClick={handleToggleTarget}
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
                  onChange={(e) => handleUpdateQty(parseInt(e.target.value, 10) || 1)}
                  style={styles.qtyInput}
                />
              </div>
            )}
          </div>
        </div>
      </header>

      {isLoading ? (
        <p style={styles.statusNotice}>Loading wiki information...</p>
      ) : !hasAnyData ? (
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
      ) : (
        <div style={styles.contentGrid}>
          <div style={styles.mainColumn}>
            {componentInfo && (
              <section style={styles.componentParentCard}>
                <div style={styles.componentParentHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <ItemThumbnail name={componentInfo.parentItemName} size={48} />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                        <span style={styles.componentBadge}>
                          {componentInfo.isPrime ? 'PRIME ' : ''}{componentInfo.parentCategory.toUpperCase()} COMPONENT
                        </span>
                        <span style={{ fontSize: 13, color: '#a0a8c8' }}>
                          Part of:
                        </span>
                        <Link
                          to={`/item/${encodeURIComponent(componentInfo.parentItemName)}`}
                          style={styles.parentItemLink}
                        >
                          {componentInfo.parentItemName}
                        </Link>
                      </div>
                      <p style={{ margin: 0, fontSize: 13, color: '#c0c8e0', lineHeight: 1.45 }}>
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
            )}
            
            {article?.extract && (
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
            )}
            {variantComparison && variantComparison.variants.length > 1 && (
              <section style={styles.variantComparisonCard}>
                <div style={styles.variantHeader}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <span style={styles.variantBadge}>VARIANT COMPARISON</span>
                      <span style={styles.variantFamilyText}>
                        Family: <strong style={{ color: '#f0f0f8' }}>{variantComparison.baseItemName}</strong> ({variantComparison.variants.length} versions)
                      </span>
                    </div>
                    <p style={styles.variantSubtitle}>
                      Compare stats side-by-side against other editions in this item family.
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setIsVariantCompOpen(!isVariantCompOpen)}
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
                              onClick={() => !isCurrent && handleSelectVariant(v.name)}
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
                            let deltaColor = '#c0c4dc';
                            let deltaBg = '#1c1e2d';
                            let deltaBorder = '#2a2e44';
                            if (row.isImprovement === true) {
                              deltaColor = '#7ae08a';
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
            )}
            {craftingRecipe && (
              <section style={styles.sectionCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
                  <div>
                    <h2 style={styles.sectionTitle}>Foundry & Crafting Recipe</h2>
                    <span style={styles.craftCostText}>
                      Build Price: {craftingRecipe.buildPriceCredits.toLocaleString()} Credits
                      {craftingRecipe.rushPricePlat ? ` | Rush: ${craftingRecipe.rushPricePlat} Plat` : ''}
                    </span>
                  </div>
                  <div style={styles.cookTimeBadge}>
                    <span style={styles.cookTimeLabel}>Time to Cook:</span>
                    <span style={styles.cookTimeValue}>{craftingRecipe.buildTimeText}</span>
                  </div>
                </div>

                <div style={styles.ingredientsBlock}>
                  <span style={styles.ingredientsTitle}>Required Crafting Resources (Hover to see best farming spots):</span>
                  <div style={styles.ingredientsGrid}>
                    {craftingRecipe.ingredients.map((ing, i) => (
                      <ResourceFarmTooltip
                        key={i}
                        ingredientName={ing.name}
                        count={ing.count}
                        isComponent={ing.isComponent}
                        parentItemName={componentInfo?.parentItemName || itemName}
                      />
                    ))}
                  </div>
                </div>

                {craftingRecipe.componentRecipes && craftingRecipe.componentRecipes.length > 0 && (
                  <div style={styles.componentRecipesSection}>
                    <span style={styles.componentsHeading}>Component Blueprints (Cook time: 12 hours each):</span>
                    <div style={styles.componentRecipesList}>
                      {craftingRecipe.componentRecipes.map((comp) => (
                        <div key={comp.itemId} style={styles.compRecipeBox}>
                          <div style={styles.compRecipeHeader}>
                            <span style={styles.compRecipeName}>{comp.itemName}</span>
                            <span style={styles.compRecipeMeta}>
                              Time: {comp.buildTimeText} | {comp.buildPriceCredits.toLocaleString()} Credits
                            </span>
                          </div>
                          <div style={styles.ingredientsGrid}>
                            {comp.ingredients.map((ing, i) => (
                              <ResourceFarmTooltip
                                key={i}
                                ingredientName={ing.name}
                                count={ing.count}
                                isComponent={ing.isComponent}
                                parentItemName={comp.itemName || componentInfo?.parentItemName || itemName}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {detailedMod?.vendorSource && (
              <section style={styles.acquisitionCard}>
                <div style={styles.acquisitionHeader}>
                  <span style={styles.acquisitionBadge}>Acquisition</span>
                  <span style={styles.vendorStoreTag}>{detailedMod.vendorSource.factionOrSyndicate}</span>
                </div>
                <p style={styles.acquisitionSentence}>
                  The mod can be bought from <strong>[{detailedMod.vendorSource.vendorName}]</strong> for{' '}
                  <span style={styles.standingHighlight}>{detailedMod.vendorSource.standingCost}</span>
                  {detailedMod.vendorSource.rankRequirement
                    ? ` after reaching ${detailedMod.vendorSource.rankRequirement} with the [${detailedMod.vendorSource.factionOrSyndicate}].`
                    : ` at [${detailedMod.vendorSource.location}].`}
                </p>
                {detailedMod.vendorSource.notes && (
                  <p style={styles.vendorNotes}>{detailedMod.vendorSource.notes}</p>
                )}
              </section>
            )}

            {vendorAcquisition && !detailedMod?.vendorSource && !vendorAcquisition.itemName.includes('(Incarnon Genesis)') && (
              <section style={styles.acquisitionCard}>
                <div style={styles.acquisitionHeader}>
                  <span style={styles.acquisitionBadge}>Acquisition</span>
                  <span style={styles.vendorStoreTag}>{vendorAcquisition.syndicateOrStore}</span>
                </div>
                <p style={styles.acquisitionSentence}>
                  {vendorAcquisition.fullAcquisitionSentence}
                </p>
                <div style={styles.vendorMetaRow}>
                  <span><strong>Vendor:</strong> {vendorAcquisition.vendorName}</span>
                  <span><strong>Cost:</strong> {vendorAcquisition.cost}</span>
                  <span><strong>Location:</strong> {vendorAcquisition.location}</span>
                </div>
                {vendorAcquisition.notes && (
                  <div style={{ marginTop: 12, padding: '10px 14px', background: '#101018', borderRadius: 6, borderLeft: '3px solid #68d4ff' }}>
                    <strong style={{ color: '#68d4ff', fontSize: 12.5, display: 'block', marginBottom: 4 }}>Rotation & Acquisition Details:</strong>
                    <p style={{ margin: 0, fontSize: 13, color: '#c0c8e0', lineHeight: 1.5 }}>
                      {vendorAcquisition.notes}
                    </p>
                  </div>
                )}
              </section>
            )}

            {resourceGuide?.acquisition && (
              <section style={styles.sectionCard}>
                <h2 style={styles.sectionTitle}>Acquisition & Strategy</h2>
                {renderFormattedAcquisition(resourceGuide.acquisition)}
              </section>
            )}

            {resourceGuide && resourceGuide.optimalNodes.length > 0 && (
              <section style={styles.sectionCard}>
                <h2 style={styles.sectionTitle}>Optimal Farming Locations</h2>
                <div style={styles.nodeList}>
                  {resourceGuide.optimalNodes.map((node, i) => (
                    <div key={i} style={styles.nodeCard}>
                      <div style={styles.nodeCardTop}>
                        <div>
                          <span style={styles.nodeName}>{node.node}</span>
                          <span style={styles.nodePlanet}> - {node.planet}</span>
                          <span style={styles.missionTypeBadge}>{node.missionType}</span>
                        </div>
                        <span
                          style={{
                            ...styles.efficiencyBadge,
                            color: node.efficiencyRating === 'Best' ? '#92d492' : '#c4c492',
                          }}
                        >
                          {node.efficiencyRating}
                        </span>
                      </div>
                      <p style={styles.strategyText}>{node.strategyNote}</p>
                    </div>
                  ))}
                </div>

                {resourceGuide.recommendedFrames.length > 0 && (
                  <div style={styles.framesTipBox}>
                    <strong style={styles.framesTipTitle}>Recommended Squad Loadouts:</strong>
                    <span style={styles.framesList}>
                      {resourceGuide.recommendedFrames.join(', ')}
                    </span>
                  </div>
                )}
              </section>
            )}

            {relicData && (
              <section style={styles.sectionCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                  <div>
                    <h2 style={styles.sectionTitle}>{relicData.fullName} Drops &amp; Refinement</h2>
                    <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#a0a4c0' }}>
                      Select a refinement tier to inspect drop chances for solo runs and 4-player Radshare squad runs.
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {(['Intact', 'Exceptional', 'Flawless', 'Radiant'] as RelicRefinement[]).map((tier) => {
                      const isSelected = selectedRelicRefinement === tier;
                      const traces = REFINEMENT_TRACES[tier];
                      return (
                        <button
                          key={tier}
                          type="button"
                          onClick={() => setSelectedRelicRefinement(tier)}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            padding: '6px 12px',
                            background: isSelected ? '#252b42' : '#141624',
                            border: `1px solid ${isSelected ? '#ffd700' : '#23273c'}`,
                            borderRadius: 6,
                            cursor: 'pointer',
                            color: isSelected ? '#ffd700' : '#9ea4c4',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <span style={{ fontSize: 12, fontWeight: 700 }}>{tier}</span>
                          <span style={{ fontSize: 10, color: isSelected ? '#eed8a0' : '#787c94' }}>
                            {traces === 0 ? '0 Traces' : `+${traces} Traces`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ padding: '10px 14px', background: '#161928', border: '1px solid #282f4c', borderRadius: 6, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <span style={{ fontSize: 13, color: '#f0f0f8', fontWeight: 600 }}>
                      Selected Refinement: <strong style={{ color: '#ffd700' }}>{selectedRelicRefinement}</strong> ({REFINEMENT_TRACES[selectedRelicRefinement]} Void Traces)
                    </span>
                    <p style={{ margin: '2px 0 0 0', fontSize: 12, color: '#9098b8' }}>
                      {selectedRelicRefinement === 'Radiant'
                        ? 'Rare drop rate maximized to 10.00% (34.39% in 4-player Radshare squad).'
                        : selectedRelicRefinement === 'Flawless'
                        ? 'Rare drop rate boosted to 6.00% (21.93% in 4-player squad).'
                        : selectedRelicRefinement === 'Exceptional'
                        ? 'Rare drop rate boosted to 4.00% (15.07% in 4-player squad).'
                        : 'Base drop rate: 2.00% Rare, 11.00% Uncommon, 25.33% Common.'}
                    </p>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, background: '#1f2438', color: '#8ec4f4' }}>
                    {relicData.rewards.length} Potential Drops
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginBottom: 20 }}>
                  {relicData.rewards.map((rw, rIdx) => {
                    const chances = getRewardRefinementChances(rw.rarity);
                    const currentRate = chances[selectedRelicRefinement.toLowerCase() as keyof typeof chances] as number;
                    const squadRate = calculateSquadSuccessProbability(currentRate, 4);

                    let rarityBg = '#221e18';
                    let rarityColor = '#e0a060';
                    let rarityBorder = '#543820';
                    if (rw.rarity === 'Rare') {
                      rarityBg = '#2c2616';
                      rarityColor = '#ffd700';
                      rarityBorder = '#6e5820';
                    } else if (rw.rarity === 'Uncommon') {
                      rarityBg = '#1c222c';
                      rarityColor = '#90caf9';
                      rarityBorder = '#28446c';
                    }

                    return (
                      <div
                        key={rIdx}
                        style={{
                          background: '#151724',
                          border: `1px solid ${rw.rarity === 'Rare' ? '#4a3820' : '#222638'}`,
                          borderRadius: 6,
                          padding: 12,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: 10,
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                padding: '2px 6px',
                                borderRadius: 3,
                                background: rarityBg,
                                color: rarityColor,
                                border: `1px solid ${rarityBorder}`,
                              }}
                            >
                              {rw.rarity}
                            </span>
                            <span style={{ fontSize: 15, fontWeight: 800, color: rarityColor }}>
                              {currentRate}%
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <ItemThumbnail name={rw.itemName} size={36} />
                            <Link
                              to={`/item/${encodeURIComponent(rw.itemName)}`}
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: '#e0e4f4',
                                textDecoration: 'none',
                                lineHeight: 1.35,
                              }}
                            >
                              {rw.itemName}
                            </Link>
                          </div>
                        </div>

                        <div style={{ padding: '6px 8px', background: '#10121c', borderRadius: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
                          <span style={{ color: '#7c829c' }}>4-Player Squad:</span>
                          <strong style={{ color: '#8ec48e' }}>{squadRate}%</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ marginTop: 20 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f0f0f8', margin: '0 0 10px 0' }}>
                    Refinement Probability Matrix (All Tiers Comparison)
                  </h3>
                  <div style={styles.comparisonTableWrapper}>
                    <table style={styles.comparisonTable}>
                      <thead>
                        <tr>
                          <th style={styles.compTh}>Reward Item</th>
                          <th style={styles.compTh}>Rarity</th>
                          <th style={{ ...styles.compTh, background: selectedRelicRefinement === 'Intact' ? '#242a42' : undefined }}>
                            Intact (0)
                          </th>
                          <th style={{ ...styles.compTh, background: selectedRelicRefinement === 'Exceptional' ? '#242a42' : undefined }}>
                            Exceptional (25)
                          </th>
                          <th style={{ ...styles.compTh, background: selectedRelicRefinement === 'Flawless' ? '#242a42' : undefined }}>
                            Flawless (50)
                          </th>
                          <th style={{ ...styles.compTh, background: selectedRelicRefinement === 'Radiant' ? '#242a42' : undefined }}>
                            Radiant (100)
                          </th>
                          <th style={styles.compTh}>Upgrade Delta</th>
                        </tr>
                      </thead>
                      <tbody>
                        {relicData.rewards.map((rw, idx) => {
                          const chances = getRewardRefinementChances(rw.rarity);
                          const delta = Number((chances.radiant - chances.intact).toFixed(2));
                          const isBoost = delta > 0;
                          return (
                            <tr key={idx} style={styles.compTr}>
                              <td style={styles.compTdLabel}>
                                <Link
                                  to={`/item/${encodeURIComponent(rw.itemName)}`}
                                  style={{ color: '#d0d4e8', textDecoration: 'none', fontWeight: 600 }}
                                >
                                  {rw.itemName}
                                </Link>
                              </td>
                              <td style={styles.compTdCurrent}>
                                <span style={getRarityBadgeStyle(rw.rarity)}>
                                  {rw.rarity}
                                </span>
                              </td>
                              <td style={{ ...styles.compTdCounterpart, background: selectedRelicRefinement === 'Intact' ? '#1f243c' : undefined }}>
                                {chances.intact}%
                              </td>
                              <td style={{ ...styles.compTdCounterpart, background: selectedRelicRefinement === 'Exceptional' ? '#1f243c' : undefined }}>
                                {chances.exceptional}%
                              </td>
                              <td style={{ ...styles.compTdCounterpart, background: selectedRelicRefinement === 'Flawless' ? '#1f243c' : undefined }}>
                                {chances.flawless}%
                              </td>
                              <td style={{ ...styles.compTdCounterpart, background: selectedRelicRefinement === 'Radiant' ? '#1f243c' : undefined }}>
                                <strong style={{ color: '#ffd700' }}>{chances.radiant}%</strong>
                              </td>
                              <td style={styles.compTdDelta}>
                                <span
                                  style={{
                                    ...styles.deltaBadge,
                                    color: isBoost ? '#7ae08a' : '#ff8282',
                                    backgroundColor: isBoost ? '#142a1a' : '#2d1818',
                                    borderColor: isBoost ? '#23582e' : '#542222',
                                  }}
                                >
                                  {isBoost ? `+${delta}% (boost)` : `${delta}%`}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}

            {relicSpots.length > 0 && (
              <section style={styles.sectionCard}>
                <h2 style={styles.sectionTitle}>Fastest Relic Farming Spots ({relicData ? `${relicData.era} Era` : 'Era'})</h2>
                <div style={styles.nodeList}>
                  {relicSpots.map((spot, i) => (
                    <div key={i} style={styles.nodeCard}>
                      <div style={styles.nodeCardTop}>
                        <div>
                          <span style={styles.nodeName}>{spot.node}</span>
                          <span style={styles.nodePlanet}> ({spot.planet})</span>
                          <span style={styles.missionTypeBadge}>{spot.missionType}</span>
                        </div>
                        <span style={styles.dropRateBadge}>{spot.dropRateText}</span>
                      </div>
                      <p style={styles.strategyText}>
                        <strong>Time:</strong> {spot.expectedTime} | {spot.strategyTip}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {Object.keys(primeRelicDrops).length > 0 && (
              <section style={styles.sectionCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <h2 style={styles.sectionTitle}>Void Relic Drop Sources</h2>
                    <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#a0a4c0' }}>
                      All active and historical Void Relics containing {itemName} blueprints and parts.
                    </p>
                  </div>
                  <Link to="/relics" style={styles.wikiLink}>
                    View Full Relics Directory
                  </Link>
                </div>
            
                <div style={{ padding: '10px 14px', background: '#1c1c28', borderLeft: '3px solid #ffd700', borderRadius: '0 6px 6px 0', marginBottom: 20, fontSize: 12.5, color: '#b0b8d0', lineHeight: 1.5 }}>
                  <strong style={{ color: '#ffd700' }}>Note on Vaulted Relics:</strong> Vaulted relics do not drop in standard Star Chart missions.
                </div>
            
                <div style={styles.primeRelicsList}>
                  {Object.entries(primeRelicDrops).map(([partName, relics]) => {
                    const isOpen = openRelicAccordions[partName] === true;
                    const sortedRelics = [...relics].sort((a, b) => {
                      if (a.vaulted !== b.vaulted) return a.vaulted ? 1 : -1;
                      return b.radiantChance - a.radiantChance;
                    });
                    const bestRelic = sortedRelics[0];
                    const unvaultedCount = relics.filter((r) => !r.vaulted).length;
                    const vaultedCount = relics.filter((r) => r.vaulted).length;
                  
                    return (
                      <div key={partName} style={{...styles.primeRelicPartGroup, borderColor: isOpen ? '#3a425c' : '#1f2334'}}>
                        <div
                          onClick={() => setOpenRelicAccordions((prev) => ({ ...prev, [partName]: !isOpen }))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setOpenRelicAccordions((prev) => ({ ...prev, [partName]: !isOpen }));
                            }
                          }}
                          style={{
                            ...styles.primeRelicAccordionHeaderBtn,
                            background: isOpen ? '#181b2a' : '#141620',
                            borderBottom: isOpen ? '1px solid #1f2334' : 'none'
                          }}
                          role="button"
                          tabIndex={0}
                          aria-expanded={isOpen}
                        >
                          {(() => {
                            const fullPartName = componentInfo ? itemName : resolveComponentFullName(partName, itemName);
                            const isDifferentPage = fullPartName.toLowerCase() !== itemName.toLowerCase();

                            return (
                              <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', flex: 1 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span style={styles.primeRelicPartTitle}>{partName}</span>
                                  </div>

                                  {isDifferentPage && (
                                    <Link
                                      to={`/item/${encodeURIComponent(fullPartName)}`}
                                      style={styles.partPageLink}
                                      onClick={(e) => e.stopPropagation()}
                                      title={`Open ${fullPartName} component page`}
                                    >
                                      Open Page
                                    </Link>
                                  )}

                                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginLeft: 'auto', marginRight: 16 }}>
                                    {bestRelic && (
                                      <span style={styles.highestDropBadge}>
                                        Best: {bestRelic.radiantChance}% ({bestRelic.era} {bestRelic.relicName})
                                      </span>
                                    )}
                                    <span style={styles.unvaultedCountBadge}>
                                      {unvaultedCount > 0 ? `${unvaultedCount} Unvaulted` : 'All Vaulted'}
                                      {vaultedCount > 0 ? ` · ${vaultedCount} Vaulted` : ''}
                                    </span>
                                  </div>
                                </div>
                                  
                                <div style={styles.accordionToggleWrapper}>
                                  <span style={{
                                    ...styles.accordionToggleArrow,
                                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                                  }}>
                                    ▼
                                  </span>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                        
                        {isOpen && (
                          <div style={styles.relicBadgesGrid}>
                            {sortedRelics.map((r, rIdx) => {
                              let eraBg = '#1b2234';
                              let eraColor = '#90caf9';
                              if (r.era === 'Lith') { eraBg = '#2a2216'; eraColor = '#e0a868'; }
                              else if (r.era === 'Meso') { eraBg = '#1a2624'; eraColor = '#70c8b0'; }
                              else if (r.era === 'Neo') { eraBg = '#281a28'; eraColor = '#d088d8'; }
                              else if (r.era === 'Axi') { eraBg = '#2c2616'; eraColor = '#e8c458'; }
                              else if (r.era === 'Requiem') { eraBg = '#2c1414'; eraColor = '#e86868'; }
                            
                              return (
                                <Link
                                  key={rIdx}
                                  to={`/item/${encodeURIComponent(r.fullName)}`}
                                  style={{
                                    ...styles.primeRelicCard,
                                    opacity: r.vaulted ? 0.65 : 1,
                                    textDecoration: 'none',
                                    color: 'inherit',
                                    cursor: 'pointer',
                                  }}
                                  title={`View details and drop tables for ${r.fullName}`}
                                >
                                  <div style={styles.primeRelicCardTop}>
                                    <span style={{ ...styles.eraChip, backgroundColor: eraBg, color: eraColor }}>
                                      {r.era} {r.relicName}
                                    </span>
                                    <span
                                      style={{
                                        fontSize: 9.5,
                                        fontWeight: 700,
                                        padding: '2px 5px',
                                        borderRadius: 3,
                                        backgroundColor: r.vaulted ? '#2d2218' : '#142a1a',
                                        color: r.vaulted ? '#e0a060' : '#7ae08a',
                                        border: `1px solid ${r.vaulted ? '#543820' : '#23582e'}`,
                                      }}
                                    >
                                      {r.vaulted ? 'Vaulted' : 'Unvaulted'}
                                    </span>
                                  </div>
                                    
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={getRarityBadgeStyle(r.rarity)}>
                                      {r.rarity}
                                    </span>
                                  </div>
                                    
                                  <div style={styles.primeRelicChancesRow}>
                                    <span style={styles.relicChanceText}>Intact: <strong style={{ color: '#f0f0f8' }}>{r.intactChance}%</strong></span>
                                    <span style={styles.relicChanceText}>Radiant: <strong style={{ color: '#f0f0f8' }}>{r.radiantChance}%</strong></span>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {lootSource && (lootSource.bossOrEnemyName || lootSource.locationNode || (Object.keys(primeRelicDrops).length === 0 && !componentInfo)) && (
              <section style={styles.sectionCard}>
                <h2 style={styles.sectionTitle}>Acquisition & Loot Drops</h2>
                <div style={styles.lootSummaryBox}>
                  {lootSource.bossOrEnemyName && (
                    <div style={styles.lootInfoRow}>
                      <span style={styles.lootInfoLabel}>Source Boss / Enemy:</span>
                      <span style={styles.lootInfoValue}>{lootSource.bossOrEnemyName}</span>
                    </div>
                  )}
                  {lootSource.locationNode && (
                    <div style={styles.lootInfoRow}>
                      <span style={styles.lootInfoLabel}>Star Chart Node:</span>
                      <span style={styles.lootInfoValue}>
                        {lootSource.locationNode} {lootSource.planet ? `(${lootSource.planet})` : ''}
                      </span>
                    </div>
                  )}
                  {lootSource.generalDropInfo && Object.keys(primeRelicDrops).length === 0 && !componentInfo && (
                    <p style={styles.lootGeneralText}>{lootSource.generalDropInfo}</p>
                  )}
                </div>

                {Object.keys(primeRelicDrops).length === 0 && !componentInfo && lootSource.components && lootSource.components.length > 0 && (
                  <div style={styles.componentsTable}>
                    <span style={styles.componentsHeader}>Component Blueprints & Parts:</span>
                    {lootSource.components.map((c, i) => (
                      <div key={i} style={styles.componentRow}>
                        <span style={styles.componentName}>{c.partName}</span>
                        <div style={styles.componentRight}>
                          <span style={styles.componentSource}>{c.sourceText}</span>
                          {c.dropChance !== undefined && (
                            <span style={styles.componentChance}>{c.dropChance}%</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}


            {incarnonGenesis ? (
              <section style={styles.incarnonCard}>
                <div style={styles.incarnonHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={styles.incarnonBadge}>INCARNON GENESIS</span>
                    <span style={styles.incarnonCircuitBadge}>
                      {incarnonGenesis.circuitRotationText || 'The Steel Path Circuit (Duviri)'}
                    </span>
                  </div>
                  <span style={styles.vendorStoreTag}>Chrysalith (Cavalero)</span>
                </div>

                <p style={styles.acquisitionSentence}>
                  {incarnonGenesis.articleTitle} upgrades <strong>{incarnonGenesis.weaponName}</strong> with {incarnonGenesis.evolutions.length} Evolution tiers, unlocking Void transmutation and alt-fire form.
                </p>

                <div style={styles.incarnonMetaRow}>
                  {incarnonGenesis.circuitWeek && (
                    <span><strong>Circuit:</strong> Week {incarnonGenesis.circuitWeek} of 7</span>
                  )}
                  <span><strong>Installation:</strong> Cavalero (Chrysalith)</span>
                  <span><strong>Plat Skip:</strong> 120 Platinum</span>
                  <span><strong>Prerequisites:</strong> The Duviri Paradox, Angels of the Zariman & Steel Path</span>
                </div>

                {incarnonGenesis.installationRequirements.length > 0 && (
                  <div style={styles.incarnonRequirementsBox}>
                    <div style={styles.incarnonReqHeader}>
                      <span style={styles.incarnonReqTitle}>Installation Requirements (Cavalero):</span>
                      <span style={styles.incarnonReqSub}>Hover to view best drop nodes, click to open farming guide</span>
                    </div>
                    <div style={styles.ingredientsGrid}>
                      {incarnonGenesis.installationRequirements.map((req, i) => (
                        <ResourceFarmTooltip
                          key={i}
                          ingredientName={req.name}
                          count={req.count}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {incarnonGenesis.acquisition && (
                  <div style={{ marginBottom: 14 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: '#eed8ff', margin: '0 0 6px 0' }}>Acquisition & Prerequisites</h3>
                    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: '#d0c4e8' }}>
                      {incarnonGenesis.acquisition}
                    </p>
                  </div>
                )}

                {incarnonGenesis.overview && (
                  <div style={styles.incarnonOverviewBox}>
                    <div style={styles.incarnonOverviewTitle}>Incarnon Transmutation & Form Overview:</div>
                    {incarnonGenesis.overview.split('\n').map((p, idx) => (
                      <p key={idx} style={styles.incarnonOverviewText}>{p}</p>
                    ))}
                  </div>
                )}

                {incarnonGenesis.evolutions.length > 0 && (
                  <div>
                    <h3 style={styles.incarnonEvolutionsHeader}>Evolution Tiers & Perks</h3>
                    {incarnonGenesis.evolutions.map((tier, tIdx) => (
                      <div key={tIdx} style={styles.incarnonTierCard}>
                        <div style={styles.incarnonTierTop}>
                          <span style={styles.incarnonTierName}>
                            {tier.tier.replace(/(\d+)/, ' $1')}: {tier.perks[0]?.name === 'Incarnon Form' ? 'Incarnon Form' : 'Evolution Perks'}
                          </span>
                          {tier.challenge && (
                            <span style={styles.incarnonChallengeBadge}>
                              Challenge: {tier.challenge}
                            </span>
                          )}
                        </div>

                        <div style={styles.incarnonPerksGrid}>
                          {tier.perks.map((perk, pIdx) => (
                            <div key={pIdx} style={styles.incarnonPerkBox}>
                              <div style={styles.incarnonPerkName}>{perk.name}</div>
                              <p style={styles.incarnonPerkDesc}>{perk.description}</p>
                              {perk.notes && (
                                <div style={styles.incarnonPerkNotes}>
                                  {perk.notes}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ) : getIncarnonGenesisWeek(itemName) && !vendorAcquisition?.itemName.includes('(Incarnon Genesis)') ? (
              <section style={{ ...styles.acquisitionCard, borderLeft: '4px solid #b877f0', background: '#161322' }}>
                <div style={styles.acquisitionHeader}>
                  <span style={{ ...styles.acquisitionBadge, background: '#2e1c44', color: '#dca8ff' }}>Incarnon Genesis</span>
                  <span style={styles.vendorStoreTag}>The Steel Path Circuit (Duviri)</span>
                </div>
                <p style={styles.acquisitionSentence}>
                  An Incarnon Genesis Adapter is available for <strong>{itemName}</strong>, unlocking 5 Evolution tiers and alt-fire Void transmutation.
                </p>
                <div style={styles.vendorMetaRow}>
                  <span><strong>Circuit Rotation:</strong> Week {getIncarnonGenesisWeek(itemName)?.week} of 7</span>
                  <span><strong>Weekly Offerings:</strong> {getIncarnonGenesisWeek(itemName)?.pool.join(', ')}</span>
                  <span><strong>Installation:</strong> Cavalero (Chrysalith)</span>
                  <span><strong>Cost:</strong> 20 Pathos Clamps + Regional Duviri Resources</span>
                </div>
                <p style={{ marginTop: 10, fontSize: 12.5, color: '#c0b8dc', lineHeight: 1.5 }}>
                  Choose 2 adapters upon completing Steel Path Circuit Tier 5 and 10 milestones each week. Adapters can be installed on standard, Prime, Prisma, Vandal, Wraith, or variant editions of this weapon.
                </p>
              </section>
            ) : null}

            {enemyDrops.length > 0 && (
              <section style={styles.sectionCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <h2 style={styles.sectionTitle}>Official Enemy Drop Tables</h2>
                    <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#a0a4c0' }}>
                      Enemies, bosses, and avatars that drop this item according to official Warframe drop data.
                    </p>
                  </div>
                  <span style={{ fontSize: 12, color: '#8ec48e', fontWeight: 600 }}>
                    {enemyDrops.length} source{enemyDrops.length === 1 ? '' : 's'}
                  </span>
                </div>

                <div style={styles.enemyDropsTableWrapper}>
                  <table style={styles.enemyDropsTable}>
                    <thead>
                      <tr>
                        <th style={styles.enemyDropsTh}>Enemy / Avatar Name</th>
                        <th style={styles.enemyDropsTh}>Enemy Drop Chance</th>
                        <th style={styles.enemyDropsTh}>Pool Drop Chance</th>
                        <th style={styles.enemyDropsTh}>Expected Drop Rate</th>
                        <th style={styles.enemyDropsTh}>Rarity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enemyDrops.map((drop, idx) => {
                        const expectedRate = drop.enemyDropChance
                          ? ((drop.enemyDropChance * drop.dropChance) / 100).toFixed(2)
                          : drop.dropChance.toFixed(2);
                        return (
                          <tr key={idx} style={styles.enemyDropRow}>
                            <td style={styles.enemyDropNameCell}>
                              <span style={styles.enemyNameText}>{drop.enemyName}</span>
                            </td>
                            <td style={styles.enemyDropStatCell}>
                              {drop.enemyDropChance !== undefined ? `${drop.enemyDropChance}%` : 'Guaranteed / Direct'}
                            </td>
                            <td style={styles.enemyDropStatCell}>
                              {drop.dropChance}%
                            </td>
                            <td style={styles.enemyDropRateCell}>
                              <span style={styles.expectedRateBadge}>{expectedRate}%</span>
                            </td>
                            <td style={styles.enemyDropRarityCell}>
                              <span style={getRarityBadgeStyle(drop.rarity)}>
                                {drop.rarity || 'Common'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {specialChallenge && (
              <section style={{ ...styles.sectionCard, borderLeft: '3px solid #8e9ec4' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h2 style={styles.sectionTitle}>Special Requirement: {specialChallenge.title}</h2>
                  <Link to="/mechanics" style={styles.wikiLink}>All Puzzle Guides</Link>
                </div>
                <div style={styles.mechanicCallout}>
                  <strong>Visual Cue:</strong> {specialChallenge.roomVisualCue}
                </div>

                <div style={styles.framesTipBox}>
                  <strong style={styles.framesTipTitle}>Recommended Frames:</strong>
                  <span style={styles.framesList}>{specialChallenge.recommendedFrames.join(', ')}</span>
                </div>

                <div style={{ marginTop: 14 }}>
                  <strong style={styles.blockTitle}>Step-by-Step Puzzle Walkthrough:</strong>
                  <ol style={styles.solutionList}>
                    {specialChallenge.stepByStepSolution.map((step, i) => (
                      <li key={i} style={{ padding: '3px 0' }}>{step}</li>
                    ))}
                  </ol>
                </div>

                {specialChallenge.tipsAndTricks && specialChallenge.tipsAndTricks.length > 0 && (
                  <div style={{ ...styles.mechanicCallout, marginTop: 12, background: '#161622', borderLeftColor: '#90d490' }}>
                    <strong>Pro-Tip:</strong> {specialChallenge.tipsAndTricks[0]}
                  </div>
                )}
              </section>
            )}
            
            {warframeStats && (
              <>
                <section style={styles.sectionCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <h2 style={styles.sectionTitle}>Warframe Base & Defensive Attributes</h2>
                    {warframeStats.sex && (
                      <span style={{ fontSize: 12, color: '#8ec48e', fontWeight: 600 }}>
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
                      <strong>Passive Ability:</strong> {warframeStats.passiveDescription}
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
                          <p style={styles.abilityDescription}>{ability.description}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}

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

            {recommendedBuilds.length > 0 && (warframeStats || weaponStats) && (
              <section style={styles.sectionCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                  <div>
                    <h2 style={styles.sectionTitle}>Recommended Community Builds & Mod Loadouts</h2>
                    <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#8888a2' }}>
                      Optimized configurations with full mod setups, Arcanes, Archon Shards, and playstyles.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {recommendedBuilds.map((b, bIdx) => (
                      <button
                        key={b.id || bIdx}
                        onClick={() => setSelectedBuildIndex(bIdx)}
                        style={{
                          backgroundColor: selectedBuildIndex === bIdx ? '#2c334d' : '#141622',
                          color: selectedBuildIndex === bIdx ? '#ffd700' : '#8e9ec4',
                          border: `1px solid ${selectedBuildIndex === bIdx ? '#ffd700' : '#222638'}`,
                          borderRadius: 6,
                          padding: '6px 12px',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {b.title.split(' ')[0]} ({b.archetype})
                      </button>
                    ))}
                  </div>
                </div>

                {recommendedBuilds[selectedBuildIndex] && (() => {
                  const b = recommendedBuilds[selectedBuildIndex];
                  return (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f0f0f8', margin: 0 }}>
                          {b.title}
                        </h3>
                        <span style={{ backgroundColor: '#222b44', color: '#ffd700', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4 }}>
                          {b.archetype}
                        </span>
                      </div>

                      <p style={{ fontSize: 13, color: '#9baacf', lineHeight: 1.5, margin: '0 0 14px 0' }}>
                        {b.description}
                      </p>

                      <div style={{ backgroundColor: '#131828', border: '1px solid #232c48', borderRadius: 6, padding: '12px 16px', marginBottom: 18 }}>
                        <strong style={{ color: '#8e9ec4', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Playstyle Strategy:</strong>
                        <p style={{ margin: '6px 0 0 0', fontSize: 13, color: '#d0d4e8', lineHeight: 1.5 }}>
                          {b.playstyle}
                        </p>
                      </div>

                      <div style={{ marginBottom: 18 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <span style={styles.componentsHeading}>Mod Slots Configuration:</span>
                          <div style={{ display: 'flex', gap: 10 }}>
                            {b.auraOrStance && (
                              <span style={{ fontSize: 12, color: '#00e676', backgroundColor: '#00e67615', border: '1px solid #00e67644', padding: '2px 8px', borderRadius: 4 }}>
                                <strong>Aura / Stance:</strong> {b.auraOrStance}
                              </span>
                            )}
                            {b.exilus && (
                              <span style={{ fontSize: 12, color: '#ffbb33', backgroundColor: '#ffbb3315', border: '1px solid #ffbb3344', padding: '2px 8px', borderRadius: 4 }}>
                                <strong>Exilus:</strong> {b.exilus}
                              </span>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                          {b.mods.map((m, mIdx) => (
                            <Link
                              key={mIdx}
                              to={`/item/${encodeURIComponent(m.modName)}`}
                              style={{
                                display: 'block',
                                backgroundColor: '#141624',
                                border: '1px solid #242940',
                                borderRadius: 6,
                                padding: '10px 12px',
                                textDecoration: 'none',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                <span style={{ fontSize: 11, color: '#68708c', fontWeight: 600 }}>Slot {m.slot + 1}</span>
                                {m.drain && (
                                  <span style={{ fontSize: 11, color: '#ffd700', backgroundColor: '#ffd70018', padding: '1px 5px', borderRadius: 3 }}>
                                    {m.drain} Drain
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: '#e0e4f4' }}>
                                {m.modName}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, marginBottom: 18 }}>
                        {b.arcanes && b.arcanes.length > 0 && (
                          <div style={{ backgroundColor: '#131520', border: '1px solid #202434', borderRadius: 6, padding: '12px 14px' }}>
                            <strong style={{ fontSize: 12, color: '#cc88ff', display: 'block', marginBottom: 6 }}>
                              Recommended Arcanes:
                            </strong>
                            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#c8c8dc' }}>
                              {b.arcanes.map((arc, aIdx) => (
                                <li key={aIdx} style={{ marginBottom: 4 }}>
                                  <Link
                                    to={`/item/${encodeURIComponent(arc)}`}
                                    style={{ color: '#dca8ff', textDecoration: 'none', fontWeight: 600 }}
                                  >
                                    {arc}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {b.archonShards && b.archonShards.length > 0 && (
                          <div style={{ backgroundColor: '#131520', border: '1px solid #202434', borderRadius: 6, padding: '12px 14px' }}>
                            <strong style={{ fontSize: 12, color: '#ff5544', display: 'block', marginBottom: 6 }}>
                              Archon Shards:
                            </strong>
                            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#c8c8dc' }}>
                              {b.archonShards.map((shard, sIdx) => (
                                <li key={sIdx}>{shard}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {b.helminth && (
                          <div style={{ backgroundColor: '#131520', border: '1px solid #202434', borderRadius: 6, padding: '12px 14px' }}>
                            <strong style={{ fontSize: 12, color: '#44dd88', display: 'block', marginBottom: 6 }}>
                              Helminth Subsume:
                            </strong>
                            <div style={{ fontSize: 13, color: '#d0d4e8', marginBottom: 4 }}>
                              <strong>{b.helminth.ability}</strong> replacing <em>{b.helminth.replacedAbility}</em>
                            </div>
                            <div style={{ fontSize: 12, color: '#7e88a4' }}>
                              {b.helminth.description}
                            </div>
                          </div>
                        )}
                      </div>

                      <div style={{ borderTop: '1px solid #202434', paddingTop: 14 }}>
                        <span style={{ fontSize: 12, color: '#8888a2', display: 'block', marginBottom: 8, fontWeight: 600 }}>
                          Explore More Community Builds & Guides:
                        </span>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                          {b.externalLinks?.redditUrl && (
                            <a
                              href={b.externalLinks.redditUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                backgroundColor: '#281a18',
                                color: '#ff6644',
                                border: '1px solid #582820',
                                borderRadius: 6,
                                padding: '6px 12px',
                                fontSize: 12,
                                fontWeight: 600,
                                textDecoration: 'none',
                              }}
                            >
                              🔴 Reddit /r/Warframe
                            </a>
                          )}
                          {b.externalLinks?.tiktokUrl && (
                            <a
                              href={b.externalLinks.tiktokUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                backgroundColor: '#182024',
                                color: '#00e5ff',
                                border: '1px solid #204050',
                                borderRadius: 6,
                                padding: '6px 12px',
                                fontSize: 12,
                                fontWeight: 600,
                                textDecoration: 'none',
                              }}
                            >
                              🎵 TikTok Builds & Clips
                            </a>
                          )}
                          {b.externalLinks?.overframeUrl && (
                            <a
                              href={b.externalLinks.overframeUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                backgroundColor: '#242018',
                                color: '#ffd700',
                                border: '1px solid #504420',
                                borderRadius: 6,
                                padding: '6px 12px',
                                fontSize: 12,
                                fontWeight: 600,
                                textDecoration: 'none',
                              }}
                            >
                              🌐 Overframe Community
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </section>
            )}

            {recommendedBuilds.length === 0 && (warframeStats || weaponStats) && (
              <section style={styles.sectionCard}>
                <h2 style={styles.sectionTitle}>Recommended Community Builds &amp; Mod Loadouts</h2>
                <p style={{ margin: '6px 0 16px 0', fontSize: 13, color: '#8888a2' }}>
                  No builds submitted yet. Check the community or be the first to contribute one.
                </p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <a
                    href={`https://www.reddit.com/r/Warframe/search/?q=${encodeURIComponent(itemName)}+build`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: '#281a18', color: '#ff6644', border: '1px solid #582820', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}
                  >
                    🔴 Reddit /r/Warframe
                  </a>
                  <a
                    href={`https://overframe.gg/search?q=${encodeURIComponent(itemName)}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: '#242018', color: '#ffd700', border: '1px solid #504420', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}
                  >
                    🌐 Overframe
                  </a>
                  <a
                    href={`https://www.tiktok.com/search?q=${encodeURIComponent(itemName + ' warframe build')}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, backgroundColor: '#182024', color: '#00e5ff', border: '1px solid #204050', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}
                  >
                    🎵 TikTok Builds
                  </a>
                </div>
              </section>
            )}

            {detailedMod && (
              <section style={styles.sectionCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h2 style={styles.sectionTitle}>Stats Progression by Rank</h2>
                  <span style={{ fontSize: 12, color: '#8ec48e', fontWeight: 600 }}>Max Rank: {detailedMod.maxRank}</span>
                </div>
                <div style={styles.rankTableWrapper}>
                  <table style={styles.rankTable}>
                    <thead>
                      <tr>
                        <th style={styles.rankTh}>Rank</th>
                        <th style={styles.rankTh}>Drain</th>
                        {detailedMod.statLabels.map((lbl) => (
                          <th key={lbl} style={styles.rankTh}>{lbl}</th>
                        ))}
                        <th style={styles.rankTh}>Full Effect</th>
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
                          {detailedMod.statLabels.map((lbl, idx) => (
                            <td key={lbl} style={styles.statTd}>
                              {Object.values(row.statValues)[idx] || '-'}
                            </td>
                          ))}
                          <td style={styles.effectTd}>{row.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>

          <aside style={styles.sideColumn}>
            {detailedMod && (
              <section style={styles.sectionCard}>
                <h3 style={styles.sectionSubTitle}>General Information</h3>
                <div style={styles.infoBox}>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Type</span>
                    <span style={styles.infoVal}>{detailedMod.type}</span>
                  </div>
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
                            ? '#d8c474'
                            : detailedMod.rarity === 'Legendary'
                            ? '#e0e0e8'
                            : '#a0a0b8',
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
                    <span style={{ ...styles.infoVal, color: '#8ec4c4', fontWeight: 600 }}>
                      {calculateModEndoToMax(detailedMod.rarity, detailedMod.maxRank).toLocaleString()}
                    </span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Credits Required To Max</span>
                    <span style={{ ...styles.infoVal, color: '#d8c474', fontWeight: 600 }}>
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
                        Official Drop Tables &#8599;
                      </a>
                    </div>
                  )}
                </div>
              </section>
            )}

            {arcaneData && (
              <section style={styles.sectionCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <h2 style={styles.sectionTitle}>{arcaneData.name} Progression & Stats</h2>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                      <span style={getRarityBadgeStyle(arcaneData.rarity)}>{arcaneData.rarity}</span>
                      <span style={{ fontSize: 12, color: '#a0a0b8', backgroundColor: '#1c1c28', padding: '2px 8px', borderRadius: 4, border: '1px solid #282838' }}>
                        {arcaneData.slot} Arcane
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: 12, color: '#8ec48e', fontWeight: 600 }}>
                    Max Rank: {arcaneData.maxRank} (21 copies total)
                  </span>
                </div>

                {/* Interactive Rank Selector */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, color: '#a0a0b8', marginBottom: 6, fontWeight: 600 }}>
                    Select Rank to Preview:
                  </label>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {arcaneData.stats.map((st) => {
                      const isSelected = selectedArcaneRank === st.rank;
                      return (
                        <button
                          key={st.rank}
                          type="button"
                          onClick={() => setSelectedArcaneRank(st.rank)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: 4,
                            border: isSelected ? '1px solid #68d4ff' : '1px solid #282838',
                            backgroundColor: isSelected ? '#162838' : '#14141e',
                            color: isSelected ? '#ffffff' : '#a0a0b8',
                            fontWeight: isSelected ? 700 : 500,
                            fontSize: 12,
                            cursor: 'pointer',
                          }}
                        >
                          Rank {st.rank} ({st.requiredCopies} {st.requiredCopies === 1 ? 'copy' : 'copies'})
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Active Rank Effect Card */}
                {(() => {
                  const currentStat = arcaneData.stats.find((s) => s.rank === selectedArcaneRank) || arcaneData.stats[arcaneData.stats.length - 1];
                  if (!currentStat) return null;
                  return (
                    <div
                      style={{
                        padding: '14px 16px',
                        backgroundColor: '#161826',
                        borderRadius: 6,
                        border: '1px solid #2b3046',
                        marginBottom: 16,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                        <strong style={{ color: '#68d4ff', fontSize: 13 }}>
                          Rank {currentStat.rank} Effect
                        </strong>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          {currentStat.revives !== undefined && currentStat.revives > 0 && (
                            <span style={{ fontSize: 11, backgroundColor: '#2e1c44', color: '#dca8ff', padding: '2px 8px', borderRadius: 4, fontWeight: 600, border: '1px solid #502c80' }}>
                              +{currentStat.revives} Arcane Revive
                            </span>
                          )}
                          <span style={{ fontSize: 12, color: '#8ec48e' }}>
                            {currentStat.requiredCopies} total copies required
                          </span>
                        </div>
                      </div>
                      <p style={{ margin: 0, fontSize: 13.5, color: '#f0f0f8', lineHeight: 1.5 }}>
                        {currentStat.effect}
                      </p>
                    </div>
                  );
                })()}

                {/* Complete Rank Progression Matrix */}
                <div style={{ marginBottom: 18 }}>
                  <span style={{ fontSize: 12, color: '#b0b0c4', fontWeight: 600, display: 'block', marginBottom: 8 }}>
                    Full Rank Progression Matrix:
                  </span>
                  <div style={styles.rankTableWrapper}>
                    <table style={styles.rankTable}>
                      <thead>
                        <tr>
                          <th style={styles.rankTh}>Rank</th>
                          <th style={styles.rankTh}>Effect Description</th>
                          <th style={styles.rankTh}>Revives</th>
                          <th style={styles.rankTh}>Copies Needed</th>
                        </tr>
                      </thead>
                      <tbody>
                        {arcaneData.stats.map((st) => (
                          <tr
                            key={st.rank}
                            style={st.rank === selectedArcaneRank ? { backgroundColor: '#182032' } : undefined}
                          >
                            <td style={styles.rankTd}>
                              <span style={styles.rankBadge}>Rank {st.rank}</span>
                            </td>
                            <td style={styles.effectTd}>{st.effect}</td>
                            <td style={styles.rankTd}>{st.revives ? `+${st.revives}` : 'None'}</td>
                            <td style={styles.rankTd}>
                              <span style={{ color: '#8ec48e', fontWeight: 600 }}>{st.requiredCopies}</span>
                              {st.arcanesToUpgrade > 0 && (
                                <span style={{ color: '#7a7a94', fontSize: 11, marginLeft: 4 }}>
                                  (+{st.arcanesToUpgrade})
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Arcane Dissolution Vosfor Pack */}
                {arcaneData.dissolutionPack && (
                  <div
                    style={{
                      padding: '12px 14px',
                      backgroundColor: '#121620',
                      border: '1px solid #1c283c',
                      borderRadius: 6,
                      marginBottom: 16,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 8,
                    }}
                  >
                    <div>
                      <strong style={{ color: '#68d4ff', fontSize: 12.5, display: 'block' }}>
                        Arcane Dissolution (Sanctum Anatomica)
                      </strong>
                      <span style={{ fontSize: 12, color: '#a0a8c0' }}>
                        Can be acquired from Albrecht's Laboratories / Loid via the <strong>{arcaneData.dissolutionPack}</strong> (200 Vosfor).
                      </span>
                    </div>
                    <span style={{ fontSize: 11, color: '#dca8ff', backgroundColor: '#281c3c', padding: '3px 8px', borderRadius: 4, border: '1px solid #48286c' }}>
                      Vosfor Transmutation
                    </span>
                  </div>
                )}

                {/* Vendor Acquisition If Any */}
                {arcaneData.vendorSource && (
                  <div
                    style={{
                      padding: '12px 14px',
                      backgroundColor: '#161a1e',
                      border: '1px solid #2a343c',
                      borderRadius: 6,
                      marginBottom: 16,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <strong style={{ color: '#ffd700', fontSize: 12.5 }}>
                        Direct Vendor Purchase: {arcaneData.vendorSource.vendorName} ({arcaneData.vendorSource.factionOrSyndicate})
                      </strong>
                      <span style={{ fontSize: 12, color: '#8ec48e', fontWeight: 600 }}>
                        {arcaneData.vendorSource.standingCost}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: '#a0a8c0', lineHeight: 1.4 }}>
                      <div><strong>Location:</strong> {arcaneData.vendorSource.location}</div>
                      {arcaneData.vendorSource.rankRequirement && (
                        <div><strong>Rank Requirement:</strong> {arcaneData.vendorSource.rankRequirement}</div>
                      )}
                      {arcaneData.vendorSource.notes && (
                        <div style={{ marginTop: 4, color: '#8a94b0' }}>{arcaneData.vendorSource.notes}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Drop Sources List */}
                {arcaneData.drops && arcaneData.drops.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <span style={{ fontSize: 12, color: '#b0b0c4', fontWeight: 600, display: 'block', marginBottom: 8 }}>
                      Drop Sources ({arcaneData.drops.length} documented):
                    </span>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 8 }}>
                      {arcaneData.drops.slice(0, 12).map((drop, dIdx) => (
                        <div
                          key={dIdx}
                          style={{
                            backgroundColor: '#141622',
                            border: '1px solid #202434',
                            borderRadius: 4,
                            padding: '8px 12px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#d0d4e8' }}>
                              {drop.source}
                            </div>
                            {drop.rotation && (
                              <div style={{ fontSize: 11, color: '#7a809c' }}>
                                Rotation {drop.rotation}
                              </div>
                            )}
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#8ec48e' }}>
                            {typeof drop.chance === 'number' ? `${(drop.chance * 100).toFixed(2)}%` : drop.chance}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Arcane Synergies & Recommendations */}
                {arcaneSynergies.length > 0 && (
                  <div style={{ borderTop: '1px solid #202434', paddingTop: 14 }}>
                    <span style={{ fontSize: 12, color: '#cc88ff', fontWeight: 600, display: 'block', marginBottom: 10 }}>
                      Recommended Warframe & Weapon Synergies:
                    </span>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
                      {arcaneSynergies.map((syn, sIdx) => (
                        <div
                          key={sIdx}
                          style={{
                            backgroundColor: '#141422',
                            border: '1px solid #24243c',
                            borderRadius: 6,
                            padding: '10px 12px',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <Link
                              to={`/item/${encodeURIComponent(syn.itemName)}`}
                              style={{ color: '#68d4ff', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}
                            >
                              {syn.itemName}
                            </Link>
                            <span style={{ fontSize: 10, color: '#cc88ff', backgroundColor: '#261836', padding: '1px 6px', borderRadius: 3 }}>
                              {syn.buildRole}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: 12, color: '#a0a8c0', lineHeight: 1.4 }}>
                            {syn.reason}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {itemGeneralInfo && (
              <section style={styles.sectionCard}>
                <h3 style={styles.sectionSubTitle}>General Information</h3>
                <div style={styles.infoBox}>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Type</span>
                    <span style={styles.infoVal}>{itemGeneralInfo.type}</span>
                  </div>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Mastery Requirement</span>
                    <span style={{ ...styles.infoVal, color: '#8ec4c4', fontWeight: 600 }}>
                      Rank {itemGeneralInfo.masteryReq}
                    </span>
                  </div>
                  {itemGeneralInfo.polarity && (
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Polarity</span>
                      <span style={styles.infoVal}>{itemGeneralInfo.polarity}</span>
                    </div>
                  )}
                  {itemGeneralInfo.trigger && (
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Trigger</span>
                      <span style={styles.infoVal}>{itemGeneralInfo.trigger}</span>
                    </div>
                  )}
                  {itemGeneralInfo.ammoType && (
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Ammo Type</span>
                      <span style={styles.infoVal}>{itemGeneralInfo.ammoType}</span>
                    </div>
                  )}
                  {itemGeneralInfo.rivenDisposition && (
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Riven Disposition</span>
                      <span style={styles.infoVal}>{itemGeneralInfo.rivenDisposition}</span>
                    </div>
                  )}
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Introduced</span>
                    <span style={styles.infoVal}>{itemGeneralInfo.introduced}</span>
                  </div>
                  {itemGeneralInfo.vendorSources && (
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Vendor / Acquisition</span>
                      <span style={{ ...styles.infoVal, color: '#d8c474' }}>
                        {itemGeneralInfo.vendorSources}
                      </span>
                    </div>
                  )}
                  {itemGeneralInfo.officialDropSourceUrl && (
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Official Drop Tables</span>
                      <a
                        href={itemGeneralInfo.officialDropSourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.dropTablesLink}
                      >
                        Official Drop Tables &#8599;
                      </a>
                    </div>
                  )}
                </div>
              </section>
            )}

            <section style={styles.sectionCard}>
              <h2 style={styles.sectionTitle}>Personal Notes</h2>
              <p style={styles.notesHelp}>
                Private notes for this item. Saved locally in your browser.
              </p>
              <textarea
                rows={5}
                placeholder="Write notes (e.g. Radshare squad recruited, need 2 more argon crystals before 00:00 UTC)..."
                value={personalNote}
                onChange={(e) => setPersonalNote(e.target.value)}
                onBlur={handleSaveNote}
                style={styles.notesTextarea}
              />
              <div style={styles.notesActions}>
                <button onClick={handleSaveNote} style={styles.saveNoteBtn}>
                  {noteSaved ? 'Saved!' : 'Save Note'}
                </button>
              </div>
            </section>

            {resourceGuide && (
              <section style={styles.sectionCard}>
                <h3 style={styles.sectionSubTitle}>Planetary Availability</h3>
                <ul style={styles.planetList}>
                  {resourceGuide.planets.map((planet) => (
                    <li key={planet} style={styles.planetItem}>
                      &#8226; {planet}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '16px 18px 60px 18px',
    maxWidth: 1040,
    margin: '0 auto',
  },
  breadcrumbNav: {
    marginBottom: 16,
  },
  backLink: {
    color: '#8a8aa8',
    textDecoration: 'none',
    fontSize: 13,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 16,
    paddingBottom: 20,
    borderBottom: '1px solid #1c1c28',
    marginBottom: 24,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  headerInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: 700,
    color: '#eaeaf0',
    margin: 0,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    fontSize: 11,
    padding: '3px 8px',
    background: '#1c1c2c',
    color: '#9090b8',
    borderRadius: 4,
  },
  wikiLink: {
    fontSize: 12,
    color: '#6e8ec4',
    textDecoration: 'none',
  },
  targetWidget: {
    display: 'flex',
    alignItems: 'center',
  },
  targetControls: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  targetButton: {
    padding: '8px 14px',
    border: '1px solid',
    borderRadius: 4,
    fontSize: 13,
    cursor: 'pointer',
    fontWeight: 500,
  },
  qtyBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  qtyLabel: {
    fontSize: 12,
    color: '#8a8aa0',
  },
  qtyInput: {
    width: 60,
    padding: '6px 8px',
    background: '#14141c',
    border: '1px solid #282838',
    borderRadius: 4,
    color: '#e0e0e8',
    fontSize: 13,
    textAlign: 'center',
  },
  statusNotice: {
    color: '#8a8aa0',
    fontSize: 14,
  },
  errorNotice: {
    color: '#c48a8a',
    fontSize: 14,
    marginBottom: 12,
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 300px',
    gap: 24,
  },
  mainColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  sideColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  sectionCard: {
    background: '#12121a',
    border: '1px solid #1e1e2c',
    borderRadius: 6,
    padding: 20,
  },
  componentParentCard: {
    background: '#141420',
    border: '1px solid #2a2a3e',
    borderLeft: '4px solid #ffd700',
    borderRadius: 6,
    padding: 16,
  },
  componentParentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 12,
  },
  componentBadge: {
    fontSize: 11,
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: 4,
    background: '#2d2218',
    color: '#ffd700',
    border: '1px solid #5c4820',
  },
  parentItemLink: {
    fontSize: 14,
    fontWeight: 700,
    color: '#ffd700',
    textDecoration: 'none',
  },
  baseVariantLink: {
    fontSize: 12,
    fontWeight: 600,
    color: '#77aaff',
    textDecoration: 'none',
    padding: '4px 10px',
    background: '#162030',
    border: '1px solid #204060',
    borderRadius: 4,
  },
  siblingStrip: {
    marginTop: 14,
    paddingTop: 12,
    borderTop: '1px solid #242436',
  },
  siblingStripLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: '#9098b8',
    display: 'block',
    marginBottom: 8,
  },
  siblingList: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  siblingChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '5px 10px',
    background: '#161622',
    border: '1px solid #262638',
    borderRadius: 4,
    color: '#d0d4e8',
    fontSize: 12,
    textDecoration: 'none',
    fontWeight: 500,
  },
  siblingChipActive: {
    background: '#2a2216',
    borderColor: '#785420',
    color: '#ffd700',
    fontWeight: 700,
  },
  viewingIndicator: {
    fontSize: 11,
    color: '#e0a860',
    fontWeight: 700,
  },
  parentPartsOverviewCard: {
    background: '#12121c',
    border: '1px solid #222238',
    borderRadius: 6,
    padding: 16,
  },
  parentPartsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  parentPartsBadge: {
    fontSize: 11,
    fontWeight: 700,
    padding: '2px 7px',
    borderRadius: 3,
    background: '#1c2838',
    color: '#68d4ff',
    border: '1px solid #28446c',
  },
  parentPartsTitle: {
    fontSize: 13,
    color: '#c0c8e0',
    fontWeight: 600,
  },
partPageLink: {
    fontSize: 11.5,
    fontWeight: 600,
    color: '#8ec4f4',
    textDecoration: 'none',
    padding: '4px 8px',
    background: '#1c2438',
    borderRadius: 4,
    border: '1px solid #2a3654',
    transition: 'background 0.2s',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#dcdce8',
    marginBottom: 14,
  },
  sectionSubTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#c4c4d4',
    marginBottom: 8,
  },
  itemImage: {
    maxHeight: 140,
    maxWidth: 200,
    objectFit: 'contain',
    borderRadius: 4,
    marginBottom: 12,
    background: '#181824',
    padding: 8,
  },
  extractText: {
    fontSize: 13,
    lineHeight: 1.6,
    color: '#a0a0b8',
    margin: 0,
  },
  mechanicCallout: {
    marginTop: 14,
    padding: '10px 14px',
    background: '#1e1c22',
    borderLeft: '3px solid #b89a64',
    borderRadius: 3,
    fontSize: 12,
    color: '#d0c4aa',
    lineHeight: 1.4,
  },
  nodeList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  nodeCard: {
    background: '#161622',
    border: '1px solid #202030',
    borderRadius: 4,
    padding: 12,
  },
  nodeCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  nodeName: {
    fontSize: 14,
    fontWeight: 600,
    color: '#e0e0ec',
  },
  nodePlanet: {
    fontSize: 13,
    color: '#8a8aa0',
  },
  missionTypeBadge: {
    marginLeft: 8,
    fontSize: 11,
    padding: '2px 6px',
    background: '#222232',
    borderRadius: 3,
    color: '#9090b0',
  },
  efficiencyBadge: {
    fontSize: 11,
    fontWeight: 600,
  },
  dropRateBadge: {
    fontSize: 11,
    color: '#8ec48e',
    fontWeight: 500,
  },
  strategyText: {
    fontSize: 12,
    color: '#8a8aa4',
    margin: 0,
    lineHeight: 1.4,
  },
  framesTipBox: {
    marginTop: 16,
    padding: '10px 12px',
    background: '#161622',
    borderRadius: 4,
    fontSize: 12,
  },
  framesTipTitle: {
    color: '#c0c0d4',
    marginRight: 6,
  },
  framesList: {
    color: '#8e9ec4',
  },
  notesHelp: {
    fontSize: 12,
    color: '#7a7a90',
    marginBottom: 10,
    lineHeight: 1.3,
  },
  notesTextarea: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '10px',
    background: '#161622',
    border: '1px solid #262638',
    borderRadius: 4,
    color: '#d0d0dc',
    fontSize: 12,
    lineHeight: 1.4,
    resize: 'vertical',
    outline: 'none',
  },
  notesActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  saveNoteBtn: {
    padding: '5px 12px',
    background: '#202030',
    border: '1px solid #2e2e44',
    borderRadius: 3,
    color: '#b0b0c8',
    fontSize: 12,
    cursor: 'pointer',
  },
  planetList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  planetItem: {
    fontSize: 12,
    color: '#8a8aa4',
    padding: '3px 0',
  },
  lootSummaryBox: {
    background: '#161622',
    borderRadius: 4,
    padding: 12,
    marginBottom: 14,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  lootInfoRow: {
    display: 'flex',
    alignItems: 'center',
    fontSize: 13,
    gap: 8,
  },
  lootInfoLabel: {
    color: '#84849a',
    minWidth: 140,
  },
  lootInfoValue: {
    color: '#e0e0ec',
    fontWeight: 600,
  },
  lootGeneralText: {
    fontSize: 12,
    color: '#9a9ab0',
    margin: '6px 0 0 0',
    lineHeight: 1.4,
  },
  componentsTable: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  componentsHeader: {
    fontSize: 12,
    fontWeight: 600,
    color: '#b0b0c4',
    marginBottom: 4,
  },
  componentRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#161622',
    border: '1px solid #202030',
    borderRadius: 4,
    padding: '8px 12px',
    fontSize: 12,
  },
  componentName: {
    fontWeight: 500,
    color: '#e4e4ee',
  },
  componentRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  componentSource: {
    color: '#8a8aa0',
  },
  componentChance: {
    color: '#8ec48e',
    fontWeight: 600,
  },
  blockTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: '#c0c0d8',
    display: 'block',
    marginBottom: 6,
  },
  solutionList: {
    paddingLeft: 20,
    margin: 0,
    fontSize: 12,
    color: '#9090a8',
    lineHeight: 1.6,
  },
  acquisitionCard: {
    background: '#141420',
    border: '1px solid #28283e',
    borderLeft: '4px solid #8eb4e4',
    borderRadius: 6,
    padding: 16,
    marginBottom: 20,
  },
  acquisitionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  acquisitionBadge: {
    fontSize: 11,
    padding: '2px 8px',
    background: '#222b3a',
    color: '#8ec4f4',
    borderRadius: 3,
    fontWeight: 600,
    textTransform: 'uppercase',
  },
  vendorStoreTag: {
    fontSize: 12,
    color: '#8a8aa4',
  },
  acquisitionSentence: {
    fontSize: 14,
    color: '#e4e4f0',
    lineHeight: 1.5,
    margin: '0 0 6px 0',
  },
  standingHighlight: {
    color: '#90d490',
    fontWeight: 600,
  },
  vendorNotes: {
    fontSize: 12,
    color: '#8e8ea4',
    margin: 0,
    lineHeight: 1.4,
  },
  vendorMetaRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 16,
    fontSize: 12,
    color: '#9a9ab0',
    marginTop: 6,
  },
  rankTableWrapper: {
    overflowX: 'auto',
  },
  rankTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 12,
    textAlign: 'left',
  },
  rankTh: {
    padding: '8px 10px',
    borderBottom: '1px solid #242436',
    color: '#8c8ca4',
    fontWeight: 600,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  rankTd: {
    padding: '8px 10px',
    borderBottom: '1px solid #1a1a26',
    color: '#dcdce8',
  },
  rankBadge: {
    display: 'inline-block',
    minWidth: 22,
    textAlign: 'center',
    padding: '2px 6px',
    background: '#1a1a28',
    borderRadius: 3,
    fontWeight: 600,
    color: '#c0c0d8',
  },
  costBadge: {
    display: 'inline-block',
    padding: '2px 6px',
    background: '#182418',
    color: '#8ec48e',
    borderRadius: 3,
    fontWeight: 600,
  },
  statTd: {
    padding: '8px 10px',
    borderBottom: '1px solid #1a1a26',
    color: '#8ec4c4',
    fontWeight: 500,
  },
  effectTd: {
    padding: '8px 10px',
    borderBottom: '1px solid #1a1a26',
    color: '#a0a0b8',
    lineHeight: 1.4,
  },
  maxRankRow: {
    background: '#161626',
  },
  infoBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '4px 0',
    borderBottom: '1px solid #181824',
    fontSize: 12,
  },
  infoLabel: {
    color: '#828298',
  },
  infoVal: {
    color: '#dcdce6',
    fontWeight: 500,
    textAlign: 'right',
  },
  dropTablesLink: {
    color: '#6e8ec4',
    textDecoration: 'none',
    fontSize: 12,
  },
  craftCostText: {
    fontSize: 12,
    color: '#8a8aa4',
  },
  cookTimeBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: '#1c1c2c',
    padding: '4px 10px',
    borderRadius: 4,
    border: '1px solid #2a2a3e',
  },
  cookTimeIcon: {
    fontSize: 13,
  },
  cookTimeLabel: {
    fontSize: 11,
    color: '#8a8aa0',
  },
  cookTimeValue: {
    fontSize: 12,
    fontWeight: 700,
    color: '#90d490',
  },
  ingredientsBlock: {
    marginTop: 12,
    marginBottom: 16,
  },
  ingredientsTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: '#b0b0c4',
    display: 'block',
    marginBottom: 8,
  },
  ingredientsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  componentRecipesSection: {
    marginTop: 14,
  },
  componentsHeading: {
    fontSize: 12,
    fontWeight: 600,
    color: '#b0b0c4',
    display: 'block',
    marginBottom: 8,
  },
  componentRecipesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  compRecipeBox: {
    background: '#161622',
    border: '1px solid #202030',
    borderRadius: 4,
    padding: 10,
  },
  compRecipeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  compRecipeName: {
    fontSize: 13,
    fontWeight: 600,
    color: '#e0e0ec',
  },
  compRecipeMeta: {
    fontSize: 11,
    color: '#8a8aa0',
  },
  statsSummaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
    gap: 8,
    marginTop: 10,
  },
  statsSummaryCard: {
    background: '#161622',
    border: '1px solid #202032',
    borderRadius: 4,
    padding: '8px 10px',
  },
  statsSummaryLabel: {
    fontSize: 10,
    color: '#8888a2',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: 2,
  },
  statsSummaryVal: {
    fontSize: 13,
    fontWeight: 600,
    color: '#e0e0ee',
  },
  damageModesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginTop: 6,
  },
  damageModeBox: {
    background: '#161622',
    border: '1px solid #202032',
    borderRadius: 4,
    padding: 10,
  },
  damageModeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  damageModeTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: '#d0d0e4',
  },
  damageModeTotal: {
    fontSize: 12,
    fontWeight: 700,
    color: '#90d490',
  },
  damageTypesRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  damageTypeChip: {
    background: '#1b1b2a',
    border: '1px solid #28283c',
    borderRadius: 3,
    padding: '3px 8px',
    display: 'flex',
    gap: 6,
    fontSize: 11,
  },
  damageTypeLabel: {
    color: '#9090a8',
  },
  damageTypeValue: {
    color: '#e0e0ee',
    fontWeight: 600,
  },
  augmentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginTop: 6,
  },
  augmentCard: {
    background: '#161622',
    border: '1px solid #202032',
    borderRadius: 4,
    padding: 10,
  },
  augmentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  augmentLink: {
    fontSize: 13,
    fontWeight: 600,
    color: '#8ec4f4',
    textDecoration: 'none',
  },
  augmentSource: {
    fontSize: 11,
    color: '#8888a0',
  },
  augmentEffect: {
    fontSize: 12,
    color: '#c0c0d4',
    margin: 0,
    lineHeight: 1.4,
  },
  variantsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginTop: 6,
  },
  variantCard: {
    background: '#161622',
    border: '1px solid #202032',
    borderRadius: 4,
    padding: 10,
  },
  variantName: {
    fontSize: 13,
    fontWeight: 600,
    color: '#e0e0ee',
    display: 'block',
    marginBottom: 2,
  },
  variantAcq: {
    fontSize: 12,
    color: '#9090a8',
    margin: '0 0 4px 0',
    lineHeight: 1.4,
  },
  variantBonus: {
    fontSize: 11,
    color: '#90d490',
    margin: 0,
  },
  abilitiesList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 12,
    marginTop: 10,
  },
  abilityCard: {
    background: '#161622',
    border: '1px solid #202032',
    borderRadius: 4,
    padding: 12,
  },
  abilityHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  abilityIndexBadge: {
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    background: '#1f2538',
    color: '#8ec4f4',
    padding: '2px 6px',
    borderRadius: 3,
    border: '1px solid #2c3650',
  },
  abilityName: {
    fontSize: 14,
    fontWeight: 700,
    color: '#e0e0ee',
  },
  abilityDescription: {
    fontSize: 12,
    color: '#a0a0b8',
    lineHeight: 1.5,
    margin: 0,
  },
  enemyDropsTableWrapper: {
    overflowX: 'auto',
    marginTop: 8,
  },
  enemyDropsTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 12.5,
    textAlign: 'left',
  },
  enemyDropsTh: {
    padding: '8px 10px',
    borderBottom: '1px solid #242436',
    color: '#8c8ca4',
    fontWeight: 600,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  enemyDropRow: {
    borderBottom: '1px solid #1a1a26',
  },
  enemyDropNameCell: {
    padding: '10px 10px',
    color: '#e4e4ee',
    fontWeight: 500,
  },
  enemyNameText: {
    color: '#e0e4f4',
    fontWeight: 500,
  },
  enemyDropStatCell: {
    padding: '10px 10px',
    color: '#c0c8e0',
  },
  enemyDropRateCell: {
    padding: '10px 10px',
  },
  expectedRateBadge: {
    display: 'inline-block',
    padding: '2px 7px',
    borderRadius: 3,
    fontSize: 11.5,
    fontWeight: 600,
    backgroundColor: '#00e67618',
    border: '1px solid #00e67644',
    color: '#00e676',
  },
  enemyDropRarityCell: {
    padding: '10px 10px',
  },
  incarnonCard: {
    background: '#161224',
    border: '1px solid #3d2b56',
    borderLeft: '4px solid #b877f0',
    borderRadius: 6,
    padding: 20,
  },
  incarnonHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottom: '1px solid #281e3a',
  },
  incarnonBadge: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.5px',
    padding: '4px 10px',
    background: '#321c4e',
    color: '#e4b8ff',
    borderRadius: 4,
    border: '1px solid #58338a',
  },
  incarnonCircuitBadge: {
    fontSize: 12,
    fontWeight: 600,
    padding: '4px 10px',
    background: '#1b2238',
    color: '#8ec5fc',
    borderRadius: 4,
    border: '1px solid #2c3e6b',
  },
  incarnonRequirementsBox: {
    marginBottom: 18,
    padding: '14px 16px',
    background: '#100c1c',
    borderRadius: 6,
    border: '1px solid #2d1e44',
  },
  incarnonReqHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  incarnonReqTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: '#eed8ff',
  },
  incarnonReqSub: {
    fontSize: 11.5,
    color: '#a090b8',
  },
  incarnonMetaRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 16,
    fontSize: 13,
    color: '#c4b8dc',
    marginBottom: 14,
    padding: '8px 12px',
    background: '#1c162e',
    borderRadius: 4,
  },
  incarnonOverviewBox: {
    marginBottom: 18,
    padding: '12px 14px',
    background: '#120e20',
    borderRadius: 4,
    borderLeft: '3px solid #7c4dff',
  },
  incarnonOverviewTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: '#d4b8ff',
    marginBottom: 6,
  },
  incarnonOverviewText: {
    margin: '0 0 8px 0',
    fontSize: 12.5,
    lineHeight: 1.55,
    color: '#d0c4e8',
  },
  incarnonEvolutionsHeader: {
    fontSize: 15,
    fontWeight: 700,
    color: '#eed8ff',
    margin: '18px 0 12px 0',
  },
  incarnonTierCard: {
    background: '#110d1f',
    border: '1px solid #2a1c3d',
    borderRadius: 6,
    padding: 14,
    marginBottom: 12,
  },
  incarnonTierTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
    paddingBottom: 8,
    borderBottom: '1px solid #201433',
  },
  incarnonTierName: {
    fontSize: 13.5,
    fontWeight: 700,
    color: '#f0e0ff',
  },
  incarnonChallengeBadge: {
    fontSize: 11.5,
    padding: '3px 8px',
    background: '#241a38',
    color: '#c4b0e8',
    borderRadius: 3,
    border: '1px solid #3c2a5c',
  },
  incarnonPerksGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: 10,
  },
  incarnonPerkBox: {
    background: '#171228',
    border: '1px solid #2e1e48',
    borderRadius: 4,
    padding: 10,
  },
  incarnonPerkName: {
    fontSize: 13,
    fontWeight: 600,
    color: '#ffd580',
    marginBottom: 4,
  },
  incarnonPerkDesc: {
    fontSize: 12,
    lineHeight: 1.5,
    color: '#e2d8f0',
    margin: 0,
    whiteSpace: 'pre-line',
  },
  incarnonPerkNotes: {
    fontSize: 11,
    lineHeight: 1.4,
    color: '#a898c0',
    marginTop: 6,
    paddingTop: 6,
    borderTop: '1px dashed #2c1e44',
  },
  variantComparisonCard: {
    background: '#131520',
    border: '1px solid #23273c',
    borderLeft: '4px solid #7c4dff',
    borderRadius: 6,
    padding: 20,
    marginBottom: 20,
  },
  variantHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 14,
    borderBottom: '1px solid #1f2334',
  },
  variantBadge: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.6px',
    padding: '3px 8px',
    background: '#281c4a',
    color: '#d6b8ff',
    borderRadius: 4,
    border: '1px solid #4a2d80',
  },
  variantFamilyText: {
    fontSize: 13,
    color: '#a8acc8',
  },
  variantSubtitle: {
    fontSize: 13,
    color: '#8e94b2',
    margin: 0,
    lineHeight: 1.4,
  },
  openVariantBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 14px',
    background: '#1e2436',
    border: '1px solid #3d4a6a',
    borderRadius: 4,
    color: '#70b4ff',
    fontSize: 12.5,
    fontWeight: 600,
    textDecoration: 'none',
    minHeight: 36,
  },
  variantTabsRow: {
    marginBottom: 16,
  },
  variantTabsLabel: {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: '#8e94b2',
    marginBottom: 8,
  },
  variantTabsList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  variantTabBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '7px 12px',
    background: '#181a26',
    border: '1px solid #282c40',
    borderRadius: 4,
    color: '#c0c4dc',
    fontSize: 12.5,
    cursor: 'pointer',
    minHeight: 34,
  },
  variantTabBtnSelected: {
    background: '#252b42',
    borderColor: '#546b9e',
    color: '#f0f4ff',
    boxShadow: '0 0 0 1px #546b9e',
  },
  variantTabBtnCurrent: {
    background: '#161e18',
    borderColor: '#24482c',
    color: '#8ec492',
    cursor: 'default',
    opacity: 0.85,
  },
  variantTypeTag: {
    fontSize: 10,
    fontWeight: 700,
    padding: '2px 5px',
    background: '#10121a',
    borderRadius: 3,
    color: '#8e94b2',
    textTransform: 'uppercase',
  },
  variantNameText: {
    fontWeight: 600,
  },
  currentIndicator: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#78a87c',
  },
  comparisonTableWrapper: {
    overflowX: 'auto',
    borderRadius: 4,
    border: '1px solid #202436',
  },
  comparisonTable: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: 13,
  },
  compTh: {
    padding: '10px 14px',
    background: '#151724',
    color: '#8e94b2',
    fontWeight: 600,
    fontSize: 12,
    borderBottom: '1px solid #23273a',
  },
  compThCurrent: {
    padding: '10px 14px',
    background: '#161b24',
    borderBottom: '1px solid #23273a',
  },
  compThCounterpart: {
    padding: '10px 14px',
    background: '#1a1828',
    borderBottom: '1px solid #23273a',
  },
  compThDelta: {
    padding: '10px 14px',
    background: '#151724',
    color: '#8e94b2',
    fontWeight: 600,
    fontSize: 12,
    borderBottom: '1px solid #23273a',
  },
  compThSub: {
    display: 'block',
    fontSize: 10.5,
    fontWeight: 600,
    textTransform: 'uppercase',
    color: '#888ca8',
    letterSpacing: '0.4px',
  },
  compThTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: '#f0f0f8',
    marginTop: 2,
  },
  compTr: {
    borderBottom: '1px solid #1c1f2e',
  },
  compTdLabel: {
    padding: '10px 14px',
    fontWeight: 600,
    color: '#d0d4e8',
    background: '#12141f',
  },
  compTdCurrent: {
    padding: '10px 14px',
    color: '#e4e6f4',
    background: '#141624',
  },
  compTdCounterpart: {
    padding: '10px 14px',
    color: '#e4e6f4',
    background: '#171626',
    fontWeight: 600,
  },
  compTdDelta: {
    padding: '10px 14px',
    background: '#12141f',
  },
  deltaBadge: {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: 3,
    fontSize: 11.5,
    fontWeight: 600,
    border: '1px solid',
  },
  primeRelicsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
primeRelicPartGroup: {
    background: '#101218',
    border: '1px solid #1f2334',
    borderRadius: 8,
    overflow: 'hidden',
    transition: 'border-color 0.2s ease',
  },
  primeRelicPartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottom: '1px solid #1a1e2c',
  },
primeRelicPartTitle: {
    fontSize: 14.5,
    fontWeight: 700,
    color: '#f4f4fa',
    letterSpacing: '0.3px',
  },
  primeRelicPartCount: {
    fontSize: 12,
    color: '#8e94b2',
    fontWeight: 600,
  },
relicBadgesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: 12,
    padding: '16px',
    backgroundColor: '#0d0f16',
  },
primeRelicCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    background: '#151722',
    border: '1px solid #202436',
    borderRadius: 6,
    padding: '12px 14px',
    transition: 'opacity 0.2s ease',
  },
  primeRelicCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eraChip: {
    display: 'inline-block',
    padding: '2px 7px',
    borderRadius: 3,
    fontSize: 11.5,
    fontWeight: 700,
    letterSpacing: '0.3px',
  },
primeRelicChancesRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    marginTop: 2,
    borderTop: '1px solid #1f2334',
  },
relicChanceText: {
    fontSize: 11.5,
    color: '#8e94b2',
  },
  variantToggleBtn: {
    padding: '8px 14px',
    background: '#281c4a',
    border: '1px solid #5a3899',
    borderRadius: 4,
    color: '#d6b8ff',
    fontSize: 12.5,
    fontWeight: 600,
    cursor: 'pointer',
    minHeight: 36,
  },
primeRelicAccordionHeaderBtn: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 16px',
    cursor: 'pointer',
    textAlign: 'left',
    color: 'inherit',
    border: 'none',
    outline: 'none',
    transition: 'background-color 0.15s ease',
  },
highestDropBadge: {
    fontSize: 11,
    fontWeight: 600,
    padding: '3px 8px',
    borderRadius: 4,
    backgroundColor: '#142a1a',
    color: '#7ae08a',
    border: '1px solid #23582e',
  },
unvaultedCountBadge: {
    fontSize: 11,
    fontWeight: 600,
    padding: '3px 8px',
    borderRadius: 4,
    backgroundColor: '#1b2234',
    color: '#90caf9',
    border: '1px solid #2e3e60',
  },
accordionToggleWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: '50%',
    backgroundColor: '#1c2032',
  },
  accordionToggleArrow: {
    fontSize: 12,
    color: '#8e94b2',
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  notFoundContainer: {
    padding: '28px 24px',
    background: '#12141f',
    border: '1px solid #23273c',
    borderRadius: 8,
    marginTop: 12,
  },
  notFoundHeader: {
    marginBottom: 20,
  },
  notFoundTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: '#f0f0f8',
    margin: '0 0 8px 0',
  },
  notFoundSub: {
    fontSize: 14,
    color: '#9a9eb8',
    margin: 0,
    lineHeight: 1.5,
  },
  suggestionsSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTop: '1px solid #1c2032',
  },
  suggestionsTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: '#ffd700',
    margin: '0 0 14px 0',
  },
  suggestionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: 12,
  },
  suggestionCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 14px',
    background: '#161826',
    border: '1px solid #242940',
    borderRadius: 6,
    textDecoration: 'none',
    transition: 'all 0.15s ease',
  },
  suggestionDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    overflow: 'hidden',
  },
  suggestionName: {
    fontSize: 13.5,
    fontWeight: 600,
    color: '#e4e6f4',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  suggestionCategory: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  suggestionBadge: {
    fontSize: 10.5,
    fontWeight: 700,
    padding: '1px 5px',
    borderRadius: 3,
    background: '#22283c',
    color: '#90caf9',
  },
  suggestionSubtype: {
    fontSize: 11,
    color: '#8e94b2',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  primarySearchLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    background: '#24324c',
    border: '1px solid #3c5482',
    borderRadius: 4,
    color: '#8ec4f4',
    fontSize: 13,
    fontWeight: 600,
    textDecoration: 'none',
  },
  secondarySearchLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    background: '#181b28',
    border: '1px solid #282e44',
    borderRadius: 4,
    color: '#a0a4c0',
    fontSize: 13,
    fontWeight: 600,
    textDecoration: 'none',
  },
};


