import { useEffect } from 'react';

export interface PageMetaOptions {
  title: string;
  description?: string;
  keywords?: string;
  canonicalPath?: string;
  ogType?: 'website' | 'article';
}

const DEFAULT_TITLE_SUFFIX = 'Warfarm Tracker';
const DEFAULT_DESCRIPTION =
  'Warframe codex, live WorldState fissures tracker, Void relic drop rates calculator, resource farming guide, weapon recipes, and arcane drop tables.';
const BASE_URL = 'https://warfarm.pages.dev';

export function usePageMeta({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords,
  canonicalPath,
  ogType = 'website',
}: PageMetaOptions): void {
  useEffect(() => {
    const fullTitle = title.includes(DEFAULT_TITLE_SUFFIX) ? title : `${title} | ${DEFAULT_TITLE_SUFFIX}`;
    document.title = fullTitle;

    const setMetaTag = (attrName: 'name' | 'property', attrValue: string, content: string) => {
      let el = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMetaTag('name', 'description', description);
    setMetaTag('name', 'robots', 'index, follow');

    if (keywords) {
      setMetaTag('name', 'keywords', keywords);
    }

    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:site_name', DEFAULT_TITLE_SUFFIX);

    const canonicalUrl = canonicalPath
      ? `${BASE_URL}${canonicalPath.startsWith('/') ? '' : '/'}${canonicalPath}`
      : typeof window !== 'undefined'
      ? `${BASE_URL}${window.location.pathname}`
      : BASE_URL;

    setMetaTag('property', 'og:url', canonicalUrl);

    setMetaTag('name', 'twitter:card', 'summary');
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', description);

    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);
  }, [title, description, keywords, canonicalPath, ogType]);
}

