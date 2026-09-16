import React, { useState, useEffect, useMemo } from 'react';
import {
  fetchMarketPrice,
  fetchPrimeSetMarketBreakdown,
  getItemMarketSlug,
  getMarketItemUrl,
} from '../../../shared/api/market-client';
import { MarketPriceSummary, PrimeSetMarketBreakdown } from '../../../shared/types/market';
import { detailStyles as styles } from './itemDetailStyles';
import { theme } from '../../styles/theme';

interface MarketPriceViewProps {
  itemName: string;
  isPrime?: boolean;
  isComponentItem?: boolean;
  componentNames?: string[];
  isTradeable?: boolean;
}

export function MarketPriceView({
  itemName,
  isPrime = false,
  isComponentItem = false,
  componentNames = [],
  isTradeable = true,
}: MarketPriceViewProps) {
  const [singlePrice, setSinglePrice] = useState<MarketPriceSummary | null>(null);
  const [primeBreakdown, setPrimeBreakdown] = useState<PrimeSetMarketBreakdown | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null);

  const isPrimeSetOverview = isPrime && !isComponentItem;
  const marketSlug = useMemo(() => getItemMarketSlug(itemName, isPrimeSetOverview), [itemName, isPrimeSetOverview]);
  const directMarketUrl = useMemo(() => getMarketItemUrl(marketSlug), [marketSlug]);

  const componentNamesKey = useMemo(() => componentNames.join('|'), [componentNames]);

  const loadMarketData = async (force = false) => {
    if (!isTradeable || !marketSlug) {
      setIsLoading(false);
      return;
    }

    if (force) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      if (isPrimeSetOverview) {
        const breakdown = await fetchPrimeSetMarketBreakdown(itemName, componentNames, { forceRefresh: force });
        setPrimeBreakdown(breakdown);
      } else {
        const price = await fetchMarketPrice(itemName, { forceRefresh: force });
        setSinglePrice(price);
      }
      setLastFetchedAt(new Date());
    } catch (err: any) {
      console.warn(`Failed loading market data for ${itemName}:`, err);
      setError(err?.message || 'Failed to connect to Warframe.market');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isTradeable) {
      loadMarketData(false);
    } else {
      setIsLoading(false);
    }
  }, [itemName, isPrimeSetOverview, componentNamesKey, isTradeable]);

  // If item is marked as untradeable or has no slug, don't render market section
  if (!isTradeable || !marketSlug) {
    return null;
  }

  const formatPlat = (val: number | null | undefined) => {
    if (val === null || val === undefined) return '-';
    return `${val}p`;
  };

  const hasPrimeData = Boolean(
    primeBreakdown &&
      (primeBreakdown.setSummary?.minSell !== null ||
        primeBreakdown.setSummary?.maxBuy !== null ||
        primeBreakdown.parts.some((p) => p.minSell !== null || p.maxBuy !== null))
  );
  const hasSingleData = Boolean(
    singlePrice &&
      (singlePrice.minSell !== null || singlePrice.maxBuy !== null)
  );
  const hasData = isPrimeSetOverview ? hasPrimeData : hasSingleData;

  // Hide the entire market section and buttons if loading is finished and there is no market data
  if (!isLoading && !hasData) {
    return null;
  }

  // If initial load in progress and no data yet, do not render external link buttons
  if (isLoading && !hasData) {
    return null;
  }

  return (
    <section style={styles.sectionCard}>
      {/* Header with Title, External Warframe.Market Link & Refresh */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 14,
          paddingBottom: 10,
          borderBottom: '1px solid #1c2030',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: 4,
                backgroundColor: theme.colors.accentBg,
                color: theme.colors.accent,
                border: '1px solid #284c6c',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Warframe.market
            </span>
            <h2 style={{ ...styles.sectionTitle, margin: 0, fontSize: 16 }}>
              {isPrimeSetOverview ? 'Prime Trading & Set Breakdown' : 'Live Trading Prices'}
            </h2>
          </div>
          <p style={{ margin: '3px 0 0 0', fontSize: 12, color: theme.colors.textSecondary }}>
            Live buyer and seller orders from active in-game and online Tenno.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <a
            href={directMarketUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 12px',
              fontSize: 11,
              fontWeight: 700,
              background: '#1c2838',
              color: theme.colors.accent,
              border: '1px solid #28547c',
              borderRadius: 4,
              textDecoration: 'none',
              transition: 'background-color 0.15s ease',
            }}
          >
            {isPrimeSetOverview ? 'Open Set on Warframe.market' : 'Open on Warframe.market'}
          </a>
        </div>
      </div>

      {isLoading && !singlePrice && !primeBreakdown ? (
        <div style={{ padding: '24px 0', fontSize: 13, color: '#8890a8', textAlign: 'center' }}>
          Loading live trading orders from Warframe.market...
        </div>
      ) : isPrimeSetOverview && primeBreakdown && hasPrimeData ? (
        /* Prime Set + Component Parts Breakdown */
        <div>
          {/* Highlight Summary Row: Full Set Price */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                padding: '12px 14px',
                background: 'linear-gradient(135deg, #181d2c 0%, #121522 100%)',
                border: '1px solid #2e3852',
                borderRadius: 6,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: '#8ea4cc', textTransform: 'uppercase' }}>
                Full Set (Buy Now)
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: theme.colors.gold, marginTop: 2 }}>
                {formatPlat(primeBreakdown.setSummary?.minSell)}
              </div>
              <div style={{ fontSize: 11, color: '#8894b4', marginTop: 2 }}>
                Top Buyer Offer: <strong style={{ color: theme.colors.green }}>{formatPlat(primeBreakdown.setSummary?.maxBuy)}</strong>
              </div>
            </div>

            <div
              style={{
                padding: '12px 14px',
                background: 'linear-gradient(135deg, #181d2c 0%, #121522 100%)',
                border: '1px solid #2e3852',
                borderRadius: 6,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: '#8ea4cc', textTransform: 'uppercase' }}>
                Sum of Separate Parts
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: theme.colors.accent, marginTop: 2 }}>
                {formatPlat(primeBreakdown.totalPartsMinSell)}
              </div>
              <div style={{ fontSize: 11, color: '#8894b4', marginTop: 2 }}>
                {primeBreakdown.setVsPartsDifference !== null && primeBreakdown.setSummary?.minSell !== null ? (
                  primeBreakdown.setVsPartsDifference > 0 ? (
                    <span style={{ color: theme.colors.green }}>
                      Buying full set saves ~{primeBreakdown.setVsPartsDifference}p
                    </span>
                  ) : primeBreakdown.setVsPartsDifference < 0 ? (
                    <span style={{ color: theme.colors.green }}>
                      Buying parts individually saves ~{Math.abs(primeBreakdown.setVsPartsDifference)}p
                    </span>
                  ) : (
                    <span>Set and parts sum are identical</span>
                  )
                ) : (
                  'Total individual blueprint/part costs'
                )}
              </div>
            </div>
          </div>

          {/* Component Parts Trading Table */}
          <div style={{ overflowX: 'auto', marginBottom: 12 }}>
            <table style={styles.compTable}>
              <thead>
                <tr style={styles.compHeaderRow}>
                  <th style={styles.compTh}>Component Blueprint / Part</th>
                  <th style={styles.compTh}>Buy Now (Lowest Sell)</th>
                  <th style={styles.compTh}>Sell Now (Top Buy)</th>
                  <th style={styles.compTh}>Marketplace Link</th>
                </tr>
              </thead>
              <tbody>
                {primeBreakdown.parts.map((part, idx) => (
                  <tr key={idx} style={styles.compTr}>
                    <td style={styles.compTdLabel}>
                      <strong>{part.partName}</strong>
                    </td>
                    <td style={styles.compTdCurrent}>
                      <span style={{ fontWeight: 700, color: part.minSell !== null ? theme.colors.gold : '#8a90a4' }}>
                        {formatPlat(part.minSell)}
                      </span>
                    </td>
                    <td style={styles.compTdCurrent}>
                      <span style={{ fontWeight: 600, color: part.maxBuy !== null ? theme.colors.green : '#8a90a4' }}>
                        {formatPlat(part.maxBuy)}
                      </span>
                    </td>
                    <td style={styles.compTdCounterpart}>
                      <a
                        href={part.marketUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 11,
                          fontWeight: 600,
                          color: theme.colors.accent,
                          textDecoration: 'none',
                          padding: '2px 8px',
                          background: '#162030',
                          border: '1px solid #28446c',
                          borderRadius: 4,
                        }}
                      >
                        View on Market
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : singlePrice && hasSingleData ? (
        /* Single Item Market Card */
        <div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 12,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                padding: '12px 14px',
                background: '#141824',
                border: '1px solid #243048',
                borderRadius: 6,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: '#8ea4cc', textTransform: 'uppercase' }}>
                Buy Now (Lowest Online Sell)
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: theme.colors.gold, marginTop: 2 }}>
                {formatPlat(singlePrice.minSell)}
              </div>
              <div style={{ fontSize: 11, color: '#8894b4', marginTop: 2 }}>
                From {singlePrice.onlineSellersCount} online/in-game sellers
              </div>
            </div>

            <div
              style={{
                padding: '12px 14px',
                background: '#141824',
                border: '1px solid #243048',
                borderRadius: 6,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: '#8ea4cc', textTransform: 'uppercase' }}>
                Sell Now (Top Online Buy Offer)
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: theme.colors.green, marginTop: 2 }}>
                {formatPlat(singlePrice.maxBuy)}
              </div>
              <div style={{ fontSize: 11, color: '#8894b4', marginTop: 2 }}>
                Instant sell offers in active order book
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Real-time Cache Notice */}
      <div
        style={{
          marginTop: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
          fontSize: 11,
          color: '#7a849e',
        }}
      >
        <span>
          Prices reflect active in-game / online PC orders. Live marketplace orders fluctuate continuously.
        </span>
        {lastFetchedAt && (
          <span>
            Data synced at {lastFetchedAt.toLocaleTimeString()}
          </span>
        )}
      </div>
    </section>
  );
}

