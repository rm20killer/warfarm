import React, { Component, ErrorInfo, ReactNode } from 'react';
import { theme } from '../styles/theme';


interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in UI component:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container} role="alert">
          <div style={styles.card}>
            <div style={styles.header}>
              <span style={styles.badge}>UI Error</span>
              <h1 style={styles.title}>
                {this.props.fallbackTitle || 'Unable to display this view'}
              </h1>
            </div>
            <p style={styles.description}>
              An unexpected error occurred while rendering this page. You can reload the page or return to the home search.
            </p>
            {this.state.error && (
              <pre style={styles.errorStack}>
                {this.state.error.message || String(this.state.error)}
              </pre>
            )}
            <div style={styles.actions}>
              <button
                type="button"
                onClick={this.handleReload}
                style={styles.primaryButton}
              >
                Reload Page
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                style={styles.secondaryButton}
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '60vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 16px',
    color: theme.colors.textPrimary,
  },
  card: {
    maxWidth: 560,
    width: '100%',
    backgroundColor: theme.colors.bgCard,
    border: `1px solid ${theme.colors.borderStrong}`,
    borderRadius: theme.radii.lg,
    padding: '24px 28px',
    boxShadow: theme.shadows.lg,
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    alignSelf: 'flex-start',
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    padding: '2px 8px',
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.redBg,
    color: theme.colors.red,
    border: `1px solid ${theme.colors.redBorder}`,
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    color: theme.colors.textHighlight,
    margin: 0,
  },
  description: {
    fontSize: 14,
    lineHeight: 1.5,
    color: theme.colors.textSecondary,
    marginBottom: 16,
  },
  errorStack: {
    backgroundColor: theme.colors.bgNavbar,
    border: `1px solid ${theme.colors.borderSubtle}`,
    borderRadius: theme.radii.md,
    padding: '12px',
    fontSize: 12,
    fontFamily: theme.typography.monoFontFamily,
    color: theme.colors.redLight,
    overflowX: 'auto',
    marginBottom: 20,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  actions: {
    display: 'flex',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: theme.colors.accentBg,
    border: `1px solid ${theme.colors.accentBorder}`,
    borderRadius: theme.radii.md,
    color: theme.colors.textHighlight,
    padding: '8px 16px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  secondaryButton: {
    backgroundColor: theme.colors.bgCardElevated,
    border: `1px solid ${theme.colors.borderDefault}`,
    borderRadius: theme.radii.md,
    color: theme.colors.textSecondary,
    padding: '8px 16px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
};

