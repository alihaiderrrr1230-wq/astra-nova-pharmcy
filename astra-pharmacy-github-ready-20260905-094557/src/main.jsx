import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AstraStoreProvider } from './store/useAstraStore.js';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AstraStoreProvider>
      <App />
    </AstraStoreProvider>
  </React.StrictMode>
);
