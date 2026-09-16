import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ALL_VENDORS, VendorRecord } from '../../shared/data/vendor-database';
import { usePageMeta } from '../../shared/utils/usePageMeta';
import { theme } from '../styles/theme';
import { directoryStyles } from '../styles/directoryPageStyles';

export function VendorsDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  const activeFilterCount = selectedCategory !== 'All' ? 1 : 0;

  usePageMeta({
    title: 'Warframe Vendors & Syndicate Shops Directory',
    description: 'Browse all Warframe vendors, syndicate standing shops, sanctuary rewards, and open world merchants with full inventory listings and standing prices.',
    keywords: 'warframe vendors, warframe syndicates, cephalon suda, cephalon simaris, standing shop, warframe merchants',
    canonicalPath: '/vendors',
  });

  const categories = useMemo(() => {
    const cats = new Set<string>();
    ALL_VENDORS.forEach((v) => {
      if (v.category) cats.add(v.category);
    });
    return ['All', ...Array.from(cats)];
  }, []);

  const filteredVendors = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return ALL_VENDORS.filter((v) => {
      const matchesSearch =
        !q ||
        v.name.toLowerCase().includes(q) ||
        v.location.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.offerings.some((o) => o.itemName.toLowerCase().includes(q));
      const matchesCat = selectedCategory === 'All' || v.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, selectedCategory]);

  const vendorsByCategory = useMemo(() => {
    const map: Record<string, VendorRecord[]> = {};
    filteredVendors.forEach((v) => {
      const cat = v.category || 'Special & Events';
      if (!map[cat]) map[cat] = [];
      map[cat].push(v);
    });
    return map;
  }, [filteredVendors]);

  return (
    <div className="page-container-responsive" style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Vendors & Syndicate Stores</h1>
        <p style={styles.subtitle}>
          Explore standing offerings, augment mods, quest blueprints, weapon parts, and cosmetics across all {ALL_VENDORS.length} Warframe syndicates and world hubs.
        </p>
      </header>

      {/* Search Controls */}
      <div style={styles.searchControlsRow}>
        <div style={styles.searchBarWrapper}>
          <input
            type="text"
            placeholder="Search vendor by name, location, or sold item (e.g. Cephalon Suda, Simaris, Galvanized, Augment)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
            aria-label="Search vendors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={styles.clearBtn}
              aria-label="Clear search"
            >
              &times;
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowFilters((prev) => !prev)}
          style={{
            ...styles.filterToggleBtn,
            backgroundColor: showFilters || activeFilterCount > 0 ? theme.colors.accentBg : theme.colors.bgInput,
            borderColor: showFilters || activeFilterCount > 0 ? theme.colors.accentBorder : theme.colors.borderDefault,
            color: showFilters || activeFilterCount > 0 ? theme.colors.textHighlight : theme.colors.textSecondary,
          }}
          aria-expanded={showFilters}
        >
          <span style={{ fontSize: 13 }}>⚙</span>
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span style={styles.filterCountBadge}>{activeFilterCount}</span>
          )}
          <span style={{ fontSize: 10, color: theme.colors.textMuted }}>
            {showFilters ? '▲' : '▼'}
          </span>
        </button>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={() => setSelectedCategory('All')}
            style={styles.resetFiltersQuickBtn}
          >
            Reset
          </button>
        )}
      </div>

      {/* Collapsible Filter Drawer */}
      {showFilters && (
        <div style={styles.filterDrawerCard}>
          <div style={styles.filterDrawerHeader}>
            <span style={styles.filterDrawerTitle}>Filter Merchants & Syndicates</span>
            <button
              type="button"
              onClick={() => setShowFilters(false)}
              style={styles.closeDrawerBtn}
            >
              &times; Close
            </button>
          </div>

          <div style={styles.filterGroup}>
            <span style={styles.filterLabel}>Store Category:</span>
            <div style={styles.categoryPills}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    ...styles.categoryPill,
                    ...(selectedCategory === cat ? styles.categoryPillActive : {}),
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.filterDrawerFooter}>
            <span style={{ fontSize: 12, color: theme.colors.textSecondary }}>
              {activeFilterCount > 0 ? `${activeFilterCount} active filter applied` : 'Showing all store types'}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory('All')}
                  style={styles.resetFiltersBtn}
                >
                  Reset All
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                style={styles.applyFiltersBtn}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={styles.resultsInfoBar}>
        <span style={styles.resultsCount}>
          Showing <strong>{filteredVendors.length}</strong> of {ALL_VENDORS.length} Vendors
        </span>
        {(selectedCategory !== 'All' || searchQuery) && (
          <button
            type="button"
            style={styles.resetFiltersBtn}
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
          >
            Reset All Filters
          </button>
        )}
      </div>

      {/* Vendor Groups */}
      {Object.keys(vendorsByCategory).length === 0 ? (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>No vendors match your search.</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            style={styles.resetBtn}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div style={styles.groupsContainer}>
          {Object.entries(vendorsByCategory).map(([category, vendorList]) => (
            <section key={category} style={styles.categorySection}>
              <div style={styles.categoryHeaderRow}>
                <h2 style={styles.categoryTitle}>{category}</h2>
                <span style={styles.categoryCountBadge}>{vendorList.length} shops</span>
              </div>

              <div className="card-grid-responsive" style={styles.vendorGrid}>
                {vendorList.map((v) => (
                  <Link
                    key={v.id}
                    to={`/vendor/${encodeURIComponent(v.name)}`}
                    style={styles.vendorCard}
                  >
                    <div style={styles.vendorCardTop}>
                      <span style={styles.currencyBadge}>{v.currency}</span>
                      <span style={styles.offeringBadge}>{v.offeringCount} items</span>
                    </div>

                    <h3 style={styles.vendorName}>{v.name}</h3>

                    <div style={styles.locationText}>
                      <strong>Location:</strong> {v.location}
                    </div>

                    <p style={styles.vendorSnippet}>
                      {v.description}
                    </p>

                    <div style={styles.viewOfferingsRow}>
                      <span style={styles.viewOfferingsLink}>
                        View Store Offerings &rarr;
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  ...directoryStyles,
  categoryPills: directoryStyles.categoryPillsStrip,
  categoryPill: directoryStyles.categoryPill,
  categoryPillActive: directoryStyles.categoryPillActive,
  emptyState: directoryStyles.emptyNoticeBox,
  emptyText: directoryStyles.emptyNoticeText,
  resetBtn: directoryStyles.resetFiltersBtn,
  groupsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 28,
  },
  categorySection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  categoryHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    borderBottom: `1px solid ${theme.colors.borderSubtle}`,
    paddingBottom: 8,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: theme.colors.textHighlight,
    margin: 0,
  },
  categoryCountBadge: {
    fontSize: 11,
    fontWeight: 600,
    color: theme.colors.textSecondary,
  },
  vendorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: 14,
  },
  vendorCard: {
    display: 'flex',
    flexDirection: 'column',
    background: theme.colors.bgCard,
    border: `1px solid ${theme.colors.borderDefault}`,
    borderRadius: theme.radii.md,
    padding: '16px 18px',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'border-color 0.15s ease, background 0.15s ease',
  },
  vendorCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  currencyBadge: {
    fontSize: 11,
    fontWeight: 700,
    padding: '2px 7px',
    borderRadius: theme.radii.sm,
    background: theme.colors.greenBg,
    color: theme.colors.green,
    border: `1px solid ${theme.colors.greenBorder}`,
  },
  offeringBadge: {
    fontSize: 11,
    fontWeight: 600,
    color: theme.colors.textMuted,
  },
  vendorName: {
    fontSize: 17,
    fontWeight: 700,
    color: theme.colors.textHighlight,
    margin: '0 0 6px 0',
  },
  locationText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  vendorSnippet: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: '1.45',
    margin: '0 0 14px 0',
    flex: 1,
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  viewOfferingsRow: {
    marginTop: 'auto',
    borderTop: `1px solid ${theme.colors.borderSubtle}`,
    paddingTop: 10,
  },
  viewOfferingsLink: {
    fontSize: 12,
    fontWeight: 700,
    color: theme.colors.accent,
  },
};