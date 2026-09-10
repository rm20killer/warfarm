import React from 'react';
import warframesJson from '../data/generated/all-warframes.json';
import weaponsJson from '../data/generated/all-weapons.json';
import modsJson from '../data/generated/all-mods.json';
import gearJson from '../data/generated/all-gear.json';
import resourcesJson from '../data/generated/all-resources.json';

const itemImageMap = new Map<string, string>();

function registerItems(items: Array<{ name: string; imageName?: string }>) {
  for (const item of items) {
    if (item.name && item.imageName) {
      const cleanName = item.name.toLowerCase().trim();
      if (!itemImageMap.has(cleanName)) {
        itemImageMap.set(cleanName, item.imageName);
      }
      // Also register without "Blueprint" suffix
      if (cleanName.endsWith(' blueprint')) {
        const baseName = cleanName.replace(' blueprint', '').trim();
        if (!itemImageMap.has(baseName)) {
          itemImageMap.set(baseName, item.imageName);
        }
      }
    }
  }
}

registerItems(warframesJson);
registerItems(weaponsJson);
registerItems(modsJson);
registerItems(gearJson);
registerItems(resourcesJson);

export function getItemImageName(itemName: string): string | undefined {
  if (!itemName) return undefined;
  const clean = itemName.toLowerCase().trim();
  return (
    itemImageMap.get(clean) ||
    itemImageMap.get(clean.replace(' blueprint', '')) ||
    itemImageMap.get(clean.replace(' prime', ''))
  );
}

export function getItemImageUrl(itemNameOrFile?: string): string | undefined {
  if (!itemNameOrFile) return undefined;
  if (itemNameOrFile.endsWith('.png') || itemNameOrFile.endsWith('.jpg') || itemNameOrFile.endsWith('.webp')) {
    return `https://raw.githubusercontent.com/WFCD/warframe-items/master/data/img/${encodeURIComponent(itemNameOrFile)}`;
  }
  const imageName = getItemImageName(itemNameOrFile);
  if (imageName) {
    return `https://raw.githubusercontent.com/WFCD/warframe-items/master/data/img/${encodeURIComponent(imageName)}`;
  }
  return undefined;
}

interface ItemThumbnailProps {
  name: string;
  imageName?: string;
  size?: number;
  alt?: string;
  style?: React.CSSProperties;
}

export function ItemThumbnail({
  name,
  imageName,
  size = 40,
  alt,
  style,
}: ItemThumbnailProps) {
  const url = imageName ? getItemImageUrl(imageName) : getItemImageUrl(name);

  if (!url) {
    return null;
  }

  return (
    <img
      src={url}
      alt={alt || name}
      width={size}
      height={size}
      loading="lazy"
      onError={(e) => {
        e.currentTarget.style.display = 'none';
      }}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        borderRadius: 4,
        flexShrink: 0,
        ...style,
      }}
    />
  );
}

