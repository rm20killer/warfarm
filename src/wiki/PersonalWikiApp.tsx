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
import { AppFooter } from './components/AppFooter';
import { AboutModal } from './components/AboutModal';
import { findSimilarItems, SimilarItemSuggestion } from '../shared/utils/fuzzy-search';
import { ItemThumbnail } from '../shared/utils/item-images';

interface NavigationBarProps {
  onOpenAbout: () => void;
}

function NavigationBar({ onOpenAbout }: NavigationBarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [targetCount, setTargetCount] = useState(0);
  const [headerQuery, setHeaderQuery] = useState('');
  const [history, setHistory] = useState<PageVisitHistory[]>(getVisitHistory);
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState<SimilarItemSuggestion[]>([]);

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

  useEffect(() => {
    const trimmed = headerQuery.trim();
    if (trimmed.length >= 2) {
      setSuggestions(findSimilarItems(trimmed, 6));
    } else {
      setSuggestions([]);
    }
  }, [headerQuery]);

  const handleHeaderSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && headerQuery.trim()) {
      navigate(`/item/${encodeURIComponent(headerQuery.trim())}`);
      setHeaderQuery('');
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (path: string) => {
    navigate(path);
    setHeaderQuery('');
    setSuggestions([]);
  };

  return (
    <header style={styles.navBar}>
      {/* Top Bar: Branding, Search, and Utilities */}
      <div style={styles.topBar}>
        <div style={styles.navBrandArea}>
          <NavLink to="/" style={styles.brandTitle}>
            Warfarm Tracker
          </NavLink>
          <button
            type="button"
            onClick={onOpenAbout}
            style={styles.versionNavBadge}
            title={`Game Version: ${syncMetaJson.gameVersion || 'Update 38'} (Click for sync & project info)`}
          >
            {syncMetaJson.gameVersion || 'Update 38'}
          </button>
        </div>

        <div style={styles.headerSearchWrapper}>
          <input
            type="text"
            placeholder="Quick jump (e.g. A12, Tellurium, Rhino)..."
            value={headerQuery}
            onChange={(e) => setHeaderQuery(e.target.value)}
            onKeyDown={handleHeaderSearch}
            style={styles.headerSearchInput}
            aria-label="Quick search"
          />
          {suggestions.length > 0 && (
            <div style={styles.headerSuggestionsDropdown}>
              {suggestions.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleSelectSuggestion(item.path)}
                  style={styles.headerSuggestionRow}
                >
                  <ItemThumbnail name={item.name} size={28} />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', overflow: 'hidden' }}>
                    <span style={styles.headerSuggestionName}>{item.name}</span>
                    <span style={styles.headerSuggestionCategory}>
                      {item.category}{item.subType && item.subType !== item.category ? ` · ${item.subType}` : ''}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={styles.actionArea}>
          <button
            type="button"
            onClick={onOpenAbout}
            style={styles.aboutNavBtn}
            title="About Warfarm Tracker, Data Sync & Links"
          >
            About &amp; Sync
          </button>

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
          Warframes &amp; Weapons
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
          Lua &amp; Puzzles
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
    </header>
  );
}

export function PersonalWikiApp() {
  const [showAboutModal, setShowAboutModal] = useState(false);

  return (
    <BrowserRouter>
      <div style={styles.appShell}>
        <NavigationBar
          onOpenAbout={() => setShowAboutModal(true)}
        />
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
        <AppFooter
          onOpenAbout={() => setShowAboutModal(true)}
        />
        <AboutModal
          isOpen={showAboutModal}
          onClose={() => setShowAboutModal(false)}
        />
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
    position: 'relative',
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
  headerSuggestionsDropdown: {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    left: 0,
    right: 0,
    backgroundColor: '#12141f',
    border: '1px solid #24283c',
    borderRadius: 6,
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
    zIndex: 1000,
    overflow: 'hidden',
  },
  headerSuggestionRow: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 12px',
    background: 'none',
    border: 'none',
    borderBottom: '1px solid #1a1e2e',
    color: '#e0e4f4',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background-color 0.15s ease',
  },
  headerSuggestionName: {
    fontSize: 13,
    fontWeight: 600,
    color: '#e0e4f4',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  headerSuggestionCategory: {
    fontSize: 11,
    color: '#8e94b2',
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
  aboutNavBtn: {
    background: '#141824',
    border: '1px solid #283852',
    borderRadius: 6,
    color: '#8ec4ff',
    padding: '6px 14px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  mainContent: {
    flex: 1,
  },
};