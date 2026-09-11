import React from 'react';

interface AppFooterProps {
  onOpenAbout: () => void;
}

export function AppFooter({ onOpenAbout }: AppFooterProps) {
  return (
    <footer style={styles.footer} aria-label="Site Footer">
      <div style={styles.container}>
        {/* Top Grid: Info & Links */}
        <div style={styles.grid}>
          {/* Column 1: Brand & Project */}
          <div style={styles.column}>
            <div style={styles.brandTitle}>Warfarm Tracker</div>
            <p style={styles.description}>
              Open source Warframe farming guide, drop database, and live progression companion.
            </p>
            <div style={styles.buttonRow}>
              <button
                type="button"
                onClick={onOpenAbout}
                style={styles.aboutBtn}
              >
                About &amp; Sync Info
              </button>
            </div>
          </div>

          {/* Column 2: Creator & Support */}
          <div style={styles.column}>
            <div style={styles.columnTitle}>Project &amp; Author</div>
            <ul style={styles.linkList}>
              <li>
                <a
                  href="https://github.com/rm20killer/warfarm"
                  target="_blank"
                  rel="noreferrer"
                  style={styles.link}
                >
                  GitHub Repository
                </a>
              </li>
              <li>
                <a
                  href="https://www.rm20.dev/"
                  target="_blank"
                  rel="noreferrer"
                  style={styles.link}
                >
                  Developer (rm20.dev)
                </a>
              </li>
              <li>
                <a
                  href="https://buymeacoffee.com/rm20"
                  target="_blank"
                  rel="noreferrer"
                  style={styles.supportLink}
                >
                  Buy Me a Coffee
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Data & Wiki Sources */}
          <div style={styles.column}>
            <div style={styles.columnTitle}>Data &amp; Wiki Sources</div>
            <ul style={styles.linkList}>
              <li>
                <a
                  href="https://wiki.warframe.com/"
                  target="_blank"
                  rel="noreferrer"
                  style={styles.link}
                >
                  Official Warframe Wiki
                </a>
              </li>
              <li>
                <a
                  href="https://warframestat.us/"
                  target="_blank"
                  rel="noreferrer"
                  style={styles.link}
                >
                  WarframeStat.us (WFCD)
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/calamity-inc/warframe-public-export-plus"
                  target="_blank"
                  rel="noreferrer"
                  style={styles.link}
                >
                  Public Export Plus
                </a>
              </li>
              <li>
                <a
                  href="https://warframe.market/"
                  target="_blank"
                  rel="noreferrer"
                  style={styles.link}
                >
                  Warframe Market
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div style={styles.disclaimerRow}>
          <p style={styles.disclaimerText}>
            <strong>Disclaimer:</strong> Warfarm Tracker is an unofficial, open-source fan-made project
            and is not affiliated with, endorsed by, or sponsored by Digital Extremes Ltd. or the Warframe Wiki.
            Warframe and all associated logos, game content, and trademarks are property of Digital Extremes Ltd.
          </p>
        </div>
      </div>
    </footer>
  );
}

const styles: Record<string, React.CSSProperties> = {
  footer: {
    background: '#08090e',
    borderTop: '1px solid #181a24',
    padding: '36px 20px 24px 20px',
    color: '#98a2be',
    marginTop: 'auto',
  },
  container: {
    maxWidth: 1140,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 28,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: 28,
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#e4e8f8',
    letterSpacing: '0.02em',
  },
  description: {
    fontSize: 13,
    lineHeight: 1.5,
    color: '#8e98b4',
    margin: 0,
    maxWidth: 320,
  },
  buttonRow: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 4,
  },
  aboutBtn: {
    background: '#161c2c',
    border: '1px solid #2e3c5a',
    borderRadius: 6,
    color: '#8ec4ff',
    padding: '6px 12px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  syncBtn: {
    background: '#12141c',
    border: '1px solid #222636',
    borderRadius: 6,
    color: '#a0a8c4',
    padding: '6px 12px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  columnTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#c4cce4',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  linkList: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  link: {
    fontSize: 13,
    color: '#a0accc',
    textDecoration: 'none',
    transition: 'color 0.15s',
  },
  supportLink: {
    fontSize: 13,
    color: '#ffd580',
    fontWeight: 600,
    textDecoration: 'none',
    transition: 'color 0.15s',
  },
  disclaimerRow: {
    borderTop: '1px solid #141722',
    paddingTop: 18,
  },
  disclaimerText: {
    fontSize: 11.5,
    lineHeight: 1.6,
    color: '#8e98b4',
    margin: 0,
  },
};
