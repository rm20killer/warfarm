import React from 'react';
import { Link } from 'react-router-dom';
import { PrimeComponentRelicDrop } from '../../../shared/data/relic-database';
import { LootSourceItem } from '../../../shared/data/loot-sources';
import { EnemyDropEntry } from '../../../shared/data/item-database';
import { SpecialChallengeGuide } from '../../../shared/data/special-mechanics';
import {
  IncarnonGenesisDetails,
  ItemVendorAcquisition,
  getIncarnonGenesisWeek,
} from '../../../shared/data/vendor-sources';
import { ResourceFarmingGuide } from '../../../shared/data/resource-guide';
import { ItemComponentInfo, resolveComponentFullName } from '../../../shared/data/item-components';
import { ResourceFarmTooltip } from '../ResourceFarmTooltip';
import { detailStyles as styles, getRarityBadgeStyle } from './itemDetailStyles';

interface AcquisitionDropViewProps {
  itemName: string;
  primeRelicDrops: Record<string, PrimeComponentRelicDrop[]>;
  openRelicAccordions: Record<string, boolean>;
  componentInfo?: ItemComponentInfo;
  lootSource?: LootSourceItem;
  vendorAcquisition?: ItemVendorAcquisition;
  incarnonGenesis?: IncarnonGenesisDetails;
  enemyDrops: EnemyDropEntry[];
  specialChallenge?: SpecialChallengeGuide;
  resourceGuide?: ResourceFarmingGuide;
  onToggleRelicAccordion: (partName: string) => void;
}

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

export function AcquisitionDropView({
  itemName,
  primeRelicDrops,
  openRelicAccordions,
  componentInfo,
  lootSource,
  vendorAcquisition,
  incarnonGenesis,
  enemyDrops,
  specialChallenge,
  resourceGuide,
  onToggleRelicAccordion,
}: AcquisitionDropViewProps) {
  const hasPrimeRelicDrops = Object.keys(primeRelicDrops).length > 0;

  return (
    <>
      {vendorAcquisition && !vendorAcquisition.itemName.includes('(Incarnon Genesis)') && (
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
              <strong style={{ color: '#68d4ff', fontSize: 12.5, display: 'block', marginBottom: 4 }}>Rotation &amp; Acquisition Details:</strong>
              <p style={{ margin: 0, fontSize: 13, color: '#c0c8e0', lineHeight: 1.5 }}>
                {vendorAcquisition.notes}
              </p>
            </div>
          )}
        </section>
      )}

      {resourceGuide?.acquisition && (
        <section style={styles.sectionCard}>
          <h2 style={styles.sectionTitle}>Acquisition &amp; Strategy</h2>
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

      {hasPrimeRelicDrops && (
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
                    onClick={() => onToggleRelicAccordion(partName)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onToggleRelicAccordion(partName);
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

      {lootSource && (lootSource.bossOrEnemyName || lootSource.locationNode || (!hasPrimeRelicDrops && !componentInfo)) && (
        <section style={styles.sectionCard}>
          <h2 style={styles.sectionTitle}>Acquisition &amp; Loot Drops</h2>
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
            {lootSource.generalDropInfo && !hasPrimeRelicDrops && !componentInfo && (
              <p style={styles.lootGeneralText}>{lootSource.generalDropInfo}</p>
            )}
          </div>

          {!hasPrimeRelicDrops && !componentInfo && lootSource.components && lootSource.components.length > 0 && (
            <div style={styles.componentsTable}>
              <span style={styles.componentsHeader}>Component Blueprints &amp; Parts:</span>
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
            <span><strong>Prerequisites:</strong> The Duviri Paradox, Angels of the Zariman &amp; Steel Path</span>
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
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#eed8ff', margin: '0 0 6px 0' }}>Acquisition &amp; Prerequisites</h3>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: '#d0c4e8' }}>
                {incarnonGenesis.acquisition}
              </p>
            </div>
          )}

          {incarnonGenesis.overview && (
            <div style={styles.incarnonOverviewBox}>
              <div style={styles.incarnonOverviewTitle}>Incarnon Transmutation &amp; Form Overview:</div>
              {incarnonGenesis.overview.split('\n').map((p, idx) => (
                <p key={idx} style={styles.incarnonOverviewText}>{p}</p>
              ))}
            </div>
          )}

          {incarnonGenesis.evolutions.length > 0 && (
            <div>
              <h3 style={styles.incarnonEvolutionsHeader}>Evolution Tiers &amp; Perks</h3>
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
    </>
  );
}
