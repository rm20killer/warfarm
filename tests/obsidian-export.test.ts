import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { exportToObsidian } from '../scripts/export-obsidian';

describe('Obsidian Vault Export & Auto-Sync System', () => {
  const vaultPath = path.resolve(process.cwd(), 'warframe-obsidian-vault');

  beforeAll(async () => {
    await exportToObsidian(vaultPath);
  }, 60000);

  it('generates a complete Obsidian vault structure with .obsidian configuration', async () => {
    expect(fs.existsSync(vaultPath)).toBe(true);

    const appJsonPath = path.join(vaultPath, '.obsidian', 'app.json');
    expect(fs.existsSync(appJsonPath)).toBe(true);
    const appConfig = JSON.parse(fs.readFileSync(appJsonPath, 'utf-8'));
    expect(appConfig.useMarkdownLinks).toBe(false);
    expect(appConfig.attachmentFolderPath).toBe('Attachments');
  });

  it('populates Attachments folder with offline image assets', () => {
    const attachmentsDir = path.join(vaultPath, 'Attachments');
    expect(fs.existsSync(attachmentsDir)).toBe(true);
    const files = fs.readdirSync(attachmentsDir);
    expect(files.length).toBeGreaterThan(100);
    const hasImages = files.some((f) => f.endsWith('.png') || f.endsWith('.jpg'));
    expect(hasImages).toBe(true);
  });

  it('creates master index pages with Dataview queries and wikilinks', () => {
    const hubPath = path.join(vaultPath, 'Hub & Dashboard.md');
    const warframesIndexPath = path.join(vaultPath, 'Warframes.md');
    const weaponsIndexPath = path.join(vaultPath, 'Weapons.md');
    const modsIndexPath = path.join(vaultPath, 'Mods.md');
    const resourcesIndexPath = path.join(vaultPath, 'Resources.md');
    const planetsIndexPath = path.join(vaultPath, 'Planets.md');
    const bossesIndexPath = path.join(vaultPath, 'Bosses.md');
    const vendorsIndexPath = path.join(vaultPath, 'Vendors.md');

    expect(fs.existsSync(hubPath)).toBe(true);
    expect(fs.existsSync(warframesIndexPath)).toBe(true);
    expect(fs.existsSync(weaponsIndexPath)).toBe(true);
    expect(fs.existsSync(modsIndexPath)).toBe(true);
    expect(fs.existsSync(resourcesIndexPath)).toBe(true);
    expect(fs.existsSync(planetsIndexPath)).toBe(true);
    expect(fs.existsSync(bossesIndexPath)).toBe(true);
    expect(fs.existsSync(vendorsIndexPath)).toBe(true);

    const warframesContent = fs.readFileSync(warframesIndexPath, 'utf-8');
    expect(warframesContent).toContain('```dataview');
    expect(warframesContent).toContain('FROM "Warframes"');

    const weaponsContent = fs.readFileSync(weaponsIndexPath, 'utf-8');
    expect(weaponsContent).toContain('```dataview');
    expect(weaponsContent).toContain('FROM "Weapons/Primary"');
    expect(weaponsContent).toContain('Primary - Shotgun');

    const resourcesContent = fs.readFileSync(resourcesIndexPath, 'utf-8');
    expect(resourcesContent).toContain('```dataview');
    expect(resourcesContent).toContain('FROM "Resources"');

    const bossesContent = fs.readFileSync(bossesIndexPath, 'utf-8');
    expect(bossesContent).toContain('```dataview');
    expect(bossesContent).toContain('FROM "Bosses"');

    const vendorsContent = fs.readFileSync(vendorsIndexPath, 'utf-8');
    expect(vendorsContent).toContain('```dataview');
    expect(vendorsContent).toContain('FROM "Vendors"');
  });

  it('generates Boss and Vendor files with drops and offerings', () => {
    const jackalPath = path.join(vaultPath, 'Bosses', 'Jackal.md');
    expect(fs.existsSync(jackalPath)).toBe(true);
    const jackalContent = fs.readFileSync(jackalPath, 'utf-8');
    expect(jackalContent).toContain('type: "Boss"');
    expect(jackalContent).toContain('[[Rhino Blueprint]]');
    expect(jackalContent).toContain('https://wiki.warframe.com/w/Jackal');

    const baroPath = path.join(vaultPath, 'Vendors', "Baro Ki'Teer.md");
    expect(fs.existsSync(baroPath)).toBe(true);
    const baroContent = fs.readFileSync(baroPath, 'utf-8');
    expect(baroContent).toContain('type: "Vendor"');
    expect(baroContent).toContain('Primed Continuity');
    expect(baroContent).toContain("https://wiki.warframe.com/w/Baro_Ki'Teer");
  });

  it('splits weapons into specialized subclass folders', () => {
    const drakgoonPath = path.join(vaultPath, 'Weapons', 'Primary', 'Shotgun', 'Drakgoon.md');
    expect(fs.existsSync(drakgoonPath)).toBe(true);
    const drakgoonContent = fs.readFileSync(drakgoonPath, 'utf-8');
    expect(drakgoonContent).toContain('subclass: "Shotgun"');
    expect(drakgoonContent).toContain('slot: "Primary"');

    const strophaPath = path.join(vaultPath, 'Weapons', 'Melee', 'Gunblade', 'Stropha.md');
    expect(fs.existsSync(strophaPath)).toBe(true);
    const strophaContent = fs.readFileSync(strophaPath, 'utf-8');
    expect(strophaContent).toContain('subclass: "Gunblade"');
    expect(strophaContent).toContain('slot: "Melee"');
  });

  it('links mods together with stat tags and generates Puncture Mods stat hub', () => {
    const punctureHubPath = path.join(vaultPath, 'Mods', 'Stats', 'Puncture Mods.md');
    expect(fs.existsSync(punctureHubPath)).toBe(true);
    const hubContent = fs.readFileSync(punctureHubPath, 'utf-8');
    expect(hubContent).toContain('#warframe/mod/stat/puncture');
    expect(hubContent).toContain('```dataview');
    expect(hubContent).toContain('[[Bore]]');

    // Mod with puncture stat
    const borePath = path.join(vaultPath, 'Mods', 'Weapons', 'Bore.md');
    if (fs.existsSync(borePath)) {
      const boreContent = fs.readFileSync(borePath, 'utf-8');
      expect(boreContent).toContain('warframe/mod/stat/puncture');
      expect(boreContent).toContain('[[Puncture Mods]]');
    }
  });

  it('exports all 241 resources from the official wiki / codex', () => {
    const resourcesDir = path.join(vaultPath, 'Resources');
    expect(fs.existsSync(resourcesDir)).toBe(true);
    const resourceFiles = fs.readdirSync(resourcesDir).filter((f) => f.endsWith('.md'));
    expect(resourceFiles.length).toBeGreaterThanOrEqual(240);
  });

  it('generates Contagious Bond note with frontmatter, vendor wikilinks, and rank table', () => {
    const notePath = path.join(vaultPath, 'Mods', 'Companion', 'Contagious Bond.md');
    expect(fs.existsSync(notePath)).toBe(true);
    const content = fs.readFileSync(notePath, 'utf-8');

    // Frontmatter validation
    expect(content).toContain('title: "Contagious Bond"');
    expect(content).toContain('type: "Mod"');
    expect(content).toContain('vendor: "[[Son]]"');
    expect(content).toContain('endo_to_max: 930');
    expect(content).toContain('credits_to_max: 44919');

    // Wikilink & table validation
    expect(content).toContain('[[Son]]');
    expect(content).toContain('| **0** | 8% | 1.5m | 4 |');
    expect(content).toContain('| **5** | 50% | 9m | 9 |');
    expect(content).toContain('https://wiki.warframe.com/w/Contagious_Bond');
  });

  it('generates Warframe notes with boss, mission wikilinks, and recommended community builds', () => {
    const rhinoPath = path.join(vaultPath, 'Warframes', 'Rhino.md');
    expect(fs.existsSync(rhinoPath)).toBe(true);
    const content = fs.readFileSync(rhinoPath, 'utf-8');

    expect(content).toContain('[[Jackal]]');
    expect(content).toContain('[[Venus - Fossa]]');
    expect(content).toContain('38.72%');

    // Recommended builds validation
    expect(content).toContain('## Recommended Community Builds');
    expect(content).toContain('Iron Skin Tank & Roar Buffer');
    expect(content).toContain('[[Ironclad Charge]]');
    expect(content).toContain('[[Iron Shrapnel]]');
    expect(content).toContain('reframed.site');
    expect(content).toContain('reddit.com');
  });

  it('generates Hub & Dashboard with game version tracking and live data pointers', () => {
    const hubPath = path.join(vaultPath, 'Hub & Dashboard.md');
    expect(fs.existsSync(hubPath)).toBe(true);
    const content = fs.readFileSync(hubPath, 'utf-8');

    expect(content).toContain('game_version: "Update 43: Jade Shadows: Constellations"');
    expect(content).toContain('Warfarm Tracker');
    expect(content).toContain('Live Star Chart & WorldState Feeds');
  });

  it('generates Resource notes linking to optimal farm nodes and squad loadouts', () => {
    const telluriumPath = path.join(vaultPath, 'Resources', 'Tellurium.md');
    expect(fs.existsSync(telluriumPath)).toBe(true);
    const content = fs.readFileSync(telluriumPath, 'utf-8');

    expect(content).toContain('[[Uranus - Ophelia]]');
    expect(content).toContain('[[Khora]]');
    expect(content).toContain('[[Nekros]]');
  });

  it('generates Mission notes with drop rotations and spawnable enemy loot tables', () => {
    const fossaPath = path.join(vaultPath, 'Planets & Missions', 'Venus - Fossa.md');
    expect(fs.existsSync(fossaPath)).toBe(true);
    const content = fs.readFileSync(fossaPath, 'utf-8');

    expect(content).toContain('[[Jackal]]');
    expect(content).toContain('[[Rhino Neuroptics Blueprint]]');
    expect(content).toContain('[[Polymer Bundle]]');
  });

  it('generates Salvage resource note with Dark Sector optimal farm nodes and Dataview backlink query', () => {
    const salvagePath = path.join(vaultPath, 'Resources', 'Salvage.md');
    expect(fs.existsSync(salvagePath)).toBe(true);
    const content = fs.readFileSync(salvagePath, 'utf-8');

    expect(content).toContain('[[Mars - Wahiba]]');
    expect(content).toContain('[[Jupiter - Camis]]');
    expect(content).toContain('[[Sedna - Amarna]]');
    expect(content).toContain('[[Nekros]]');
    expect(content).toContain('[[Khora]]');
    expect(content).toContain('FROM [[Salvage]]');
  });

  it('connects crafting resources to Warframes with bidirectional wikilinks', () => {
    const rhinoPath = path.join(vaultPath, 'Warframes', 'Rhino.md');
    expect(fs.existsSync(rhinoPath)).toBe(true);
    const rhinoContent = fs.readFileSync(rhinoPath, 'utf-8');

    expect(rhinoContent).toContain('## Foundry Crafting Requirements');
    expect(rhinoContent).toContain('[[Morphics]]');
    expect(rhinoContent).toContain('[[Ferrite]]');
    expect(rhinoContent).toContain('[[Rubedo]]');
    expect(rhinoContent).toContain('[[Orokin Cell]]');

    const sarynPath = path.join(vaultPath, 'Warframes', 'Saryn.md');
    expect(fs.existsSync(sarynPath)).toBe(true);
    const sarynContent = fs.readFileSync(sarynPath, 'utf-8');
    expect(sarynContent).toContain('[[Salvage]]');
  });

  it('connects crafting resources to weapons with wikilinks and quantities', () => {
    const drakgoonPath = path.join(vaultPath, 'Weapons', 'Primary', 'Shotgun', 'Drakgoon.md');
    expect(fs.existsSync(drakgoonPath)).toBe(true);
    const drakgoonContent = fs.readFileSync(drakgoonPath, 'utf-8');

    expect(drakgoonContent).toContain('## Foundry & Crafting Requirements');
    expect(drakgoonContent).toContain('[[Circuits]]');
    expect(drakgoonContent).toContain('[[Morphics]]');
    expect(drakgoonContent).toContain('[[Nano Spores]]');
    expect(drakgoonContent).toContain('[[Alloy Plate]]');
  });

  it('generates Vainthorn note with verified wiki Acquisition section and no generic fake nodes', () => {
    const vainthornPath = path.join(vaultPath, 'Resources', 'Vainthorn.md');
    expect(fs.existsSync(vainthornPath)).toBe(true);
    const content = fs.readFileSync(vainthornPath, 'utf-8');

    expect(content).toContain('## Acquisition');
    expect(content).toContain('[Abyssal Zone](https://wiki.warframe.com/w/Abyssal_Zone)');
    expect(content).toContain('[Ceres](https://wiki.warframe.com/w/Ceres)');
    expect(content).toContain('[Abyssal Beacons](https://wiki.warframe.com/w/Abyssal_Beacon)');
    expect(content).toContain('[The Steel Path](https://wiki.warframe.com/w/The_Steel_Path)');

    // Ensure generic fake nodes and loadouts are eliminated
    expect(content).not.toContain('Star Chart Nodes');
    expect(content).not.toContain('Origin System');
    expect(content).not.toContain('Recommended Squad Warframes');
  });

  it('generates Steel Essence with dedicated Acquisition section and no fake farming nodes', () => {
    const essencePath = path.join(vaultPath, 'Resources', 'Steel Essence.md');
    expect(fs.existsSync(essencePath)).toBe(true);
    const content = fs.readFileSync(essencePath, 'utf-8');

    expect(content).toContain('## Acquisition');
    expect(content).toContain('[Acolytes](https://wiki.warframe.com/w/Acolytes)');
    expect(content).not.toContain('Star Chart Nodes');
    expect(content).not.toContain('Origin System');
  });

  it('records WFCD warframe-items and warframe-drop-data in sync-meta sources', () => {
    const syncMetaPath = path.resolve(__dirname, '..', 'src', 'shared', 'data', 'generated', 'sync-meta.json');
    expect(fs.existsSync(syncMetaPath)).toBe(true);
    const meta = JSON.parse(fs.readFileSync(syncMetaPath, 'utf-8'));

    expect(meta.sources).toContain('https://github.com/WFCD/warframe-items');
    expect(meta.sources).toContain('https://github.com/WFCD/warframe-drop-data');
    expect(meta.sources).not.toContain('https://raw.githubusercontent.com/calamity-inc/warframe-public-export-plus');
  });
});



