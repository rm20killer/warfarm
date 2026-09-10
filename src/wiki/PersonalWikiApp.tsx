import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { WikiSearchPage } from './pages/WikiSearchPage';
import { WikiItemDetailPage } from './pages/WikiItemDetailPage';
import { ResourceLocatorPage } from './pages/ResourceLocatorPage';
import { RelicFinderPage } from './pages/RelicFinderPage';
import { MyTargetsPage } from './pages/MyTargetsPage';
import { PlanetsMissionsPage } from './pages/PlanetsMissionsPage';
import { SpecialMechanicsPage } from './pages/SpecialMechanicsPage';
import { ModsDirectoryPage } from './pages/ModsDirectoryPage';
import { GearDirectoryPage } from './pages/GearDirectoryPage';
import { ArcanesDirectoryPage } from './pages/ArcanesDirectoryPage';
import { LiveWorldStatePage } from './pages/LiveWorldStatePage';
import {
  getPersonalTargets,
  getVisitHistory,
  clearVisitHistory,
  PageVisitHistory,
} from './storage';
import syncMetaJson from '../shared/data/generated/sync-meta.json';

function NavigationBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [targetCount, setTargetCount] = useState(0);
  const [headerQuery, setHeaderQuery] = useState('');
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [history, setHistory] = useState<PageVisitHistory[]>(getVisitHistory);
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);

  useEffect(() => {
    const updateCount = () => setTargetCount(getPersonalTargets().length);
    updateCount();

    window.addEventListener('personal-targets-updated', updateCount);
    return () => window.removeEventListener('personal-targets-updated', updateCount);
  }, []);

  useEffect(() => {
    const updateHistory = () => setHistory(getVisitHistory());
    updateHistory();

    window.addEventListener('wiki-history-updated', updateHistory);
    return () => window.removeEventListener('wiki-history-updated', updateHistory);
  }, []);

  const handleHeaderSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && headerQuery.trim()) {
      navigate(`/item/${encodeURIComponent(headerQuery.trim())}`);
      setHeaderQuery('');
    }
  };

  return (
    <header style={styles.navBar}>
      {/* Top Bar: Branding, Search, and Utilities */}
      <div style={styles.topBar}>
        <div style={styles.navBrandArea}>
          <NavLink to="/" style={styles.brandTitle}>
            Warfarm Tracker
          </NavLink>
          <span style={styles.versionNavBadge} title={`Data synced: ${new Date(syncMetaJson.lastSyncedAt).toLocaleDateString()}`}>
            {syncMetaJson.gameVersion || 'Update 38'}
          </span>
        </div>

        <div style={styles.headerSearchWrapper}>
          <input
            type="text"
            placeholder="Quick jump (e.g. Tellurium, Rhino)..."
            value={headerQuery}
            onChange={(e) => setHeaderQuery(e.target.value)}
            onKeyDown={handleHeaderSearch}
            style={styles.headerSearchInput}
            aria-label="Quick search"
          />
        </div>

        <div style={styles.actionArea}>
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowHistoryDropdown((prev) => !prev)}
              style={{
                ...styles.historyNavBtn,
                backgroundColor: showHistoryDropdown ? '#1c2838' : '#14141e',
                borderColor: showHistoryDropdown ? '#68d4ff' : '#28283c',
                color: showHistoryDropdown ? '#ffffff' : '#c0c8e0',
              }}
              title="Recently Visited Pages & Items"
              aria-label="Recently Visited Pages & Items"
              aria-expanded={showHistoryDropdown}
            >
              History {history.length > 0 && <span style={styles.historyBadge}>{history.length}</span>}
            </button>

            {showHistoryDropdown && (
              <>
                <div
                  style={styles.popoverBackdrop}
                  onClick={() => setShowHistoryDropdown(false)}
                />
                <div style={styles.historyDropdown}>
                  <div style={styles.historyDropdownHeader}>
                    <strong style={{ fontSize: 13, color: '#f0f0f8' }}>Browsing History</strong>
                    {history.length > 0 && (
                      <button
                        type="button"
                        onClick={() => clearVisitHistory()}
                        style={styles.clearHistoryButton}
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {history.length === 0 ? (
                    <div style={styles.historyEmpty}>
                      No recently viewed pages yet.
                    </div>
                  ) : (
                    <div style={styles.historyDropdownList}>
                      {history.map((item) => (
                        <button
                          key={item.path}
                          type="button"
                          onClick={() => {
                            navigate(item.path);
                            setShowHistoryDropdown(false);
                          }}
                          style={styles.historyDropdownItem}
                        >
                          <div style={styles.historyItemLeft}>
                            {item.category && (
                              <span style={styles.historyItemCategory}>
                                {item.category}
                              </span>
                            )}
                            <span style={styles.historyItemTitle}>{item.title}</span>
                          </div>
                          <span style={styles.historyItemArrow}>&rarr;</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => setShowSyncModal(true)}
            style={styles.syncNavBtn}
            title="Live Data Sync"
          >
            Sync
          </button>
        </div>
      </div>

      {/* Bottom Bar: Primary Navigation */}
      <nav style={styles.navLinksContainer} aria-label="Wiki navigation">
        <NavLink
          to="/live"
          style={({ isActive }) => ({
            ...styles.navLink,
            color: isActive ? '#00e676' : '#8888a2',
            borderBottom: isActive ? '2px solid #00e676' : '2px solid transparent',
          })}
        >
          <span style={{ color: '#00e676', fontSize: 10 }}>●</span> Live
        </NavLink>
        <NavLink
          to="/mods"
          style={({ isActive }) => ({
            ...styles.navLink,
            color: isActive ? '#f0f0f8' : '#8888a2',
            borderBottom: isActive ? '2px solid #8e9ec4' : '2px solid transparent',
          })}
        >
          Mods
        </NavLink>
        <NavLink
          to="/gear"
          style={({ isActive }) => ({
            ...styles.navLink,
            color: isActive ? '#f0f0f8' : '#8888a2',
            borderBottom: isActive ? '2px solid #8e9ec4' : '2px solid transparent',
          })}
        >
          Warframes & Weapons
        </NavLink>
        <NavLink
          to="/arcanes"
          style={({ isActive }) => ({
            ...styles.navLink,
            color: isActive ? '#f0f0f8' : '#8888a2',
            borderBottom: isActive ? '2px solid #8e9ec4' : '2px solid transparent',
          })}
        >
          Arcanes
        </NavLink>
        <NavLink
          to="/missions"
          style={({ isActive }) => ({
            ...styles.navLink,
            color: isActive ? '#f0f0f8' : '#8888a2',
            borderBottom: isActive ? '2px solid #8e9ec4' : '2px solid transparent',
          })}
        >
          Planet Drops
        </NavLink>
        <NavLink
          to="/resources"
          style={({ isActive }) => ({
            ...styles.navLink,
            color: isActive ? '#f0f0f8' : '#8888a2',
            borderBottom: isActive ? '2px solid #8e9ec4' : '2px solid transparent',
          })}
        >
          Resource Locator
        </NavLink>
        <NavLink
          to="/mechanics"
          style={({ isActive }) => ({
            ...styles.navLink,
            color: isActive ? '#f0f0f8' : '#8888a2',
            borderBottom: isActive ? '2px solid #8e9ec4' : '2px solid transparent',
          })}
        >
          Lua & Puzzles
        </NavLink>
        <NavLink
          to="/relics"
          style={({ isActive }) => ({
            ...styles.navLink,
            color: isActive ? '#f0f0f8' : '#8888a2',
            borderBottom: isActive ? '2px solid #8e9ec4' : '2px solid transparent',
          })}
        >
          Relics
        </NavLink>
        <NavLink
          to="/targets"
          style={({ isActive }) => ({
            ...styles.navLink,
            color: isActive ? '#f0f0f8' : '#8888a2',
            borderBottom: isActive ? '2px solid #8e9ec4' : '2px solid transparent',
          })}
        >
          My Targets {targetCount > 0 && <span style={styles.targetBadge}>{targetCount}</span>}
        </NavLink>
      </nav>

      {showSyncModal && (
        <div style={styles.modalBackdrop} onClick={() => setShowSyncModal(false)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Sync Info</h2>
              <button
                onClick={() => setShowSyncModal(false)}
                style={styles.modalCloseBtn}
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>

            <div style={styles.modalBody}>
              <section style={styles.modalSection}>
                <h3 style={styles.modalSectionTitle}>Synced with Official Wiki</h3>
                <p style={styles.modalText}>
                  Synchronized with <code>wiki.warframe.com</code> and Warframe Public Export:
                </p>
                <ul style={styles.featureList}>
                  <li><strong>Last Synced</strong>: {new Date(syncMetaJson.lastSyncedAt).toLocaleString()}</li>
                  <li><strong>Wiki Resources Gathered</strong>: {syncMetaJson.resourcesCount} (includes official recommended farming locations & drop planets)</li>
                  <li><strong>Sources</strong>: Official Warframe Wiki, Warframe-Items, Public Export Plus</li>
                </ul>
                <div style={styles.codeBlock}>
                  <div><code>npm run sync:all</code> : Fetches latest wiki data & regenerates the complete Obsidian vault</div>
                  <div><code>npm run sync:data</code> : Pulls latest items, wiki resources, and recipes</div>
                  <div><code>npm run export:obsidian</code> : Re-exports all markdown notes and images to the vault</div>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export function PersonalWikiApp() {
  return (
    <BrowserRouter>
      <div style={styles.appShell}>
        <NavigationBar />
        <main style={styles.mainContent}>
          <Routes>
            <Route path="/" element={<WikiSearchPage />} />
            <Route path="/live" element={<LiveWorldStatePage />} />
            <Route path="/mods" element={<ModsDirectoryPage />} />
            <Route path="/gear" element={<GearDirectoryPage />} />
            <Route path="/arcanes" element={<ArcanesDirectoryPage />} />
            <Route path="/item/:title" element={<WikiItemDetailPage />} />
            <Route path="/missions" element={<PlanetsMissionsPage />} />
            <Route path="/resources" element={<ResourceLocatorPage />} />
            <Route path="/mechanics" element={<SpecialMechanicsPage />} />
            <Route path="/relics" element={<RelicFinderPage />} />
            <Route path="/targets" element={<MyTargetsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

const styles: Record<string, React.CSSProperties> = {
  appShell: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    background: '#0e0e12',
    color: '#e0e0e4',
  },
  navBar: {
    display: 'flex',
    flexDirection: 'column',
    background: '#0a0a0e',
    borderBottom: '1px solid #1a1a24',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 24px',
    gap: 16,
    flexWrap: 'wrap',
  },
  navBrandArea: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexShrink: 0,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#e4e4ee',
    textDecoration: 'none',
  },
  versionNavBadge: {
    fontSize: 11,
    fontWeight: 700,
    padding: '2px 7px',
    background: '#222538',
    color: '#ffd700',
    borderRadius: 4,
    border: '1px solid #ffd70033',
    letterSpacing: '0.02em',
  },
  headerSearchWrapper: {
    flex: '1 1 250px',
    maxWidth: 480,
    margin: '0 12px',
  },
  headerSearchInput: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '8px 16px',
    background: '#14141c',
    border: '1px solid #222230',
    borderRadius: 6,
    color: '#d0d0dc',
    fontSize: 13,
    outline: 'none',
    transition: 'border-color 0.2s ease',
  },
  actionArea: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexShrink: 0,
  },
  navLinksContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 24,
    padding: '0 24px',
    overflowX: 'auto',
    whiteSpace: 'nowrap',
    scrollbarWidth: 'none', 
    msOverflowStyle: 'none',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '10px 0 12px',
    fontSize: 13,
    fontWeight: 500,
    textDecoration: 'none',
    transition: 'color 0.15s, border-color 0.15s',
    marginBottom: '-1px', // Anchors the active border seamlessly to the bottom
  },
  targetBadge: {
    fontSize: 10,
    padding: '2px 6px',
    background: '#2a3a2a',
    color: '#90d090',
    borderRadius: 10,
    fontWeight: 600,
  },
  historyNavBtn: {
    background: '#14141e',
    border: '1px solid #28283c',
    borderRadius: 6,
    color: '#c0c8e0',
    padding: '6px 12px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    transition: 'all 0.15s ease',
  },
  historyBadge: {
    fontSize: 10,
    padding: '1px 5px',
    background: '#162838',
    color: '#68d4ff',
    border: '1px solid #28446c',
    borderRadius: 10,
    fontWeight: 700,
  },
  popoverBackdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 190,
  },
  historyDropdown: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    width: 320,
    maxHeight: 420,
    background: '#12141e',
    border: '1px solid #2c3248',
    borderRadius: 6,
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
    zIndex: 200,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  historyDropdownHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    background: '#161926',
    borderBottom: '1px solid #222638',
  },
  clearHistoryButton: {
    fontSize: 11,
    color: '#8e9ec4',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'underline',
    padding: '2px 4px',
  },
  historyEmpty: {
    padding: '24px 16px',
    fontSize: 12,
    color: '#98a4c8',
    textAlign: 'center',
  },
  historyDropdownList: {
    overflowY: 'auto',
    maxHeight: 360,
    display: 'flex',
    flexDirection: 'column',
  },
  historyDropdownItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    background: 'none',
    border: 'none',
    borderBottom: '1px solid #1a1d2c',
    color: '#d0d4e8',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background 0.15s ease',
    width: '100%',
    boxSizing: 'border-box',
  },
  historyItemLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    overflow: 'hidden',
  },
  historyItemCategory: {
    fontSize: 10,
    color: '#68d4ff',
    backgroundColor: '#102030',
    border: '1px solid #204060',
    padding: '2px 6px',
    borderRadius: 4,
    fontWeight: 600,
    textTransform: 'uppercase',
    flexShrink: 0,
  },
  historyItemTitle: {
    fontSize: 13,
    color: '#e4e8f8',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  historyItemArrow: {
    fontSize: 12,
    color: '#98a4c8',
    marginLeft: 8,
    flexShrink: 0,
  },
  syncNavBtn: {
    background: '#1c2234',
    border: '1px solid #36486c',
    borderRadius: 6,
    color: '#9db4e0',
    padding: '6px 14px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  modalBackdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(5, 5, 8, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalCard: {
    background: '#12121a',
    border: '1px solid #28283c',
    borderRadius: 8,
    width: '90%',
    maxWidth: 620,
    maxHeight: '85vh',
    overflowY: 'auto',
    padding: 24,
    boxShadow: '0 12px 36px rgba(0,0,0,0.6)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottom: '1px solid #202030',
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#f0f0f8',
    margin: 0,
  },
  modalCloseBtn: {
    background: 'transparent',
    border: 'none',
    color: '#8888a2',
    fontSize: 24,
    cursor: 'pointer',
    padding: '0 6px',
  },
  modalBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  modalSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#d0d0e2',
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  modalText: {
    fontSize: 13,
    color: '#a0a0b8',
    margin: 0,
    lineHeight: 1.5,
  },
  featureList: {
    margin: '4px 0 0 0',
    paddingLeft: 20,
    fontSize: 13,
    color: '#c0c0d4',
    lineHeight: 1.6,
  },
  codeBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    background: '#09090e',
    border: '1px solid #1e1e2c',
    borderRadius: 6,
    padding: 14,
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#8ec48e',
  },
  mainContent: {
    flex: 1,
  },
};