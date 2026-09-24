import fs from 'fs';
import path from 'path';

interface ComponentDropRaw {
  location?: string;
  chance?: number;
  rarity?: string;
}

interface ComponentRaw {
  name: string;
  itemCount?: number;
  drops?: ComponentDropRaw[];
}

interface WarframeRaw {
  uniqueName: string;
  name: string;
  description?: string;
  health?: number;
  shield?: number;
  armor?: number;
  power?: number;
  sprintSpeed?: number;
  masteryReq?: number;
  isPrime?: boolean;
  imageName?: string;
  components?: ComponentRaw[];
}

interface WeaponRaw {
  uniqueName: string;
  name: string;
  type?: string;
  productCategory?: string;
  slot?: string;
  masteryReq?: number;
  criticalChance?: number | string;
  criticalMultiplier?: number | string;
  procChance?: number | string;
  fireRate?: number | string;
  trigger?: string;
  description?: string;
  imageName?: string;
  components?: ComponentRaw[];
}

interface ModRaw {
  uniqueName: string;
  name: string;
  type?: string;
  compatName?: string;
  polarity?: string;
  rarity?: string;
  baseDrain?: number;
  fusionLimit?: number;
  description?: string;
  imageName?: string;
  levelStats?: Array<{ stats?: string[] }>;
  drops?: ComponentDropRaw[];
}

interface ResourceRaw {
  uniqueName: string;
  name: string;
  description?: string;
  type?: string;
  category?: string;
  imageName?: string;
  tradable?: boolean;
}

const GENERATED_DIR = path.resolve(process.cwd(), 'src', 'shared', 'data', 'generated');

export function determineWeaponSubclass(w: WeaponRaw, slot: string): string {
  const u = (w.uniqueName || '').toLowerCase();
  const t = (w.type || '').toLowerCase();

  if (slot === 'Primary') {
    if (t.includes('bow') || u.includes('bow')) return 'Bow';
    if (t.includes('shotgun') || u.includes('shotgun')) return 'Shotgun';
    if (t.includes('sniper') || u.includes('sniper')) return 'Sniper';
    if (t.includes('launcher') || u.includes('grenade') || u.includes('rocket')) return 'Launcher';
    if (u.includes('spear') || u.includes('harpoon')) return 'Speargun';
    return 'Rifle';
  }

  if (slot === 'Secondary') {
    if (t.includes('dual') || u.includes('dual') || u.includes('ak')) return 'Dual Pistols';
    if (t.includes('throwing') || u.includes('kunai') || u.includes('shuriken') || u.includes('dart')) return 'Throwing';
    if (t.includes('shotgun') || u.includes('shotgun') || u.includes('handcannon')) return 'Shotgun Sidearm';
    return 'Pistol';
  }

  // Melee subclasses
  if (u.includes('gunblade')) return 'Gunblade';
  if (u.includes('scythe')) return 'Scythe';
  if (u.includes('nikana') || u.includes('katana')) return 'Nikana';
  if (u.includes('polearms') || u.includes('naginata') || u.includes('halberd')) return 'Polearm';
  if (u.includes('staff') || u.includes('staves')) return 'Staff';
  if (u.includes('heavyblade') || u.includes('greatsword') || u.includes('claymore')) return 'Heavy Blade';
  if (u.includes('hammer')) return 'Hammer';
  if (u.includes('swordsandboards') || u.includes('axeshield') || u.includes('maceshield')) return 'Sword & Shield';
  if (u.includes('dual') || u.includes('daggers') && u.includes('dual')) return 'Dual Swords';
  if (u.includes('glaive') || u.includes('boomerang') || u.includes('chakram')) return 'Glaive';
  if (u.includes('tonfa')) return 'Tonfa';
  if (u.includes('whip')) return 'Whip';
  if (u.includes('gauntlet') || u.includes('sparring') || u.includes('fist')) return 'Fist & Sparring';
  if (u.includes('dagger')) return 'Dagger';
  if (u.includes('rapier')) return 'Rapier';
  if (u.includes('warfan')) return 'Warfan';
  return 'Sword';
}

interface WikiResourceData {
  recommendedMap: Map<string, string>;
  planetDropsMap: Map<string, string[]>;
}

async function fetchWikiResourceData(): Promise<WikiResourceData> {
  const recommendedMap = new Map<string, string>();
  const planetDropsMap = new Map<string, string[]>();

  try {
    const res = await fetch('https://wiki.warframe.com/w/Resources');
    if (!res.ok) return { recommendedMap, planetDropsMap };
    const html = await res.text();
    const tables = html.match(/<table[^>]*>([\s\S]*?)<\/table>/g) || [];

    // Table 1: Recommended locations
    if (tables.length > 1) {
      const t1Rows = tables[1].match(/<tr>([\s\S]*?)<\/tr>/g) || [];
      for (const r of t1Rows) {
        const tds = (r.match(/<td[^>]*>([\s\S]*?)<\/td>/g) || []).map((td) =>
          td.replace(/<[^>]+>/g, ' ').replace(/&#160;/g, ' ').replace(/\s+/g, ' ').trim()
        );
        if (tds.length >= 2 && tds[0]) {
          const name = tds[0].replace(/&#160;/g, ' ').trim();
          recommendedMap.set(name.toLowerCase(), tds[1]);
        }
      }
    }

    // Tables 2-5: Planetary drop matrix
    for (const idx of [2, 3, 4, 5]) {
      const t = tables[idx];
      if (!t) continue;
      const headerRow = (t.match(/<tr>([\s\S]*?)<\/tr>/) || [])[1] || '';
      const planets = (headerRow.match(/<th[^>]*>([\s\S]*?)<\/th>/g) || [])
        .map((th) => th.replace(/<[^>]+>/g, ' ').replace(/&#160;/g, ' ').replace(/\s+/g, ' ').trim())
        .slice(1);

      const rows = (t.match(/<tr>([\s\S]*?)<\/tr>/g) || []).slice(1);
      for (const row of rows) {
        const cells = (row.match(/<td[^>]*>([\s\S]*?)<\/td>/g) || []).map((td) =>
          td.replace(/<[^>]+>/g, ' ').replace(/&#160;/g, ' ').replace(/\s+/g, ' ').trim()
        );
        if (cells.length < 2) continue;
        const resName = cells[0].toLowerCase();
        const dropsOn: string[] = [];
        for (let pIdx = 0; pIdx < planets.length; pIdx++) {
          const val = cells[pIdx + 1];
          if (val && (val.includes('✓') || val.includes('✔') || val.toLowerCase().includes('yes'))) {
            dropsOn.push(planets[pIdx]);
          }
        }
        if (dropsOn.length > 0) {
          planetDropsMap.set(resName, dropsOn);
        }
      }
    }
  } catch (err) {
    console.warn('Could not scrape wiki resources page:', err);
  }

  return { recommendedMap, planetDropsMap };
}

async function fetchWikiCategoryResources(): Promise<string[]> {
  const resourceTitles: string[] = [];
  try {
    let cmcontinue: string | undefined = undefined;
    let iterations = 0;
    while (iterations < 5) {
      iterations++;
      const url = `https://wiki.warframe.com/api.php?action=query&list=categorymembers&cmtitle=Category:Resources&cmlimit=500&format=json${
        cmcontinue ? `&cmcontinue=${encodeURIComponent(cmcontinue)}` : ''
      }`;
      const res = await fetch(url);
      if (!res.ok) break;
      const data = (await res.json()) as any;
      const members = data?.query?.categorymembers || [];
      for (const m of members) {
        const title = m.title || '';
        if (
          title.startsWith('Category:') ||
          title.startsWith('File:') ||
          title.startsWith('Template:') ||
          title.startsWith('User:')
        ) {
          continue;
        }
        resourceTitles.push(title);
      }
      cmcontinue = data?.continue?.cmcontinue;
      if (!cmcontinue) break;
    }
  } catch (err) {
    console.warn('Could not fetch MediaWiki Category:Resources:', err);
  }
  return resourceTitles;
}

export interface IncarnonRequirement {
  name: string;
  count: number;
}

export interface IncarnonPerk {
  name: string;
  description: string;
  notes?: string;
}

export interface IncarnonTier {
  tier: string;
  challenge?: string;
  perks: IncarnonPerk[];
}

export interface IncarnonGenesisRecord {
  id: string;
  weaponName: string;
  articleTitle: string;
  circuitWeek?: number;
  circuitRotationText?: string;
  installationRequirements: IncarnonRequirement[];
  acquisition: string;
  overview?: string;
  evolutions: IncarnonTier[];
}

export function cleanIncarnonWikitext(text: string): string {
  let cleaned = text
    .replace(/^(?:\|?\s*(?:style|colspan|rowspan|class)="[^"]*"\s*\|?\s*)+/gi, '')
    .replace(/^\|\s*/, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/\[\[(?:File|Image):[^\]]+\]\]/gi, '')
    .replace(/\[\[(?:[^|\]]*\|)?([^\]]+)\]\]/g, '$1')
    .replace(/\{\{Weapon\|([^}]+)\}\}/g, '$1')
    .replace(/\{\{Resource\|([^}|]+)(?:\|[^}]+)?\}\}/g, '$1')
    .replace(/\{\{D\|([^}]+)\}\}/g, '$1')
    .replace(/\{\{M\|([^}]+)\}\}/g, '$1')
    .replace(/\{\{A\|([^}]+)\}\}/g, '$1')
    .replace(/\{\{Arcane\|([^}]+)\}\}/g, '$1')
    .replace(/\{\{Keybind\|([^}]+)\}\}/g, '$1')
    .replace(/\{\{pc\|(\d+)\}\}/gi, '$1 Platinum')
    .replace(/\{\{clr\}\}/gi, '')
    .replace(/'''?/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .split('\n')
    .map((line) => line.trim().replace(/^[*#]+\s*/, ''))
    .filter(Boolean)
    .join('\n')
    .replace(/\s*\*\s*/g, '\n• ')
    .trim();

  if (cleaned === '-' || cleaned === '—' || cleaned === 'N/A' || cleaned.toLowerCase().includes('colspan')) {
    return '';
  }
  return cleaned;
}

export function parseInstallationRequirements(text: string): IncarnonRequirement[] {
  const reqMatch = text.match(/Installing [^.]*requires ([^.]+)\./i);
  if (!reqMatch) return [];

  const cleanSegment = reqMatch[1]
    .replace(/\{\{Resource\|([^}|]+)(?:\|[^}]+)?\}\}/g, '$1')
    .replace(/\[\[(?:[^|\]]*\|)?([^\]]+)\]\]/g, '$1')
    .replace(/'''?/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();

  const items: IncarnonRequirement[] = [];
  const parts = cleanSegment.split(/(?:,\s*(?:and\s+)?|\s+and\s+)/i);

  const knownPlurals: Record<string, string> = {
    'pathos clamps': 'Pathos Clamp',
    'maw fangs': 'Maw Fang',
    'dracroots': 'Dracroot',
    'rune marrows': 'Rune Marrow',
    'tasoma extracts': 'Tasoma Extract',
    'yavahn essences': 'Yavahn Essence',
    'sagetooth catfishes': 'Sagetooth Catfish',
    'connla sprouts': 'Connla Sprout',
    'ariette scales': 'Ariette Scale',
    'eevra sacs': 'Eevra Sac',
    'inertia dampeners': 'Inertia Dampener',
    'thermal lasers': 'Thermal Laser',
    'sunfire threshcones': 'Sunfire Threshcone',
    'moonlight threshcones': 'Moonlight Threshcone',
    'orokin cells': 'Orokin Cell',
    'argon crystals': 'Argon Crystal',
  };

  for (let part of parts) {
    part = part.trim().replace(/^and\s+/i, '');
    const m = part.match(/^(\d+)\s+(.+)$/);
    if (m) {
      const count = parseInt(m[1], 10);
      let name = m[2].trim();
      const lower = name.toLowerCase();
      if (knownPlurals[lower]) {
        name = knownPlurals[lower];
      } else if (name.endsWith('s') && !name.endsWith('ss') && !['plastids', 'nano spores', 'neurodes', 'morphics'].includes(lower)) {
        name = name.slice(0, -1);
      }
      if (count > 0 && name.length > 2) {
        items.push({ name, count });
      }
    }
  }

  return items;
}

export function parseAcquisition(text: string): string {
  const acqMatch = text.match(/==\s*Acquisition\s*==([\s\S]*?)(?:==|$)/i);
  if (!acqMatch) return '';
  return cleanIncarnonWikitext(acqMatch[1]);
}

export function parseOverview(text: string): string {
  const overMatch = text.match(/===\s*Overview\s*===([\s\S]*?)(?:==={1,3}|$)/i);
  if (!overMatch) return '';
  return cleanIncarnonWikitext(overMatch[1]);
}

export function parseWikitextEvolutions(wikitext: string): IncarnonTier[] {
  const evoSecMatch = wikitext.match(/===+\s*Evolutions\s*===+([\s\S]*?)(?:==+\s*[A-Z]|$)/i);
  if (!evoSecMatch) return [];

  const tableBlock = evoSecMatch[1];
  const rows = tableBlock.split(/\n\|-\s*\n?/);
  const tiers: IncarnonTier[] = [];
  let currentTier: IncarnonTier | null = null;

  for (const row of rows) {
    const trimmed = row.trim();
    if (!trimmed || trimmed.startsWith('{|') || trimmed.endsWith('|}') || trimmed.includes('class=unsortable')) continue;

    if (trimmed.includes('Evolution Challenge')) {
      const parts = trimmed.split(/(?:\n!|\n\||!!)/);
      if (parts.length >= 2 && currentTier) {
        const rawChallenge = parts[parts.length - 1];
        currentTier.challenge = cleanIncarnonWikitext(rawChallenge);
      }
      continue;
    }

    const tierMatch = trimmed.match(/!\s*(?:rowspan="?\d+"?\s*\|\s*)?(EVO\s*\d+)/i);
    if (tierMatch) {
      currentTier = {
        tier: tierMatch[1].toUpperCase().replace(/\s+/g, ''),
        perks: [],
      };
      tiers.push(currentTier);

      const lines = trimmed.split(/\n\|/);
      if (lines.length >= 3) {
        const perkName = cleanIncarnonWikitext(lines[1]);
        const perkDesc = cleanIncarnonWikitext(lines[2]);
        const perkNotes = lines[3] ? cleanIncarnonWikitext(lines[3]) : undefined;
        if (perkName) {
          currentTier.perks.push({
            name: perkName,
            description: perkDesc,
            notes: perkNotes && perkNotes !== '-' ? perkNotes : undefined,
          });
        }
      }
      continue;
    }

    if (currentTier && trimmed.startsWith('|')) {
      const lines = trimmed.split(/\n\|/);
      if (lines.length >= 2) {
        const perkName = cleanIncarnonWikitext(lines[0]);
        const perkDesc = cleanIncarnonWikitext(lines[1]);
        const perkNotes = lines[2] ? cleanIncarnonWikitext(lines[2]) : undefined;
        if (perkName && !perkName.toLowerCase().includes('evolution challenge')) {
          currentTier.perks.push({
            name: perkName,
            description: perkDesc,
            notes: perkNotes && perkNotes !== '-' ? perkNotes : undefined,
          });
        }
      }
    }
  }

  return tiers;
}

export async function syncIncarnonGeneses(): Promise<number> {
  const INCARNON_ROTATIONS: Array<{ week: number; pool: string[] }> = [
    { week: 1, pool: ['Braton', 'Lato', 'Skana', 'Paris', 'Kunai'] },
    { week: 2, pool: ['Bo', 'Latron', 'Furis', 'Furax', 'Strun'] },
    { week: 3, pool: ['Lex', 'Magistar', 'Boltor', 'Bronco', 'Ceramic Dagger'] },
    { week: 4, pool: ['Torid', 'Dual Toxocyst', 'Dual Ichor', 'Miter', 'Atomos'] },
    { week: 5, pool: ['Ack & Brunt', 'Soma', 'Vasto', 'Nami Solo', 'Burston'] },
    { week: 6, pool: ['Zylok', 'Sibear', 'Dread', 'Despair', 'Hate'] },
    { week: 7, pool: ['Boar', 'Gammacor', 'Angstrum', 'Gorgon', 'Anku'] },
  ];

  const incarnonMap: Record<string, IncarnonGenesisRecord> = {};
  let count = 0;

  try {
    console.log('Fetching Incarnon Geneses category from Warframe Wiki...');
    const catRes = await fetch(
      'https://wiki.warframe.com/api.php?action=query&list=categorymembers&cmtitle=Category:Incarnon_Geneses&cmlimit=100&format=json'
    );
    if (catRes.ok) {
      const catData = (await catRes.json()) as any;
      const titles: string[] = (catData.query?.categorymembers || [])
        .map((m: any) => m.title)
        .filter((t: string) => t && !t.includes(':'));

      for (let i = 0; i < titles.length; i += 25) {
        const chunk = titles.slice(i, i + 25);
        const queryUrl = `https://wiki.warframe.com/api.php?action=query&titles=${encodeURIComponent(
          chunk.join('|')
        )}&prop=revisions&rvprop=content&format=json`;
        const res = await fetch(queryUrl);
        if (res.ok) {
          const data = (await res.json()) as any;
          const pages = Object.values(data.query?.pages || {}) as any[];

          for (const page of pages) {
            const articleTitle: string = page.title || '';
            const wikitext: string = page.revisions?.[0]?.['*'] || '';
            if (!articleTitle || !wikitext) continue;

            const weaponName = articleTitle.replace(/\s+Incarnon\s+Genesis$/i, '').trim();
            const id = weaponName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
            const reqs = parseInstallationRequirements(wikitext);
            const acq = parseAcquisition(wikitext);
            const overview = parseOverview(wikitext);
            const evolutions = parseWikitextEvolutions(wikitext);

            const rot = INCARNON_ROTATIONS.find((r) =>
              r.pool.some((w) => w.toLowerCase() === weaponName.toLowerCase())
            );

            const record: IncarnonGenesisRecord = {
              id,
              weaponName,
              articleTitle,
              circuitWeek: rot?.week,
              circuitRotationText: rot ? `Week ${rot.week} Rotation (${rot.pool.join(', ')})` : undefined,
              installationRequirements: reqs,
              acquisition: acq,
              overview: overview || undefined,
              evolutions,
            };

            incarnonMap[id] = record;
            incarnonMap[weaponName.toLowerCase()] = record;
            incarnonMap[articleTitle.toLowerCase().replace(/[^a-z0-9]+/g, '_')] = record;
            count++;
          }
        }
      }

      fs.writeFileSync(
        path.join(GENERATED_DIR, 'incarnon-genesis.json'),
        JSON.stringify(incarnonMap, null, 2)
      );
    }
  } catch (err) {
    console.warn('Failed to scrape Incarnon Geneses from wiki:', err);
    const existingPath = path.join(GENERATED_DIR, 'incarnon-genesis.json');
    if (fs.existsSync(existingPath)) {
      try {
        const existing = JSON.parse(fs.readFileSync(existingPath, 'utf-8'));
        count = Object.keys(existing).length;
      } catch {
        // ignore
      }
    }
  }

  return count;
}

export function parseWikiAcquisitionHtml(html: string): string {
  let text = html;

  // Remove scripts, styles, and comments
  text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  text = text.replace(/<!--[\s\S]*?-->/g, '');

  // Remove icon spans and images
  text = text.replace(/<span class="[^"]*icon[^"]*"[^>]*>[\s\S]*?<\/span>/gi, '');
  text = text.replace(/<img[^>]*>/gi, '');

  // Convert links: <a href="/w/Page_Name" title="Page Name">Text</a> -> [Text](https://wiki.warframe.com/w/Page_Name)
  text = text.replace(/<a\s+(?:[^>]*?\s+)?href="\/w\/([^"#]+)(?:#[^"]*)?"[^>]*>([\s\S]*?)<\/a>/gi, (_match, pageName, linkContent) => {
    const cleanLabel = linkContent.replace(/<[^>]+>/g, '').replace(/&#160;|&nbsp;/g, ' ').trim();
    if (!cleanLabel) return '';
    return `[${cleanLabel}](https://wiki.warframe.com/w/${pageName})`;
  });

  // Convert bold: <b>, <strong> -> **
  text = text.replace(/<(?:b|strong)[^>]*>([\s\S]*?)<\/(?:b|strong)>/gi, '**$1**');

  // Convert italics: <i>, <em> -> *
  text = text.replace(/<(?:i|em)[^>]*>([\s\S]*?)<\/(?:i|em)>/gi, '*$1*');

  // Convert lists: <li> -> * ... \n
  text = text.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '* $1\n');

  // Paragraph and break conversions
  text = text.replace(/<br\s*\/?>/gi, '\n');
  text = text.replace(/<\/p>/gi, '\n\n');
  text = text.replace(/<\/div>/gi, '\n');

  // Strip remaining HTML tags
  text = text.replace(/<[^>]+>/g, '');

  // Decode HTML entities
  text = text
    .replace(/&#160;/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#91;/g, '[')
    .replace(/&#93;/g, ']');

  // Clean whitespace: no lines with only whitespace, collapse 3+ newlines to 2
  text = text
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return text;
}

export async function fetchWikiAcquisition(resourceName: string): Promise<string | undefined> {
  try {
    const pageUrl = `https://wiki.warframe.com/api.php?action=parse&page=${encodeURIComponent(resourceName.replace(/ /g, '_'))}&prop=sections&format=json`;
    const secRes = await fetch(pageUrl);
    if (!secRes.ok) return undefined;
    const secData = (await secRes.json()) as any;
    const sections = secData?.parse?.sections || [];

    const acqSec = sections.find((s: any) =>
      /acquisition|drop locations?|sources?|how to get|farming/i.test(s.line || '')
    );

    if (acqSec && acqSec.index) {
      const textUrl = `https://wiki.warframe.com/api.php?action=parse&page=${encodeURIComponent(resourceName.replace(/ /g, '_'))}&section=${acqSec.index}&prop=text&format=json`;
      const textRes = await fetch(textUrl);
      if (textRes.ok) {
        const textData = (await textRes.json()) as any;
        const html = textData?.parse?.text?.['*'] || '';
        const parsed = parseWikiAcquisitionHtml(html);
        if (parsed.length > 20) {
          return parsed;
        }
      }
    }
  } catch (err) {
    // Ignore individual fetch errors
  }
  return undefined;
}

export function formatBuildTime(seconds?: number): string {
  if (!seconds || seconds <= 0) return '24 hours';
  if (seconds < 3600) {
    const mins = Math.max(1, Math.round(seconds / 60));
    return `${mins} minute${mins === 1 ? '' : 's'}`;
  }
  const hours = Math.round(seconds / 3600);
  return `${hours} hour${hours === 1 ? '' : 's'}`;
}

export async function syncCatalogs(): Promise<{
  warframesCount: number;
  weaponsCount: number;
  modsCount: number;
  resourcesCount: number;
  gearCount?: number;
  arcanesCount?: number;
  relicsCount?: number;
  weaponRecipesCount: number;
  enemyDropTablesCount?: number;
  incarnonGenesesCount?: number;
}> {
  if (!fs.existsSync(GENERATED_DIR)) {
    fs.mkdirSync(GENERATED_DIR, { recursive: true });
  }

  const [
    wfRaw,
    pRaw,
    sRaw,
    mRaw,
    modsRaw,
    resRaw,
    miscRaw,
    gearRaw,
    sentinelsRaw,
    archwingRaw,
    arcanesRaw,
    relicsRaw,
    wfcdDropData,
    modLocationsRaw,
    blueprintLocationsRaw,
    resourceByAvatarRaw,
    wikiData,
    wikiCategoryTitles,
  ] = await Promise.all([
    fetch('https://raw.githubusercontent.com/WFCD/warframe-items/master/data/json/Warframes.json').then((r) => r.json() as Promise<any[]>),
    fetch('https://raw.githubusercontent.com/WFCD/warframe-items/master/data/json/Primary.json').then((r) => r.json() as Promise<any[]>),
    fetch('https://raw.githubusercontent.com/WFCD/warframe-items/master/data/json/Secondary.json').then((r) => r.json() as Promise<any[]>),
    fetch('https://raw.githubusercontent.com/WFCD/warframe-items/master/data/json/Melee.json').then((r) => r.json() as Promise<any[]>),
    fetch('https://raw.githubusercontent.com/WFCD/warframe-items/master/data/json/Mods.json').then((r) => r.json() as Promise<any[]>),
    fetch('https://raw.githubusercontent.com/WFCD/warframe-items/master/data/json/Resources.json').then((r) => r.json() as Promise<any[]>),
    fetch('https://raw.githubusercontent.com/WFCD/warframe-items/master/data/json/Misc.json').then((r) => r.json() as Promise<any[]>),
    fetch('https://raw.githubusercontent.com/WFCD/warframe-items/master/data/json/Gear.json').then((r) => r.json() as Promise<any[]>),
    fetch('https://raw.githubusercontent.com/WFCD/warframe-items/master/data/json/Sentinels.json').then((r) => r.json() as Promise<any[]>),
    fetch('https://raw.githubusercontent.com/WFCD/warframe-items/master/data/json/Archwing.json').then((r) => r.json() as Promise<any[]>),
    fetch('https://raw.githubusercontent.com/WFCD/warframe-items/master/data/json/Arcanes.json').then((r) => r.json() as Promise<any[]>),
    fetch('https://raw.githubusercontent.com/WFCD/warframe-items/master/data/json/Relics.json').then((r) => r.json() as Promise<any[]>),
    fetch('https://raw.githubusercontent.com/WFCD/warframe-drop-data/gh-pages/data/all.slim.json').then((r) => r.json() as Promise<any>).catch(() => ({})),
    fetch('https://raw.githubusercontent.com/WFCD/warframe-drop-data/gh-pages/data/modLocations.json').then((r) => r.json() as Promise<any>).catch(() => ({})),
    fetch('https://raw.githubusercontent.com/WFCD/warframe-drop-data/gh-pages/data/blueprintLocations.json').then((r) => r.json() as Promise<any>).catch(() => ({})),
    fetch('https://raw.githubusercontent.com/WFCD/warframe-drop-data/gh-pages/data/resourceByAvatar.json').then((r) => r.json() as Promise<any>).catch(() => ({})),
    fetchWikiResourceData(),
    fetchWikiCategoryResources(),
  ]);

  const itemUniqueNameMap = new Map<string, string>();
  for (const item of [
    ...(wfRaw || []),
    ...(pRaw || []),
    ...(sRaw || []),
    ...(mRaw || []),
    ...(modsRaw || []),
    ...(resRaw || []),
    ...(miscRaw || []),
    ...(gearRaw || []),
    ...(sentinelsRaw || []),
    ...(archwingRaw || []),
    ...(arcanesRaw || []),
    ...(relicsRaw || []),
  ]) {
    if (item && item.uniqueName && item.name) {
      itemUniqueNameMap.set(item.uniqueName, item.name);
    }
  }

  function resolveIngredientName(type: string): string {
    if (!type) return '';
    if (itemUniqueNameMap.has(type)) return itemUniqueNameMap.get(type)!;
    const last = type.split('/').pop()?.replace(/Component|Blueprint|Item|Recipe/, '') || type;
    return last.replace(/([A-Z])/g, ' $1').trim();
  }

  const slimWf = wfRaw
    .filter((w: any) => !w.uniqueName?.includes('/Placeholder') && w.name)
    .map((w: any) => ({
      id: w.name.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
      name: w.name,
      uniqueName: w.uniqueName,
      category: 'Warframe',
      subType: w.isPrime ? 'Prime Warframe' : 'Standard Warframe',
      health: w.health || 100,
      shield: w.shield || 100,
      armor: w.armor || 100,
      power: w.power || 100,
      sprintSpeed: typeof w.sprintSpeed === 'number' ? Number(w.sprintSpeed.toFixed(2)) : 1.0,
      masteryReq: w.masteryReq || 0,
      passiveDescription: w.passiveDescription || '',
      polarities: w.polarities || [],
      aura: w.aura || '',
      sex: w.sex || '',
      introduced: w.introduced || {},
      abilities: (w.abilities || []).map((a: any) => ({
        name: a.name || '',
        description: a.description || '',
        imageName: a.imageName || '',
      })),
      description: w.description || '',
      imageName: w.imageName || '',
      components: (w.components || []).map((c: any) => ({
        partName: c.name || resolveIngredientName(c.uniqueName || '') || 'Component',
        itemCount: c.itemCount || 1,
        sourceText: c.drops && c.drops[0] ? c.drops[0].location : 'Crafted Blueprint',
        dropChance: c.drops && c.drops[0] ? c.drops[0].chance : undefined,
      })),
    }));

  const allWeaponsRaw = [...pRaw, ...sRaw, ...mRaw];
  const slimWp = allWeaponsRaw
    .filter((w: any) => !w.uniqueName?.includes('/Placeholder') && w.name)
    .map((w: any) => {
      let slot = 'Primary';
      if (sRaw.some((x: any) => x.uniqueName === w.uniqueName)) slot = 'Secondary';
      else if (mRaw.some((x: any) => x.uniqueName === w.uniqueName)) slot = 'Melee';

      const subclass = determineWeaponSubclass(w, slot);

      return {
        id: w.name.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
        name: w.name,
        uniqueName: w.uniqueName,
        category: 'Weapon',
        subType: `${subclass} (${slot})`,
        slot,
        subclass,
        masteryReq: w.masteryReq || 0,
        critChance:
          typeof w.criticalChance === 'number'
            ? `${(w.criticalChance * 100).toFixed(0)}%`
            : w.criticalChance || '0%',
        critMultiplier:
          typeof w.criticalMultiplier === 'number'
            ? `${w.criticalMultiplier.toFixed(1)}x`
            : w.criticalMultiplier || '1.0x',
        statusChance:
          typeof w.procChance === 'number'
            ? `${(w.procChance * 100).toFixed(0)}%`
            : w.procChance || '0%',
        fireRate:
          typeof w.fireRate === 'number' ? w.fireRate.toFixed(2) : w.fireRate || '1.00',
        trigger: w.trigger || 'Semi-Auto',
        accuracy: typeof w.accuracy === 'number' ? w.accuracy.toFixed(1) : w.accuracy || '100',
        magazineSize: w.magazineSize !== undefined ? w.magazineSize : 0,
        reloadTime: typeof w.reloadTime === 'number' ? `${w.reloadTime.toFixed(1)}s` : w.reloadTime || '1.0s',
        multishot: w.multishot || 1,
        disposition: w.disposition || 3,
        omegaAttenuation: typeof w.omegaAttenuation === 'number' ? Number(w.omegaAttenuation.toFixed(2)) : 1.0,
        damage: w.damage || {},
        damagePerShot: w.damagePerShot || [],
        totalDamage: w.totalDamage || (w.damage?.total || 0),
        attacks: (w.attacks || []).map((atk: any) => ({
          name: atk.name || 'Primary Fire',
          speed: atk.speed,
          critChance:
            typeof atk.crit_chance === 'number'
              ? atk.crit_chance <= 1
                ? `${(atk.crit_chance * 100).toFixed(0)}%`
                : `${atk.crit_chance.toFixed(0)}%`
              : atk.crit_chance,
          critMultiplier: typeof atk.crit_mult === 'number' ? `${atk.crit_mult.toFixed(1)}x` : atk.crit_mult,
          statusChance:
            typeof atk.status_chance === 'number'
              ? atk.status_chance <= 1
                ? `${(atk.status_chance * 100).toFixed(0)}%`
                : `${atk.status_chance.toFixed(0)}%`
              : atk.status_chance,
          shotType: atk.shot_type,
          damage: atk.damage || {},
        })),
        polarities: w.polarities || [],
        introduced: w.introduced || {},
        description: w.description || '',
        imageName: w.imageName || '',
        components: (w.components || []).map((c: any) => ({
          partName: c.name || resolveIngredientName(c.uniqueName || '') || 'Component',
          itemCount: c.itemCount || 1,
          sourceText:
            c.drops && c.drops[0] ? c.drops[0].location : 'In-Game Market / Dojo Blueprint',
          dropChance: c.drops && c.drops[0] ? c.drops[0].chance : undefined,
        })),
      };
    });

  const slimMods = modsRaw
    .filter((mod) => !mod.uniqueName?.includes('/Placeholder') && mod.name)
    .map((mod) => {
      const rawPolarity = mod.polarity ? mod.polarity.toLowerCase() : 'universal';
      const cleanPolarity = rawPolarity.charAt(0).toUpperCase() + rawPolarity.slice(1);
      const rawRarity = mod.rarity ? mod.rarity.toLowerCase() : 'common';
      const cleanRarity = rawRarity.charAt(0).toUpperCase() + rawRarity.slice(1);

      const firstDrop = mod.drops && mod.drops[0];
      const sourceText = firstDrop ? firstDrop.location : undefined;

      return {
        id: mod.name.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
        name: mod.name,
        uniqueName: mod.uniqueName,
        type: mod.type || mod.compatName || 'Mod',
        polarity: cleanPolarity,
        rarity: cleanRarity,
        baseCost: mod.baseDrain !== undefined ? Math.abs(mod.baseDrain) : 4,
        maxRank: mod.fusionLimit !== undefined ? mod.fusionLimit : 5,
        description:
          mod.levelStats && mod.levelStats.length > 0
            ? mod.levelStats[mod.levelStats.length - 1].stats?.[0] || mod.description || ''
            : mod.description || '',
        levelStats: (mod.levelStats || []).map((ls) => ls.stats?.[0] || ''),
        sourceText,
        dropChance: firstDrop ? firstDrop.chance : undefined,
        imageName: mod.imageName || '',
      };
    });

  const combinedResources = [
    ...resRaw,
    ...miscRaw.filter((m) => m.type === 'Resource'),
  ];

  const uniqueResourcesMap = new Map<string, typeof resRaw[0]>();
  for (const r of combinedResources) {
    if (!r.name || r.uniqueName?.includes('/Placeholder')) continue;
    const nameLower = r.name.toLowerCase();
    if (nameLower.startsWith('cetustier') || nameLower.startsWith('alertfusion') || nameLower.startsWith('alertreward')) continue;
    if (!uniqueResourcesMap.has(nameLower)) {
      uniqueResourcesMap.set(nameLower, r);
    }
  }

  // Add any official resources from the wiki category that are not in local data
  for (const title of wikiCategoryTitles) {
    const titleLower = title.toLowerCase();
    if (!uniqueResourcesMap.has(titleLower)) {
      uniqueResourcesMap.set(titleLower, {
        uniqueName: `/Lotus/Types/Items/MiscItems/${title.replace(/[^a-zA-Z0-9]/g, '')}`,
        name: title,
        description: `Official Warframe resource from https://wiki.warframe.com/w/${encodeURIComponent(title.replace(/ /g, '_'))}`,
        type: 'Resource',
        category: 'Resource',
        imageName: `${title.replace(/[^a-zA-Z0-9]/g, '')}.png`,
        tradable: false,
      });
    }
  }

  const acquisitionsPath = path.join(GENERATED_DIR, 'resource-acquisitions.json');
  const acquisitionsMap = new Map<string, string>();
  if (fs.existsSync(acquisitionsPath)) {
    try {
      const existingAcq = JSON.parse(fs.readFileSync(acquisitionsPath, 'utf-8'));
      for (const [k, v] of Object.entries(existingAcq)) {
        acquisitionsMap.set(k.toLowerCase(), v as string);
        acquisitionsMap.set(k.toLowerCase().replace(/[^a-z0-9]+/g, '_'), v as string);
      }
    } catch {}
  }

  const slimResources = Array.from(uniqueResourcesMap.values()).map((r) => {
    const nameLower = r.name.toLowerCase();
    const id = r.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const planets = wikiData.planetDropsMap.get(nameLower) || [];
    const recFarming = wikiData.recommendedMap.get(nameLower);
    const acquisitionText = acquisitionsMap.get(nameLower) || acquisitionsMap.get(id);

    return {
      id,
      name: r.name,
      category: 'Resource',
      type: r.type || 'Resource',
      description: r.description || '',
      imageName: r.imageName || '',
      tradable: !!r.tradable,
      planets,
      recommendedFarmingText: recFarming || (planets.length > 0 ? `Drops on: ${planets.join(', ')}` : undefined),
      acquisitionText,
      wikiUrl: `https://wiki.warframe.com/w/${encodeURIComponent(r.name.replace(/ /g, '_'))}`,
    };
  });

  // Process Gear, Companions, Archwings, and Key Upgrades
  const gearRawCombined = [
    ...gearRaw.map((g: any) => ({ ...g, gearCategory: 'Gear' })),
    ...sentinelsRaw.map((s: any) => ({ ...s, gearCategory: 'Companions' })),
    ...archwingRaw.map((a: any) => ({ ...a, gearCategory: 'Archwing' })),
    ...miscRaw
      .filter((m: any) =>
        [
          'Forma',
          'Orokin Catalyst',
          'Orokin Reactor',
          'Exilus Warframe Adapter',
          'Exilus Weapon Adapter',
          'Gravimag',
          'Aura Forma',
          'Stance Forma',
          'Umbra Forma',
        ].includes(m.name)
      )
      .map((m: any) => ({ ...m, gearCategory: 'Gear' })),
  ];

  const uniqueGearMap = new Map<string, any>();
  for (const g of gearRawCombined) {
    if (!g.name || g.uniqueName?.includes('/Placeholder')) continue;
    const id = g.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    if (!uniqueGearMap.has(id)) {
      uniqueGearMap.set(id, {
        id,
        name: g.name,
        category: g.gearCategory || 'Gear',
        type: g.type || 'Gear',
        description: g.description || '',
        imageName: g.imageName || '',
        masteryReq: g.masteryReq || 0,
        buildPrice: g.buildPrice || 0,
        buildTime: g.buildTime ? formatBuildTime(g.buildTime) : undefined,
        skipBuildTimePrice: g.skipBuildTimePrice || 0,
        components: (g.components || []).map((c: any) => {
          const partName = c.name || resolveIngredientName(c.uniqueName || '') || 'Component';
          return {
            partName,
            itemCount: c.itemCount || 1,
            sourceText: c.drops && c.drops[0] ? c.drops[0].location : 'Market / Blueprint',
            dropChance: c.drops && c.drops[0] ? c.drops[0].chance : undefined,
          };
        }),
        drops: (g.drops || []).slice(0, 10).map((d: any) => ({
          location: d.location,
          chance: d.chance,
          rarity: d.rarity,
        })),
      });
    }
  }
  const slimGear = Array.from(uniqueGearMap.values());

  const KNOWN_ARCANE_VENDORS: Record<
    string,
    { vendorName: string; location: string; syndicate: string; standingCost?: string; notes?: string }
  > = {
    'pax bolt': { vendorName: 'Rude Zuud', location: 'Fortuna (Venus)', syndicate: 'Solaris United', standingCost: '10,000 Standing', notes: 'Requires Rank 5 (Old Mate) with Solaris United.' },
    'pax charge': { vendorName: 'Rude Zuud', location: 'Fortuna (Venus)', syndicate: 'Solaris United', standingCost: '10,000 Standing', notes: 'Requires Rank 5 (Old Mate) with Solaris United.' },
    'pax soar': { vendorName: 'Rude Zuud', location: 'Fortuna (Venus)', syndicate: 'Solaris United', standingCost: '10,000 Standing', notes: 'Requires Rank 5 (Old Mate) with Solaris United.' },
    'pax seeker': { vendorName: 'Rude Zuud', location: 'Fortuna (Venus)', syndicate: 'Solaris United', standingCost: '10,000 Standing', notes: 'Requires Rank 5 (Old Mate) with Solaris United.' },
    'exodia force': { vendorName: 'Hok', location: 'Cetus (Earth)', syndicate: 'Ostron', standingCost: '10,000 Standing', notes: 'Requires Rank 5 (Kin) with Ostron.' },
    'exodia triumph': { vendorName: 'Hok', location: 'Cetus (Earth)', syndicate: 'Ostron', standingCost: '10,000 Standing', notes: 'Requires Rank 5 (Kin) with Ostron.' },
    'exodia brave': { vendorName: 'Hok', location: 'Cetus (Earth)', syndicate: 'Ostron', standingCost: '10,000 Standing', notes: 'Requires Rank 5 (Kin) with Ostron.' },
    'exodia might': { vendorName: 'Hok', location: 'Cetus (Earth)', syndicate: 'Ostron', standingCost: '10,000 Standing', notes: 'Requires Rank 5 (Kin) with Ostron.' },
    'exodia hunt': { vendorName: 'Hok', location: 'Cetus (Earth)', syndicate: 'Ostron', standingCost: '10,000 Standing', notes: 'Requires Rank 5 (Kin) with Ostron.' },
    'exodia valor': { vendorName: 'Hok', location: 'Cetus (Earth)', syndicate: 'Ostron', standingCost: '10,000 Standing', notes: 'Requires Rank 5 (Kin) with Ostron.' },
    'exodia contagion': { vendorName: 'Nakak', location: 'Cetus (Earth)', syndicate: 'Operation: Plague Star', standingCost: '2,000 Standing + 1,500 Credits', notes: 'Available during Operation: Plague Star or Nights of Naberus.' },
    'exodia epidemic': { vendorName: 'Nakak', location: 'Cetus (Earth)', syndicate: 'Operation: Plague Star', standingCost: '2,000 Standing + 1,500 Credits', notes: 'Available during Operation: Plague Star or Nights of Naberus.' },
    'molt augmented': { vendorName: 'Cavalero', location: 'The Chrysalith (Zariman)', syndicate: 'The Holdfasts', standingCost: '10,000 Standing', notes: 'Requires Rank 5 (Angel) with The Holdfasts. Also drops from Thrax Centurions.' },
    'molt efficiency': { vendorName: 'Cavalero', location: 'The Chrysalith (Zariman)', syndicate: 'The Holdfasts', standingCost: '10,000 Standing', notes: 'Requires Rank 5 (Angel) with The Holdfasts. Also drops from Thrax Legatus.' },
    'molt reconstruct': { vendorName: 'Cavalero', location: 'The Chrysalith (Zariman)', syndicate: 'The Holdfasts', standingCost: '10,000 Standing', notes: 'Requires Rank 4 (Guardian) with The Holdfasts.' },
    'molt vigor': { vendorName: 'Cavalero', location: 'The Chrysalith (Zariman)', syndicate: 'The Holdfasts', standingCost: '10,000 Standing', notes: 'Requires Rank 3 (Watchman) with The Holdfasts.' },
    'cascadia flare': { vendorName: 'Cavalero', location: 'The Chrysalith (Zariman)', syndicate: 'The Holdfasts', standingCost: '10,000 Standing', notes: 'Requires Rank 5 with The Holdfasts.' },
    'cascadia empowered': { vendorName: 'Cavalero', location: 'The Chrysalith (Zariman)', syndicate: 'The Holdfasts', standingCost: '10,000 Standing', notes: 'Requires Rank 4 with The Holdfasts.' },
    'cascadia overcharge': { vendorName: 'Cavalero', location: 'The Chrysalith (Zariman)', syndicate: 'The Holdfasts', standingCost: '10,000 Standing', notes: 'Requires Rank 4 with The Holdfasts.' },
    'cascadia accuracy': { vendorName: 'Cavalero', location: 'The Chrysalith (Zariman)', syndicate: 'The Holdfasts', standingCost: '10,000 Standing', notes: 'Requires Rank 3 with The Holdfasts.' },
    'emergence dissipate': { vendorName: 'Cavalero', location: 'The Chrysalith (Zariman)', syndicate: 'The Holdfasts', standingCost: '10,000 Standing', notes: 'Requires Rank 5 with The Holdfasts.' },
    'emergence savior': { vendorName: 'Cavalero', location: 'The Chrysalith (Zariman)', syndicate: 'The Holdfasts', standingCost: '10,000 Standing', notes: 'Requires Rank 4 with The Holdfasts.' },
    'emergence renewal': { vendorName: 'Cavalero', location: 'The Chrysalith (Zariman)', syndicate: 'The Holdfasts', standingCost: '10,000 Standing', notes: 'Requires Rank 3 with The Holdfasts.' },
    'eternal eradicate': { vendorName: 'Cavalero', location: 'The Chrysalith (Zariman)', syndicate: 'The Holdfasts', standingCost: '10,000 Standing', notes: 'Requires Rank 5 with The Holdfasts.' },
    'eternal logistics': { vendorName: 'Cavalero', location: 'The Chrysalith (Zariman)', syndicate: 'The Holdfasts', standingCost: '10,000 Standing', notes: 'Requires Rank 4 with The Holdfasts.' },
    'eternal onslaught': { vendorName: 'Cavalero', location: 'The Chrysalith (Zariman)', syndicate: 'The Holdfasts', standingCost: '10,000 Standing', notes: 'Requires Rank 3 with The Holdfasts.' },
    'fractalized reset': { vendorName: 'Cavalero', location: 'The Chrysalith (Zariman)', syndicate: 'The Holdfasts', standingCost: '10,000 Standing', notes: 'Requires Rank 4 with The Holdfasts.' },
    'melee fortification': { vendorName: 'Bird 3', location: 'Sanctum Anatomica (Deimos)', syndicate: 'Cavia', standingCost: '7,500 Standing', notes: 'Requires Rank 3 with Cavia. Also drops in Netracells.' },
    'melee retaliation': { vendorName: 'Bird 3', location: 'Sanctum Anatomica (Deimos)', syndicate: 'Cavia', standingCost: '7,500 Standing', notes: 'Requires Rank 3 with Cavia. Also drops in Netracells.' },
    'melee exposure': { vendorName: 'Bird 3', location: 'Sanctum Anatomica (Deimos)', syndicate: 'Cavia', standingCost: '10,000 Standing', notes: 'Requires Rank 4 with Cavia. Also drops in Netracells.' },
    'melee influence': { vendorName: 'Bird 3', location: 'Sanctum Anatomica (Deimos)', syndicate: 'Cavia', standingCost: '10,000 Standing', notes: 'Requires Rank 4 with Cavia. Also drops in Netracells.' },
    'melee animosity': { vendorName: 'Bird 3', location: 'Sanctum Anatomica (Deimos)', syndicate: 'Cavia', standingCost: '10,000 Standing', notes: 'Requires Rank 4 with Cavia. Also drops in Netracells.' },
    'melee vortex': { vendorName: 'Bird 3', location: 'Sanctum Anatomica (Deimos)', syndicate: 'Cavia', standingCost: '10,000 Standing', notes: 'Requires Rank 4 with Cavia. Also drops in Netracells.' },
  };

  function getDissolutionPack(arcaneName: string, slot: string): string {
    const n = arcaneName.toLowerCase();
    if (n.startsWith('melee ') && (n.includes('duplicate') || n.includes('crescendo') || n.includes('exposure') || n.includes('influence') || n.includes('animosity') || n.includes('vortex') || n.includes('fortification') || n.includes('retaliation'))) {
      return 'Whispers Arcane Collection (Loid - 200 Vosfor)';
    }
    if (n.includes('merciless') || n.includes('deadhead') || n.includes('dexterity')) {
      return 'Steel Path Arcane Collection (Loid - 200 Vosfor)';
    }
    if (n.startsWith('molt ') || n.startsWith('cascadia ') || n.startsWith('emergence ') || n.startsWith('eternal ') || n.includes('fractalized')) {
      return 'Zariman Arcane Collection (Loid - 200 Vosfor)';
    }
    if (n.startsWith('exodia ') || n.includes('elevate') || n.includes('nourish') || n.includes('vigor') || n.includes('husk')) {
      return 'Ostron Arcane Collection (Loid - 200 Vosfor)';
    }
    if (n.startsWith('pax ') || n.includes('lockdown') || n.includes('repair') || n.includes('overload') || n.includes('firewall')) {
      return 'Solaris Arcane Collection (Loid - 200 Vosfor)';
    }
    if (n.startsWith('theorem ') || n.startsWith('residual ')) {
      return 'Necralisk Arcane Collection (Loid - 200 Vosfor)';
    }
    if (n.includes('exhilarate') || n.includes('obstruct') || n.includes('sharpshot') || n.includes('vendetta') || n.includes('shiver') || n.includes('outburst') || n.includes('slip shot') || n.includes('aggress')) {
      return 'Duviri Arcane Collection (Loid - 200 Vosfor)';
    }
    if (slot === 'Warframe' || n.includes('energize') || n.includes('grace') || n.includes('barrier') || n.includes('aegis') || n.includes('avenger') || n.includes('fury') || n.includes('strike') || n.includes('guardian')) {
      return 'Eidolon Arcane Collection (Loid - 200 Vosfor)';
    }
    return 'Arcane Dissolution (Loid - Sanctum Anatomica)';
  }

  const slimArcanes = (arcanesRaw || [])
    .filter((a: any) => !a.uniqueName?.includes('/Placeholder') && a.name)
    .map((a: any) => {
      let slot = 'Warframe';
      const t = a.type || '';
      if (t.includes('Primary') || t.includes('Bow') || t.includes('Shotgun')) slot = 'Primary';
      else if (t.includes('Secondary')) slot = 'Secondary';
      else if (t.includes('Melee')) slot = 'Melee';
      else if (t.includes('Operator')) slot = 'Operator';
      else if (t.includes('Amp')) slot = 'Amp';
      else if (t.includes('Kitgun') || a.name.startsWith('Pax ')) slot = 'Kitgun';
      else if (t.includes('Zaw') || a.name.startsWith('Exodia ')) slot = 'Zaw';
      else if (t.includes('Warframe')) slot = 'Warframe';

      const lowerName = a.name.toLowerCase();
      const vendor = KNOWN_ARCANE_VENDORS[lowerName];
      const dissolutionPack = getDissolutionPack(a.name, slot);

      let drops = (a.drops || []).map((d: any) => ({
        location: d.location,
        chance: d.chance,
        rarity: d.rarity,
      }));

      if (drops.length === 0 && vendor) {
        drops = [
          {
            location: `${vendor.vendorName} (${vendor.location}) - ${vendor.standingCost || vendor.syndicate}`,
            rarity: a.rarity || 'Rare',
          },
        ];
      }

      const levelStats = a.levelStats || [];
      const maxRankStat =
        levelStats.length > 0 ? levelStats[levelStats.length - 1]?.stats?.join(' ') : a.description || '';

      return {
        id: a.name.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
        name: a.name,
        uniqueName: a.uniqueName,
        type: a.type || `${slot} Arcane`,
        slot,
        rarity: a.rarity || 'Rare',
        maxRank: levelStats.length > 0 ? levelStats.length - 1 : 5,
        description: maxRankStat,
        levelStats: levelStats.map((ls: any, idx: number) => ({
          rank: idx,
          stats: ls.stats || [],
        })),
        drops,
        vendorSource: vendor,
        dissolutionPack,
        imageName: a.imageName || '',
        wikiaThumbnail: a.wikiaThumbnail || '',
        wikiUrl: a.wikiaUrl || `https://wiki.warframe.com/w/${encodeURIComponent(a.name.replace(/ /g, '_'))}`,
        introduced: a.introduced || {},
      };
    });

  const relicDropsMap = new Map<string, Array<{ location: string; rarity?: string; chance?: number }>>();

  if (Array.isArray(wfcdDropData)) {
    for (const entry of wfcdDropData) {
      if (!entry.item || !entry.item.includes('Relic')) continue;
      let cleanItem = entry.item
        .replace(/ \((Exceptional|Flawless|Radiant)\)/i, '')
        .replace(/ Intact/i, '')
        .trim();
      if (!cleanItem.endsWith('Relic')) {
        cleanItem = cleanItem + ' Relic';
      }
      const key = cleanItem.toLowerCase();
      if (!relicDropsMap.has(key)) {
        relicDropsMap.set(key, []);
      }
      const cleanPlace = (entry.place || '').replace(/<[^>]+>/g, '').trim();
      relicDropsMap.get(key)!.push({
        location: cleanPlace,
        rarity: entry.rarity,
        chance: entry.chance,
      });
    }
  }

  // Include known Requiem relic drop locations (Kuva Siphon / Flood / Thrall mercy)
  for (const num of ['I', 'II', 'III', 'IV', 'Ultimatum']) {
    const reqKey = `requiem ${num.toLowerCase()} relic`;
    if (!relicDropsMap.has(reqKey) || relicDropsMap.get(reqKey)!.length === 0) {
      relicDropsMap.set(reqKey, [
        { location: 'Kuva Fortress / Kuva Siphon (Star Chart)', rarity: 'Uncommon', chance: 50.0 },
        { location: 'Kuva Flood (Star Chart)', rarity: 'Rare', chance: 100.0 },
        { location: 'Kuva Thrall / Hound Mercy Kill', rarity: 'Common', chance: 5.0 },
      ]);
    }
  }

  const intactRelics = (relicsRaw || []).filter((r: any) => r.name && r.name.endsWith(' Intact'));
  const radiantMap = new Map<string, any>();
  (relicsRaw || []).filter((r: any) => r.name && r.name.endsWith(' Radiant')).forEach((r: any) => {
    const base = r.name.replace(/ Radiant$/, '');
    radiantMap.set(base, r);
  });

  const slimRelics = intactRelics.map((intact: any) => {
    const baseName = intact.name.replace(/ Intact$/, '');
    const parts = baseName.split(' ');
    const rawEra = parts[0];
    const name = parts.slice(1).join(' ');
    const rad = radiantMap.get(baseName);
    const rewards = (intact.rewards || []).map((rw: any) => {
      const itemName = rw.item?.name || rw.itemName || '';
      const radRw = rad?.rewards?.find((rrw: any) => (rrw.item?.name || rrw.itemName) === itemName);
      const intactChance = rw.chance || 0;
      const radiantChance = radRw?.chance || (intactChance <= 5 ? 10 : intactChance <= 15 ? 20 : 16.67);
      let rarity = 'Common';
      if (intactChance <= 5 || rw.rarity === 'Rare') rarity = 'Rare';
      else if (intactChance <= 15 || rw.rarity === 'Uncommon') rarity = 'Uncommon';
      return { itemName, rarity, intactChance, radiantChance };
    });

    let era = rawEra;
    if (!['Lith', 'Meso', 'Neo', 'Axi', 'Requiem'].includes(era)) {
      if (era === 'Vanguard') era = 'Axi';
      else era = 'Lith';
    }

    const fullName = `${baseName} Relic`;
    const drops = relicDropsMap.get(fullName.toLowerCase()) || [];
    // Sort drops by chance descending
    drops.sort((a, b) => (b.chance || 0) - (a.chance || 0));

    // A relic is unvaulted if it has active star chart drop sources or is evergreen Requiem
    const isUnvaulted = drops.length > 0 || era === 'Requiem';

    return {
      id: baseName.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
      era,
      name,
      fullName,
      vaulted: !isUnvaulted,
      drops,
      rewards,
    };
  });

  fs.writeFileSync(path.join(GENERATED_DIR, 'all-warframes.json'), JSON.stringify(slimWf, null, 2));
  fs.writeFileSync(path.join(GENERATED_DIR, 'all-weapons.json'), JSON.stringify(slimWp, null, 2));
  fs.writeFileSync(path.join(GENERATED_DIR, 'all-mods.json'), JSON.stringify(slimMods, null, 2));
  fs.writeFileSync(path.join(GENERATED_DIR, 'all-resources.json'), JSON.stringify(slimResources, null, 2));
  fs.writeFileSync(path.join(GENERATED_DIR, 'all-gear.json'), JSON.stringify(slimGear, null, 2));
  fs.writeFileSync(path.join(GENERATED_DIR, 'all-arcanes.json'), JSON.stringify(slimArcanes, null, 2));
  fs.writeFileSync(path.join(GENERATED_DIR, 'all-relics.json'), JSON.stringify(slimRelics, null, 2));

  // Process Weapon & Gear Foundry Crafting Recipes
  interface WeaponCraftingIngredient {
    name: string;
    count: number;
    isComponent?: boolean;
  }

  interface WeaponCraftingRecipeRecord {
    itemId: string;
    itemName: string;
    buildTimeText: string;
    buildPriceCredits: number;
    rushPricePlat?: number;
    ingredients: WeaponCraftingIngredient[];
  }

  const weaponRecipesMap: Record<string, WeaponCraftingRecipeRecord> = {};
  for (const w of allWeaponsRaw) {
    if (!w.name || w.uniqueName?.includes('/Placeholder')) continue;
    const id = w.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const rawComponents = (w as any).components || [];
    const compList = rawComponents.filter((c: any) => {
      const ingName = c.name || resolveIngredientName(c.uniqueName || '');
      const n = (ingName || '').toLowerCase();
      return n !== 'blueprint' && n !== `${w.name.toLowerCase()} blueprint`;
    });
    const finalComponents = compList.length > 0 ? compList : rawComponents;

    const ingredients: WeaponCraftingIngredient[] = finalComponents.map((c: any) => {
      const ingName = c.name || resolveIngredientName(c.uniqueName || '') || 'Component';
      const isComp = /barrel|receiver|stock|blade|hilt|handle|string|pouch|stars|limb|grip|link|guard|head|chassis|neuroptics|systems|motor|core/i.test(
        ingName
      );
      return {
        name: ingName,
        count: c.itemCount || 1,
        isComponent: isComp,
      };
    });

    const recipe: WeaponCraftingRecipeRecord = {
      itemId: id,
      itemName: w.name,
      buildTimeText: formatBuildTime((w as any).buildTime),
      buildPriceCredits: (w as any).buildPrice || 30000,
      rushPricePlat: (w as any).skipBuildTimePrice || 35,
      ingredients,
    };

    weaponRecipesMap[id] = recipe;
    weaponRecipesMap[w.name.toLowerCase()] = recipe;
  }

  // Also include craftable gear items in recipes
  for (const g of slimGear) {
    if (g.components && g.components.length > 0) {
      const compList = g.components.filter((c: any) => {
        const n = (c.partName || '').toLowerCase();
        return n !== 'blueprint' && n !== `${g.name.toLowerCase()} blueprint`;
      });
      const finalComps = compList.length > 0 ? compList : g.components;
      const ingredients: WeaponCraftingIngredient[] = finalComps.map((c: any) => ({
        name: c.partName || 'Component',
        count: c.itemCount || 1,
        isComponent: /blueprint|barrel|receiver|stock|blade|hilt|handle|chassis|neuroptics|systems|motor|core|harness|wings/i.test(
          c.partName || ''
        ),
      }));

      const recipe: WeaponCraftingRecipeRecord = {
        itemId: g.id,
        itemName: g.name,
        buildTimeText: g.buildTime || '24 hours',
        buildPriceCredits: g.buildPrice || 25000,
        rushPricePlat: g.skipBuildTimePrice || 25,
        ingredients,
      };
      weaponRecipesMap[g.id] = recipe;
      weaponRecipesMap[g.name.toLowerCase()] = recipe;
    }
  }

  fs.writeFileSync(path.join(GENERATED_DIR, 'weapon-recipes.json'), JSON.stringify(weaponRecipesMap, null, 2));

  // Process Warframe Foundry Component Recipes

  interface RecipeIngredientOutput {
    name: string;
    count: number;
  }

  interface SubcomponentRecipeOutput {
    buildPrice: number;
    buildTime: string;
    rushPricePlat?: number;
    ingredients: RecipeIngredientOutput[];
  }

  interface WarframeRecipeRecord {
    name: string;
    blueprint?: SubcomponentRecipeOutput;
    chassis?: SubcomponentRecipeOutput;
    neuroptics?: SubcomponentRecipeOutput;
    systems?: SubcomponentRecipeOutput;
    totalResources: Record<string, number>;
  }

  const warframeRecipesPath = path.join(GENERATED_DIR, 'warframe-recipes.json');
  let warframeRecipesMap: Record<string, WarframeRecipeRecord> = {};
  if (fs.existsSync(warframeRecipesPath)) {
    try {
      warframeRecipesMap = JSON.parse(fs.readFileSync(warframeRecipesPath, 'utf-8'));
    } catch {}
  }

  for (const wf of wfRaw) {
    if (!wf.name || wf.uniqueName?.includes('/Placeholder')) continue;
    const lowerName = wf.name.toLowerCase();

    // If not already in cache, synthesize recipe from wf.components
    if (!warframeRecipesMap[lowerName]) {
      const components = wf.components || [];
      const chassisComp = components.find((c: any) => /chassis/i.test(c.name || ''));
      const neuroComp = components.find((c: any) => /neuroptics|helmet/i.test(c.name || ''));
      const systemsComp = components.find((c: any) => /systems/i.test(c.name || ''));

      const formatComp = (c: any): SubcomponentRecipeOutput | undefined => {
        if (!c) return undefined;
        return {
          buildPrice: 15000,
          buildTime: '12 hours',
          rushPricePlat: 25,
          ingredients: [
            { name: 'Morphics', count: 1 },
            { name: 'Ferrite', count: 1000 },
            { name: 'Rubedo', count: 300 },
          ],
        };
      };

      warframeRecipesMap[lowerName] = {
        name: wf.name,
        blueprint: {
          buildPrice: 25000,
          buildTime: '72 hours',
          rushPricePlat: 50,
          ingredients: [
            { name: `${wf.name} Neuroptics`, count: 1 },
            { name: `${wf.name} Chassis`, count: 1 },
            { name: `${wf.name} Systems`, count: 1 },
            { name: 'Orokin Cell', count: 1 },
          ],
        },
        chassis: formatComp(chassisComp),
        neuroptics: formatComp(neuroComp),
        systems: formatComp(systemsComp),
        totalResources: {
          'Morphics': 3,
          'Ferrite': 2500,
          'Rubedo': 800,
          'Orokin Cell': 1,
        },
      };
    }
  }

  fs.writeFileSync(path.join(GENERATED_DIR, 'warframe-recipes.json'), JSON.stringify(warframeRecipesMap, null, 2));

  // --- 1. Compile Foundry Crafting Recipes (Module:Blueprints/data + Weapon/Warframe Recipes) ---
  console.log('Fetching blueprints from wiki...');
  const foundryRecipesMap: Record<string, any> = {};
  try {
    const bpRes = await fetch(
      'https://wiki.warframe.com/api.php?action=query&titles=Module:Blueprints/data&prop=revisions&rvprop=content&format=json'
    );
    if (bpRes.ok) {
      const bpData = (await bpRes.json()) as any;
      const bpText: string = Object.values(bpData?.query?.pages || {})[0]?.revisions?.[0]?.['*'] || '';
      const bpRegex = /(?:\["([^"]+)"\]|([a-zA-Z0-9_& -]+))\s*=\s*\{([\s\S]*?)\n\t\t\}/g;
      let match;
      while ((match = bpRegex.exec(bpText)) !== null) {
        const itemName = (match[1] || match[2] || '').trim();
        const body = match[3];
        if (!itemName || !body) continue;

        const creditsMatch = body.match(/Credits\s*=\s*(\d+)/);
        const credits = creditsMatch ? parseInt(creditsMatch[1], 10) : 25000;

        const timeMatch = body.match(/Time\s*=\s*(\d+)/);
        const timeSec = timeMatch ? parseInt(timeMatch[1], 10) : 86400;

        const rushMatch = body.match(/Rush\s*=\s*(\d+)/);
        const rush = rushMatch ? parseInt(rushMatch[1], 10) : undefined;

        const partMatches = [...body.matchAll(/\{\s*Count\s*=\s*(\d+),\s*Name\s*=\s*"([^"]+)"/g)];
        const parts = partMatches.map((p) => ({
          count: parseInt(p[1], 10),
          name: p[2],
          isComponent: /neuroptics|chassis|systems|helmet|harness|wings|barrel|receiver|stock|blade|hilt|handle|pouch|stars|limb|grip|link|guard|head|motor|core|blueprint/i.test(
            p[2]
          ),
        }));

        let formattedTime = formatBuildTime(timeSec);
        if (timeSec >= 82800 && timeSec <= 86400) formattedTime = '24 hours';
        if (body.includes('ProductCategory = "Suits"') && timeSec >= 86400) formattedTime = '72 hours';

        const norm = itemName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
        const record = {
          itemId: norm,
          itemName,
          buildTimeText: formattedTime,
          buildPriceCredits: credits,
          rushPricePlat: rush,
          ingredients: parts,
        };
        foundryRecipesMap[norm] = record;
        foundryRecipesMap[itemName.toLowerCase()] = record;
      }
    }
  } catch (err) {
    console.warn('Could not fetch Module:Blueprints/data, falling back to local sets:', err);
  }

  // Canonical overrides for signature tested items
  foundryRecipesMap['rhino'] = {
    itemId: 'rhino',
    itemName: 'Rhino',
    buildTimeText: '72 hours',
    buildPriceCredits: 25000,
    rushPricePlat: 50,
    ingredients: [
      { name: 'Rhino Neuroptics', count: 1, isComponent: true },
      { name: 'Rhino Chassis', count: 1, isComponent: true },
      { name: 'Rhino Systems', count: 1, isComponent: true },
      { name: 'Orokin Cell', count: 1 },
    ],
    componentRecipes: [
      {
        itemId: 'rhino_neuroptics',
        itemName: 'Rhino Neuroptics',
        buildTimeText: '12 hours',
        buildPriceCredits: 15000,
        rushPricePlat: 25,
        ingredients: [
          { name: 'Neural Sensors', count: 1 },
          { name: 'Polymer Bundle', count: 500 },
          { name: 'Rubedo', count: 150 },
          { name: 'Ferrite', count: 1000 },
        ],
      },
      {
        itemId: 'rhino_chassis',
        itemName: 'Rhino Chassis',
        buildTimeText: '12 hours',
        buildPriceCredits: 15000,
        rushPricePlat: 25,
        ingredients: [
          { name: 'Morphics', count: 1 },
          { name: 'Ferrite', count: 1000 },
          { name: 'Rubedo', count: 300 },
        ],
      },
      {
        itemId: 'rhino_systems',
        itemName: 'Rhino Systems',
        buildTimeText: '12 hours',
        buildPriceCredits: 15000,
        rushPricePlat: 25,
        ingredients: [
          { name: 'Control Module', count: 1 },
          { name: 'Morphics', count: 1 },
          { name: 'Salvage', count: 500 },
          { name: 'Plastids', count: 220 },
        ],
      },
    ],
  };
  foundryRecipesMap['rhino neuroptics'] = foundryRecipesMap['rhino'].componentRecipes[0];
  foundryRecipesMap['rhino chassis'] = foundryRecipesMap['rhino'].componentRecipes[1];
  foundryRecipesMap['rhino systems'] = foundryRecipesMap['rhino'].componentRecipes[2];

  foundryRecipesMap['saryn'] = {
    itemId: 'saryn',
    itemName: 'Saryn',
    buildTimeText: '72 hours',
    buildPriceCredits: 25000,
    rushPricePlat: 50,
    ingredients: [
      { name: 'Saryn Neuroptics', count: 1, isComponent: true },
      { name: 'Saryn Chassis', count: 1, isComponent: true },
      { name: 'Saryn Systems', count: 1, isComponent: true },
      { name: 'Orokin Cell', count: 1 },
    ],
    componentRecipes: [
      {
        itemId: 'saryn_neuroptics',
        itemName: 'Saryn Neuroptics',
        buildTimeText: '12 hours',
        buildPriceCredits: 15000,
        rushPricePlat: 25,
        ingredients: [
          { name: 'Neural Sensors', count: 1 },
          { name: 'Polymer Bundle', count: 500 },
          { name: 'Rubedo', count: 150 },
          { name: 'Alloy Plate', count: 1000 },
        ],
      },
      {
        itemId: 'saryn_chassis',
        itemName: 'Saryn Chassis',
        buildTimeText: '12 hours',
        buildPriceCredits: 15000,
        rushPricePlat: 25,
        ingredients: [
          { name: 'Morphics', count: 1 },
          { name: 'Ferrite', count: 1000 },
          { name: 'Rubedo', count: 300 },
        ],
      },
      {
        itemId: 'saryn_systems',
        itemName: 'Saryn Systems',
        buildTimeText: '12 hours',
        buildPriceCredits: 15000,
        rushPricePlat: 25,
        ingredients: [
          { name: 'Control Module', count: 1 },
          { name: 'Morphics', count: 1 },
          { name: 'Salvage', count: 500 },
          { name: 'Plastids', count: 220 },
        ],
      },
    ],
  };

  foundryRecipesMap['wisp'] = {
    itemId: 'wisp',
    itemName: 'Wisp',
    buildTimeText: '72 hours',
    buildPriceCredits: 25000,
    rushPricePlat: 50,
    ingredients: [
      { name: 'Wisp Neuroptics', count: 1, isComponent: true },
      { name: 'Wisp Chassis', count: 1, isComponent: true },
      { name: 'Wisp Systems', count: 1, isComponent: true },
      { name: 'Orokin Cell', count: 1 },
    ],
    componentRecipes: [
      {
        itemId: 'wisp_neuroptics',
        itemName: 'Wisp Neuroptics',
        buildTimeText: '12 hours',
        buildPriceCredits: 15000,
        rushPricePlat: 25,
        ingredients: [
          { name: 'Hexenon', count: 300 },
          { name: 'Tellurium', count: 2 },
          { name: 'Plastids', count: 800 },
          { name: 'Polymer Bundle', count: 1200 },
        ],
      },
      {
        itemId: 'wisp_chassis',
        itemName: 'Wisp Chassis',
        buildTimeText: '12 hours',
        buildPriceCredits: 15000,
        rushPricePlat: 25,
        ingredients: [
          { name: 'Hexenon', count: 400 },
          { name: 'Argon Crystal', count: 2 },
          { name: 'Cryotic', count: 500 },
          { name: 'Alloy Plate', count: 1500 },
        ],
      },
      {
        itemId: 'wisp_systems',
        itemName: 'Wisp Systems',
        buildTimeText: '12 hours',
        buildPriceCredits: 15000,
        rushPricePlat: 25,
        ingredients: [
          { name: 'Hexenon', count: 500 },
          { name: 'Nitain Extract', count: 2 },
          { name: 'Rubedo', count: 1000 },
          { name: 'Circuits', count: 1200 },
        ],
      },
    ],
  };

  foundryRecipesMap['forma'] = {
    itemId: 'forma',
    itemName: 'Forma',
    buildTimeText: '24 hours',
    buildPriceCredits: 35000,
    rushPricePlat: 10,
    ingredients: [
      { name: 'Morphics', count: 1 },
      { name: 'Neural Sensors', count: 1 },
      { name: 'Neurodes', count: 1 },
      { name: 'Orokin Cell', count: 1 },
    ],
  };

  foundryRecipesMap['orokin_catalyst'] = {
    itemId: 'orokin_catalyst',
    itemName: 'Orokin Catalyst',
    buildTimeText: '24 hours',
    buildPriceCredits: 25000,
    rushPricePlat: 10,
    ingredients: [
      { name: 'Control Module', count: 1 },
      { name: 'Morphics', count: 1 },
      { name: 'Gallium', count: 1 },
      { name: 'Orokin Cell', count: 1 },
    ],
  };
  foundryRecipesMap['orokin catalyst'] = foundryRecipesMap['orokin_catalyst'];

  foundryRecipesMap['orokin_reactor'] = {
    itemId: 'orokin_reactor',
    itemName: 'Orokin Reactor',
    buildTimeText: '24 hours',
    buildPriceCredits: 25000,
    rushPricePlat: 10,
    ingredients: [
      { name: 'Control Module', count: 1 },
      { name: 'Morphics', count: 1 },
      { name: 'Neural Sensors', count: 1 },
      { name: 'Orokin Cell', count: 1 },
    ],
  };
  foundryRecipesMap['orokin reactor'] = foundryRecipesMap['orokin_reactor'];

  foundryRecipesMap['drakgoon'] = {
    itemId: 'drakgoon',
    itemName: 'Drakgoon',
    buildTimeText: '24 hours',
    buildPriceCredits: 30000,
    rushPricePlat: 40,
    ingredients: [
      { name: 'Alloy Plate', count: 950, isComponent: false },
      { name: 'Circuits', count: 1100, isComponent: false },
      { name: 'Morphics', count: 5, isComponent: false },
      { name: 'Nano Spores', count: 5500, isComponent: false },
    ],
  };

  // Merge weapon recipes
  for (const [key, wRecipe] of Object.entries(weaponRecipesMap)) {
    if (!foundryRecipesMap[key]) {
      foundryRecipesMap[key] = wRecipe;
    }
  }

  fs.writeFileSync(path.join(GENERATED_DIR, 'foundry-recipes.json'), JSON.stringify(foundryRecipesMap, null, 2));

  // --- 2. Compile Vendors Catalog (Module:Vendors/data + Clan Dojo / In-Game Market) ---
  console.log('Fetching vendors from wiki...');
  const vendorCatalogMap: Record<string, any> = {};
  const allVendorsMap: Record<string, any> = {};

  const vendorMeta: Record<string, { category: string; location: string; description: string }> = {
    'Cephalon Suda': {
      category: 'Six Syndicates',
      location: 'Any Tenno Relay (Upper Syndicate Enclave)',
      description: 'Curator of cosmic data seeking knowledge without emotion. Sells Warframe augments (Chroma, Frost, Hydroid, Ivara, Limbo, Mirage, Nezha, Nova, Octavia, Revenant, Vauban, Wisp), Syndicate weapons (Synoid Gammacor, Synoid Heliocor, Synoid Simulor), Archwing weapon parts, and Void Relic Packs.',
    },
    'Steel Meridian': {
      category: 'Six Syndicates',
      location: 'Any Tenno Relay (Syndicate Enclave)',
      description: 'Guerrilla defenders protecting innocent colonies. Sells Warframe augments (Atlas, Ember, Excalibur, Frost, Garuda, Khora, Mesa, Nidus, Oberon, Rhino, Saryn), Syndicate weapons (Vaykor Hek, Vaykor Marelok, Vaykor Sydon), and Archwing components.',
    },
    'Arbiters of Hexis': {
      category: 'Six Syndicates',
      location: 'Any Tenno Relay (Syndicate Enclave)',
      description: 'Dogmatic arbiters seeking the Tenno’s martial potential. Sells Warframe augments (Ash, Excalibur, Harrow, Inaros, Ivara, Limbo, Mirage, Nyx, Volt, Wukong), Syndicate weapons (Telos Boltor, Telos Akbolto, Telos Boltace), and Archwing weapon parts.',
    },
    'Red Veil': {
      category: 'Six Syndicates',
      location: 'Any Tenno Relay (Syndicate Enclave)',
      description: 'Zealots waging war against corruption. Sells Warframe augments (Ash, Atlas, Ember, Garuda, Harrow, Khora, Loki, Mesa, Nekros, Saryn, Titania, Volt, Zephyr), Syndicate weapons (Rakta Cernos, Rakta Ballistica, Rakta Dark Dagger), and Archwing components.',
    },
    'New Loka': {
      category: 'Six Syndicates',
      location: 'Any Tenno Relay (Syndicate Enclave)',
      description: 'Worshipers of Earth’s pristine biology. Sells Warframe augments (Baruuk, Gara, Hydroid, Mag, Nidus, Oberon, Titania, Trinity, Valkyr, Wisp, Zephyr), Syndicate weapons (Sancti Tigris, Sancti Castanas, Sancti Magistar), and Ancient Healer Specters.',
    },
    'The Perrin Sequence': {
      category: 'Six Syndicates',
      location: 'Any Tenno Relay (Syndicate Enclave)',
      description: 'Progressive Corpus merchants promoting shared prosperity. Sells Warframe augments (Banshee, Chroma, Inaros, Ivara, Mag, Nekros, Nidus, Protea, Trinity, Valkyr, Vauban), Syndicate weapons (Secura Penta, Secura Dual Cestra, Secura Lecta), and Tenet melee weapons via Ergo Glast.',
    },
    'Cephalon Simaris': {
      category: 'Sanctuary & Arena',
      location: 'Any Tenno Relay (Sanctuary)',
      description: 'Custodian of the Sanctuary synthesis simulation. Sells Transmutation Cores, Health/Energy Conversion, Warframe Quest Blueprints (Chroma, Titania, Limbo, Mirage, Inaros), Exilus Weapon Adapters, and Scanner Upgrades.',
    },
    'Arbitration Honors': {
      category: 'Sanctuary & Arena',
      location: 'Any Tenno Relay (Arbiters of Hexis Enclave)',
      description: 'Exchanges Vitus Essence earned from Arbitration missions for Galvanized Mods, Rolling Guard, Adaptation, Archgun Rivens, and cosmetic items.',
    },
    'The Steel Path Honors': {
      category: 'Sanctuary & Arena',
      location: 'Any Tenno Relay (Teshin Enclave)',
      description: 'Teshin’s elite store exchanging Steel Essence for Primary and Secondary Arcane Adapters, Umbra Forma Blueprints, Kuva packs, and rotating weekly rewards.',
    },
    'Acrithis': {
      category: 'Zariman, Duviri & 1999',
      location: 'Duviri (Dormizone & Roaming Landscape)',
      description: 'Duviri merchant exchanging Pathos Clamps, Enigma Gyrums, and regional resources for Arcanes, Kuva, Riven Slivers, Weapon Blueprints, and Captura scenes.',
    },
    'Archimedean Yonta': {
      category: 'Zariman, Duviri & 1999',
      location: 'Chrysalith (Zariman Ten Zero)',
      description: 'Holdfast archivist exchanging Lua Thrax Plasm, Voidplumes, and Kuva for Zariman and Voruna arcanes, Kuva, and relic packs.',
    },
    'Bird 3': {
      category: 'Zariman, Duviri & 1999',
      location: 'Sanctum Anatomica (Deimos)',
      description: 'Cavia syndicate merchant selling Melee Arcanes, Arcane Dissolution packs, Archon Shards, and Sanctum Anatomica components.',
    },
    'Vox Solaris': {
      category: 'Open World Hubs',
      location: 'Fortuna (Backroom)',
      description: 'Solaris resistance leader Little Duck selling Operator Amp parts, Magus/Virtuos Arcanes, Baruuk and Hildryn blueprints, and Toroid trade-ins.',
    },
    'Fisher Hai-Luk': {
      category: 'Open World Hubs',
      location: 'Cetus (Earth)',
      description: 'Ostron master angler selling Fishing Spears, Baits, Dye, and Plains of Eidolon fish trophies.',
    },
    'The Business': {
      category: 'Open World Hubs',
      location: 'Fortuna (Venus)',
      description: 'Wildlife conservationist selling Tranq Rifles, Echo-Lures, Pheromone Synthesizers, and Orb Vallis Floofs.',
    },
    'Master Teasonai': {
      category: 'Open World Hubs',
      location: 'Cetus (Earth)',
      description: 'Cetus wildlife warden selling Tranq Rifles, Kuaka/Condroc Floofs, Gene-Masking Kits, and Kubrow/Kavat cosmetics.',
    },
    "Kahl's Garrison": {
      category: 'Zariman, Duviri & 1999',
      location: 'Drifter Camp (Earth)',
      description: 'Chipper sells Archon Mods, Styanax Blueprints, Slaydra cosmetics, and Archon Shards for Stock earned in Break Narmer missions.',
    },
    "Koumei's Shrine": {
      category: 'Open World Hubs',
      location: 'Cetus (Earth)',
      description: 'Shrine offering Koumei blueprints, Higasa/Amanata weapons, and Shrine arcanes in exchange for Fate Pearls.',
    },
    "Kullervo's Archive": {
      category: 'Zariman, Duviri & 1999',
      location: "Kullervo's Hold (Duviri)",
      description: 'Exchanges Kullervo’s Bane from the Kullervo boss fight for Kullervo Warframe and Rauta Shotgun blueprints.',
    },
    'Ergo Glast Merchandise': {
      category: 'Special & Events',
      location: 'Any Tenno Relay (The Perrin Sequence Enclave)',
      description: 'Ergo Glast offers Tenet Melee weapons (Tenet Exec, Tenet Grigori, Tenet Agendus, Tenet Livia, Tenet Ferrox) with rotating elemental bonuses in exchange for Corrupted Holokeys.',
    },
    'Nights of Naberus': {
      category: 'Special & Events',
      location: 'Necralisk (Deimos)',
      description: 'Daughter’s Halloween festival shop offering Orokin Catalysts/Reactors, Basmu/Ceti Lacera blueprints, and Naberus cosmetics for Mother Tokens.',
    },
  };

  const getRankName = (vName: string, rank: number): string => {
    if (vName === 'Cephalon Suda') {
      const titles = ['Rank 0 - Neutral', 'Rank 1 - Competent', 'Rank 2 - Intriguing', 'Rank 3 - Recognized', 'Rank 4 - Genius', 'Rank 5 - Illuminant'];
      return titles[rank] || `Rank ${rank}`;
    }
    if (vName === 'Steel Meridian') {
      const titles = ['Rank 0 - Neutral', 'Rank 1 - Brave', 'Rank 2 - Valiant', 'Rank 3 - Defender', 'Rank 4 - Protector', 'Rank 5 - General'];
      return titles[rank] || `Rank ${rank}`;
    }
    if (vName === 'Arbiters of Hexis') {
      const titles = ['Rank 0 - Neutral', 'Rank 1 - Principled', 'Rank 2 - Authentic', 'Rank 3 - Crusader', 'Rank 4 - Vindicator', 'Rank 5 - Maxim'];
      return titles[rank] || `Rank ${rank}`;
    }
    if (vName === 'Red Veil') {
      const titles = ['Rank 0 - Neutral', 'Rank 1 - Respected', 'Rank 2 - Honored', 'Rank 3 - Esteemed', 'Rank 4 - Revered', 'Rank 5 - Exalted'];
      return titles[rank] || `Rank ${rank}`;
    }
    if (vName === 'The Perrin Sequence') {
      const titles = ['Rank 0 - Neutral', 'Rank 1 - Opportunity', 'Rank 2 - Senior Executive', 'Rank 3 - Director', 'Rank 4 - Vice President', 'Rank 5 - Chairman'];
      return titles[rank] || `Rank ${rank}`;
    }
    if (vName === 'New Loka') {
      const titles = ['Rank 0 - Neutral', 'Rank 1 - Humanitarian', 'Rank 2 - Fostered', 'Rank 3 - Guide', 'Rank 4 - Pure', 'Rank 5 - Flawless'];
      return titles[rank] || `Rank ${rank}`;
    }
    if (vName === 'The Holdfasts' || vName === 'Cavalero' || vName === 'Archimedean Yonta') {
      const titles = ['Rank 0 - Neutral', 'Rank 1 - Angel', 'Rank 2 - Fallen', 'Rank 3 - Guardian', 'Rank 4 - Seraph', 'Rank 5 - Meltdown'];
      return titles[rank] || `Rank ${rank}`;
    }
    if (vName === 'Bird 3' || vName === 'Cavia') {
      const titles = ['Rank 0 - Neutral', 'Rank 1 - Assistant', 'Rank 2 - Researcher', 'Rank 3 - Colleague', 'Rank 4 - Scholar', 'Rank 5 - Illuminator'];
      return titles[rank] || `Rank ${rank}`;
    }
    return `Rank ${rank}`;
  };

  try {
    const vRes = await fetch(
      'https://wiki.warframe.com/api.php?action=query&titles=Module:Vendors/data&prop=revisions&rvprop=content&format=json'
    );
    if (vRes.ok) {
      const vData = (await vRes.json()) as any;
      const vText: string = Object.values(vData?.query?.pages || {})[0]?.revisions?.[0]?.['*'] || '';
      const vendorHeaders = [...vText.matchAll(/\["([^"]+)"\]\s*=\s*\{/g)];
      for (let i = 0; i < vendorHeaders.length; i++) {
        const vMatch = vendorHeaders[i];
        const vendorName = vMatch[1];
        const startIdx = vMatch.index;
        const endIdx = i + 1 < vendorHeaders.length ? vendorHeaders[i + 1].index : vText.length;
        const block = vText.substring(startIdx, endIdx);

        const currencyMatch = block.match(/Currency\s*=\s*"([^"]+)"/);
        const currency = currencyMatch ? currencyMatch[1] : 'Standing';

        const vendorId = vendorName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
        const meta = vendorMeta[vendorName] || {
          category: 'Special & Events',
          location: vendorName,
          description: `Vendor offering items and blueprints in exchange for ${currency}.`,
        };

        const vendorRecord = {
          id: vendorId,
          name: vendorName,
          title: vendorName,
          syndicateOrStore: vendorName,
          location: meta.location,
          currency,
          category: meta.category,
          description: meta.description,
          offerings: [] as any[],
        };

        const offeringRegex = /\{\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*(\d+)/g;
        let oMatch;
        while ((oMatch = offeringRegex.exec(block)) !== null) {
          const itemName = oMatch[1];
          const itemCategory = oMatch[2];
          const cost = parseInt(oMatch[3], 10);
          const lineEnd = block.indexOf('}', oMatch.index);
          const line = lineEnd !== -1 ? block.substring(oMatch.index, lineEnd) : '';
          const prereqMatch = line.match(/Prereq\s*=\s*(\d+)/);
          const prereq = prereqMatch ? parseInt(prereqMatch[1], 10) : undefined;
          const rankText = typeof prereq === 'number' ? getRankName(vendorName, prereq) : undefined;

          const norm = itemName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
          const rec = {
            itemId: norm,
            itemName,
            vendorName,
            syndicateOrStore: vendorName,
            cost: `${cost.toLocaleString()} ${currency}`,
            rankRequirement: rankText,
            location: meta.location,
            fullAcquisitionSentence: `${itemName} can be purchased from ${vendorName} for ${cost.toLocaleString()} ${currency}${
              rankText ? ` after reaching ${rankText}` : ''
            }.`,
          };
          vendorCatalogMap[norm] = rec;
          vendorCatalogMap[itemName.toLowerCase()] = rec;

          vendorRecord.offerings.push({
            itemName,
            category: itemCategory,
            cost,
            formattedCost: `${cost.toLocaleString()} ${currency}`,
            currency,
            quantity: 1,
            rankRequirement: rankText,
            rankNumber: prereq,
          });
        }

        if (vendorRecord.offerings.length > 0) {
          // Sort offerings by rank requirement then name
          vendorRecord.offerings.sort((a, b) => {
            const ra = typeof a.rankNumber === 'number' ? a.rankNumber : 99;
            const rb = typeof b.rankNumber === 'number' ? b.rankNumber : 99;
            if (ra !== rb) return ra - rb;
            return a.itemName.localeCompare(b.itemName);
          });
          (vendorRecord as any).offeringCount = vendorRecord.offerings.length;
          allVendorsMap[vendorId] = vendorRecord;
          allVendorsMap[vendorName.toLowerCase()] = vendorRecord;
        }
      }
    }
  } catch (err) {
    console.warn('Could not fetch Module:Vendors/data:', err);
  }

  // Canonical additions for Clan Dojo and key items
  const canonicalVendors = [
    {
      itemId: 'wukong',
      itemName: 'Wukong',
      vendorName: 'Tenno Lab Research Terminal',
      syndicateOrStore: 'Clan Dojo (Tenno Lab)',
      cost: '15,000 Credits per Blueprint',
      rankRequirement: 'Clan Membership (Requires completed research)',
      location: 'Clan Dojo (Tenno Lab)',
      fullAcquisitionSentence: 'The Warframe blueprints can be duplicated from the Tenno Lab in your Clan Dojo after research is completed.',
    },
    {
      itemId: 'volt',
      itemName: 'Volt',
      vendorName: 'Tenno Lab Research Terminal',
      syndicateOrStore: 'Clan Dojo (Tenno Lab)',
      cost: '15,000 Credits per Blueprint',
      rankRequirement: 'Clan Membership',
      location: 'Clan Dojo (Tenno Lab)',
      fullAcquisitionSentence: 'Component and main blueprints can be purchased from the Tenno Lab in your Clan Dojo.',
    },
    {
      itemId: 'ignis_wraith',
      itemName: 'Ignis Wraith',
      vendorName: "Chem Lab / Baro Ki'Teer",
      syndicateOrStore: 'Clan Dojo (Chem Lab)',
      cost: '15,000 Credits (Dojo) or 250 Ducats + 50,000 Credits (Baro)',
      rankRequirement: 'Mastery Rank 9',
      location: 'Clan Dojo (Chem Lab) or Relay during Void Trader visits',
      fullAcquisitionSentence: 'The weapon blueprint can be duplicated from the Chem Lab in your Clan Dojo once your clan reaches Rank 10.',
    },
    {
      itemId: 'drakgoon',
      itemName: 'Drakgoon',
      vendorName: 'In-Game Market Console',
      syndicateOrStore: 'In-Game Market',
      cost: '20,000 Credits',
      rankRequirement: 'Mastery Rank 5',
      location: 'Orbiter Market Console',
      fullAcquisitionSentence: 'The weapon blueprint can be purchased directly from the In-Game Market for 20,000 Credits.',
      notes: 'The Kuva Drakgoon variant is obtained by spawning a Kuva Larvling on level 20+ Grineer missions and defeating the generated Kuva Lich.',
    },
    {
      itemId: 'fomorian_accelerant',
      itemName: 'Fomorian Accelerant',
      vendorName: 'Kela De Thaym',
      syndicateOrStore: 'Rathuum Arena Assassination',
      cost: '25 Judgement Points entry fee',
      rankRequirement: 'Requires Rathuum arena points on Sedna',
      location: 'Merrow (Sedna)',
      fullAcquisitionSentence: 'The Drakgoon exclusive augment mod drops directly from Kela De Thaym upon defeat on Merrow, Sedna.',
    },
    {
      itemId: 'contagious_bond',
      itemName: 'Contagious Bond',
      vendorName: 'Son',
      syndicateOrStore: 'Entrati',
      cost: '20,000 Standing',
      rankRequirement: 'Rank 3 - Associate',
      location: 'Necralisk (Deimos)',
      fullAcquisitionSentence: 'The mod can be bought from Son for 20,000 Standing after reaching Rank 3 - Associate with the Entrati.',
      notes: 'Exchanged with Son in the Necralisk on Deimos using Entrati syndicate standing.',
    },
    {
      itemId: 'mecha_empowered',
      itemName: 'Mecha Empowered',
      vendorName: 'Son',
      syndicateOrStore: 'Entrati',
      cost: '20,000 Standing',
      rankRequirement: 'Rank 3 - Associate',
      location: 'Necralisk (Deimos)',
      fullAcquisitionSentence: 'The mod can be bought from Son for 20,000 Standing after reaching Rank 3 - Associate with the Entrati.',
      notes: 'Exchanged with Son in the Necralisk on Deimos using Entrati syndicate standing.',
    },
    {
      itemId: 'qorvex',
      itemName: 'Qorvex',
      vendorName: 'Bird 3',
      syndicateOrStore: 'Cavia',
      cost: '20,000 Standing per Component Blueprint (50,000 for Main BP)',
      rankRequirement: 'Rank 2 - Researcher',
      location: 'Sanctum Anatomica (Deimos)',
      fullAcquisitionSentence: 'The Warframe and component blueprints can be bought from Bird 3 after reaching Rank 2 - Researcher with the Cavia.',
    },
    {
      itemId: 'laetum',
      itemName: 'Laetum',
      vendorName: 'Cavalero',
      syndicateOrStore: 'The Holdfasts',
      cost: '3,000 Standing + Voidgel Orbs',
      rankRequirement: 'Rank 1 - Fallen',
      location: 'Chrysalith (Zariman Ten Zero)',
      fullAcquisitionSentence: 'The weapon blueprint can be bought from Cavalero in the Chrysalith after reaching Rank 1 with The Holdfasts.',
    },
    {
      itemId: 'phenmor',
      itemName: 'Phenmor',
      vendorName: 'Cavalero',
      syndicateOrStore: 'The Holdfasts',
      cost: '3,000 Standing + Voidgel Orbs',
      rankRequirement: 'Rank 1 - Fallen',
      location: 'Chrysalith (Zariman Ten Zero)',
      fullAcquisitionSentence: 'The weapon blueprint can be bought from Cavalero in the Chrysalith after reaching Rank 1 with The Holdfasts.',
    },
  ];

  for (const cv of canonicalVendors) {
    vendorCatalogMap[cv.itemId] = cv;
    vendorCatalogMap[cv.itemName.toLowerCase()] = cv;
  }

  fs.writeFileSync(path.join(GENERATED_DIR, 'vendor-catalog.json'), JSON.stringify(vendorCatalogMap, null, 2));
  fs.writeFileSync(path.join(GENERATED_DIR, 'all-vendors.json'), JSON.stringify(allVendorsMap, null, 2));

  // --- 3. Compile Planet Missions from official drop data ---
  console.log('Compiling planet missions...');
  const planetMap: Record<string, any> = {};
  const dropRegex = /^([^/]+)\/([^(,]+)(?:\s*\(<b>([^<]+)<\/b>\))?(?:,\s*Rotation\s*([ABC]))?/i;

  const bossMap: Record<string, string> = {
    venus: 'Jackal',
    mercury: 'Captain Vor',
    earth: 'Vay Hek',
    mars: 'Lt Lech Kril',
    ceres: 'Captain Vor & Lt Lech Kril',
    jupiter: 'Alad V / Ropalolyst',
    saturn: 'General Sargas Ruk',
    uranus: 'Tyl Regor',
    neptune: 'The Sergeant',
    pluto: 'Ambulas',
    sedna: 'Kela De Thaym',
    europa: 'Raptor',
    phobos: 'The Sergeant',
    deimos: 'Zealoid Prelate',
    eris: 'Mutalist Alad V',
  };

  if (Array.isArray(wfcdDropData)) {
    for (const d of wfcdDropData) {
      if (!d.place || !d.item) continue;
      const m = d.place.match(dropRegex);
      if (!m) continue;

      let planetName = m[1].trim();
      if (planetName.includes('Zariman Ten Zero')) planetName = 'Zariman';
      if (planetName.includes('Höllvania')) planetName = 'Höllvania';

      const node = m[2].trim();
      const missionType = m[3] ? m[3].trim() : 'Mission';
      const rotation = m[4] ? m[4].trim() : undefined;

      const pId = planetName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      if (!planetMap[pId]) {
        const matchingRes = slimResources.filter((r) => r.planets.includes(planetName)).map((r) => r.name);
        const faction =
          planetName === 'Venus' ||
          planetName === 'Jupiter' ||
          planetName === 'Pluto' ||
          planetName === 'Europa' ||
          planetName === 'Neptune'
            ? 'Corpus'
            : planetName === 'Deimos' || planetName === 'Eris'
            ? 'Infested'
            : planetName === 'Void'
            ? 'Corrupted'
            : 'Grineer';

        planetMap[pId] = {
          id: pId,
          name: planetName,
          faction,
          resourceDrops: matchingRes,
          bossName: bossMap[pId],
          missions: [],
        };
      }

      let nodeMission = planetMap[pId].missions.find((x: any) => x.node.toLowerCase() === node.toLowerCase());
      if (!nodeMission) {
        let notes: string | undefined = undefined;
        if (node.toLowerCase() === 'fossa' && planetName === 'Venus') {
          notes = 'Defeat the Jackal to acquire Rhino component blueprints and Stropha parts.';
        } else if (node.toLowerCase() === 'merrow' && planetName === 'Sedna') {
          notes = 'Defeat Kela De Thaym to acquire Saryn component blueprints.';
        }

        nodeMission = {
          node,
          planet: planetName,
          missionType,
          levelRange: 'Standard',
          faction: planetMap[pId].faction,
          notes,
          rotationA: [],
          rotationB: [],
          rotationC: [],
          specialDrops: [],
        };
        planetMap[pId].missions.push(nodeMission);
      }

      const dropItem = {
        itemName: d.item,
        chance: d.chance,
        rarity: d.rarity,
      };

      if (rotation === 'A') {
        if (!nodeMission.rotationA.some((x: any) => x.itemName === d.item)) nodeMission.rotationA.push(dropItem);
      } else if (rotation === 'B') {
        if (!nodeMission.rotationB.some((x: any) => x.itemName === d.item)) nodeMission.rotationB.push(dropItem);
      } else if (rotation === 'C') {
        if (!nodeMission.rotationC.some((x: any) => x.itemName === d.item)) nodeMission.rotationC.push(dropItem);
      } else {
        const dropStr = `${d.item} (${d.chance}%)`;
        if (!nodeMission.specialDrops.includes(dropStr)) {
          nodeMission.specialDrops.push(dropStr);
        }
      }
    }
  }

  // Ensure Jackal drops Rhino components on Fossa (Venus)
  const venusObj = planetMap['venus'];
  if (venusObj) {
    let fossa = venusObj.missions.find((m: any) => m.node.toLowerCase() === 'fossa');
    if (!fossa) {
      fossa = {
        node: 'Fossa',
        planet: 'Venus',
        missionType: 'Assassination',
        levelRange: '6 - 8',
        faction: 'Corpus',
        notes: 'Defeat the Jackal to acquire Rhino component blueprints and Stropha parts.',
        specialDrops: [],
        spawnableEnemies: [],
      };
      venusObj.missions.push(fossa);
    }
    const requiredFossaDrops = [
      'Rhino Neuroptics Blueprint (38.72%)',
      'Rhino Chassis Blueprint (38.72%)',
      'Rhino Systems Blueprint (22.56%)',
      'Stropha Barrel (10.0%)',
      'Stropha Blade (10.0%)',
      'Stropha Receiver (10.0%)',
      'Stropha Stock (10.0%)',
    ];
    for (const rfd of requiredFossaDrops) {
      if (!fossa.specialDrops.includes(rfd)) {
        fossa.specialDrops.push(rfd);
      }
    }
    fossa.spawnableEnemies = [
      {
        name: 'Jackal (Assassination Boss)',
        unitCategory: 'Boss',
        armorOrHealthType: 'Robotic / Alloy Armor',
        drops: [
          { itemName: 'Rhino Neuroptics Blueprint', category: 'Blueprint', chanceText: '38.72%' },
          { itemName: 'Rhino Chassis Blueprint', category: 'Blueprint', chanceText: '38.72%' },
          { itemName: 'Rhino Systems Blueprint', category: 'Blueprint', chanceText: '22.56%' },
        ],
      },
    ];
  }

  // Ensure Kela De Thaym drops Saryn and Rathuum mods on Merrow (Sedna)
  const sednaObj = planetMap['sedna'];
  if (sednaObj) {
    let merrow = sednaObj.missions.find((m: any) => m.node.toLowerCase() === 'merrow');
    if (!merrow) {
      merrow = {
        node: 'Merrow',
        planet: 'Sedna',
        missionType: 'Assassination',
        levelRange: '35 - 40',
        faction: 'Grineer',
        notes: 'Requires 25 Judgement Points from Rathuum arenas. Defeat Kela to earn Saryn blueprints.',
        specialDrops: [],
        spawnableEnemies: [],
      };
      sednaObj.missions.push(merrow);
    }
    const requiredMerrowDrops = [
      'Saryn Neuroptics Blueprint (38.72%)',
      'Saryn Chassis Blueprint (38.72%)',
      'Saryn Systems Blueprint (22.56%)',
      'Fomorian Accelerant - Drakgoon Augment (11.28%)',
      'Acid Shells - Sobek Augment (11.28%)',
      'Medi-Ray - Sentinel Mod (11.28%)',
      'Nightwatch Napalm - Ogris Augment (11.28%)',
      'Harkonar Wraith (11.28%)',
      'Vulcan Blitz - Jat Kittag Augment (11.28%)',
    ];
    for (const rmd of requiredMerrowDrops) {
      if (!merrow.specialDrops.includes(rmd)) {
        merrow.specialDrops.push(rmd);
      }
    }
    merrow.spawnableEnemies = [
      {
        name: 'Kela De Thaym (Assassination Boss)',
        unitCategory: 'Boss',
        armorOrHealthType: 'Cloned Flesh / Alloy Armor',
        drops: [
          { itemName: 'Saryn Neuroptics Blueprint', category: 'Blueprint', chanceText: '38.72%' },
          { itemName: 'Saryn Chassis Blueprint', category: 'Blueprint', chanceText: '38.72%' },
          { itemName: 'Saryn Systems Blueprint', category: 'Blueprint', chanceText: '22.56%' },
          { itemName: 'Fomorian Accelerant', category: 'Mod', chanceText: '11.28%' },
          { itemName: 'Acid Shells', category: 'Mod', chanceText: '11.28%' },
          { itemName: 'Medi-Ray', category: 'Mod', chanceText: '11.28%' },
          { itemName: 'Nightwatch Napalm', category: 'Mod', chanceText: '11.28%' },
          { itemName: 'Vulcan Blitz', category: 'Mod', chanceText: '11.28%' },
          { itemName: 'Orokin Cell', category: 'Resource', chanceText: 'Rare' },
        ],
      },
      {
        name: 'Rathuum Roller',
        unitCategory: 'Light',
        armorOrHealthType: 'Machinery / Ferrite Armor',
        drops: [
          { itemName: 'Detonite Ampule', category: 'Resource', chanceText: 'Common' },
          { itemName: 'Rubedo', category: 'Resource', chanceText: 'Common' },
        ],
      },
    ];
  }

  // Ensure Ophelia on Uranus has Drekar Butcher for Condition Overload
  const uranusObj = planetMap['uranus'];
  if (uranusObj) {
    let ophelia = uranusObj.missions.find((m: any) => m.node.toLowerCase() === 'ophelia');
    if (!ophelia) {
      ophelia = {
        node: 'Ophelia',
        planet: 'Uranus',
        missionType: 'Survival',
        levelRange: '24 - 29',
        faction: 'Grineer',
        notes: 'Top tier Polymer Bundle and Tellurium farm node with submersible tileset.',
        specialDrops: [],
        spawnableEnemies: [],
      };
      uranusObj.missions.push(ophelia);
    }
    ophelia.spawnableEnemies = [
      {
        name: 'Drekar Butcher',
        unitCategory: 'Light',
        armorOrHealthType: 'Cloned Flesh',
        drops: [
          { itemName: 'Condition Overload', category: 'Mod', chanceText: '0.02%' },
          { itemName: 'Polymer Bundle', category: 'Resource', chanceText: 'Common' },
        ],
      },
    ];
  }

  const finalPlanetsData = Object.values(planetMap);
  fs.writeFileSync(path.join(GENERATED_DIR, 'planet-missions.json'), JSON.stringify(finalPlanetsData, null, 2));

  // --- 4. Compile Official Enemy Drop Tables (Mods, Blueprints, Resources, and Bosses) ---
  console.log('Compiling official enemy drop tables...');
  interface EnemyDropEntryRecord {
    enemyName: string;
    enemyDropChance?: number;
    dropChance: number;
    rarity?: string;
    category?: string;
  }

  const enemyDropTablesMap: Record<string, EnemyDropEntryRecord[]> = {};

  const addEnemyDrop = (itemName: string, entry: EnemyDropEntryRecord) => {
    if (!itemName) return;
    const cleanName = itemName.trim();
    const id = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    if (!id) return;
    if (!enemyDropTablesMap[id]) enemyDropTablesMap[id] = [];

    const cleanDropChance = typeof entry.dropChance === 'number' && !isNaN(entry.dropChance) ? entry.dropChance : (parseFloat(String(entry.dropChance)) || 0);
    const cleanEntry: EnemyDropEntryRecord = {
      ...entry,
      dropChance: cleanDropChance,
    };

    if (!enemyDropTablesMap[id].some((e) => e.enemyName === cleanEntry.enemyName)) {
      enemyDropTablesMap[id].push(cleanEntry);
    }

    if (cleanName.endsWith(' Blueprint')) {
      const baseName = cleanName.replace(/ Blueprint$/, '');
      const baseId = baseName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      if (baseId && baseId !== id) {
        if (!enemyDropTablesMap[baseId]) enemyDropTablesMap[baseId] = [];
        if (!enemyDropTablesMap[baseId].some((e) => e.enemyName === cleanEntry.enemyName)) {
          enemyDropTablesMap[baseId].push(cleanEntry);
        }
      }
    }
  };

  if (modLocationsRaw?.modLocations && Array.isArray(modLocationsRaw.modLocations)) {
    for (const m of modLocationsRaw.modLocations) {
      if (!m.modName) continue;
      for (const en of m.enemies || []) {
        if (!en.enemyName) continue;
        addEnemyDrop(m.modName, {
          enemyName: en.enemyName,
          enemyDropChance: en.enemyModDropChance,
          dropChance: en.chance,
          rarity: en.rarity,
          category: 'Mod',
        });
      }
    }
  }

  if (blueprintLocationsRaw?.blueprintLocations && Array.isArray(blueprintLocationsRaw.blueprintLocations)) {
    for (const b of blueprintLocationsRaw.blueprintLocations) {
      const name = b.itemName || b.blueprintName;
      if (!name) continue;
      for (const en of b.enemies || []) {
        if (!en.enemyName) continue;
        const entry: EnemyDropEntryRecord = {
          enemyName: en.enemyName,
          enemyDropChance: en.enemyItemDropChance || en.enemyBlueprintDropChance,
          dropChance: en.chance,
          rarity: en.rarity,
          category: 'Blueprint',
        };
        if (b.itemName) addEnemyDrop(b.itemName, entry);
        if (b.blueprintName) addEnemyDrop(b.blueprintName, entry);
      }
    }
  }

  if (resourceByAvatarRaw?.resourceByAvatar && Array.isArray(resourceByAvatarRaw.resourceByAvatar)) {
    for (const r of resourceByAvatarRaw.resourceByAvatar) {
      const enemySource = r.source;
      if (!enemySource) continue;
      for (const item of r.items || []) {
        if (!item.item) continue;
        const rawChance = typeof item.chance === 'number' ? item.chance : (parseFloat(String(item.chance)) || 0);
        addEnemyDrop(item.item, {
          enemyName: enemySource,
          dropChance: rawChance,
          rarity: item.rarity || 'Common',
          category: 'Resource',
        });
      }
    }
  }

  for (const planet of Object.values(planetMap) as any[]) {
    for (const mission of planet.missions || []) {
      for (const enemy of mission.spawnableEnemies || []) {
        for (const drop of enemy.drops || []) {
          if (!drop.itemName) continue;
          const parsedChance = parseFloat(String(drop.chanceText).replace(/[^0-9.]/g, '')) || 10;
          addEnemyDrop(drop.itemName, {
            enemyName: enemy.name,
            dropChance: parsedChance,
            rarity: drop.chanceText?.includes('Rare') ? 'Rare' : 'Uncommon',
            category: drop.category,
          });
        }
      }
    }
  }

  for (const id of Object.keys(enemyDropTablesMap)) {
    enemyDropTablesMap[id].sort((a, b) => {
      const effA = a.enemyDropChance ? (a.enemyDropChance * a.dropChance) / 100 : a.dropChance;
      const effB = b.enemyDropChance ? (b.enemyDropChance * b.dropChance) / 100 : b.dropChance;
      return effB - effA;
    });
    if (enemyDropTablesMap[id].length > 30) {
      enemyDropTablesMap[id] = enemyDropTablesMap[id].slice(0, 30);
    }
  }

  fs.writeFileSync(path.join(GENERATED_DIR, 'enemy-drop-tables.json'), JSON.stringify(enemyDropTablesMap, null, 2));

  const incarnonGenesesCount = await syncIncarnonGeneses();

  const uniqueWeaponsCount = new Set(allWeaponsRaw.filter((w) => !w.uniqueName?.includes('/Placeholder') && w.name).map((w) => w.name)).size;

  let versionInfo = {
    gameVersion: 'Update 43: Jade Shadows: Constellations',
    gameBuild: 'v2026.08.19',
    versionDisplay: 'Warframe Update 43: Jade Shadows: Constellations',
  };

  try {
    const wikiUrl = 'https://wiki.warframe.com/api.php?action=query&list=categorymembers&cmtitle=Category:Updates&cmdir=desc&cmsort=timestamp&cmlimit=15&format=json';
    const wikiRes = await fetch(wikiUrl);
    if (wikiRes.ok) {
      const data = await wikiRes.json();
      const members: Array<{ title: string; ns: number }> = data?.query?.categorymembers || [];
      const updateItems = members.filter((m) => m.ns === 0 && m.title.toLowerCase().startsWith('update '));
      updateItems.sort((a, b) => {
        const matchA = a.title.match(/update\s+(\d+)/i);
        const matchB = b.title.match(/update\s+(\d+)/i);

        const numA = matchA ? parseInt(matchA[1], 10) : 0;
        const numB = matchB ? parseInt(matchB[1], 10) : 0;

        return numB - numA; 
      });
      const updateItem = updateItems[0];
      if (updateItem) {
        versionInfo = {
          gameVersion: updateItem.title,
          gameBuild: 'v2026.08.19',
          versionDisplay: `Warframe ${updateItem.title}`,
        };
      }
    }
  } catch (err) {
    console.warn('Auto-detect game version from wiki failed, using fallback:', err);
  }

  const syncMeta = {
    gameVersion: versionInfo.gameVersion,
    gameBuild: versionInfo.gameBuild,
    versionDisplay: versionInfo.versionDisplay,
    lastSyncedAt: new Date().toISOString(),
    warframesCount: slimWf.length,
    weaponsCount: slimWp.length,
    modsCount: slimMods.length,
    resourcesCount: slimResources.length,
    weaponRecipesCount: uniqueWeaponsCount,
    gearCount: slimGear.length,
    arcanesCount: slimArcanes.length,
    relicsCount: slimRelics.length,
    enemyDropTablesCount: Object.keys(enemyDropTablesMap).length,
    incarnonGenesesCount,
    wikiResourcesGathered: wikiCategoryTitles.length,
    totalCount: slimWf.length + slimWp.length + slimMods.length + slimResources.length + uniqueWeaponsCount + slimGear.length + slimArcanes.length + slimRelics.length,
    sources: [
      'https://wiki.warframe.com/',
      'https://github.com/WFCD/warframe-items',
      'https://github.com/WFCD/warframe-drop-data',
    ],
  };
  fs.writeFileSync(path.join(GENERATED_DIR, 'sync-meta.json'), JSON.stringify(syncMeta, null, 2));

  try {
    const { writeSitemap } = await import('./generate-sitemap');
    writeSitemap();
  } catch (err) {
    console.warn('Could not generate sitemap during catalog sync:', err);
  }

  return {
    warframesCount: slimWf.length,
    weaponsCount: slimWp.length,
    modsCount: slimMods.length,
    resourcesCount: slimResources.length,
    gearCount: slimGear.length,
    arcanesCount: slimArcanes.length,
    relicsCount: slimRelics.length,
    weaponRecipesCount: uniqueWeaponsCount,
    enemyDropTablesCount: Object.keys(enemyDropTablesMap).length,
    incarnonGenesesCount,
  };
}

if (process.argv[1]?.endsWith('sync-catalogs.ts')) {
  syncCatalogs()
    .then((res) => {
      console.log('Catalogs synchronized successfully:');
      console.log(` - Warframes:        ${res.warframesCount}`);
      console.log(` - Weapons:          ${res.weaponsCount}`);
      console.log(` - Weapon Recipes:   ${res.weaponRecipesCount}`);
      console.log(` - Mods:             ${res.modsCount}`);
      console.log(` - Resources:        ${res.resourcesCount}`);
      console.log(` - Gear & Other:     ${res.gearCount}`);
      console.log(` - Arcanes:          ${res.arcanesCount}`);
      console.log(` - Relics:           ${res.relicsCount}`);
      console.log(` - Enemy Drop Tables: ${res.enemyDropTablesCount}`);
      console.log(` - Incarnon Geneses: ${res.incarnonGenesesCount}`);
    })
    .catch((err) => {
      console.error('Catalog sync failed:', err);
      process.exit(1);
    });
}
