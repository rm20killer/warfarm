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
  DetailedModData,
} from '../../shared/data/mod-database';
import {
  getItemVendorAcquisition,
  ItemVendorAcquisition,
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
} from '../../shared/data/item-database';
import {
  getRelicDropsForPrimeItem,
  getRelicById,
  RelicEntry,
  RelicRefinement,
  PrimeComponentRelicDrop,
} from '../../shared/data/relic-database';
import { RecommendedBuild, getRecommendedBuildsForItem } from '../../shared/data/recommended-builds';
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
import { getWeaponLineage } from './GearDirectoryPage';
import { findSimilarItems, SimilarItemSuggestion } from '../../shared/utils/fuzzy-search';
import { usePageMeta } from '../../shared/utils/usePageMeta';
import {
  parseItemComponent,
  getParentItemComponents,
  ItemComponentInfo,
  SiblingComponent,
} from '../../shared/data/item-components';

import {
  detailStyles as styles,
  ItemHeaderView,
  ItemNotFoundView,
  ComponentDetailView,
  ItemWikiSummaryView,
  VariantComparisonView,
  FoundryRecipeView,
  RelicDetailView,
  WeaponDetailView,
  WarframeDetailView,
  ModStatsProgressionView,
  ModGeneralInfoView,
  ModVendorAcquisitionView,
  ArcaneDetailView,
  AcquisitionDropView,
  CommunityBuildsView,
  ItemGeneralInfoAsideView,
} from '../components/item-detail';

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
  const [, setParentComponents] = useState<SiblingComponent[]>([]);
  const [similarItems, setSimilarItems] = useState<SimilarItemSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [personalNote, setPersonalNote] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);
  const [target, setTarget] = useState<PersonalTarget | undefined>(undefined);
  const [targetQty, setTargetQty] = useState(1);
  const [previousPage, setPreviousPage] = useState<PageVisitHistory | undefined>(undefined);

  const pageTitle = itemName ? `${itemName} - Codex, Drops & Stats` : 'Item Codex Details';
  const pageDescription =
    article?.extract?.slice(0, 160) ||
    resourceGuide?.description?.slice(0, 160) ||
    (itemName
      ? `Warframe codex guide, drop tables, crafting recipes, and stats for ${itemName}.`
      : 'Warframe item codex and farming guide.');

  usePageMeta({
    title: pageTitle,
    description: pageDescription,
    keywords: itemName
      ? `${itemName}, warframe ${itemName}, warframe drops, farming guide, ${itemGeneralInfo?.type || resourceGuide?.category || 'codex'}`
      : undefined,
    canonicalPath: itemName ? `/item/${encodeURIComponent(itemName)}` : '/item',
  });

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

  const handleToggleRelicAccordion = (partName: string) => {
    setOpenRelicAccordions((prev) => ({ ...prev, [partName]: !prev[partName] }));
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
      <ItemHeaderView
        itemName={itemName}
        article={article}
        resourceGuide={resourceGuide}
        arcaneData={arcaneData}
        detailedMod={detailedMod}
        relicData={relicData}
        relicMatch={relicMatch}
        warframeStats={warframeStats}
        weaponStats={weaponStats}
        componentInfo={componentInfo}
        weaponLineage={weaponLineage}
        specialChallenge={specialChallenge}
        itemGeneralInfo={itemGeneralInfo}
        target={target}
        targetQty={targetQty}
        previousPage={previousPage}
        onToggleTarget={handleToggleTarget}
        onUpdateQty={handleUpdateQty}
      />

      {isLoading ? (
        <p style={styles.statusNotice}>Loading wiki information...</p>
      ) : !hasAnyData ? (
        <ItemNotFoundView itemName={itemName} similarItems={similarItems} />
      ) : (
        <div style={styles.contentGrid}>
          <div style={styles.mainColumn}>
            {componentInfo && (
              <ComponentDetailView componentInfo={componentInfo} />
            )}
            
            <ItemWikiSummaryView
              itemName={itemName}
              article={article}
              resourceGuide={resourceGuide}
            />

            <VariantComparisonView
              variantComparison={variantComparison}
              isVariantCompOpen={isVariantCompOpen}
              onToggleOpen={() => setIsVariantCompOpen(!isVariantCompOpen)}
              onSelectVariant={handleSelectVariant}
            />

            <FoundryRecipeView
              craftingRecipe={craftingRecipe}
              itemName={itemName}
              parentItemName={componentInfo?.parentItemName}
            />

            {relicData && (
              <RelicDetailView
                relicData={relicData}
                selectedRelicRefinement={selectedRelicRefinement}
                relicSpots={relicSpots}
                onSelectRefinement={setSelectedRelicRefinement}
              />
            )}

            <WeaponDetailView
              weaponStats={weaponStats}
              weaponExtras={weaponExtras}
            />

            {warframeStats && (
              <WarframeDetailView warframeStats={warframeStats} />
            )}

            {detailedMod && (
              <ModStatsProgressionView detailedMod={detailedMod} />
            )}

            <AcquisitionDropView
              itemName={itemName}
              primeRelicDrops={primeRelicDrops}
              openRelicAccordions={openRelicAccordions}
              componentInfo={componentInfo}
              lootSource={lootSource}
              vendorAcquisition={vendorAcquisition}
              incarnonGenesis={incarnonGenesis}
              enemyDrops={enemyDrops}
              specialChallenge={specialChallenge}
              resourceGuide={resourceGuide}
              onToggleRelicAccordion={handleToggleRelicAccordion}
            />

            <CommunityBuildsView
              itemName={itemName}
              recommendedBuilds={recommendedBuilds}
              selectedBuildIndex={selectedBuildIndex}
              isCombatItem={Boolean(warframeStats || weaponStats)}
              onSelectBuildIndex={setSelectedBuildIndex}
            />
          </div>

          <aside style={styles.sideColumn}>
            {detailedMod && (
              <>
                <ModVendorAcquisitionView detailedMod={detailedMod} />
                <ModGeneralInfoView detailedMod={detailedMod} />
              </>
            )}

            {arcaneData && (
              <ArcaneDetailView
                arcaneData={arcaneData}
                selectedArcaneRank={selectedArcaneRank}
                arcaneSynergies={arcaneSynergies}
                onSelectRank={setSelectedArcaneRank}
              />
            )}

            <ItemGeneralInfoAsideView
              itemGeneralInfo={itemGeneralInfo}
              personalNote={personalNote}
              noteSaved={noteSaved}
              resourceGuide={resourceGuide}
              onChangeNote={setPersonalNote}
              onSaveNote={handleSaveNote}
            />
          </aside>
        </div>
      )}
    </div>
  );
}
