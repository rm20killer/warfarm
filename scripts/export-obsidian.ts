import fs from 'fs';
import path from 'path';
import { getAllMods, calculateModEndoToMax, calculateModCreditsToMax, calculateTradingTax, generateModRankStats } from '../src/shared/data/mod-database';
import { getAllWarframes, getAllWeapons } from '../src/shared/data/loot-sources';
import { getAllResourceGuides } from '../src/shared/data/resource-guide';
import { PLANETS_DATA } from '../src/shared/data/planet-missions';
import allResourcesJson from '../src/shared/data/generated/all-resources.json';
import allWeaponsJson from '../src/shared/data/generated/all-weapons.json';
import allWarframesJson from '../src/shared/data/generated/all-warframes.json';
import allModsJson from '../src/shared/data/generated/all-mods.json';
import warframeRecipesJson from '../src/shared/data/generated/warframe-recipes.json';
import foundryRecipesJson from '../src/shared/data/generated/foundry-recipes.json';
import allGearJson from '../src/shared/data/generated/all-gear.json';
import syncMetaJson from '../src/shared/data/generated/sync-meta.json';
import { ALL_BOSSES, ALL_VENDORS } from '../src/shared/data/vendor-boss-data';
import { getRecommendedBuildsForItem } from '../src/shared/data/recommended-builds';
import { getAllArcanes } from '../src/shared/data/arcanes';

function sanitizeFilename(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, '-').trim();
}

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function downloadImages(imageNames: string[], attachmentsDir: string): Promise<number> {
  const uniqueImages = Array.from(new Set(imageNames.filter(Boolean)));
  const toDownload = uniqueImages.filter((img) => !fs.existsSync(path.join(attachmentsDir, img)));
  if (toDownload.length === 0) return 0;

  console.log(`Downloading ${toDownload.length} image assets to Attachments/...`);
  const concurrency = 25;
  let downloaded = 0;

  for (let i = 0; i < toDownload.length; i += concurrency) {
    const chunk = toDownload.slice(i, i + concurrency);
    await Promise.all(
      chunk.map(async (img) => {
        try {
          const url = `https://raw.githubusercontent.com/WFCD/warframe-items/master/data/img/${encodeURIComponent(img)}`;
          const res = await fetch(url);
          if (res.ok) {
            const buffer = Buffer.from(await res.arrayBuffer());
            fs.writeFileSync(path.join(attachmentsDir, img), buffer);
            downloaded++;
          }
        } catch {
          // Ignore network errors on individual asset
        }
      })
    );
  }
  return downloaded;
}

const STAT_KEYWORDS: Record<string, { tag: string; hubName: string; label: string }> = {
  puncture: { tag: 'puncture', hubName: 'Puncture Mods', label: 'Puncture' },
  slash: { tag: 'slash', hubName: 'Slash Mods', label: 'Slash' },
  impact: { tag: 'impact', hubName: 'Impact Mods', label: 'Impact' },
  heat: { tag: 'heat', hubName: 'Heat Mods', label: 'Heat' },
  cold: { tag: 'cold', hubName: 'Cold Mods', label: 'Cold' },
  electricity: { tag: 'electricity', hubName: 'Electricity Mods', label: 'Electricity' },
  toxin: { tag: 'toxin', hubName: 'Toxin Mods', label: 'Toxin' },
  viral: { tag: 'viral', hubName: 'Viral Mods', label: 'Viral' },
  corrosive: { tag: 'corrosive', hubName: 'Corrosive Mods', label: 'Corrosive' },
  radiation: { tag: 'radiation', hubName: 'Radiation Mods', label: 'Radiation' },
  magnetic: { tag: 'magnetic', hubName: 'Magnetic Mods', label: 'Magnetic' },
  blast: { tag: 'blast', hubName: 'Blast Mods', label: 'Blast' },
  critical: { tag: 'critical', hubName: 'Critical Mods', label: 'Critical' },
  status: { tag: 'status', hubName: 'Status Mods', label: 'Status' },
  multishot: { tag: 'multishot', hubName: 'Multishot Mods', label: 'Multishot' },
};

export function detectModStats(modText: string): Array<{ tag: string; hubName: string; label: string }> {
  const lower = modText.toLowerCase();
  const matched: Array<{ tag: string; hubName: string; label: string }> = [];

  for (const [key, info] of Object.entries(STAT_KEYWORDS)) {
    if (key === 'critical') {
      if (lower.includes('critical chance') || lower.includes('critical damage') || lower.includes('critical multiplier')) {
        matched.push(info);
      }
    } else if (key === 'status') {
      if (lower.includes('status chance') || lower.includes('status duration') || lower.includes('status effect')) {
        matched.push(info);
      }
    } else {
      const regex = new RegExp(`\\b${key}\\b`, 'i');
      if (regex.test(lower)) {
        matched.push(info);
      }
    }
  }

  return matched;
}

export async function exportToObsidian(vaultPath?: string): Promise<{
  vaultDir: string;
  notesCount: number;
}> {
  const targetDir = vaultPath || process.argv[2] || process.env.OBSIDIAN_VAULT_PATH || path.resolve(process.cwd(), 'warframe-obsidian-vault');
  ensureDir(targetDir);

  const attachmentsDir = path.join(targetDir, 'Attachments');
  ensureDir(attachmentsDir);

function ensureObsidianVaultSetup(targetDir: string): void {
  const dotObsidian = path.join(targetDir, '.obsidian');
  ensureDir(dotObsidian);

  // 1. app.json
  fs.writeFileSync(
    path.join(dotObsidian, 'app.json'),
    JSON.stringify(
      {
        useMarkdownLinks: false,
        newFileLocation: 'root',
        attachmentFolderPath: 'Attachments',
        showFrontmatter: true,
      },
      null,
      2
    )
  );

  // 2. graph.json with enhanced color groups
  const graphPath = path.join(dotObsidian, 'graph.json');
  const graphConfig = {
    "collapse-filter": false,
    "search": "",
    "showTags": false,
    "showAttachments": false,
    "hideUnresolved": true,
    "showOrphans": true,
    "collapse-color-groups": false,
    "colorGroups": [
      { "query": "file:\"Hub & Dashboard\"", "color": { "a": 1, "rgb": 16777215 } },
      { "query": "tag:#warframe/type/prime_warframe", "color": { "a": 1, "rgb": 16106818 } },
      { "query": "path:Warframes", "color": { "a": 1, "rgb": 3900150 } },
      { "query": "path:Weapons/Primary", "color": { "a": 1, "rgb": 16347926 } },
      { "query": "path:Weapons/Secondary", "color": { "a": 1, "rgb": 440020 } },
      { "query": "path:Weapons/Melee", "color": { "a": 1, "rgb": 15680580 } },
      { "query": "tag:#warframe/mod/rarity/legendary", "color": { "a": 1, "rgb": 16007006 } },
      { "query": "path:Mods", "color": { "a": 1, "rgb": 11032055 } },
      { "query": "tag:#warframe/resource/rare", "color": { "a": 1, "rgb": 15381256 } },
      { "query": "path:Resources", "color": { "a": 1, "rgb": 1096065 } },
      { "query": "path:Gear", "color": { "a": 1, "rgb": 15638570 } },
      { "query": "path:Bosses", "color": { "a": 1, "rgb": 15680580 } },
      { "query": "path:Vendors", "color": { "a": 1, "rgb": 15485081 } },
      { "query": "path:Arcanes", "color": { "a": 1, "rgb": 16766720 } },
      { "query": "path:\"Planets & Missions\"", "color": { "a": 1, "rgb": 6514417 } }
    ],
    "collapse-display": false,
    "showArrow": true,
    "textFadeMultiplier": 0,
    "nodeSizeMultiplier": 1.15,
    "lineSizeMultiplier": 1.2,
    "collapse-forces": false,
    "centerStrength": 0.42,
    "repelStrength": 14.5,
    "linkStrength": 0.65,
    "linkDistance": 160,
    "scale": 0.23,
    "close": false
  };
  fs.writeFileSync(graphPath, JSON.stringify(graphConfig, null, 2));

  // 3. appearance.json & snippets
  const appearancePath = path.join(dotObsidian, 'appearance.json');
  let appearance: any = {};
  if (fs.existsSync(appearancePath)) {
    try { appearance = JSON.parse(fs.readFileSync(appearancePath, 'utf-8')); } catch {}
  }
  appearance.enabledCssSnippets = Array.from(new Set([...(appearance.enabledCssSnippets || []), 'warframe-theme']));
  appearance.baseFontSize = 16;
  fs.writeFileSync(appearancePath, JSON.stringify(appearance, null, 2));

  // 4. community-plugins.json
  const communityPluginsPath = path.join(dotObsidian, 'community-plugins.json');
  let enabledPlugins: string[] = ['dataview', 'obsidian-sortable', 'obsidian-hover-editor', 'omnisearch', 'obsidian-style-settings'];
  if (fs.existsSync(communityPluginsPath)) {
    try {
      const existing = JSON.parse(fs.readFileSync(communityPluginsPath, 'utf-8'));
      if (Array.isArray(existing)) {
        enabledPlugins = Array.from(new Set([...existing, ...enabledPlugins]));
      }
    } catch {}
  }
  fs.writeFileSync(communityPluginsPath, JSON.stringify(enabledPlugins, null, 2));
}

  ensureObsidianVaultSetup(targetDir);

  // Collect image assets to download
  const imageSet = new Set<string>();
  for (const w of allWarframesJson) if (w.imageName) imageSet.add(w.imageName);
  for (const w of allWeaponsJson) if (w.imageName) imageSet.add(w.imageName);
  for (const r of allResourcesJson) if (r.imageName) imageSet.add(r.imageName);
  for (const m of allModsJson) if (m.imageName) imageSet.add(m.imageName);
  for (const g of allGearJson) if (g.imageName) imageSet.add(g.imageName);

  await downloadImages(Array.from(imageSet), attachmentsDir);

  let count = 0;

  // 1. Resources Directory (Export ALL 241 resources from Codex)
  const resourcesDir = path.join(targetDir, 'Resources');
  ensureDir(resourcesDir);

  const allGuides = getAllResourceGuides();
  const guideMap = new Map<string, (typeof allGuides)[0]>();
  for (const g of allGuides) {
    guideMap.set(g.name.toLowerCase(), g);
    guideMap.set(g.id, g);
  }

  const categorizedResources: Record<string, typeof allResourcesJson> = {
    Rare: [],
    Planetary: [],
    'Mining & Gems': [],
    'Open World': [],
    Research: [],
    Other: [],
  };

  for (const r of allResourcesJson) {
    const filename = `${sanitizeFilename(r.name)}.md`;
    const guide = guideMap.get(r.name.toLowerCase()) || guideMap.get(r.id);

    let classification = 'Planetary';
    const descLower = (r.description || '').toLowerCase();
    const typeLower = (r.type || '').toLowerCase();
    const nameLower = r.name.toLowerCase();

    if (guide?.category === 'Rare' || ['argon crystal', 'tellurium', 'orokin cell', 'morphics', 'neural sensors', 'neurodes', 'gallium', 'control module'].includes(nameLower)) {
      classification = 'Rare';
    } else if (typeLower.includes('gem') || descLower.includes('ore') || descLower.includes('gem') || descLower.includes('mineral') || descLower.includes('refined')) {
      classification = 'Mining & Gems';
    } else if (descLower.includes('plains of eidolon') || descLower.includes('orb vallis') || descLower.includes('cambion drift') || descLower.includes('duviri') || descLower.includes('debt-bond') || descLower.includes('fish') || descLower.includes('token')) {
      classification = 'Open World';
    } else if (descLower.includes('clan') || descLower.includes('research') || ['fieldron', 'mutagen mass', 'detonite injector', 'mutagen sample', 'detonite ampule', 'fieldron sample'].includes(nameLower)) {
      classification = 'Research';
    } else if (['alloy plate', 'circuits', 'ferrite', 'nano spores', 'plastids', 'polymer bundle', 'rubedo', 'salvage', 'cryotic', 'oxium'].includes(nameLower)) {
      classification = 'Planetary';
    } else {
      classification = 'Other';
    }

    categorizedResources[classification].push(r);

    const imageEmbed = r.imageName && fs.existsSync(path.join(attachmentsDir, r.imageName))
      ? `![[${r.imageName}|140]]\n`
      : '';

    const planetsList = guide?.planets && guide.planets.length > 0 ? guide.planets : (r as any).planets || [];

    const frontmatter = [
      '---',
      `title: "${r.name}"`,
      'type: "Resource"',
      `classification: "${classification}"`,
      guide?.category ? `rarity: "${guide.category}"` : '',
      planetsList.length > 0 ? `planets: [${planetsList.map((p: string) => `"${p}"`).join(', ')}]` : '',
      r.imageName ? `image: "[[${r.imageName}]]"` : '',
      'tags:',
      '  - warframe/resource',
      `  - warframe/resource/${classification.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      '---',
      '',
    ].filter(Boolean).join('\n');

    let optimalNodesMd = '';
    let squadMd = '';

    if (guide && guide.optimalNodes.length > 0) {
      optimalNodesMd = [
        '## Optimal Farming Locations',
        ...guide.optimalNodes.map((node) => {
          return `### [[${node.planet} - ${node.node}]] ([[${node.planet}]])\n* **Mission Type**: ${node.missionType}\n* **Efficiency Rating**: **${node.efficiencyRating}**\n* **Strategy**: ${node.strategyNote}\n`;
        }),
        '',
      ].join('\n');

      if (guide.recommendedFrames && guide.recommendedFrames.length > 0) {
        squadMd = [
          '## Recommended Squad Warframes',
          ...guide.recommendedFrames.map((f) => `* [[${f}]]`),
          '',
        ].join('\n');
      }
    }

    const acquisitionText = guide?.acquisition || (r as any).acquisitionText;
    const acquisitionMd = acquisitionText
      ? `## Acquisition\n${acquisitionText}\n`
      : '';

    const dataviewUsageMd = [
      '## Blueprints & Crafting Usage',
      'Items in your knowledge base that require this resource for construction:',
      '```dataview',
      'TABLE type, slot, subclass',
      `FROM [[${r.name}]]`,
      'SORT file.name ASC',
      '```',
      '',
    ].join('\n');

    const content = [
      frontmatter,
      imageEmbed,
      `# ${r.name}`,
      '',
      `> [!summary] Classification: **${classification}**${planetsList.length > 0 ? ` | Planetary Drops: ${planetsList.map((p: string) => `[[${p}]]`).join(', ')}` : ''}`,
      '',
      `## Overview\n${r.description || 'Warframe crafting component.'}\n`,
      guide?.specialMechanics ? `> [!tip] Special Mechanics\n> ${guide.specialMechanics}\n` : '',
      acquisitionMd,
      optimalNodesMd,
      squadMd,
      dataviewUsageMd,
      '## External Reference',
      `* [Official Warframe Wiki](https://wiki.warframe.com/w/${encodeURIComponent(r.name.replace(/ /g, '_'))})`,
      '',
    ].filter(Boolean).join('\n');

    fs.writeFileSync(path.join(resourcesDir, filename), content, 'utf-8');
    count++;
  }

  // 2. Warframes Directory (With local image embeds)
  const warframesDir = path.join(targetDir, 'Warframes');
  ensureDir(warframesDir);

  const allWarframes = getAllWarframes();
  const warframeImageMap = new Map<string, string>();
  for (const w of allWarframesJson) {
    if (w.imageName) warframeImageMap.set(w.name.toLowerCase(), w.imageName);
  }

  for (const wf of allWarframes) {
    const filename = `${sanitizeFilename(wf.name)}.md`;
    const tagSubType = wf.subType?.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'standard';
    const rawWf = allWarframesJson.find((x) => x.name.toLowerCase() === wf.name.toLowerCase());
    const imageName = warframeImageMap.get(wf.name.toLowerCase());
    const imageEmbed = imageName && fs.existsSync(path.join(attachmentsDir, imageName))
      ? `![[${imageName}|200]]\n`
      : '';

    const frontmatter = [
      '---',
      `title: "${wf.name}"`,
      'type: "Warframe"',
      `sub_type: "${wf.subType || 'Warframe'}"`,
      `acquisition: "${wf.acquisitionType}"`,
      rawWf?.masteryReq !== undefined ? `mastery_rank: ${rawWf.masteryReq}` : '',
      rawWf?.health !== undefined ? `health: ${rawWf.health}` : '',
      rawWf?.shield !== undefined ? `shield: ${rawWf.shield}` : '',
      rawWf?.armor !== undefined ? `armor: ${rawWf.armor}` : '',
      imageName ? `image: "[[${imageName}]]"` : '',
      'tags:',
      '  - warframe/frame',
      `  - warframe/type/${tagSubType}`,
      '---',
      '',
    ].filter(Boolean).join('\n');

    const baseStatsMd = rawWf
      ? [
          '## Base Attributes',
          '| Health | Shield | Armor | Energy (Power) | Sprint Speed | Required MR | Polarities | Aura |',
          '| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |',
          `| **${rawWf.health || 100}** | **${rawWf.shield || 100}** | **${rawWf.armor || 100}** | **${rawWf.power || 100}** | ${rawWf.sprintSpeed || 1.0} | MR ${rawWf.masteryReq || 0} | ${rawWf.polarities?.length ? rawWf.polarities.join(', ') : 'None'} | ${rawWf.aura || 'None'} |`,
          '',
        ].join('\n')
      : '';

    const passiveMd = rawWf?.passiveDescription
      ? `## Passive Ability\n> [!tip] ${rawWf.passiveDescription}\n\n`
      : '';

    const abilitiesMd = rawWf?.abilities && rawWf.abilities.length > 0
      ? [
          '## Abilities',
          ...rawWf.abilities.map((a: any, idx: number) => {
            return `### Ability ${idx + 1}: ${a.name}\n${a.description}\n`;
          }),
          '',
        ].join('\n')
      : '';

    const encounterLink = wf.bossOrEnemyName ? `[[${wf.bossOrEnemyName}]]` : undefined;
    const locationLink = wf.locationNode && wf.planet ? `[[${wf.planet} - ${wf.locationNode}]]` : wf.planet ? `[[${wf.planet}]]` : undefined;

    let foundryCraftingMd = '';
    const normalizedWf = wf.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    const directFoundryRecipe = (foundryRecipesJson as Record<string, any>)[normalizedWf] || (foundryRecipesJson as Record<string, any>)[wf.name.toLowerCase()];
    const wfRecipe = (warframeRecipesJson as Record<string, any>)[wf.name.toLowerCase()];

    if (directFoundryRecipe && directFoundryRecipe.componentRecipes && directFoundryRecipe.componentRecipes.length > 0) {
      const subpartSections = directFoundryRecipe.componentRecipes.map((p: any) => {
        const ingredientsList = (p.ingredients || [])
          .map((ing: any) => `* **[[${ing.name}]]**: ${Number(ing.count).toLocaleString()}`)
          .join('\n');
        return `### ${p.itemName}\n* **Build Time**: ${p.buildTimeText || '12 hours'}\n* **Build Credits**: \`${Number(p.buildPriceCredits || 15000).toLocaleString()} Credits\`\n\n**Required Resources**:\n${ingredientsList}\n`;
      });

      const totalResources: Record<string, number> = {};
      for (const ing of directFoundryRecipe.ingredients || []) {
        if (!ing.isComponent) {
          totalResources[ing.name] = (totalResources[ing.name] || 0) + Number(ing.count || 1);
        }
      }
      for (const comp of directFoundryRecipe.componentRecipes) {
        for (const ing of comp.ingredients || []) {
          totalResources[ing.name] = (totalResources[ing.name] || 0) + Number(ing.count || 1);
        }
      }

      const totalResList = Object.entries(totalResources)
        .map(([resName, count]) => `| [[${resName}]] | **${count.toLocaleString()}** |`)
        .join('\n');

      const totalTable = totalResList
        ? `### Cumulative Crafting Materials\n| Resource | Total Required |\n| :--- | :---: |\n${totalResList}\n`
        : '';

      foundryCraftingMd = [
        '## Foundry Crafting Requirements',
        `> [!info] Main Blueprint: **${directFoundryRecipe.buildTimeText || '72 hours'}** build time | \`${Number(directFoundryRecipe.buildPriceCredits || 25000).toLocaleString()} Credits\` | Requires completed Neuroptics, Chassis, and Systems.`,
        '',
        totalTable,
        ...subpartSections,
      ].join('\n');
    } else if (wfRecipe) {
      const subparts = [
        { label: 'Neuroptics', data: wfRecipe.neuroptics },
        { label: 'Chassis', data: wfRecipe.chassis },
        { label: 'Systems', data: wfRecipe.systems },
      ].filter((p) => p.data && p.data.ingredients && p.data.ingredients.length > 0);

      const subpartSections = subparts.map((p) => {
        const ingredientsList = p.data.ingredients
          .map((ing: any) => `* **[[${ing.name}]]**: ${ing.count.toLocaleString()}`)
          .join('\n');
        return `### ${wf.name} ${p.label}\n* **Build Time**: ${p.data.buildTime}\n* **Build Credits**: \`${p.data.buildPrice.toLocaleString()} Credits\`\n\n**Required Resources**:\n${ingredientsList}\n`;
      });

      const totalResList = Object.entries(wfRecipe.totalResources || {})
        .map(([resName, count]) => `| [[${resName}]] | **${(count as number).toLocaleString()}** |`)
        .join('\n');

      const totalTable = totalResList
        ? `### Cumulative Crafting Materials\n| Resource | Total Required |\n| :--- | :---: |\n${totalResList}\n`
        : '';

      if (subparts.length > 0 || totalResList) {
        foundryCraftingMd = [
          '## Foundry Crafting Requirements',
          '> [!info] Main Blueprint: **72 hours** build time | `25,000 Credits` | Requires completed Neuroptics, Chassis, and Systems.',
          '',
          totalTable,
          ...subpartSections,
        ].join('\n');
      }
    }

    const componentsMd = wf.components && wf.components.length > 0
      ? [
          '## Blueprints & Component Drops',
          '| Component | Source / Location | Drop Chance |',
          '| :--- | :--- | :--- |',
          ...wf.components.map((c) => {
            const cleanSource = c.sourceText.replace(/\(([^)]+)\)/g, '([[$1]])');
            return `| **${c.partName}** | ${cleanSource} | ${c.dropChance !== undefined ? `${c.dropChance}%` : '-'} |`;
          }),
          '',
        ].join('\n')
      : '';

    const builds = getRecommendedBuildsForItem(wf.name, 'Warframe');
    let recommendedBuildsMd = '';
    if (builds.length > 0) {
      const buildSections = builds.map((b) => {
        const auraText = b.auraOrStance ? `* **Aura / Stance**: **[[${b.auraOrStance}]]**\n` : '';
        const exilusText = b.exilus ? `* **Exilus**: **[[${b.exilus}]]**\n` : '';
        const modsList = b.mods.map((m) => `* Slot ${m.slot + 1}: **[[${m.modName}]]**${m.drain ? ` (${m.drain} Drain)` : ''}`).join('\n');
        const arcanesText = b.arcanes && b.arcanes.length > 0 ? `* **Recommended Arcanes**: ${b.arcanes.join(', ')}\n` : '';
        const shardsText = b.archonShards && b.archonShards.length > 0 ? `* **Archon Shards**: ${b.archonShards.join(', ')}\n` : '';
        const helminthText = b.helminth ? `* **Helminth**: **${b.helminth.ability}** replacing *${b.helminth.replacedAbility}* (${b.helminth.description})\n` : '';

        return `### ${b.title} (${b.archetype})\n> [!summary] Author: ${b.author} | Archetype: **${b.archetype}**\n\n${b.description}\n\n**Playstyle Strategy**:\n> [!tip] ${b.playstyle}\n\n**Mod Configuration**:\n${auraText}${exilusText}${modsList}\n\n**Endgame Enhancements**:\n${arcanesText}${shardsText}${helminthText}\n**Community Links**:\n* [RE:FRAMED Community Builds](${b.externalLinks?.reframedUrl})\n* [Reddit /r/Warframe Discussions](${b.externalLinks?.redditUrl})\n* [TikTok Builds & Clips](${b.externalLinks?.tiktokUrl})\n* [Overframe Community](${b.externalLinks?.overframeUrl})\n`;
      });

      recommendedBuildsMd = [
        '## Recommended Community Builds',
        ...buildSections,
      ].join('\n');
    }

    const content = [
      frontmatter,
      imageEmbed,
      `# ${wf.name}`,
      '',
      `> [!summary] Classification: **${wf.subType || 'Warframe'}** | Acquisition: **${wf.acquisitionType}**`,
      encounterLink ? `> Encounter: ${encounterLink}` : '',
      locationLink ? `> Location: ${locationLink}` : '',
      '',
      `## Overview\n${wf.description}\n`,
      baseStatsMd,
      passiveMd,
      abilitiesMd,
      wf.generalDropInfo ? `> [!note]\n> ${wf.generalDropInfo}\n` : '',
      foundryCraftingMd,
      componentsMd,
      recommendedBuildsMd,
      '## External Reference',
      `* [Official Warframe Wiki](https://wiki.warframe.com/w/${encodeURIComponent(wf.name.replace(/ /g, '_'))})`,
      '* [Official DE Drop Tables](https://www.warframe.com/droptables)',
      '',
    ].filter(Boolean).join('\n');

    fs.writeFileSync(path.join(warframesDir, filename), content, 'utf-8');
    count++;
  }

  // 3. Weapons Directory (Split into specific subclasses and subfolders)
  const weaponsBaseDir = path.join(targetDir, 'Weapons');
  ensureDir(weaponsBaseDir);

  const weaponDetailsMap = new Map<string, (typeof allWeaponsJson)[0]>();
  for (const w of allWeaponsJson) {
    weaponDetailsMap.set(w.name.toLowerCase(), w);
  }

  const allWeapons = getAllWeapons();
  const weaponsBySubclass: Record<string, string[]> = {};

  for (const wp of allWeapons) {
    const rawDetails = weaponDetailsMap.get(wp.name.toLowerCase());
    const slot = rawDetails?.slot || (wp.subType?.includes('Secondary') ? 'Secondary' : wp.subType?.includes('Melee') ? 'Melee' : 'Primary');
    const subclass = rawDetails?.subclass || (slot === 'Primary' ? 'Rifle' : slot === 'Secondary' ? 'Pistol' : 'Sword');

    const subclassDir = path.join(weaponsBaseDir, slot, sanitizeFilename(subclass));
    ensureDir(subclassDir);

    const subKey = `${slot} - ${subclass}`;
    if (!weaponsBySubclass[subKey]) weaponsBySubclass[subKey] = [];
    weaponsBySubclass[subKey].push(wp.name);

    const filename = `${sanitizeFilename(wp.name)}.md`;
    const imageName = rawDetails?.imageName;
    const imageEmbed = imageName && fs.existsSync(path.join(attachmentsDir, imageName))
      ? `![[${imageName}|220]]\n`
      : '';

    const frontmatter = [
      '---',
      `title: "${wp.name}"`,
      'type: "Weapon"',
      `slot: "${slot}"`,
      `subclass: "${subclass}"`,
      rawDetails?.masteryReq !== undefined ? `mastery_rank: ${rawDetails.masteryReq}` : '',
      rawDetails?.trigger ? `trigger: "${rawDetails.trigger}"` : '',
      rawDetails?.critChance ? `crit_chance: "${rawDetails.critChance}"` : '',
      rawDetails?.critMultiplier ? `crit_multiplier: "${rawDetails.critMultiplier}"` : '',
      rawDetails?.statusChance ? `status_chance: "${rawDetails.statusChance}"` : '',
      rawDetails?.fireRate ? `fire_rate: "${rawDetails.fireRate}"` : '',
      imageName ? `image: "[[${imageName}]]"` : '',
      'tags:',
      '  - warframe/weapon',
      `  - warframe/weapon/${slot.toLowerCase()}`,
      `  - warframe/weapon/subclass/${subclass.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      '---',
      '',
    ].filter(Boolean).join('\n');

    const combatTable = rawDetails
      ? [
          '## Combat Specs',
          '| Mastery Rank | Trigger | Crit Chance | Crit Multiplier | Status Chance | Fire Rate | Magazine | Reload Time | Accuracy | Multishot | Riven Dispo |',
          '| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |',
          `| **MR ${rawDetails.masteryReq}** | ${rawDetails.trigger} | ${rawDetails.critChance} | ${rawDetails.critMultiplier} | ${rawDetails.statusChance} | ${rawDetails.fireRate} | ${rawDetails.magazineSize} rounds | ${rawDetails.reloadTime} | ${rawDetails.accuracy} | ${rawDetails.multishot || 1} | ${rawDetails.omegaAttenuation ? `${rawDetails.omegaAttenuation}x (${rawDetails.disposition || 3}/5)` : `${rawDetails.disposition || 3}/5`} |`,
          '',
        ].join('\n')
      : '';

    let attackModesMd = '';
    if (rawDetails?.attacks && rawDetails.attacks.length > 0) {
      const modeSections = rawDetails.attacks.map((atk: any) => {
        const dmgEntries = Object.entries(atk.damage || {});
        const dmgTable =
          dmgEntries.length > 0
            ? `| Damage Type | Value |\n| :--- | :---: |\n` +
              dmgEntries
                .map(([dt, val]) => `| **${dt.charAt(0).toUpperCase() + dt.slice(1)}** | ${val} |`)
                .join('\n')
            : '';
        return `### ${atk.name || 'Primary Fire'}\n* **Speed / Rate**: ${atk.speed || rawDetails.fireRate}\n* **Crit Chance**: ${atk.critChance || rawDetails.critChance}\n* **Crit Multiplier**: ${atk.critMultiplier || rawDetails.critMultiplier}\n* **Status Chance**: ${atk.statusChance || rawDetails.statusChance}\n${atk.shotType ? `* **Shot Type**: ${atk.shotType}\n` : ''}\n${dmgTable}\n`;
      });

      attackModesMd = ['## Firing & Attack Modes', ...modeSections, ''].join('\n');
    }

    const comps = rawDetails?.components || wp.components || [];
    const componentsMd = comps.length > 0
      ? [
          '## Foundry & Crafting Requirements',
          '| Component / Resource | Quantity | Source / Acquisition | Drop Chance |',
          '| :--- | :---: | :--- | :---: |',
          ...comps.map((c) => {
            const pName = c.partName || 'Component';
            const isBlueprint = pName.toLowerCase() === 'blueprint';
            const link = isBlueprint ? `**${wp.name} Blueprint**` : `**[[${pName}]]**`;
            const count = c.itemCount ? c.itemCount.toLocaleString() : '1';
            const cleanSource = (c.sourceText || '-').replace(/\(([^)]+)\)/g, '([[$1]])');
            return `| ${link} | ${count} | ${cleanSource} | ${c.dropChance !== undefined ? `${c.dropChance}%` : '-'} |`;
          }),
          '',
        ].join('\n')
      : '';

    const weaponBuilds = getRecommendedBuildsForItem(wp.name, slot);
    let weaponBuildsMd = '';
    if (weaponBuilds.length > 0) {
      const buildSections = weaponBuilds.map((b) => {
        const stanceText = b.auraOrStance ? `* **Stance**: **[[${b.auraOrStance}]]**\n` : '';
        const exilusText = b.exilus ? `* **Exilus**: **[[${b.exilus}]]**\n` : '';
        const modsList = b.mods.map((m) => `* Slot ${m.slot + 1}: **[[${m.modName}]]**${m.drain ? ` (${m.drain} Drain)` : ''}`).join('\n');
        const arcanesText = b.arcanes && b.arcanes.length > 0 ? `* **Recommended Arcanes**: ${b.arcanes.join(', ')}\n` : '';

        return `### ${b.title} (${b.archetype})\n> [!summary] Author: ${b.author} | Archetype: **${b.archetype}**\n\n${b.description}\n\n**Playstyle Strategy**:\n> [!tip] ${b.playstyle}\n\n**Mod Configuration**:\n${stanceText}${exilusText}${modsList}\n\n**Endgame Enhancements**:\n${arcanesText}\n**Community Links**:\n* [RE:FRAMED Builds](${b.externalLinks?.reframedUrl})\n* [Reddit /r/Warframe Discussions](${b.externalLinks?.redditUrl})\n* [TikTok Builds & Clips](${b.externalLinks?.tiktokUrl})\n* [Overframe Community](${b.externalLinks?.overframeUrl})\n`;
      });

      weaponBuildsMd = [
        '## Recommended Community Builds',
        ...buildSections,
      ].join('\n');
    }

    const content = [
      frontmatter,
      imageEmbed,
      `# ${wp.name}`,
      '',
      `> [!summary] Slot: **${slot}** | Subclass: **${subclass}**${rawDetails ? ` | Required Rank: **MR ${rawDetails.masteryReq}**` : ''}`,
      wp.bossOrEnemyName ? `> Source Enemy: [[${wp.bossOrEnemyName}]]` : '',
      '',
      `## Overview\n${wp.description}\n`,
      combatTable,
      attackModesMd,
      wp.generalDropInfo ? `> [!info]\n> ${wp.generalDropInfo}\n` : '',
      componentsMd,
      weaponBuildsMd,
      '## External Reference',
      `* [Official Warframe Wiki](https://wiki.warframe.com/w/${encodeURIComponent(wp.name.replace(/ /g, '_'))})`,
      '',
    ].filter(Boolean).join('\n');

    fs.writeFileSync(path.join(subclassDir, filename), content, 'utf-8');
    count++;
  }

  // 4. Mods Directory (With damage/stat detection, tagging, and stat hubs)
  const modsBaseDir = path.join(targetDir, 'Mods');
  ensureDir(modsBaseDir);
  const companionModDir = path.join(modsBaseDir, 'Companion');
  const warframeModDir = path.join(modsBaseDir, 'Warframe');
  const weaponModDir = path.join(modsBaseDir, 'Weapons');
  const auraModDir = path.join(modsBaseDir, 'Aura');
  const exilusModDir = path.join(modsBaseDir, 'Exilus');
  const statsHubDir = path.join(modsBaseDir, 'Stats');
  ensureDir(companionModDir);
  ensureDir(warframeModDir);
  ensureDir(weaponModDir);
  ensureDir(auraModDir);
  ensureDir(exilusModDir);
  ensureDir(statsHubDir);

  const modDetailsMap = new Map<string, (typeof allModsJson)[0]>();
  for (const m of allModsJson) {
    modDetailsMap.set(m.name.toLowerCase(), m);
  }

  const modsByStat: Record<string, string[]> = {};
  const allMods = getAllMods();

  for (const m of allMods) {
    const tLower = m.type.toLowerCase();
    let destDir = warframeModDir;
    let modCat = 'Warframe';

    if (tLower.includes('companion') || tLower.includes('beast') || tLower.includes('robotic')) {
      destDir = companionModDir;
      modCat = 'Companion';
    } else if (tLower.includes('aura')) {
      destDir = auraModDir;
      modCat = 'Aura';
    } else if (tLower.includes('exilus') || tLower.includes('drift')) {
      destDir = exilusModDir;
      modCat = 'Exilus';
    } else if (tLower.includes('shotgun') || tLower.includes('rifle') || tLower.includes('pistol') || tLower.includes('melee') || tLower.includes('primary') || tLower.includes('secondary')) {
      destDir = weaponModDir;
      modCat = 'Weapon';
    }

    const rawMod = modDetailsMap.get(m.name.toLowerCase());
    const fullText = `${m.name} ${m.description} ${rawMod?.levelStats?.join(' ') || ''}`;
    const detectedStats = detectModStats(fullText);

    for (const stat of detectedStats) {
      if (!modsByStat[stat.hubName]) modsByStat[stat.hubName] = [];
      modsByStat[stat.hubName].push(m.name);
    }

    const filename = `${sanitizeFilename(m.name)}.md`;
    const endoCost = calculateModEndoToMax(m.rarity, m.maxRank);
    const creditCost = calculateModCreditsToMax(m.rarity, m.maxRank);
    const tax = calculateTradingTax(m.rarity);

    const vendorWikilink = m.vendorSource ? `[[${m.vendorSource.vendorName}]]` : undefined;
    const locationWikilink = m.vendorSource ? `[[${m.vendorSource.location}]]` : undefined;
    const imageName = rawMod?.imageName;
    const imageEmbed = imageName && fs.existsSync(path.join(attachmentsDir, imageName))
      ? `![[${imageName}|180]]\n`
      : '';

    const statTags = detectedStats.map((s) => `  - warframe/mod/stat/${s.tag}`);
    const statLinks = detectedStats.map((s) => `[[${s.hubName}]]`).join(', ');

    const frontmatter = [
      '---',
      `title: "${m.name}"`,
      'type: "Mod"',
      `mod_category: "${modCat}"`,
      `polarity: "${m.polarity}"`,
      `rarity: "${m.rarity}"`,
      `max_rank: ${m.maxRank}`,
      `base_cost: ${m.baseCost}`,
      `drain_range: "${m.baseCost} to ${m.baseCost + m.maxRank}"`,
      `endo_to_max: ${endoCost}`,
      `credits_to_max: ${creditCost}`,
      `trading_tax: ${tax}`,
      vendorWikilink ? `vendor: "${vendorWikilink}"` : '',
      imageName ? `image: "[[${imageName}]]"` : '',
      'tags:',
      '  - warframe/mod',
      `  - warframe/mod/${modCat.toLowerCase()}`,
      `  - warframe/rarity/${m.rarity.toLowerCase()}`,
      `  - warframe/polarity/${m.polarity.toLowerCase()}`,
      ...statTags,
      '---',
      '',
    ].filter(Boolean).join('\n');

    let rankTableMd = '';
    try {
      const rankStats = generateModRankStats(m);
      if (rankStats.length > 0) {
        const statKeys = m.statLabels;
        rankTableMd = [
          '## Rank Progression',
          `| Rank | ${statKeys.join(' | ')} | Capacity Cost |`,
          `| :--- | ${statKeys.map(() => ':---').join(' | ')} | :--- |`,
          ...rankStats.map((rs) => {
            const vals = Object.values(rs.statValues);
            return `| **${rs.rank}** | ${vals.join(' | ')} | ${rs.cost} |`;
          }),
          '',
        ].join('\n');
      }
    } catch {
      // Fallback
    }

    const acquisitionMd = m.vendorSource
      ? [
          '## Acquisition',
          `The mod can be bought from **${vendorWikilink}** for **${m.vendorSource.standingCost}**${
            m.vendorSource.rankRequirement ? ` after reaching ${m.vendorSource.rankRequirement} with the [${m.vendorSource.factionOrSyndicate}]` : ''
          } at ${locationWikilink}.`,
          m.vendorSource.notes ? `\n> ${m.vendorSource.notes}\n` : '',
          '',
        ].join('\n')
      : '';

    const content = [
      frontmatter,
      imageEmbed,
      `# ${m.name}`,
      '',
      `> [!summary] Compatibility: **${m.type}** | Polarity: **${m.polarity}** | Rarity: **${m.rarity}** | Base Cost: **${m.baseCost}**`,
      statLinks ? `> Combat Stats: ${statLinks}` : '',
      '',
      '## General Information',
      `* **Max Rank**: ${m.maxRank}`,
      `* **Capacity Drain**: ${m.baseCost} (Rank 0) to ${m.baseCost + m.maxRank} (Rank ${m.maxRank})`,
      `* **Endo Required To Max**: \`${endoCost.toLocaleString()} Endo\``,
      `* **Credits Required To Max**: \`${creditCost.toLocaleString()} Credits\``,
      `* **Trading Tax**: \`${tax.toLocaleString()} Credits\``,
      `* **Introduced**: ${m.introduced}`,
      '',
      acquisitionMd,
      rankTableMd,
      '## External Reference',
      `* [Official Warframe Wiki](https://wiki.warframe.com/w/${encodeURIComponent(m.name.replace(/ /g, '_'))})`,
      m.officialDropSourceUrl ? `* [Official Drop Tables](${m.officialDropSourceUrl})` : '',
      '',
    ].filter(Boolean).join('\n');

    fs.writeFileSync(path.join(destDir, filename), content, 'utf-8');
    count++;
  }

  // Generate Stat Hub notes (e.g. Puncture Mods.md, Slash Mods.md, etc.)
  for (const [hubName, modNames] of Object.entries(modsByStat)) {
    const filename = `${sanitizeFilename(hubName)}.md`;
    const statKey = Object.values(STAT_KEYWORDS).find((s) => s.hubName === hubName)?.tag || 'stat';

    const hubContent = [
      '---',
      `title: "${hubName}"`,
      'type: "Stat Hub"',
      'tags:',
      '  - warframe/mod_hub',
      `  - warframe/mod/stat/${statKey}`,
      '---',
      '',
      `# ${hubName}`,
      '',
      `> [!summary] All mods that enhance or interact with **${hubName.replace(' Mods', '')}** (${modNames.length} mods).`,
      '',
      '## Interactive Dataview Query',
      '```dataview',
      'TABLE polarity, rarity, max_rank, drain_range',
      `FROM #warframe/mod/stat/${statKey}`,
      'SORT file.name ASC',
      '```',
      '',
      '## Complete Mods List',
      ...modNames.map((name) => `* [[${name}]]`),
      '',
    ].join('\n');

    fs.writeFileSync(path.join(statsHubDir, filename), hubContent, 'utf-8');
    count++;
  }

  // 5. Planets & Missions Directory
  const planetsDir = path.join(targetDir, 'Planets & Missions');
  ensureDir(planetsDir);

  for (const planet of PLANETS_DATA) {
    const planetFilename = `${sanitizeFilename(planet.name)}.md`;
    const planetContent = [
      '---',
      `title: "${planet.name}"`,
      'type: "Planet"',
      `faction: "${planet.faction}"`,
      planet.bossName ? `boss: "[[${planet.bossName}]]"` : '',
      planet.resourceDrops.length > 0 ? `resource_drops: [${planet.resourceDrops.map((r) => `"[[${r}]]"`).join(', ')}]` : '',
      'tags:',
      '  - warframe/planet',
      '---',
      '',
      `# ${planet.name}`,
      '',
      `> [!summary] Enemy Faction: **${planet.faction}**${planet.bossName ? ` | Assassination Target: [[${planet.bossName}]]` : ''}`,
      '',
      '## Planetary Resources',
      planet.resourceDrops.map((r) => `* [[${r}]]`).join('\n'),
      '',
      '## Mission Nodes',
      planet.missions.map((m) => `* [[${planet.name} - ${m.node}]] (${m.missionType} - Levels: ${m.levelRange})`).join('\n'),
      '',
    ].filter(Boolean).join('\n');
    fs.writeFileSync(path.join(planetsDir, planetFilename), planetContent, 'utf-8');
    count++;

    for (const m of planet.missions) {
      const nodeFilename = `${sanitizeFilename(`${planet.name} - ${m.node}`)}.md`;
      const rotationBlocks: string[] = [];
      if (m.rotationA && m.rotationA.length > 0) {
        rotationBlocks.push(`### Rotation A\n| Item / Reward | Drop Chance |\n| :--- | :--- |\n${m.rotationA.map((d) => `| [[${d.itemName}]] | ${d.chance}% |`).join('\n')}\n`);
      }
      if (m.rotationB && m.rotationB.length > 0) {
        rotationBlocks.push(`### Rotation B\n| Item / Reward | Drop Chance |\n| :--- | :--- |\n${m.rotationB.map((d) => `| [[${d.itemName}]] | ${d.chance}% |`).join('\n')}\n`);
      }
      if (m.rotationC && m.rotationC.length > 0) {
        rotationBlocks.push(`### Rotation C\n| Item / Reward | Drop Chance |\n| :--- | :--- |\n${m.rotationC.map((d) => `| [[${d.itemName}]] | ${d.chance}% |`).join('\n')}\n`);
      }
      const dropsMd = rotationBlocks.join('\n');

      const enemiesMd = m.spawnableEnemies && m.spawnableEnemies.length > 0
        ? [
            '## Spawnable Enemies & Drops',
            ...m.spawnableEnemies.map((e) => {
              const lootList = e.drops.map((d) => `[[${d.itemName}]] (${d.chanceText})`).join(', ');
              return `* **${e.name}** (${e.unitCategory}): Drops ${lootList}`;
            }),
            '',
          ].join('\n')
        : '';

      const planetResourcesMd = planet.resourceDrops && planet.resourceDrops.length > 0
        ? `## Planetary Resources\n${planet.resourceDrops.map((r) => `* [[${r}]]`).join('\n')}\n`
        : '';

      const nodeContent = [
        '---',
        `title: "${planet.name} - ${m.node}"`,
        'type: "Mission Node"',
        `planet: "[[${planet.name}]]"`,
        `node: "${m.node}"`,
        `mission_type: "${m.missionType}"`,
        planet.bossName && m.missionType === 'Assassination' ? `boss: "[[${planet.bossName}]]"` : '',
        'tags:',
        '  - warframe/mission',
        '---',
        '',
        `# ${m.node} (${planet.name})`,
        '',
        `> [!summary] Planet: [[${planet.name}]] | Mission: **${m.missionType}** | Levels: **${m.levelRange}**`,
        m.notes ? `> [!note]\n> ${m.notes}\n` : '',
        planet.bossName && m.missionType === 'Assassination' ? `> Assassination Target: [[${planet.bossName}]]\n` : '',
        dropsMd ? `## Mission Reward Rotations\n${dropsMd}` : '',
        enemiesMd,
        planetResourcesMd,
      ].filter(Boolean).join('\n');

      fs.writeFileSync(path.join(planetsDir, nodeFilename), nodeContent, 'utf-8');
      count++;
    }
  }

  // 6A. Bosses Directory
  const bossesDir = path.join(targetDir, 'Bosses');
  ensureDir(bossesDir);

  for (const boss of ALL_BOSSES) {
    const filename = `${sanitizeFilename(boss.name)}.md`;
    const tagType = boss.type.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const tagFaction = boss.faction.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const dropsList = boss.keyDrops.map((d) => `* **[[${d}]]**`).join('\n');

    const frontmatter = [
      '---',
      `title: "${boss.name}"`,
      'type: "Boss"',
      `boss_type: "${boss.type}"`,
      `faction: "${boss.faction}"`,
      `location: "${boss.location}"`,
      `planet: "${boss.planet}"`,
      'key_drops:',
      ...boss.keyDrops.map((d) => `  - "${d}"`),
      'tags:',
      '  - warframe/boss',
      `  - warframe/boss/${tagType}`,
      `  - warframe/faction/${tagFaction}`,
      '---',
      '',
    ].join('\n');

    const content = [
      frontmatter,
      `# ${boss.name}`,
      '',
      `> [!summary] Type: **${boss.type}** | Faction: **${boss.faction}** | Encounter: **${boss.location}**`,
      '',
      `## Overview\n${boss.description}\n`,
      `## Combat Tactics & Encounter Mechanics\n> [!tip] ${boss.tactics}\n`,
      `## Key Blueprint & Component Drops\n${dropsList}\n`,
      '## External Reference',
      `* [Official Warframe Wiki](https://wiki.warframe.com/w/${encodeURIComponent(boss.name.replace(/ /g, '_'))})`,
      '',
    ].join('\n');

    fs.writeFileSync(path.join(bossesDir, filename), content, 'utf-8');
    count++;
  }

  // 6B. Vendors Directory
  const vendorsDir = path.join(targetDir, 'Vendors');
  ensureDir(vendorsDir);

  for (const vendor of ALL_VENDORS) {
    const filename = `${sanitizeFilename(vendor.name)}.md`;
    const tagType = vendor.type.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const tagHub = vendor.hub.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const offeringsList = vendor.keyOfferings.map((o) => `* **[[${o}]]**`).join('\n');

    const frontmatter = [
      '---',
      `title: "${vendor.name}"`,
      'type: "Vendor"',
      `vendor_type: "${vendor.type}"`,
      `syndicate: "${vendor.syndicate}"`,
      `location: "${vendor.location}"`,
      `hub: "${vendor.hub}"`,
      `planet: "${vendor.planet}"`,
      'key_offerings:',
      ...vendor.keyOfferings.map((o) => `  - "${o}"`),
      'tags:',
      '  - warframe/vendor',
      `  - warframe/vendor/${tagType}`,
      `  - warframe/hub/${tagHub}`,
      '---',
      '',
    ].join('\n');

    const content = [
      frontmatter,
      `# ${vendor.name}`,
      '',
      `> [!summary] Role: **${vendor.type}** | Affiliation: **${vendor.syndicate}** | Location: **${vendor.location}**`,
      '',
      `## Overview\n${vendor.description}\n`,
      `## Key Offerings & Blueprints\n${offeringsList}\n`,
      '## External Reference',
      `* [Official Warframe Wiki](https://wiki.warframe.com/w/${encodeURIComponent(vendor.name.replace(/ /g, '_'))})`,
      '',
    ].join('\n');

    fs.writeFileSync(path.join(vendorsDir, filename), content, 'utf-8');
    count++;
  }

  // 6B. Gear, Companions & Archwing Directory
  const gearBaseDir = path.join(targetDir, 'Gear');
  ensureDir(gearBaseDir);
  const gearItemsDir = path.join(gearBaseDir, 'Gear');
  const companionsDir = path.join(gearBaseDir, 'Companions');
  const archwingDir = path.join(gearBaseDir, 'Archwing');
  ensureDir(gearItemsDir);
  ensureDir(companionsDir);
  ensureDir(archwingDir);

  for (const g of allGearJson) {
    const isCompanion = g.category === 'Companions';
    const isArchwing = g.category === 'Archwing';
    const destDir = isCompanion ? companionsDir : isArchwing ? archwingDir : gearItemsDir;
    const filename = `${sanitizeFilename(g.name)}.md`;

    const tagCat = (g.category || 'Gear').toLowerCase().replace(/[^a-z0-9]/g, '_');
    const imageName = g.imageName;
    const imageEmbed = imageName && fs.existsSync(path.join(attachmentsDir, imageName))
      ? `![[${imageName}|180]]\n`
      : '';

    const frontmatter = [
      '---',
      `title: "${g.name}"`,
      'type: "Gear"',
      `category: "${g.category || 'Gear'}"`,
      `sub_type: "${g.type || g.category || 'Gear'}"`,
      g.masteryReq !== undefined ? `mastery_rank: ${g.masteryReq}` : '',
      imageName ? `image: "[[${imageName}]]"` : '',
      'tags:',
      '  - warframe/gear',
      `  - warframe/gear/${tagCat}`,
      '---',
      '',
    ].filter(Boolean).join('\n');

    const specsTable = [
      '## Equipment Specifications',
      '| Mastery Requirement | Build Time | Build Price | Rush Price |',
      '| :---: | :---: | :---: | :---: |',
      `| MR ${g.masteryReq || 0} | ${g.buildTime || 'Instant / N/A'} | ${g.buildPrice ? `${g.buildPrice.toLocaleString()} Credits` : 'N/A'} | ${g.skipBuildTimePrice ? `${g.skipBuildTimePrice} Plat` : 'N/A'} |`,
      '',
    ].join('\n');

    const comps = g.components || [];
    const componentsMd = comps.length > 0
      ? [
          '## Foundry Crafting Components',
          '| Component / Material | Quantity | Source / Acquisition | Drop Chance |',
          '| :--- | :---: | :--- | :---: |',
          ...comps.map((c: any) => {
            const isBlueprint = (c.partName || '').toLowerCase().includes('blueprint');
            const link = isBlueprint ? `**${c.partName}**` : `**[[${c.partName}]]**`;
            const count = c.itemCount ? c.itemCount.toLocaleString() : '1';
            const cleanSource = (c.sourceText || 'Market / Clan Dojo').replace(/\(([^)]+)\)/g, '([[$1]])');
            return `| ${link} | ${count} | ${cleanSource} | ${c.dropChance !== undefined ? `${c.dropChance}%` : '-'} |`;
          }),
          '',
        ].join('\n')
      : '';

    const content = [
      frontmatter,
      imageEmbed,
      `# ${g.name}`,
      '',
      `> [!summary] Category: **${g.category || 'Gear'}** | Type: **${g.type || 'Gear'}** | Required Rank: **MR ${g.masteryReq || 0}**`,
      '',
      `## Overview\n${g.description || 'Specialized Tenno equipment.'}\n`,
      specsTable,
      componentsMd,
      '## External Reference',
      `* [Official Warframe Wiki](https://wiki.warframe.com/w/${encodeURIComponent(g.name.replace(/ /g, '_'))})`,
      '',
    ].filter(Boolean).join('\n');

    fs.writeFileSync(path.join(destDir, filename), content, 'utf-8');
    count++;
  }

  // 6D. Arcanes Directory (Export all 172 Arcanes)
  const arcanesDir = path.join(targetDir, 'Arcanes');
  ensureDir(arcanesDir);

  const allArcanes = getAllArcanes();
  for (const a of allArcanes) {
    const filename = `${sanitizeFilename(a.name)}.md`;
    const tagSlot = a.slot.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const tagRarity = a.rarity.toLowerCase();

    const frontmatter = [
      '---',
      `title: "${a.name}"`,
      'type: "Arcane"',
      `slot: "${a.slot}"`,
      `rarity: "${a.rarity}"`,
      `max_rank: ${a.maxRank}`,
      a.dissolutionPack ? `dissolution_pack: "${a.dissolutionPack}"` : '',
      a.vendorSource ? `vendor: "[[${a.vendorSource.vendorName}]]"` : '',
      'tags:',
      '  - warframe/arcane',
      `  - warframe/arcane/slot/${tagSlot}`,
      `  - warframe/arcane/rarity/${tagRarity}`,
      '---',
      '',
    ].filter(Boolean).join('\n');

    const rankRows = a.stats.map((st) => {
      const revivesText = st.revives ? `+${st.revives}` : 'None';
      const copiesText = st.arcanesToUpgrade > 0 ? `${st.requiredCopies} (+${st.arcanesToUpgrade})` : `${st.requiredCopies}`;
      return `| Rank ${st.rank} | ${st.effect} | ${revivesText} | ${copiesText} |`;
    }).join('\n');

    const rankTableMd = [
      '## Rank Progression',
      '| Rank | Effect | Revives | Cumulative Copies |',
      '| :---: | :--- | :---: | :---: |',
      rankRows,
      '',
    ].join('\n');

    const vendorMd = a.vendorSource
      ? [
          '## Syndicate & Vendor Purchase',
          `* **Merchant**: [[${a.vendorSource.vendorName}]]`,
          `* **Faction / Syndicate**: ${a.vendorSource.factionOrSyndicate}`,
          `* **Standing Cost**: **${a.vendorSource.standingCost}**`,
          `* **Location**: ${a.vendorSource.location}`,
          a.vendorSource.rankRequirement ? `* **Rank Requirement**: ${a.vendorSource.rankRequirement}` : '',
          a.vendorSource.notes ? `* **Notes**: ${a.vendorSource.notes}` : '',
          '',
        ].filter(Boolean).join('\n')
      : '';

    const dissolutionMd = a.dissolutionPack
      ? [
          '## Arcane Dissolution (Sanctum Anatomica)',
          `Available from Albrecht's Laboratories / Loid via the **${a.dissolutionPack}** Vosfor pack (200 Vosfor).`,
          '',
        ].join('\n')
      : '';

    const dropsMd = a.drops && a.drops.length > 0
      ? [
          '## Drop Sources',
          '| Source / Encounter | Rotation | Drop Rate |',
          '| :--- | :---: | :---: |',
          ...a.drops.slice(0, 15).map((d) => {
            const chanceText = typeof d.chance === 'number' ? `${(d.chance * 100).toFixed(2)}%` : d.chance;
            return `| ${d.source} | ${d.rotation || '-'} | ${chanceText} |`;
          }),
          '',
        ].join('\n')
      : '';

    const content = [
      frontmatter,
      `# ${a.name}`,
      '',
      `> [!summary] Slot: **${a.slot} Arcane** | Rarity: **${a.rarity}** | Max Rank: **Rank ${a.maxRank}** (21 total copies)`,
      '',
      `## Overview\n${a.description || 'Enhancement item that provides passive bonuses to equipment.'}\n`,
      rankTableMd,
      vendorMd,
      dissolutionMd,
      dropsMd,
      '## External Reference',
      `* [Official Warframe Wiki](https://wiki.warframe.com/w/${encodeURIComponent(a.name.replace(/ /g, '_'))})`,
      '',
    ].filter(Boolean).join('\n');

    fs.writeFileSync(path.join(arcanesDir, filename), content, 'utf-8');
    count++;
  }

  // 7. Visual Master Index Pages (Dataview-powered MOCs)
  // 7A. Warframes.md
  const warframesIndexContent = [
    '---',
    'title: "Warframes Index"',
    'type: "Index"',
    'tags:',
    '  - warframe/index',
    '  - warframe/frame',
    '---',
    '',
    '# Warframes Index',
    '',
    `Welcome to the complete Warframes directory. Total frames tracked: **${allWarframes.length}**.`,
    '',
    '## Warframes Gallery',
    '```dataview',
    'TABLE WITHOUT ID',
    '  choice(image, embed(image), "-") AS "Preview",',
    '  file.link AS "Warframe",',
    '  sub_type AS "Classification",',
    '  choice(mastery_rank != null, "MR " + mastery_rank, "MR 0") AS "Required MR",',
    '  choice(health != null, health, 100) AS "Health",',
    '  choice(shield != null, shield, 100) AS "Shield",',
    '  choice(armor != null, armor, 100) AS "Armor",',
    '  acquisition AS "Acquisition"',
    'FROM "Warframes"',
    'SORT file.name ASC',
    '```',
    '',
  ].join('\n');
  fs.writeFileSync(path.join(targetDir, 'Warframes.md'), warframesIndexContent, 'utf-8');
  count++;

  // 7B. Weapons.md
  const weaponsIndexContent = [
    '---',
    'title: "Weapons Index"',
    'type: "Index"',
    'tags:',
    '  - warframe/index',
    '  - warframe/weapon',
    '---',
    '',
    '# Weapons Index',
    '',
    `Browse all **${allWeapons.length}** weapons organized by slot and specialized combat subclasses.`,
    '',
    '## Primary Weapons',
    '```dataview',
    'TABLE WITHOUT ID',
    '  choice(image, embed(image), "-") AS "Preview",',
    '  file.link AS "Primary Weapon",',
    '  subclass AS "Subclass",',
    '  choice(mastery_rank != null, "MR " + mastery_rank, "MR 0") AS "Required MR",',
    '  trigger AS "Trigger",',
    '  crit_chance AS "Crit Chance",',
    '  status_chance AS "Status Chance"',
    'FROM "Weapons/Primary"',
    'SORT file.name ASC',
    '```',
    '',
    '## Secondary Weapons',
    '```dataview',
    'TABLE WITHOUT ID',
    '  choice(image, embed(image), "-") AS "Preview",',
    '  file.link AS "Secondary Weapon",',
    '  subclass AS "Subclass",',
    '  choice(mastery_rank != null, "MR " + mastery_rank, "MR 0") AS "Required MR",',
    '  trigger AS "Trigger",',
    '  crit_chance AS "Crit Chance",',
    '  status_chance AS "Status Chance"',
    'FROM "Weapons/Secondary"',
    'SORT file.name ASC',
    '```',
    '',
    '## Melee Weapons',
    '```dataview',
    'TABLE WITHOUT ID',
    '  choice(image, embed(image), "-") AS "Preview",',
    '  file.link AS "Melee Weapon",',
    '  subclass AS "Subclass",',
    '  choice(mastery_rank != null, "MR " + mastery_rank, "MR 0") AS "Required MR",',
    '  crit_chance AS "Crit Chance",',
    '  status_chance AS "Status Chance"',
    'FROM "Weapons/Melee"',
    'SORT file.name ASC',
    '```',
    '',
    '## Weapon Subclasses Breakdown',
    ...Object.entries(weaponsBySubclass).map(([subKey, names]) => {
      return `### ${subKey} (${names.length} Weapons)\n${names.map((n) => `* [[${n}]]`).join(', ')}\n`;
    }),
    '',
  ].join('\n');
  fs.writeFileSync(path.join(targetDir, 'Weapons.md'), weaponsIndexContent, 'utf-8');
  count++;

  // 7C. Mods.md
  const modsIndexContent = [
    '---',
    'title: "Mods Index"',
    'type: "Index"',
    'tags:',
    '  - warframe/index',
    '  - warframe/mod',
    '---',
    '',
    '# Mods Directory & Stat Hubs',
    '',
    `Total mods indexed: **${allMods.length}**.`,
    '',
    '## Combat & Damage Stat Hubs',
    'Browse mods categorized by their elemental damage, physical damage, or combat mechanics:',
    '',
    Object.values(STAT_KEYWORDS)
      .map((s) => `* **[[${s.hubName}]]** (${modsByStat[s.hubName]?.length || 0} mods): \`#warframe/mod/stat/${s.tag}\``)
      .join('\n'),
    '',
    '## Category Directories',
    '* **Companion Mods**: [[Mods/Companion/]]',
    '* **Warframe Mods**: [[Mods/Warframe/]]',
    '* **Weapon Mods**: [[Mods/Weapons/]]',
    '* **Aura Mods**: [[Mods/Aura/]]',
    '* **Exilus Mods**: [[Mods/Exilus/]]',
    '',
  ].join('\n');
  fs.writeFileSync(path.join(targetDir, 'Mods.md'), modsIndexContent, 'utf-8');
  count++;

  // 7D. Resources.md
  const resourcesIndexContent = [
    '---',
    'title: "Resources Index"',
    'type: "Index"',
    'tags:',
    '  - warframe/index',
    '  - warframe/resource',
    '---',
    '',
    '# Resources Index',
    '',
    `Complete directory of all **${allResourcesJson.length}** Warframe crafting materials, mining minerals, gems, and research resources.`,
    '',
    '## All Resources Catalog',
    '```dataview',
    'TABLE WITHOUT ID',
    '  choice(image, embed(image), "-") AS "Preview",',
    '  file.link AS "Resource",',
    '  classification AS "Category",',
    '  planets AS "Planetary Drops"',
    'FROM "Resources"',
    'SORT classification ASC, file.name ASC',
    '```',
    '',
    '## Rare Crafting Resources',
    '```dataview',
    'TABLE WITHOUT ID',
    '  choice(image, embed(image), "-") AS "Preview",',
    '  file.link AS "Resource",',
    '  planets AS "Farming Locations"',
    'FROM "Resources"',
    'WHERE classification = "Rare"',
    'SORT file.name ASC',
    '```',
    '',
  ].join('\n');
  fs.writeFileSync(path.join(targetDir, 'Resources.md'), resourcesIndexContent, 'utf-8');
  count++;

  // 7E. Gear.md
  const gearIndexContent = [
    '---',
    'title: "Gear & Equipment Index"',
    'type: "Index"',
    'tags:',
    '  - warframe/index',
    '  - warframe/gear',
    '---',
    '',
    '# Gear & Equipment Index',
    '',
    `Complete directory of Tenno utility gear, companions, sentinels, archwings, and essential catalysts. Total items: **${allGearJson.length}**.`,
    '',
    '## Equipment Directory',
    '```dataview',
    'TABLE WITHOUT ID',
    '  choice(image, embed(image), "-") AS "Preview",',
    '  file.link AS "Equipment Name",',
    '  category AS "Category",',
    '  sub_type AS "Subtype",',
    '  choice(mastery_rank != null, "MR " + mastery_rank, "MR 0") AS "Required MR"',
    'FROM "Gear"',
    'SORT category ASC, file.name ASC',
    '```',
    '',
  ].join('\n');
  fs.writeFileSync(path.join(targetDir, 'Gear.md'), gearIndexContent, 'utf-8');
  count++;

  // 7F. Planets.md
  const planetsIndexContent = [
    '---',
    'title: "Star Chart Planets Index"',
    'type: "Index"',
    'tags:',
    '  - warframe/index',
    '  - warframe/planet',
    '---',
    '',
    '# Star Chart Planets Index',
    '',
    '## Origin System Star Chart',
    '```dataview',
    'TABLE WITHOUT ID',
    '  file.link AS "Planet / Sector",',
    '  faction AS "Enemy Faction",',
    '  boss AS "Assassination Boss",',
    '  resource_drops AS "Resource Drops"',
    'FROM "Planets & Missions"',
    'WHERE type = "Planet"',
    'SORT file.name ASC',
    '```',
    '',
    '## Planets Overview',
    PLANETS_DATA.map((p) => {
      const bossText = p.bossName ? ` | Boss: [[${p.bossName}]]` : '';
      const resourcesText = p.resourceDrops.map((r) => `[[${r}]]`).join(', ');
      return `* **[[${p.name}]]** (${p.faction}${bossText})\n  * Resources: ${resourcesText}\n  * Total Nodes: ${p.missions.length}`;
    }).join('\n\n'),
    '',
  ].join('\n');
  fs.writeFileSync(path.join(targetDir, 'Planets.md'), planetsIndexContent, 'utf-8');
  count++;

  // 7G. Bosses.md
  const bossesIndexContent = [
    '---',
    'title: "Assassination Targets & Bosses Index"',
    'type: "Index"',
    'tags:',
    '  - warframe/index',
    '  - warframe/boss',
    '---',
    '',
    '# Assassination Targets & Bosses Index',
    '',
    `Directory of all **${ALL_BOSSES.length}** Origin System assassination targets, open-world Eidolons, Orb Mothers, Archons, and Stalker assassins.`,
    '',
    '## Bosses & Targets Directory',
    '```dataview',
    'TABLE WITHOUT ID',
    '  file.link AS "Boss / Target",',
    '  boss_type AS "Classification",',
    '  faction AS "Faction",',
    '  location AS "Encounter Location",',
    '  key_drops AS "Key Blueprint & Part Drops"',
    'FROM "Bosses"',
    'SORT boss_type ASC, file.name ASC',
    '```',
    '',
  ].join('\n');
  fs.writeFileSync(path.join(targetDir, 'Bosses.md'), bossesIndexContent, 'utf-8');
  count++;

  // 7H. Vendors.md
  const vendorsIndexContent = [
    '---',
    'title: "Syndicates & Vendors Index"',
    'type: "Index"',
    'tags:',
    '  - warframe/index',
    '  - warframe/vendor',
    '---',
    '',
    '# Syndicates & Vendors Index',
    '',
    `Directory of all **${ALL_VENDORS.length}** Hub merchants, Syndicates, Baro Ki'Teer Void Trader, and open-world vendors.`,
    '',
    '## Vendors & Merchants Directory',
    '```dataview',
    'TABLE WITHOUT ID',
    '  file.link AS "Vendor / Merchant",',
    '  vendor_type AS "Role",',
    '  syndicate AS "Affiliation / Syndicate",',
    '  location AS "Location / Hub",',
    '  key_offerings AS "Key Offerings & Blueprints"',
    'FROM "Vendors"',
    'SORT vendor_type ASC, file.name ASC',
    '```',
    '',
  ].join('\n');
  fs.writeFileSync(path.join(targetDir, 'Vendors.md'), vendorsIndexContent, 'utf-8');
  count++;

  // 7I. Arcanes.md
  const arcanesIndexContent = [
    '---',
    'title: "Arcanes Index"',
    'type: "Index"',
    'tags:',
    '  - warframe/index',
    '  - warframe/arcane',
    '---',
    '',
    '# Arcanes & Enhancements Index',
    '',
    `Complete directory of all **${allArcanes.length}** Arcanes, covering Warframe, Primary, Secondary, Melee, Operator, Amp, Kitgun, and Zaw slots.`,
    '',
    '## Arcanes Directory',
    '```dataview',
    'TABLE WITHOUT ID',
    '  file.link AS "Arcane",',
    '  slot AS "Slot",',
    '  rarity AS "Rarity",',
    '  choice(max_rank != null, "Rank " + max_rank, "Rank 5") AS "Max Rank",',
    '  choice(dissolution_pack != null AND dissolution_pack != "", dissolution_pack, "-") AS "Dissolution Pack",',
    '  choice(vendor != null AND vendor != "", vendor, "-") AS "Vendor Source"',
    'FROM "Arcanes"',
    'SORT slot ASC, rarity DESC, file.name ASC',
    '```',
    '',
  ].join('\n');
  fs.writeFileSync(path.join(targetDir, 'Arcanes.md'), arcanesIndexContent, 'utf-8');
  count++;

  // 7J. Master Hub & Dashboard
  const dashboardContent = [
    '---',
    'title: "Warfarm Tracker Hub"',
    'type: "Dashboard"',
    `game_version: "${syncMetaJson.gameVersion || 'Update 38 (1999)'}"`,
    `game_build: "${syncMetaJson.gameBuild || 'v2026.08.19'}"`,
    'tags:',
    '  - warframe/dashboard',
    '---',
    '',
    '# Warfarm Tracker - Codex & Knowledge Hub',
    '',
    `> [!info] Tracked Game Version: **${syncMetaJson.gameVersion || 'Warframe Update 38 (1999)'}** | Build: \`${syncMetaJson.gameBuild || 'v2026.08.19'}\` | Data Synced: ${new Date(syncMetaJson.lastSyncedAt).toLocaleDateString()}`,
    '',
    'Welcome to your local offline Warfarm Tracker knowledge base vault. Every note is interconnected via bidirectional `[[Wikilinks]]` and enriched with local image previews and recommended community builds.',
    '',
    '## Live Star Chart & WorldState Feeds',
    '* 🌐 **Live Star Chart Feed**: Open World cycles (Cetus/Eidolon Day/Night, Orb Vallis, Deimos), active Syndicate Bounties with reward drop percentages, and Void Fissures are available on the companion web dashboard (`http://localhost:5173/live`).',
    '',
    '## Master Directories',
    '* 🛡️ **[[Warframes]]** (121 Frames with attributes and visual gallery)',
    '* ⚔️ **[[Weapons]]** (612 Weapons categorized by slot and subclass)',
    '* 🔮 **[[Mods]]** (1,806 Mods with rank progression tables and [[Puncture Mods|Stat Hubs]])',
    '* 🎴 **[[Arcanes]]** (172 Arcanes for Warframes, Weapons, and Operators with rank matrices)',
    '* 💎 **[[Resources]]** (600 Resources with wiki farming nodes and recipes)',
    '* 🧰 **[[Gear]]** (210 Utility Gear items, Companions, Sentinels, and Archwings)',
    '* 🪐 **[[Planets]]** (Star Chart missions, rotation drops, and enemies)',
    '* 💀 **[[Bosses]]** (24 Assassination targets, Eidolons, Orb Mothers, and Archons)',
    '* 🏪 **[[Vendors]]** (16 Hub merchants, Syndicates, and Baro Ki\'Teer)',
    '',
    '## Interactive Knowledge Graph',
    'Press `Ctrl + G` to view the Warframe universe graph with custom visual color grouping:',
    '* 🟡 **Orokin Prime Gold**: Prime Warframes (`tag:#warframe/type/prime_warframe`)',
    '* 🔵 **Lotus Blue**: Warframes (`path:Warframes`)',
    '* 🟠 **Radiant Orange**: Primary Weapons (`path:Weapons/Primary`)',
    '* 🔷 **Neon Cyan**: Secondary Weapons (`path:Weapons/Secondary`)',
    '* 🔴 **Crimson Red**: Melee Weapons (`path:Weapons/Melee`)',
    '* 🟣 **Void Violet**: Mods & Upgrades (`path:Mods`)',
    '* 🟨 **Golden Amber**: Arcanes & Enhancements (`path:Arcanes`)',
    '* 🟢 **Emerald Green**: Planetary Crafting Resources (`path:Resources`)',
    '* 🟫 **Amber**: Gear, Companions & Archwings (`path:Gear`)',
    '* 🟪 **Deep Indigo**: Star Chart Planets & Missions (`path:"Planets & Missions"`)',
    '* 🩸 **Crimson**: Assassination Bosses (`path:Bosses`)',
    '* 🌸 **Magenta**: Vendors & Hub Merchants (`path:Vendors`)',
    '* ⚪ **Pearl White**: Master Index Hubs (`file:"Hub & Dashboard"`)',
    '',
    '## Community Plugins & Visual Tools',
    '* 📊 **Dataview**: Renders dynamic interactive tables, lists, and query dashboards across all 2,900+ notes.',
    '* 🔄 **Sortable**: Click any table header (e.g. Critical Chance, Drop Rate, Cost) to sort ascending or descending.',
    '* 👁️ **Hover Editor**: Hover over any link (like `[[Tellurium]]` or `[[Ash Prime]]`) to open an interactive, scrollable preview popover.',
    '* 🔍 **Omnisearch**: Press `Ctrl + P` -> Omnisearch for instant fuzzy search across notes with thumbnail previews.',
    '* 🎨 **Warframe Theme CSS Snippet**: Custom sci-fi styling with Orokin callouts and element tag pills.',
    '',
    '## Quick Dataview Queries',
    '',
    '### Prime Warframes Roster',
    '```dataview',
    'TABLE WITHOUT ID',
    '  file.link AS "Warframe",',
    '  sub_type AS "Classification",',
    '  acquisition AS "Acquisition"',
    'FROM "Warframes"',
    'WHERE contains(tags, "warframe/type/prime_warframe")',
    'SORT file.name ASC',
    'LIMIT 12',
    '```',
    '',
    '### Rare Crafting Resources',
    '```dataview',
    'TABLE WITHOUT ID',
    '  file.link AS "Resource",',
    '  classification AS "Type",',
    '  planets AS "Drop Planets"',
    'FROM "Resources"',
    'WHERE contains(tags, "warframe/resource/rare")',
    'SORT file.name ASC',
    '```',
    '',
    '### Legendary & Rare Arcanes',
    '```dataview',
    'TABLE WITHOUT ID',
    '  file.link AS "Arcane",',
    '  slot AS "Slot",',
    '  rarity AS "Rarity",',
    '  dissolution_pack AS "Dissolution Pack"',
    'FROM "Arcanes"',
    'WHERE rarity = "Legendary" OR rarity = "Rare"',
    'SORT rarity DESC, file.name ASC',
    'LIMIT 8',
    '```',
    '',
    '### Key Assassination Bosses',
    '```dataview',
    'TABLE WITHOUT ID',
    '  file.link AS "Boss / Target",',
    '  boss_type AS "Category",',
    '  location AS "Location"',
    'FROM "Bosses"',
    'SORT boss_type ASC, file.name ASC',
    'LIMIT 8',
    '```',
    '',
    '### Syndicates & Key Vendors',
    '```dataview',
    'TABLE WITHOUT ID',
    '  file.link AS "Vendor",',
    '  vendor_type AS "Role",',
    '  location AS "Location"',
    'FROM "Vendors"',
    'SORT vendor_type ASC, file.name ASC',
    'LIMIT 8',
    '```',
    '',
    '### Top Critical Chance Primary Weapons',
    '```dataview',
    'TABLE WITHOUT ID',
    '  file.link AS "Weapon",',
    '  subclass AS "Subclass",',
    '  crit_chance AS "Crit Chance",',
    '  crit_multiplier AS "Multiplier"',
    'FROM "Weapons/Primary"',
    'WHERE crit_chance != "0%" AND crit_chance != ""',
    'SORT crit_chance DESC',
    'LIMIT 8',
    '```',
    '',
    '---',
    `*Vault generated automatically on: ${new Date().toISOString()}*`,
    '',
  ].join('\n');

  fs.writeFileSync(path.join(targetDir, 'Hub & Dashboard.md'), dashboardContent, 'utf-8');
  count++;

  return {
    vaultDir: targetDir,
    notesCount: count,
  };
}

if (process.argv[1]?.endsWith('export-obsidian.ts')) {
  exportToObsidian()
    .then((res) => {
      console.log(`Obsidian Vault generated successfully:`);
      console.log(` - Vault Directory: ${res.vaultDir}`);
      console.log(` - Total Notes Created: ${res.notesCount}`);
    })
    .catch((err) => {
      console.error('Obsidian export failed:', err);
      process.exit(1);
    });
}
