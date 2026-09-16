import React, { useEffect } from "react";
import syncMetaJson from "../../shared/data/generated/sync-meta.json";
import { theme } from "../styles/theme";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div style={styles.backdrop} onClick={onClose} role="presentation">
      <div
        className="modal-dialog-responsive"
        style={styles.dialog}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-dialog-title"
      >
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <h2 id="about-dialog-title" style={styles.title}>
              About Warfarm Tracker
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={styles.closeBtn}
            aria-label="Close dialog"
          >
            &times;
          </button>
        </div>

        <div style={styles.body}>
          <section style={styles.section}>
            <h3 style={styles.sectionHeading}>Project Overview</h3>
            <p style={styles.text}>
              Warfarm Tracker is an open source companion designed to quickly
              look up drop tables, crafting recipes, and live worldstate timers
              without ads or information overload.
            </p>
          </section>

          {/* Section 2: Data Synchronization & Catalog Info */}
          <section style={styles.section}>
            <h3 style={styles.sectionHeading}>Data Synchronization</h3>
            <div style={styles.syncCard}>
              <div style={styles.syncMetaRow}>
                <div style={styles.syncMetaCol}>
                  <span style={styles.metaLabel}>Game Version</span>
                  <span style={styles.metaVal}>
                    {syncMetaJson.gameVersion || "Update 38"}
                  </span>
                </div>
                <div style={styles.syncMetaCol}>
                  <span style={styles.metaLabel}>Last Synced</span>
                  <span style={styles.metaVal}>
                    {new Date(syncMetaJson.lastSyncedAt).toLocaleString()}
                  </span>
                </div>
                <div style={styles.syncMetaCol}>
                  <span style={styles.metaLabel}>Total Items</span>
                  <span style={styles.metaVal}>
                    {syncMetaJson.totalCount} <span style={styles.metaUnit}>items</span>
                  </span>
                </div>
              </div>

              <div style={styles.cliSection}>
                <span style={styles.cliLabel}>
                  Local Commands for anyone self hosting:
                </span>
                <div style={styles.codeBlock}>
                  <div>
                    <code>npm run sync:data</code> : Pulls latest item catalogs
                    and drop tables
                  </div>
                  <div>
                    <code>npm run export:obsidian</code> : Re-exports all
                    markdown notes and assets
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Author & Support Links */}
          <section style={styles.section}>
            <h3 style={styles.sectionHeading}>Developer & Links</h3>
            <div style={styles.linkGrid}>
              <a
                href="https://github.com/rm20killer/warfarm"
                target="_blank"
                rel="noreferrer"
                style={styles.cardLink}
              >
                <div style={styles.cardLabel}>Source Code</div>
                <div style={styles.cardTitle}>
                  github.com/rm20killer/warfarm
                </div>
              </a>

              <a
                href="https://www.rm20.dev/"
                target="_blank"
                rel="noreferrer"
                style={styles.cardLink}
              >
                <div style={styles.cardLabel}>Developer Website</div>
                <div style={styles.cardTitle}>rm20.dev</div>
              </a>

              <a
                href="https://buymeacoffee.com/rm20"
                target="_blank"
                rel="noreferrer"
                style={styles.bmcCardLink}
              >
                <div style={styles.bmcCardLabel}>Support the Project</div>
                <div style={styles.bmcCardTitle}>☕ Buy me a coffee</div>
              </a>
            </div>
          </section>

          {/* Section 4: Sources */}
          <section style={styles.section}>
            <h3 style={styles.sectionHeading}>
              Data Sources & Community Repositories
            </h3>
            <ul style={styles.sourceList}>
              <li style={styles.sourceItem}>
                <strong>Official Warframe Wiki:</strong>{" "}
                <a
                  href="https://wiki.warframe.com/"
                  target="_blank"
                  rel="noreferrer"
                  style={styles.inlineLink}
                >
                  wiki.warframe.com
                </a>
                <span style={styles.sourceDesc}>
                  Official game mechanics, drop tables, and acquisition guides.
                </span>
              </li>
              <li style={styles.sourceItem}>
                <strong>Warframe Community Developers (WFCD):</strong>{" "}
                <a
                  href="https://warframestat.us/"
                  target="_blank"
                  rel="noreferrer"
                  style={styles.inlineLink}
                >
                  warframestat.us
                </a>
                <span style={styles.sourceDesc}>
                  Live worldstate feed, fissures, alerts, and invasion tracking.
                </span>
              </li>
              <li style={styles.sourceItem}>
                <strong>Warframe Public Export Plus:</strong>{" "}
                <a
                  href="https://github.com/calamity-inc/warframe-public-export-plus"
                  target="_blank"
                  rel="noreferrer"
                  style={styles.inlineLink}
                >
                  github.com/calamity-inc/warframe-public-export-plus
                </a>
                <span style={styles.sourceDesc}>
                  Parsed public export data and item catalogs.
                </span>
              </li>
              <li style={styles.sourceItem}>
                <strong>Warframe Market API:</strong>{" "}
                <a
                  href="https://warframe.market/"
                  target="_blank"
                  rel="noreferrer"
                  style={styles.inlineLink}
                >
                  warframe.market
                </a>
                <span style={styles.sourceDesc}>
                  Community market statistics and price reference data.
                </span>
              </li>
            </ul>
          </section>

          {/* Section 5: Disclaimer */}
          <section style={styles.disclaimerBox}>
            <h4 style={styles.disclaimerHeading}>
              Disclaimer & Trademarks
            </h4>
            <p style={styles.disclaimerText}>
              This project is an unofficial fan creation and is not affiliated
              with, endorsed by, or sponsored by Digital Extremes Ltd. or the
              Warframe Wiki. Warframe, the Warframe logo, and all related names,
              images, and likenesses are trademarks or registered trademarks of
              Digital Extremes Ltd.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: theme.colors.bgModalBackdrop,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: 16,
    boxSizing: "border-box",
  },
  dialog: {
    background: theme.colors.bgCard,
    border: `1px solid ${theme.colors.borderStrong}`,
    borderRadius: theme.radii.lg,
    width: "100%",
    maxWidth: 640,
    maxHeight: "90vh",
    overflowY: "auto",
    padding: 24,
    boxShadow: theme.shadows.lg,
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 12,
    borderBottom: `1px solid ${theme.colors.borderDefault}`,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    color: theme.colors.textHighlight,
    margin: 0,
  },
  versionBadge: {
    fontSize: 11,
    fontWeight: 700,
    padding: "2px 8px",
    background: theme.colors.bgCardElevated,
    color: theme.colors.gold,
    borderRadius: theme.radii.sm,
    border: `1px solid ${theme.colors.goldBorder}`,
    whiteSpace: "nowrap",
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: theme.colors.textSecondary,
    fontSize: 24,
    cursor: "pointer",
    padding: "0 6px",
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: 700,
    color: theme.colors.textHighlight,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    margin: 0,
  },
  text: {
    fontSize: 13.5,
    lineHeight: 1.6,
    color: theme.colors.textPrimary,
    margin: 0,
  },
  syncCard: {
    background: theme.colors.bgCardElevated,
    border: `1px solid ${theme.colors.borderSubtle}`,
    borderRadius: theme.radii.md,
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  syncMetaRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: 12,
  },
  syncMetaCol: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  metaLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    textTransform: "uppercase",
    fontWeight: 600,
    letterSpacing: "0.03em",
  },
  metaVal: {
    fontSize: 13,
    fontWeight: 600,
    color: theme.colors.textHighlight,
  },
  metaUnit: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: 400,
  },
  cliSection: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    borderTop: `1px solid ${theme.colors.borderSubtle}`,
    paddingTop: 12,
  },
  cliLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: theme.colors.textSecondary,
  },
  codeBlock: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    background: theme.colors.bgNavbar,
    border: `1px solid ${theme.colors.borderSubtle}`,
    borderRadius: theme.radii.sm,
    padding: 10,
    fontSize: 12,
    fontFamily: theme.typography.monoFontFamily,
    color: theme.colors.green,
    lineHeight: 1.5,
    overflowX: "auto",
    whiteSpace: "nowrap",
  },
  linkGrid: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  cardLink: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    padding: "12px 14px",
    background: theme.colors.bgCardElevated,
    border: `1px solid ${theme.colors.borderDefault}`,
    borderRadius: theme.radii.md,
    textDecoration: "none",
    transition: "border-color 0.15s ease, background 0.15s ease",
    overflow: "hidden",
  },
  cardLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    textTransform: "uppercase",
    fontWeight: 600,
    letterSpacing: "0.03em",
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: theme.colors.accent,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  bmcCardLink: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: '12px 14px',
    background: '#f7d501', 
    border: '1px solid #8b8454ff',
    borderRadius: theme.radii.md,
    textDecoration: 'none',
  },
  bmcCardLabel: {
    fontSize: 12,
    color: '#22221f',
    textTransform: 'uppercase',
    fontWeight: 700,
    letterSpacing: '0.03em',
  },
  bmcCardTitle: {
    fontSize: 14,
    fontWeight: 800,
    color: '#22221f',
  },
  sourceList: {
    margin: 0,
    paddingLeft: 20,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  sourceItem: {
    fontSize: 13.5,
    lineHeight: 1.5,
    color: theme.colors.textPrimary,
  },
  inlineLink: {
    color: theme.colors.accent,
    textDecoration: "none",
    fontWeight: 600,
  },
  sourceDesc: {
    display: "block",
    fontSize: 12.5,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  disclaimerBox: {
    background: theme.colors.bgNavbar,
    border: `1px solid ${theme.colors.borderSubtle}`,
    borderRadius: theme.radii.md,
    padding: "14px 16px",
  },
  disclaimerHeading: {
    fontSize: 11,
    fontWeight: 700,
    color: theme.colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    margin: "0 0 8px 0",
  },
  disclaimerText: {
    fontSize: 12,
    lineHeight: 1.5,
    color: theme.colors.textMuted,
    margin: 0,
  },
};
