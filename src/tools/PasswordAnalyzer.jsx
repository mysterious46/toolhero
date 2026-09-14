import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Key, Check, X, AlertTriangle, Info } from 'lucide-react';
import AdBanner from '../components/AdBanner';

export default function PasswordAnalyzer() {
  const [pass, setPass] = useState('');

  // Calculate Entropy: E = L * log2(R)
  const getEntropy = (str) => {
    if (!str) return 0;
    let pool = 0;
    if (/[a-z]/.test(str)) pool += 26;
    if (/[A-Z]/.test(str)) pool += 26;
    if (/[0-9]/.test(str)) pool += 10;
    if (/[^a-zA-Z0-9]/.test(str)) pool += 32;
    if (pool === 0) return 0;
    return Math.round(str.length * Math.log2(pool));
  };

  const entropy = getEntropy(pass);

  // Time to crack estimate
  const getCrackTime = (ent) => {
    if (!pass) return '—';
    if (ent < 28) return 'Instantly (Very Weak)';
    if (ent < 36) return 'Few seconds';
    if (ent < 60) return 'Several days';
    if (ent < 80) return 'Several years';
    return 'Centuries / Unbreakable';
  };

  const crackTime = getCrackTime(entropy);

  const checks = [
    { label: 'At least 12 characters', pass: pass.length >= 12 },
    { label: 'Contains uppercase letter (A-Z)', pass: /[A-Z]/.test(pass) },
    { label: 'Contains lowercase letter (a-z)', pass: /[a-z]/.test(pass) },
    { label: 'Contains number (0-9)', pass: /[0-9]/.test(pass) },
    { label: 'Contains special symbol (!@#$)', pass: /[^a-zA-Z0-9]/.test(pass) },
    { label: 'No repeating sequential characters (aaa, 123)', pass: pass ? !/(.)\1\1|123|abc|qwerty/i.test(pass) : false },
  ];

  return (
    <div>
      <AdBanner slotType="leaderboard" />

      {/* Input Box */}
      <div style={{ background: 'var(--bg-elevated)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-main)', marginBottom: '1.25rem' }}>
        <label className="control-label">Enter Password to Audit</label>
        <input
          className="form-input"
          type="text"
          style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: '1rem', padding: '0.75rem' }}
          value={pass}
          onChange={e => setPass(e.target.value)}
          placeholder="Type password to audit strength & entropy..."
        />
      </div>

      {/* Strength & Entropy Score */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ background: 'var(--bg-card)', padding: '1.15rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-main)', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Entropy Score</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: pass ? (entropy >= 60 ? 'var(--green)' : entropy >= 40 ? 'var(--accent)' : 'var(--red)') : 'var(--text-tertiary)' }}>
            {pass ? entropy : 0} <span style={{ fontSize: '0.9rem' }}>bits</span>
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '1.15rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-main)', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Estimated Crack Time</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: pass ? (entropy >= 60 ? 'var(--green)' : 'var(--text-primary)') : 'var(--text-tertiary)', marginTop: '0.3rem' }}>
            {crackTime}
          </div>
        </div>
      </div>

      {/* Audit Checklist */}
      <div style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-main)' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.85rem' }}>Security Criteria Audit</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.65rem' }}>
          {checks.map((c, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: c.pass ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
              {c.pass ? <Check size={16} color="var(--green)" /> : <X size={16} color="var(--red)" />}
              <span>{c.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
