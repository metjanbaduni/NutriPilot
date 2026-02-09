import React from 'react';

const HIGHLIGHTS = [
  {
    label: 'Protein Focus',
    value: 'Hit 80%+ of targets',
  },
  {
    label: 'Macro Balance',
    value: 'Clarity across carbs & fats',
  },
  {
    label: 'AI Insights',
    value: 'Smarter meals, faster logs',
  },
];

function AuthLogo() {
  return (
    <div className="auth-logo" aria-hidden="true">
      <svg viewBox="0 0 64 64" role="img" focusable="false">
        <defs>
          <linearGradient id="auth-logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7ff0cc" />
            <stop offset="100%" stopColor="#38e7b1" />
          </linearGradient>
        </defs>
        <circle
          cx="32"
          cy="32"
          r="26"
          fill="none"
          stroke="url(#auth-logo-gradient)"
          strokeWidth="2.5"
        />
        <path
          d="M22 44V20L40 44V20"
          fill="none"
          stroke="url(#auth-logo-gradient)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M40 20L34 26M40 20L46 26"
          fill="none"
          stroke="url(#auth-logo-gradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

/**
 * Provides a shared layout for authentication screens with branding and supporting content.
 * @param {Object} props
 * @param {string} props.title - Primary heading for the auth card.
 * @param {string} props.subtitle - Supporting text shown under the title.
 * @param {React.ReactNode} props.children - Form content for the auth flow.
 * @param {React.ReactNode} [props.footer] - Optional footer content (links, helpers).
 * @returns {JSX.Element}
 */
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="auth-shell">
      <div className="auth-backdrop" aria-hidden="true">
        <div className="auth-orb auth-orb--mint" />
        <div className="auth-orb auth-orb--slate" />
      </div>
      <div className="auth-container">
        <section className="auth-intro auth-fade auth-delay-1">
          <div className="auth-logo-row">
            <AuthLogo />
            <div>
              <p className="auth-eyebrow">NutriPilot</p>
              <h1 className="auth-hero">Precision nutrition for muscle growth.</h1>
            </div>
          </div>
          <p className="auth-copy">
            Minimal, calm, and focused on what matters: protein, consistency, and progress.
          </p>
          <div className="auth-highlight-grid">
            {HIGHLIGHTS.map((item) => (
              <div key={item.label} className="auth-highlight">
                <p className="auth-highlight-label">{item.label}</p>
                <p className="auth-highlight-value">{item.value}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="auth-card auth-fade auth-delay-2">
          <div className="auth-card-header">
            <h2 className="auth-card-title">{title}</h2>
            <p className="auth-card-subtitle">{subtitle}</p>
          </div>
          {children}
          {footer ? <div className="auth-footer">{footer}</div> : null}
        </section>
      </div>
    </div>
  );
}
