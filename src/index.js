import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Amplify } from 'aws-amplify';
import App from './components/App';
import awsconfig from './aws-exports';
import './index.css';

if (!awsconfig) {
  throw new Error('Amplify configuration is missing.');
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element "#root" not found.');
}

// Amplify must be configured before any Auth or API usage.
Amplify.configure(awsconfig);

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
