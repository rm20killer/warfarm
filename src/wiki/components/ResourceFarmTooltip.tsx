import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getResourceGuide } from '../../shared/data/resource-guide';
import { ItemThumbnail } from '../../shared/utils/item-images';

interface ResourceFarmTooltipProps {
  ingredientName: string;
  count: number;
  isComponent?: boolean;
}

export function ResourceFarmTooltip({ ingredientName, count, isComponent }: ResourceFarmTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const guide = getResourceGuide(ingredientName);


  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 350);
  };

  const handleBlur = (e: React.FocusEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
      return;
    }
    handleMouseLeave();
  };

  const handleChipClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('a')) return;
    navigate(`/item/${encodeURIComponent(ingredientName)}`);
  };

  return (
    <div
      style={styles.wrapper}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleBlur}
      tabIndex={0}
      role="button"
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-label={`Ingredient ${ingredientName}, required: ${count}. Click or hover for farming spots.`}
    >
      <div style={styles.chip} onClick={handleChipClick} title={`Click to open full guide for ${ingredientName}`}>
        <ItemThumbnail name={ingredientName} size={22} />
        <span style={styles.countBadge}>{count.toLocaleString()}x</span>
        <span style={styles.ingredientName}>{ingredientName}</span>
        {!isComponent && guide && <span style={styles.infoIcon}>&#9432;</span>}
      </div>

      {isOpen && (
        <div
          style={styles.tooltipContainer}
          role="dialog"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div style={styles.tooltipCard}>
            <div style={styles.tooltipHeader}>
              <span style={styles.tooltipTitle}>{ingredientName}</span>
              {guide && <span style={styles.tooltipBadge}>{guide.category}</span>}
            </div>

            {guide ? (
              <>
                <div style={styles.tooltipRow}>
                  <span style={styles.tooltipLabel}>Found on:</span>
                  <span style={styles.tooltipValue}>{guide.planets.join(', ')}</span>
                </div>

                {guide.optimalNodes.length > 0 && (
                  <div style={styles.bestNodeBox}>
                    <div style={styles.bestNodeTop}>
                      <span style={styles.bestNodeLabel}>Best Farm Spot:</span>
                      <span style={styles.bestNodeRating}>{guide.optimalNodes[0].efficiencyRating}</span>
                    </div>
                    <div style={styles.bestNodeName}>
                      {guide.optimalNodes[0].node} ({guide.optimalNodes[0].planet})
                    </div>
                    <span style={styles.bestNodeType}>{guide.optimalNodes[0].missionType}</span>
                    <p style={styles.bestNodeTip}>{guide.optimalNodes[0].strategyNote}</p>
                  </div>
                )}

                {guide.recommendedFrames.length > 0 && (
                  <div style={styles.framesRow}>
                    <span style={styles.tooltipLabel}>Squad:</span>
                    <span style={styles.framesValue}>{guide.recommendedFrames.slice(0, 2).join(', ')}</span>
                  </div>
                )}

                <Link to={`/item/${encodeURIComponent(ingredientName)}`} style={styles.viewGuideLink}>
                  View Full Farm Guide &rarr;
                </Link>
              </>
            ) : (
              <p style={styles.componentNotice}>
                {isComponent
                  ? 'Warframe / Weapon component. Crafted separately in Foundry from blueprints.'
                  : 'Common foundry component. Click to inspect acquisition sources and drop tables.'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    position: 'relative',
    display: 'inline-block',
    outline: 'none',
  },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    background: '#161622',
    border: '1px solid #242436',
    borderRadius: 4,
    padding: '6px 12px',
    cursor: 'pointer',
    transition: 'border-color 0.15s, background-color 0.15s',
  },
  countBadge: {
    fontSize: 11,
    fontWeight: 700,
    color: '#8ec48e',
    background: '#142214',
    padding: '2px 6px',
    borderRadius: 3,
  },
  ingredientName: {
    fontSize: 13,
    fontWeight: 500,
    color: '#e4e4ee',
  },
  infoIcon: {
    fontSize: 11,
    color: '#7a7a92',
  },
  tooltipContainer: {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    paddingBottom: 10,
    zIndex: 9999,
    cursor: 'default',
  },
  tooltipCard: {
    width: 280,
    background: '#141422',
    border: '1px solid #2c2c44',
    borderRadius: 6,
    padding: 14,
    boxShadow: '0 8px 28px rgba(0, 0, 0, 0.7)',
    textAlign: 'left',
  },
  tooltipHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderBottom: '1px solid #1e1e30',
    paddingBottom: 6,
  },
  tooltipTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: '#eaeaf4',
  },
  tooltipBadge: {
    fontSize: 10,
    padding: '1px 5px',
    background: '#222234',
    color: '#9a9ac0',
    borderRadius: 3,
  },
  tooltipRow: {
    fontSize: 11,
    marginBottom: 6,
    display: 'flex',
    gap: 6,
  },
  tooltipLabel: {
    color: '#7c7c94',
  },
  tooltipValue: {
    color: '#d0d0e2',
  },
  bestNodeBox: {
    background: '#181828',
    border: '1px solid #24243a',
    borderRadius: 4,
    padding: 8,
    marginTop: 6,
    marginBottom: 8,
  },
  bestNodeTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  bestNodeLabel: {
    fontSize: 10,
    fontWeight: 600,
    color: '#9090b0',
    textTransform: 'uppercase',
  },
  bestNodeRating: {
    fontSize: 10,
    fontWeight: 700,
    color: '#90d490',
  },
  bestNodeName: {
    fontSize: 12,
    fontWeight: 600,
    color: '#e4e4f0',
  },
  bestNodeType: {
    fontSize: 10,
    color: '#7a7a92',
    display: 'block',
    marginBottom: 4,
  },
  bestNodeTip: {
    fontSize: 11,
    color: '#8e8ea4',
    margin: 0,
    lineHeight: 1.3,
  },
  framesRow: {
    fontSize: 11,
    display: 'flex',
    gap: 6,
    marginBottom: 8,
  },
  framesValue: {
    color: '#8ec4c4',
  },
  viewGuideLink: {
    display: 'block',
    fontSize: 11,
    color: '#6e8ec4',
    textDecoration: 'none',
    marginTop: 4,
  },
  componentNotice: {
    fontSize: 11,
    color: '#8c8ca0',
    lineHeight: 1.4,
    margin: 0,
  },
};

