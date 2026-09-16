import React from 'react';
import ReactDOM from 'react-dom/client';
import { PersonalWikiApp } from '../wiki/PersonalWikiApp';
import { ErrorBoundary } from '../wiki/components/ErrorBoundary';

const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ErrorBoundary>
        <PersonalWikiApp />
      </ErrorBoundary>
    </React.StrictMode>
  );
}


