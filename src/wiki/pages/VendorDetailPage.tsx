import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getVendorByNameOrId, ALL_VENDORS } from '../../shared/data/vendor-database';
import { ItemThumbnail } from '../../shared/utils/item-images';
import { usePageMeta } from '../../shared/utils/usePageMeta';
import { theme } from '../styles/theme';

export function VendorDetailPage() {
  const { name } = useParams<{ name: string }>();
  const vendorName = decodeURIComponent(name || '');
  const vendor = useMemo(() => getVendorByNameOrId(vendorName), [vendorName]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRank, setSelectedRank] = useState('All');

  const pageTitle = vendor ? `${vendor.name} Offerings & Standing Shop` : 'Vendor Store';
  const pageDescription = vendor
    ? `Browse all items, blueprints, mods, and cosmetics available from ${vendor.name} in Warframe. Includes standing costs and rank requirements.`
    : 'Warframe syndicate store and vendor offerings directory.';

  usePageMeta({
    title: pageTitle,
    description: pageDescription,
    keywords: vendor
      ? `${vendor.name}, warframe ${vendor.name}, ${vendor.name} standing, syndicate offerings, warframe vendor`
      : undefined,
    canonicalPath: vendor ? `/vendor/${encodeURIComponent(vendor.name)}` : '/vendors',
  });

  const categories = useMemo(() => {
    if (!vendor) return ['All'];
    const cats = new Set<string>();
    vendor.offerings.forEach((o) => {
      if (o.category) cats.add(o.category);
    });
    return ['All', ...Array.from(cats).sort()];
  }, [vendor]);

  const ranks = useMemo(() => {
    if (!vendor) return ['All'];
    const rSet = new Set<string>();
    vendor.offerings.forEach((o) => {
      if (o.rankRequirement) rSet.add(o.rankRequirement);
    });
    return ['All', ...Array.from(rSet).sort()];
  }, [vendor]);

  const filteredOfferings = useMemo(() => {
    if (!vendor) return [];
    const q = searchQuery.toLowerCase().trim();

    return vendor.offerings.filter((o) => {
      const matchesSearch = !q || o.itemName.toLowerCase().includes(q);
      const matchesCategory = selectedCategory === 'All' || o.category === selectedCategory;
      const matchesRank = selectedRank === 'All' || o.rankRequirement === selectedRank;
      return matchesSearch && matchesCategory && matchesRank;
    });
  }, [vendor, searchQuery, selectedCategory, selectedRank]);

  if (!vendor) {
    return (
      <div style={styles.container}>
        <div style={styles.notFoundCard}>
          <h1 style={styles.notFoundTitle}>Vendor Not Found</h1>
          <p style={styles.notFoundText}>
            Could not locate a vendor named "{vendorName}". Check the directory for all available syndicates and merchants.
          </p>
          <Link to="/vendors" style={styles.primaryButton}>
            Browse All Vendors &rarr;
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container-responsive" style={styles.container}>
      {/* Breadcrumb Navigation */}
      <nav style={styles.breadcrumbNav} aria-label="Breadcrumb">
        <Link to="/" style={styles.breadcrumbLink}>Home</Link>
        <span style={styles.breadcrumbSeparator}>/</span>
        <Link to="/vendors" style={styles.breadcrumbLink}>Vendors</Link>
        <span style={styles.breadcrumbSeparator}>/</span>
        <span style={styles.breadcrumbCurrent}>{vendor.name}</span>
      </nav>

      {/* Vendor Header Card */}
      <header style={styles.vendorHeaderCard}>
        <div style={styles.vendorHeaderTop}>
          <div>
            <div style={styles.vendorBadgeRow}>
              <span style={styles.categoryBadge}>{vendor.category}</span>
              <span style={styles.currencyBadge}>Currency: {vendor.currency}</span>
              <span style={styles.countBadge}>{vendor.offeringCount} Offerings</span>
            </div>
            <h1 style={styles.vendorTitle}>{vendor.name}</h1>
            <p style={styles.vendorLocation}>
              <strong>Location:</strong> {vendor.location}
            </p>
          </div>
          <Link to="/vendors" style={styles.secondaryButton}>
            &larr; All Vendors
          </Link>
        </div>

        <p style={styles.vendorDescription}>{vendor.description}</p>
      </header>

      {/* Filter and Search Controls */}
      <section style={styles.controlsSection} aria-label="Vendor search and filters">
        <div style={styles.searchWrapper}>
          <input
            type="text"
            placeholder={`Search ${vendor.name}'s offerings (e.g. Augment, Blueprint, Sigil)...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
            aria-label="Search vendor offerings"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={styles.clearSearchBtn}
              aria-label="Clear search query"
            >
              &times;
            </button>
          )}
        </div>

        <div style={styles.filtersRow}>
          <div style={styles.filterGroup}>
            <label htmlFor="category-select" style={styles.filterLabel}>Category:</label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={styles.selectInput}
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {ranks.length > 1 && (
            <div style={styles.filterGroup}>
              <label htmlFor="rank-select" style={styles.filterLabel}>Requirement:</label>
              <select
                id="rank-select"
                value={selectedRank}
                onChange={(e) => setSelectedRank(e.target.value)}
                style={styles.selectInput}
              >
                {ranks.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          )}

          <div style={styles.resultCountText}>
            Showing <strong>{filteredOfferings.length}</strong> of {vendor.offeringCount} items
          </div>
        </div>
      </section>

      {/* Offerings Grid */}
      {filteredOfferings.length === 0 ? (
        <div style={styles.emptyResultsCard}>
          <p style={styles.emptyResultsText}>
            No offerings match your search query and filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedRank('All');
            }}
            style={styles.resetFiltersBtn}
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="card-grid-responsive" style={styles.offeringsGrid}>
          {filteredOfferings.map((item, idx) => (
            <Link
              key={`${item.itemName}-${idx}`}
              to={`/item/${encodeURIComponent(item.itemName)}`}
              style={styles.offeringCard}
            >
              <div style={styles.offeringThumbWrapper}>
                <ItemThumbnail name={item.itemName} size={44} />
              </div>

              <div style={styles.offeringContent}>
                <div style={styles.offeringNameRow}>
                  <span style={styles.offeringName} title={item.itemName}>
                    {item.itemName}
                  </span>
                </div>

                <div style={styles.offeringTagsRow}>
                  <span style={styles.offeringCategoryTag}>
                    {item.category}
                  </span>
                  {item.rankRequirement && (
                    <span style={styles.rankRequirementTag}>
                      {item.rankRequirement}
                    </span>
                  )}
                </div>

                <div style={styles.offeringCostRow}>
                  <span style={styles.costLabel}>Cost:</span>
                  <span style={styles.costValue}>{item.formattedCost}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Other Related Vendors Carousel / Links */}
      <section style={styles.otherVendorsSection}>
        <h2 style={styles.otherVendorsTitle}>Explore Other Syndicates & Merchants</h2>
        <div style={styles.otherVendorsList}>
          {ALL_VENDORS.filter((v) => v.id !== vendor.id).slice(0, 8).map((ov) => (
            <Link
              key={ov.id}
              to={`/vendor/${encodeURIComponent(ov.name)}`}
              style={styles.otherVendorPill}
            >
              <span style={styles.otherVendorName}>{ov.name}</span>
              <span style={styles.otherVendorCount}>{ov.offeringCount} items</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '24px 16px',
    color: theme.colors.textPrimary,
  },
  breadcrumbNav: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
    marginBottom: 16,
  },
  breadcrumbLink: {
    color: theme.colors.accent,
    textDecoration: 'none',
  },
  breadcrumbSeparator: {
    color: theme.colors.textMuted,
  },
  breadcrumbCurrent: {
    color: theme.colors.textHighlight,
    fontWeight: 600,
  },
  vendorHeaderCard: {
    background: theme.colors.bgCard,
    border: `1px solid ${theme.colors.borderDefault}`,
    borderRadius: theme.radii.lg,
    padding: '20px 24px',
    marginBottom: 20,
  },
  vendorHeaderTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
  },
  vendorBadgeRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  categoryBadge: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    padding: '3px 8px',
    borderRadius: theme.radii.sm,
    background: theme.colors.accentBg,
    color: theme.colors.accent,
    border: `1px solid ${theme.colors.accentBorder}`,
  },
  currencyBadge: {
    fontSize: 11,
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: theme.radii.sm,
    background: theme.colors.goldBg,
    color: theme.colors.gold,
    border: `1px solid ${theme.colors.goldBorder}`,
  },
  countBadge: {
    fontSize: 11,
    fontWeight: 600,
    padding: '3px 8px',
    borderRadius: theme.radii.sm,
    background: theme.colors.bgCardElevated,
    color: theme.colors.textSecondary,
    border: `1px solid ${theme.colors.borderDefault}`,
  },
  vendorTitle: {
    fontSize: 26,
    fontWeight: 800,
    color: theme.colors.textHighlight,
    margin: '4px 0 6px 0',
  },
  vendorLocation: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    margin: 0,
  },
  vendorDescription: {
    fontSize: 14,
    lineHeight: '1.55',
    color: theme.colors.textPrimary,
    margin: '12px 0 0 0',
    borderTop: `1px solid ${theme.colors.borderSubtle}`,
    paddingTop: 12,
  },
  secondaryButton: {
    fontSize: 13,
    fontWeight: 600,
    color: theme.colors.accent,
    background: theme.colors.accentBg,
    border: `1px solid ${theme.colors.accentBorder}`,
    borderRadius: theme.radii.md,
    padding: '8px 14px',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    transition: 'background 0.15s ease',
  },
  primaryButton: {
    display: 'inline-block',
    fontSize: 14,
    fontWeight: 700,
    color: theme.colors.textHighlight,
    background: theme.colors.accentBg,
    border: `1px solid ${theme.colors.accentBorder}`,
    borderRadius: theme.radii.md,
    padding: '10px 18px',
    textDecoration: 'none',
    marginTop: 12,
  },
  controlsSection: {
    background: theme.colors.bgCard,
    border: `1px solid ${theme.colors.borderDefault}`,
    borderRadius: theme.radii.lg,
    padding: '16px 20px',
    marginBottom: 20,
  },
  searchWrapper: {
    position: 'relative',
    marginBottom: 14,
  },
  searchInput: {
    width: '100%',
    padding: '10px 14px',
    background: theme.colors.bgInput,
    border: `1px solid ${theme.colors.borderDefault}`,
    borderRadius: theme.radii.md,
    color: theme.colors.textHighlight,
    fontSize: 14,
    boxSizing: 'border-box',
    outline: 'none',
  },
  clearSearchBtn: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'transparent',
    border: 'none',
    color: theme.colors.textMuted,
    fontSize: 18,
    cursor: 'pointer',
  },
  filtersRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: theme.colors.textSecondary,
  },
  selectInput: {
    background: theme.colors.bgInput,
    border: `1px solid ${theme.colors.borderDefault}`,
    borderRadius: theme.radii.sm,
    color: theme.colors.textPrimary,
    fontSize: 13,
    padding: '6px 10px',
    cursor: 'pointer',
    outline: 'none',
  },
  resultCountText: {
    marginLeft: 'auto',
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  offeringsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: 12,
    marginBottom: 32,
  },
  offeringCard: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
    background: theme.colors.bgCard,
    border: `1px solid ${theme.colors.borderDefault}`,
    borderRadius: theme.radii.md,
    padding: '12px 14px',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'border-color 0.15s ease, background 0.15s ease',
  },
  offeringThumbWrapper: {
    flexShrink: 0,
    width: 44,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: theme.colors.bgNavbar,
    borderRadius: theme.radii.sm,
    border: `1px solid ${theme.colors.borderSubtle}`,
  },
  offeringContent: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  offeringNameRow: {
    display: 'flex',
    alignItems: 'center',
  },
  offeringName: {
    fontSize: 14,
    fontWeight: 700,
    color: theme.colors.textHighlight,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  offeringTagsRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  offeringCategoryTag: {
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    padding: '2px 5px',
    borderRadius: theme.radii.sm,
    background: theme.colors.bgCardElevated,
    color: theme.colors.textSecondary,
    border: `1px solid ${theme.colors.borderDefault}`,
  },
  rankRequirementTag: {
    fontSize: 10,
    fontWeight: 600,
    padding: '2px 5px',
    borderRadius: theme.radii.sm,
    background: theme.colors.purpleBg,
    color: theme.colors.purple,
    border: `1px solid ${theme.colors.purpleBorder}`,
  },
  offeringCostRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
    fontSize: 12,
  },
  costLabel: {
    color: theme.colors.textSecondary,
  },
  costValue: {
    color: theme.colors.gold,
    fontWeight: 700,
  },
  emptyResultsCard: {
    background: theme.colors.bgCard,
    border: `1px solid ${theme.colors.borderDefault}`,
    borderRadius: theme.radii.lg,
    padding: '36px 24px',
    textAlign: 'center',
    marginBottom: 32,
  },
  emptyResultsText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  resetFiltersBtn: {
    background: theme.colors.accentBg,
    border: `1px solid ${theme.colors.accentBorder}`,
    borderRadius: theme.radii.md,
    color: theme.colors.accent,
    padding: '8px 16px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  otherVendorsSection: {
    background: theme.colors.bgCardElevated,
    border: `1px solid ${theme.colors.borderDefault}`,
    borderRadius: theme.radii.lg,
    padding: '20px 24px',
  },
  otherVendorsTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: theme.colors.textHighlight,
    marginTop: 0,
    marginBottom: 14,
  },
  otherVendorsList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
  },
  otherVendorPill: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 12px',
    background: theme.colors.bgCard,
    border: `1px solid ${theme.colors.borderDefault}`,
    borderRadius: theme.radii.md,
    textDecoration: 'none',
    color: 'inherit',
    fontSize: 13,
    transition: 'border-color 0.15s ease',
  },
  otherVendorName: {
    color: theme.colors.textPrimary,
    fontWeight: 600,
  },
  otherVendorCount: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  notFoundCard: {
    background: theme.colors.bgCard,
    border: `1px solid ${theme.colors.borderDefault}`,
    borderRadius: theme.radii.lg,
    padding: '48px 24px',
    textAlign: 'center',
  },
  notFoundTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: theme.colors.red,
    marginBottom: 10,
  },
  notFoundText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    maxWidth: 500,
    margin: '0 auto 16px auto',
    lineHeight: '1.5',
  },
};
