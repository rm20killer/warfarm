import allVendorsJson from './generated/all-vendors.json';

export interface VendorOffering {
  itemName: string;
  category: string;
  cost: number;
  formattedCost: string;
  currency: string;
  quantity: number;
  rankRequirement?: string;
  rankNumber?: number;
}

export interface VendorRecord {
  id: string;
  name: string;
  title: string;
  syndicateOrStore: string;
  location: string;
  currency: string;
  category: 'Six Syndicates' | 'Sanctuary & Arena' | 'Open World Hubs' | 'Zariman, Duviri & 1999' | 'Special & Events' | string;
  description: string;
  offeringCount: number;
  offerings: VendorOffering[];
}

const vendorsMap: Record<string, VendorRecord> = allVendorsJson as unknown as Record<string, VendorRecord>;

export const ALL_VENDORS: VendorRecord[] = Object.values(
  Object.fromEntries(
    Object.entries(vendorsMap).filter(([key, v]) => key === v.id)
  )
);

export function getAllVendors(): VendorRecord[] {
  return ALL_VENDORS;
}

export function getVendorByNameOrId(nameOrId: string): VendorRecord | undefined {
  if (!nameOrId) return undefined;
  const lower = nameOrId.toLowerCase().trim();
  const id = lower.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');

  if (vendorsMap[id]) return vendorsMap[id];
  if (vendorsMap[lower]) return vendorsMap[lower];

  return ALL_VENDORS.find(
    (v) =>
      v.id === id ||
      v.name.toLowerCase() === lower ||
      v.title.toLowerCase() === lower ||
      v.name.toLowerCase().includes(lower)
  );
}

export function getVendorsByCategory(category: string): VendorRecord[] {
  return ALL_VENDORS.filter((v) => v.category.toLowerCase() === category.toLowerCase());
}

export function getVendorsSellingItem(itemName: string): { vendor: VendorRecord; offering: VendorOffering }[] {
  if (!itemName) return [];
  const lower = itemName.toLowerCase().trim();
  const results: { vendor: VendorRecord; offering: VendorOffering }[] = [];

  for (const vendor of ALL_VENDORS) {
    for (const offering of vendor.offerings) {
      if (offering.itemName.toLowerCase() === lower) {
        results.push({ vendor, offering });
      }
    }
  }

  return results;
}
