import React from 'react';
import ReactDOM from 'react-dom/client';
import { PersonalWikiApp } from '../wiki/PersonalWikiApp';

const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <PersonalWikiApp />
    </React.StrictMode>
  );
}

