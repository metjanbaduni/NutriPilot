import React from 'react';
import { Routes, Route } from 'react-router-dom';

const ROUTES = {
  login: '/login',
  signup: '/signup',
  dashboard: '/dashboard',
  settings: '/settings'
};

const PLACEHOLDER_LABELS = {
  login: 'Login',
  signup: 'Signup',
  dashboard: 'Dashboard',
  settings: 'Settings'
};

const MODAL_HOST_ID = 'modal-host';

function LoginPlaceholder() {
  return <div>{PLACEHOLDER_LABELS.login}</div>;
}

function SignupPlaceholder() {
  return <div>{PLACEHOLDER_LABELS.signup}</div>;
}

function DashboardPlaceholder() {
  return <div>{PLACEHOLDER_LABELS.dashboard}</div>;
}

function SettingsPlaceholder() {
  return <div>{PLACEHOLDER_LABELS.settings}</div>;
}

/**
 * App route skeleton with placeholder views and modal host.
 * @returns {JSX.Element} App routes and modal host container.
 */
export default function App() {
  return (
    <>
      <Routes>
        <Route path={ROUTES.login} element={<LoginPlaceholder />} />
        <Route path={ROUTES.signup} element={<SignupPlaceholder />} />
        <Route path={ROUTES.dashboard} element={<DashboardPlaceholder />} />
        <Route path={ROUTES.settings} element={<SettingsPlaceholder />} />
      </Routes>
      <div id={MODAL_HOST_ID} />
    </>
  );
}
