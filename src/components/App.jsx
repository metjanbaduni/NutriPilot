import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

function Dashboard() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">NutriPilot Dashboard</h1>
      <p className="mt-2 text-slate-600">Welcome. Start logging meals to see your macros.</p>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
