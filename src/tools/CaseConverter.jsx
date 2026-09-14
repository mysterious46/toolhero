import React, { useState } from 'react';
import { Type, Copy, Check, RefreshCw } from 'lucide-react';
import AdBanner from '../components/AdBanner';

export default function CaseConverter() {
  const [text, setText] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);

  const transformations = [
    { key: 'upper', name: 'UPPERCASE', fn: (str) => str.toUpperCase() },
    { key: 'lower', name: 'lowercase', fn: (str) => str.toLowerCase() },
    { key: 'title', name: 'Title Case', fn: (str) => str.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') },
    { key: 'sentence', name: 'Sentence case', fn: (str) => str.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase()) },
    { key: 'camel', name: 'camelCase', fn: (str) => str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase()) },
    { key: 'snake', name: 'snake_case', fn: (str) => str.toLowerCase().trim().replace(/[\s\W]+/g, '_') },
    { key: 'kebab', name: 'kebab-case', fn: (str) => str.toLowerCase().trim().replace(/[\s\W]+/g, '-') },
    { key: 'pascal', name: 'PascalCase', fn: (str) => str.toLowerCase().replace(/(^\w|[^a-zA-Z0-9]+\w)/g, m => m.replace(/[^a-zA-Z0-9]/, '').toUpperCase()) },
    { key: 'alternating', name: 'aLtErNaTiNg cAsE', fn: (str) => str.split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join('') },
  ];

  const copyResult = (res, key) => {
    navigator.clipboard.writeText(res);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div>
      <AdBanner slotType="leaderboard" />

      {/* Input Area */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-tertiary)' }}>Input Text</label>
          {text && <button className="btn btn-secondary btn-sm" onClick={() => setText('')}>Clear</button>}
        </div>
        <textarea
          className="form-input"
          style={{ width: '100%', minHeight: '110px', resize: 'vertical', fontSize: '0.9rem' }}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type or paste text to convert case..."
        />
      </div>

      {/* Transformations List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem' }}>
        {transformations.map(t => {
          const res = text ? t.fn(text) : '';
          return (
            <div key={t.key} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-main)', borderRadius: 'var(--radius-sm)', padding: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent)' }}>{t.name}</span>
                <button className="btn btn-secondary btn-sm" onClick={() => copyResult(res, t.key)} disabled={!res}>
                  {copiedKey === t.key ? <Check size={12} color="var(--green)" /> : <Copy size={12} />}
                  <span>{copiedKey === t.key ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div style={{ fontSize: '0.82rem', fontFamily: 'var(--font-mono)', background: 'var(--bg-elevated)', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid var(--border-main)', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                {res || '—'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
