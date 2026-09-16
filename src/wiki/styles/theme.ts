import React from 'react';

/**
 * Global Warframe Hub Theme & Design System
 * Single source of truth for all colors, surfaces, borders, typography, and badges.
 * Modify tokens here to change themes globally across the entire application.
 */

export const theme = {
  colors: {
    // Surface & Backgrounds
    bgApp: '#0e0e12',
    bgNavbar: '#0a0a0e',
    bgCard: '#12141e',
    bgCardElevated: '#161926',
    bgCardHover: '#181d2c',
    bgCardActive: '#1c2236',
    bgInput: '#14141c',
    bgModalBackdrop: 'rgba(0, 0, 0, 0.75)',

    // Text & Hierarchy
    textPrimary: '#e4e8f8',
    textSecondary: '#8e96b2',
    textMuted: '#687088',
    textHighlight: '#ffffff',
    textInverse: '#0e0e12',

    // Borders & Separators
    borderSubtle: '#1a1d2c',
    borderDefault: '#24283c',
    borderStrong: '#2e3852',
    borderAccent: '#284c6c',

    // Accents & Signals
    accent: '#68d4ff',
    accentLight: '#8ecbfc',
    accentBg: '#162838',
    accentBorder: '#284c6c',

    gold: '#ffd700',
    goldLight: '#ffe866',
    goldBg: '#2a2216',
    goldBorder: '#5c4820',

    green: '#7ae08a',
    greenLight: '#9ef4ac',
    greenBg: '#142a1a',
    greenBorder: '#23582e',

    red: '#ff6b6b',
    redLight: '#ff8a8a',
    redBg: '#3a181c',
    redBorder: '#642028',

    purple: '#bb9af7',
    purpleLight: '#dca8ff',
    purpleBg: '#251b38',
    purpleBorder: '#4d306e',

    orange: '#ff9e64',
    orangeBg: '#2d1e16',
    orangeBorder: '#5c3822',

    platinumBuy: '#9e3f7e',
    platinumSell: '#1e7e5c',

    platinumBg: '#40403e',
    platinumBorder: '#81817cff',

    // Categories
    catWarframe: '#bb9af7',
    catWarframeBg: '#251b38',
    catWarframeBorder: '#4d306e',

    catWeapon: '#ff7a90',
    catWeaponBg: '#2d1822',
    catWeaponBorder: '#582438',

    catMod: '#7dcfff',
    catModBg: '#142436',
    catModBorder: '#204468',

    catArcane: '#ffd700',
    catArcaneBg: '#2a2216',
    catArcaneBorder: '#5c4820',

    catRelic: '#f0c060',
    catRelicBg: '#2a2216',
    catRelicBorder: '#5c4820',

    catResource: '#9ece6a',
    catResourceBg: '#1a2a18',
    catResourceBorder: '#2e4e2c',

    // Rarities
    rarityCommon: '#d49b6a',
    rarityCommonBg: '#261b14',
    rarityCommonBorder: '#4a3020',

    rarityUncommon: '#90caf9',
    rarityUncommonBg: '#142434',
    rarityUncommonBorder: '#244464',

    rarityRare: '#ffd700',
    rarityRareBg: '#2a2216',
    rarityRareBorder: '#5c4820',

    rarityLegendary: '#ffffff',
    rarityLegendaryBg: '#282834',
    rarityLegendaryBorder: '#505068',

    // Weapon Lineages
    lineageIncarnon: '#50dccb',
    lineageIncarnonBg: '#111c1f',
    lineageIncarnonBorder: '#195c58',

    lineageTenet: '#00f0ff',
    lineageTenetBg: '#071a24',
    lineageTenetBorder: '#0c4763',

    lineageKuva: '#ff2a2a',
    lineageKuvaBg: '#210b0b',
    lineageKuvaBorder: '#7a1111',

    lineageCoda: '#f872ee',
    lineageCodaBg: '#180316',
    lineageCodaBorder: '#6b0c62',

    // Damage Types (Named by Type)
    slash: '#8f8182',
    puncture: '#868178',
    impact: '#5c696a',
    heat: '#fa780e',
    cold: '#3f4d8c',
    electricity: '#4a3a5d',
    toxin: '#8ded20',
    blast: '#ff7733',
    corrosive: '#7d8d13',
    gas: '#247452',
    magnetic: '#c5c7cf',
    radiation: '#e7df01',
    viral: '#ed83cb',
    void: '#44eedd',
    tau: '#e0a030',
    sentient: '#e0a030',

    // Stats & Mechanics (Named by Type)
    health: '#7c191a',
    healthBg: '#3a181e',
    healthBorder: '#642028',
    shield: '#07c2e8',
    shieldBg: '#142434',
    shieldBorder: '#244464',
    energy: '#1c5eb6',
    energyBg: '#081b35',
    energyBorder: '#4d306e',
    affinity: '#68d4ff',
    affinityBg: '#162838',
    affinityBorder: '#284c6c',
    lowerIsBetter: '#7ae08a',
    upperIsBetter: '#7ae08a',

    // Relic Eras
    relicLith: '#e0a868',
    relicLithBg: '#2a2216',
    relicLithBorder: '#5c4820',

    relicMeso: '#70c8b0',
    relicMesoBg: '#1a2624',
    relicMesoBorder: '#23582e',

    relicNeo: '#e5e5e5',
    relicNeoBg: '#40403e',
    relicNeoBorder: '#81817cff',

    relicAxi: '#e5c964',
    relicAxiBg: '#2c2616',
    relicAxiBorder: '#5c4820',

    relicRequiem: '#740e0e',
    relicRequiemBg: '#2c1414',
    relicRequiemBorder: '#642028',

    // Vault & Acquisition Status
    vaulted: '#e0a060',
    vaultedBg: '#2d2218',
    vaultedBorder: '#543820',
    unvaulted: '#7ae08a',
    unvaultedBg: '#142a1a',
    unvaultedBorder: '#23582e',

    // World State & Cycles
    day: '#ffbb33',
    night: '#69b4ff',
    warm: '#ff8844',
    coldCycle: '#44ccff',
    vome: '#43c4bfff',
    fass: '#ff5522',
    corpusCycle: '#55aaff',
    grineerCycle: '#ff4444',
    voidTraderActive: '#74c69d',
    voidTraderActiveBg: '#1b4332',
    voidTraderActiveBorder: '#2d6a4f',
    voidTraderInactive: '#8fa0d0',
    voidTraderInactiveBg: '#232942',
    voidTraderInactiveBorder: '#39446d',
  },

  radii: {
    sm: 4,
    md: 6,
    lg: 8,
    full: 9999,
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },

  typography: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
    monoFontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace",
    sizes: {
      xs: 10,
      sm: 11,
      md: 13,
      base: 14,
      lg: 16,
      xl: 18,
      xxl: 22,
      display: 26,
    },
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      black: 800,
    },
  },

  shadows: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.3)',
    md: '0 4px 16px rgba(0, 0, 0, 0.4)',
    lg: '0 8px 32px rgba(0, 0, 0, 0.5)',
  },

  helpers: {
    getRarityBadgeStyle(rarity?: string): React.CSSProperties {
      const r = (rarity || '').toLowerCase();
      if (r.includes('legendary')) {
        return {
          display: 'inline-block',
          padding: '2px 8px',
          borderRadius: 4,
          fontSize: 11,
          fontWeight: 600,
          backgroundColor: theme.colors.rarityLegendaryBg,
          border: `1px solid ${theme.colors.rarityLegendaryBorder}`,
          color: theme.colors.rarityLegendary,
        };
      }
      if (r.includes('rare')) {
        return {
          display: 'inline-block',
          padding: '2px 8px',
          borderRadius: 4,
          fontSize: 11,
          fontWeight: 600,
          backgroundColor: theme.colors.rarityRareBg,
          border: `1px solid ${theme.colors.rarityRareBorder}`,
          color: theme.colors.rarityRare,
        };
      }
      if (r.includes('uncommon')) {
        return {
          display: 'inline-block',
          padding: '2px 8px',
          borderRadius: 4,
          fontSize: 11,
          fontWeight: 600,
          backgroundColor: theme.colors.rarityUncommonBg,
          border: `1px solid ${theme.colors.rarityUncommonBorder}`,
          color: theme.colors.rarityUncommon,
        };
      }
      return {
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 600,
        backgroundColor: theme.colors.rarityCommonBg,
        border: `1px solid ${theme.colors.rarityCommonBorder}`,
        color: theme.colors.rarityCommon,
      };
    },

    getCategoryBadgeStyle(category?: string): React.CSSProperties {
      const cat = (category || '').toLowerCase();
      let bg = theme.colors.accentBg;
      let border = theme.colors.accentBorder;
      let color = theme.colors.accent;

      if (cat.includes('warframe')) {
        bg = theme.colors.catWarframeBg;
        border = theme.colors.catWarframeBorder;
        color = theme.colors.catWarframe;
      } else if (cat.includes('weapon')) {
        bg = theme.colors.catWeaponBg;
        border = theme.colors.catWeaponBorder;
        color = theme.colors.catWeapon;
      } else if (cat.includes('arcane')) {
        bg = theme.colors.catArcaneBg;
        border = theme.colors.catArcaneBorder;
        color = theme.colors.catArcane;
      } else if (cat.includes('mod')) {
        bg = theme.colors.catModBg;
        border = theme.colors.catModBorder;
        color = theme.colors.catMod;
      } else if (cat.includes('relic')) {
        bg = theme.colors.catRelicBg;
        border = theme.colors.catRelicBorder;
        color = theme.colors.catRelic;
      } else if (cat.includes('resource')) {
        bg = theme.colors.catResourceBg;
        border = theme.colors.catResourceBorder;
        color = theme.colors.catResource;
      }

      return {
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 600,
        backgroundColor: bg,
        border: `1px solid ${border}`,
        color: color,
      };
    },

    getLineageBadgeStyle(lineage: string): React.CSSProperties {
      let bg = theme.colors.bgCard;
      let border = theme.colors.borderDefault;
      let color = theme.colors.textPrimary;

      if (lineage === 'Incarnon') {
        bg = theme.colors.lineageIncarnonBg;
        border = theme.colors.lineageIncarnonBorder;
        color = theme.colors.lineageIncarnon;
      } else if (lineage === 'Tenet') {
        bg = theme.colors.lineageTenetBg;
        border = theme.colors.lineageTenetBorder;
        color = theme.colors.lineageTenet;
      } else if (lineage === 'Kuva') {
        bg = theme.colors.lineageKuvaBg;
        border = theme.colors.lineageKuvaBorder;
        color = theme.colors.lineageKuva;
      } else if (lineage === 'Coda') {
        bg = theme.colors.lineageCodaBg;
        border = theme.colors.lineageCodaBorder;
        color = theme.colors.lineageCoda;
      }

      return {
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.4px',
        padding: '2px 7px',
        borderRadius: 3,
        backgroundColor: bg,
        color: color,
        border: `1px solid ${border}`,
        textTransform: 'uppercase',
      };
    },

    getRelicEraStyle(era: string): { bg: string; color: string; border: string } {
      const e = (era || '').toLowerCase();
      if (e === 'lith') {
        return {
          bg: theme.colors.relicLithBg,
          color: theme.colors.relicLith,
          border: theme.colors.relicLithBorder,
        };
      }
      if (e === 'meso') {
        return {
          bg: theme.colors.relicMesoBg,
          color: theme.colors.relicMeso,
          border: theme.colors.relicMesoBorder,
        };
      }
      if (e === 'neo') {
        return {
          bg: theme.colors.relicNeoBg,
          color: theme.colors.relicNeo,
          border: theme.colors.relicNeoBorder,
        };
      }
      if (e === 'axi') {
        return {
          bg: theme.colors.relicAxiBg,
          color: theme.colors.relicAxi,
          border: theme.colors.relicAxiBorder,
        };
      }
      if (e === 'requiem') {
        return {
          bg: theme.colors.relicRequiemBg,
          color: theme.colors.relicRequiem,
          border: theme.colors.relicRequiemBorder,
        };
      }
      return {
        bg: theme.colors.bgCardElevated,
        color: theme.colors.accent,
        border: theme.colors.borderDefault,
      };
    },
  },
};

/**
 * Reusable layout & component style primitives configured from theme tokens
 */
export const commonStyles = {
  card: {
    backgroundColor: theme.colors.bgCard,
    border: `1px solid ${theme.colors.borderDefault}`,
    borderRadius: theme.radii.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  } as React.CSSProperties,

  cardElevated: {
    backgroundColor: theme.colors.bgCardElevated,
    border: `1px solid ${theme.colors.borderStrong}`,
    borderRadius: theme.radii.md,
    padding: theme.spacing.lg,
    boxShadow: theme.shadows.sm,
  } as React.CSSProperties,

  sectionTitle: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textHighlight,
    margin: `0 0 ${theme.spacing.sm}px 0`,
  } as React.CSSProperties,

  sectionSubTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textHighlight,
    margin: `0 0 ${theme.spacing.md}px 0`,
  } as React.CSSProperties,

  primaryButton: {
    backgroundColor: theme.colors.accentBg,
    color: theme.colors.accent,
    border: `1px solid ${theme.colors.accentBorder}`,
    borderRadius: theme.radii.sm,
    padding: '6px 14px',
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  } as React.CSSProperties,

  secondaryButton: {
    backgroundColor: theme.colors.bgCard,
    color: theme.colors.textSecondary,
    border: `1px solid ${theme.colors.borderDefault}`,
    borderRadius: theme.radii.sm,
    padding: '6px 14px',
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.medium,
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  } as React.CSSProperties,

  input: {
    backgroundColor: theme.colors.bgInput,
    border: `1px solid ${theme.colors.borderDefault}`,
    borderRadius: theme.radii.md,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.md,
    padding: '8px 14px',
    outline: 'none',
  } as React.CSSProperties,

  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textPrimary,
  } as React.CSSProperties,

  th: {
    textAlign: 'left',
    padding: '10px 14px',
    backgroundColor: theme.colors.bgCardElevated,
    color: theme.colors.textSecondary,
    borderBottom: `1px solid ${theme.colors.borderStrong}`,
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  } as React.CSSProperties,

  td: {
    padding: '10px 14px',
    borderBottom: `1px solid ${theme.colors.borderSubtle}`,
  } as React.CSSProperties,

  directoryHeader: {
    backgroundColor: theme.colors.bgCardElevated,
    border: `1px solid ${theme.colors.borderDefault}`,
    borderRadius: theme.radii.lg,
    padding: '16px 20px',
    marginBottom: 16,
  } as React.CSSProperties,

  directoryTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: theme.colors.textHighlight,
    margin: '0 0 4px 0',
  } as React.CSSProperties,

  directorySubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    margin: 0,
    lineHeight: 1.45,
  } as React.CSSProperties,

  searchControlsRow: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 16,
  } as React.CSSProperties,

  searchBarWrapper: {
    flex: '1 1 300px',
    display: 'flex',
    position: 'relative',
    alignItems: 'center',
  } as React.CSSProperties,

  searchInput: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '10px 14px',
    backgroundColor: theme.colors.bgInput,
    border: `1px solid ${theme.colors.borderDefault}`,
    borderRadius: theme.radii.md,
    color: theme.colors.textHighlight,
    fontSize: 14,
    outline: 'none',
    minHeight: 40,
  } as React.CSSProperties,

  clearSearchBtn: {
    position: 'absolute',
    right: 10,
    padding: '4px 8px',
    backgroundColor: 'transparent',
    border: 'none',
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  } as React.CSSProperties,

  filterToggleBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '10px 14px',
    borderRadius: theme.radii.md,
    border: `1px solid ${theme.colors.borderDefault}`,
    backgroundColor: theme.colors.bgInput,
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    minHeight: 40,
    transition: 'all 0.15s ease',
  } as React.CSSProperties,

  filterCountBadge: {
    backgroundColor: theme.colors.accent,
    color: theme.colors.bgCard,
    borderRadius: theme.radii.full,
    fontSize: 10,
    fontWeight: 800,
    padding: '1px 6px',
    minWidth: 16,
    textAlign: 'center',
  } as React.CSSProperties,

  resetFiltersQuickBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '10px 14px',
    borderRadius: theme.radii.md,
    border: `1px solid ${theme.colors.borderDefault}`,
    backgroundColor: 'transparent',
    color: theme.colors.textMuted,
    fontSize: 12,
    cursor: 'pointer',
    minHeight: 40,
  } as React.CSSProperties,

  filterDrawerCard: {
    backgroundColor: theme.colors.bgCard,
    border: `1px solid ${theme.colors.borderDefault}`,
    borderRadius: theme.radii.lg,
    padding: '16px 18px',
    marginBottom: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  } as React.CSSProperties,

  filterDrawerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottom: `1px solid ${theme.colors.borderSubtle}`,
  } as React.CSSProperties,

  filterDrawerTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: theme.colors.textHighlight,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  } as React.CSSProperties,

  closeDrawerBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: theme.colors.textMuted,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    padding: '4px 8px',
  } as React.CSSProperties,

  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  } as React.CSSProperties,

  filterLabel: {
    fontSize: 12,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: theme.colors.textMuted,
  } as React.CSSProperties,

  filterPills: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  } as React.CSSProperties,

  filterPill: {
    padding: '6px 12px',
    backgroundColor: theme.colors.bgCardElevated,
    border: `1px solid ${theme.colors.borderDefault}`,
    borderRadius: theme.radii.sm,
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  } as React.CSSProperties,

  filterPillActive: {
    backgroundColor: theme.colors.accentBg,
    borderColor: theme.colors.accentBorder,
    color: theme.colors.accent,
    fontWeight: 700,
  } as React.CSSProperties,

  filterDrawerFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    borderTop: `1px solid ${theme.colors.borderSubtle}`,
    flexWrap: 'wrap',
    gap: 10,
  } as React.CSSProperties,

  resetFiltersBtn: {
    backgroundColor: 'transparent',
    border: `1px solid ${theme.colors.borderDefault}`,
    color: theme.colors.accent,
    padding: '6px 12px',
    borderRadius: theme.radii.sm,
    fontSize: 12,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: 34,
  } as React.CSSProperties,

  applyFiltersBtn: {
    backgroundColor: theme.colors.accentBg,
    border: `1px solid ${theme.colors.accentBorder}`,
    color: theme.colors.textHighlight,
    padding: '6px 14px',
    borderRadius: theme.radii.sm,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    minHeight: 34,
  } as React.CSSProperties,

  tabBar: {
    display: 'flex',
    gap: 6,
    overflowX: 'auto',
    paddingBottom: 4,
    marginBottom: 16,
  } as React.CSSProperties,

  tabButton: {
    padding: '8px 16px',
    backgroundColor: theme.colors.bgCard,
    border: `1px solid ${theme.colors.borderDefault}`,
    borderRadius: theme.radii.md,
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s ease',
  } as React.CSSProperties,

  tabButtonActive: {
    backgroundColor: theme.colors.accentBg,
    borderColor: theme.colors.accentBorder,
    color: theme.colors.textHighlight,
  } as React.CSSProperties,
};


