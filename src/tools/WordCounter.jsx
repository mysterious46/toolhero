import React, { useState } from 'react';
import { Type, Copy, Check, Clock, FileText, AlignLeft } from 'lucide-react';
import AdBanner from '../components/AdBanner';

export default function WordCounter() {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  // Statistics calculations
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charsWithSpaces = text.length;
  const charsNoSpaces = text.replace(/\s+/g, '').length;
  const sentences = text.trim() ? (text.match(/[^.!?]+[.!?]+/g) || [text]).length : 0;
  const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter(p => p.trim()).length : 0;
  const readingTime = Math.ceil(words / 200); // Average 200 words/min

  // Keyword density
  const getTopKeywords = () => {
    if (!text.trim()) return [];
    const stopWords = new Set(['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'is', 'are', 'was', 'were']);
    const cleanWords = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
    const counts = {};

    cleanWords.forEach(w => {
      if (w.length > 2 && !stopWords.has(w)) {
        counts[w] = (counts[w] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  const topKeywords = getTopKeywords();

  const copyText = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <AdBanner slotType="leaderboard" />

      {/* Counter Stat Badges Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.85rem', marginBottom: '1.25rem' }}>
        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-main)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>{words}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>Words</div>
        </div>

        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-main)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{charsWithSpaces}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>Characters</div>
        </div>

        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-main)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{charsNoSpaces}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>Chars (no space)</div>
        </div>

        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-main)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{sentences}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>Sentences</div>
        </div>

        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-main)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{paragraphs}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>Paragraphs</div>
        </div>

        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-main)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--green)' }}>~{readingTime}m</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>Reading Time</div>
        </div>
      </div>

      {/* Main Text Input Area */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-tertiary)' }}>Enter or Paste Text</label>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {text && (
              <button className="btn btn-secondary btn-sm" onClick={() => setText('')}>Clear</button>
            )}
            <button className="btn btn-secondary btn-sm" onClick={copyText} disabled={!text}>
              {copied ? <Check size={13} color="var(--green)" /> : <Copy size={13} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
        <textarea
          className="form-input"
          style={{ width: '100%', minHeight: '260px', resize: 'vertical', fontSize: '0.9rem', lineHeight: '1.6' }}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type or paste your text here..."
        />
      </div>

      {/* Keyword Density Table */}
      {topKeywords.length > 0 && (
        <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-main)' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.65rem' }}>
            Top Keywords & Frequency
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {topKeywords.map(([kw, count]) => (
              <span key={kw} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-main)', padding: '0.35rem 0.65rem', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 600 }}>
                {kw} <strong style={{ color: 'var(--accent)', marginLeft: '0.2rem' }}>×{count}</strong>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
