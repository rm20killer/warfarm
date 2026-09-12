import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.SITE_URL || 'https://warfarm.dev';
const GENERATED_DIR = path.resolve(process.cwd(), 'src', 'shared', 'data', 'generated');
const PUBLIC_DIR = path.resolve(process.cwd(), 'public');

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: string;
}

export function generateSitemapXml(): string {
  const today = new Date().toISOString().split('T')[0];

  const staticRoutes: SitemapUrl[] = [
    { loc: `${BASE_URL}/`, lastmod: today, changefreq: 'daily', priority: '1.0' },
    { loc: `${BASE_URL}/live`, lastmod: today, changefreq: 'hourly', priority: '0.9' },
    { loc: `${BASE_URL}/relics`, lastmod: today, changefreq: 'daily', priority: '0.9' },
    { loc: `${BASE_URL}/missions`, lastmod: today, changefreq: 'weekly', priority: '0.8' },
    { loc: `${BASE_URL}/resources`, lastmod: today, changefreq: 'weekly', priority: '0.8' },
    { loc: `${BASE_URL}/mods`, lastmod: today, changefreq: 'weekly', priority: '0.8' },
    { loc: `${BASE_URL}/arcanes`, lastmod: today, changefreq: 'weekly', priority: '0.8' },
    { loc: `${BASE_URL}/gear`, lastmod: today, changefreq: 'weekly', priority: '0.8' },
    { loc: `${BASE_URL}/mechanics`, lastmod: today, changefreq: 'weekly', priority: '0.8' },
    { loc: `${BASE_URL}/targets`, lastmod: today, changefreq: 'monthly', priority: '0.5' },
  ];

  const itemUrls: SitemapUrl[] = [];
  const seenUrls = new Set<string>();

  const loadItems = (fileName: string, priority: string, changefreq: SitemapUrl['changefreq'] = 'weekly') => {
    const filePath = path.join(GENERATED_DIR, fileName);
    if (!fs.existsSync(filePath)) return;

    try {
      const items: Array<{ name?: string; fullName?: string }> = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      for (const item of items) {
        const name = item.name || item.fullName;
        if (!name) continue;
        const loc = `${BASE_URL}/item/${encodeURIComponent(name)}`;
        if (!seenUrls.has(loc)) {
          seenUrls.add(loc);
          itemUrls.push({
            loc,
            lastmod: today,
            changefreq,
            priority,
          });
        }
      }
    } catch (err) {
      console.warn(`Failed to read ${fileName} for sitemap:`, err);
    }
  };

  loadItems('all-warframes.json', '0.8');
  loadItems('all-weapons.json', '0.7');
  loadItems('all-arcanes.json', '0.7');
  loadItems('all-relics.json', '0.7');
  loadItems('all-resources.json', '0.7');
  loadItems('all-mods.json', '0.6');
  loadItems('all-gear.json', '0.6');

  const allUrls = [...staticRoutes, ...itemUrls];

  const xmlEntries = allUrls
    .map(
      (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlEntries}
</urlset>
`;
}

export function writeSitemap(): void {
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }
  const xml = generateSitemapXml();
  const outputPath = path.join(PUBLIC_DIR, 'sitemap.xml');
  fs.writeFileSync(outputPath, xml, 'utf-8');
  console.log(`Generated sitemap.xml with entries at ${outputPath}`);
}

if (process.argv[1]?.endsWith('generate-sitemap.ts')) {
  writeSitemap();
}

