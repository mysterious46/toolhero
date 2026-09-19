import React, { useState } from 'react';
import { ArrowRightLeft, FileCode, Check, RefreshCw, Info } from 'lucide-react';

export default function DiffChecker() {
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');

  // Calculate line diffs
  const getDiffs = () => {
    if (!text1 && !text2) return [];
    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');
    const max = Math.max(lines1.length, lines2.length);
    const diffResult = [];

    for (let i = 0; i < max; i++) {
      const l1 = lines1[i];
      const l2 = lines2[i];

      if (l1 === l2) {
        diffResult.push({ type: 'same', line1: l1, line2: l2 });
      } else if (l1 !== undefined && l2 !== undefined) {
        diffResult.push({ type: 'modified', line1: l1, line2: l2 });
      } else if (l1 !== undefined) {
        diffResult.push({ type: 'removed', line1: l1, line2: '' });
      } else {
        diffResult.push({ type: 'added', line1: '', line2: l2 });
      }
    }
    return diffResult;
  };

  const diffs = getDiffs();

  return (
    <div>

      {/* Input Editors Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-tertiary)' }}>Original Text (Left)</label>
            {text1 && <button className="btn btn-secondary btn-sm" onClick={() => setText1('')}>Clear</button>}
          </div>
          <textarea
            className="form-input"
            style={{ width: '100%', minHeight: '180px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', resize: 'vertical' }}
            value={text1}
            onChange={e => setText1(e.target.value)}
            placeholder="Paste original text or code..."
          />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-tertiary)' }}>Modified Text (Right)</label>
            {text2 && <button className="btn btn-secondary btn-sm" onClick={() => setText2('')}>Clear</button>}
          </div>
          <textarea
            className="form-input"
            style={{ width: '100%', minHeight: '180px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', resize: 'vertical' }}
            value={text2}
            onChange={e => setText2(e.target.value)}
            placeholder="Paste modified text or code..."
          />
        </div>
      </div>

      {/* Diff Output Box */}
      {diffs.length > 0 ? (
        <div style={{ background: '#1e1e1e', borderRadius: 'var(--radius-md)', border: '1px solid #333', padding: '1rem', overflowX: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#d4d4d4' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8a8a8a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.65rem' }}>
            Line-by-Line Diff Comparison
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {diffs.map((d, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: d.type === 'modified' ? 'rgba(234, 179, 8, 0.15)' : d.type === 'added' ? 'rgba(34, 197, 94, 0.15)' : d.type === 'removed' ? 'rgba(239, 68, 68, 0.15)' : 'transparent', padding: '2px 6px', borderRadius: '3px' }}>
                <div style={{ color: d.type === 'removed' ? '#f87171' : d.type === 'modified' ? '#fde047' : '#9ca3af' }}>
                  <span style={{ userSelect: 'none', width: '24px', display: 'inline-block', opacity: 0.5 }}>{idx + 1}</span>
                  {d.line1}
                </div>
                <div style={{ color: d.type === 'added' ? '#4ade80' : d.type === 'modified' ? '#fde047' : '#9ca3af' }}>
                  <span style={{ userSelect: 'none', width: '24px', display: 'inline-block', opacity: 0.5 }}>{idx + 1}</span>
                  {d.line2}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ padding: '1.5rem', textAlign: 'center', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-main)' }}>
          <Info size={24} color="var(--text-tertiary)" style={{ marginBottom: '0.4rem' }} />
          <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Paste text in both boxes to calculate diff</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '0.2rem' }}>
            Highlights added (+), removed (-), and modified lines.
          </div>
        </div>
      )}
    </div>
  );
}
