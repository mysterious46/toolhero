import React, { useState, useEffect } from 'react';
import { Key, ShieldCheck, Copy, Check, RefreshCw, Hash } from 'lucide-react';

export default function PasswordGenerator() {
  // Password state
  const [length, setLength] = useState(16);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [includeLower, setIncludeLower] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [password, setPassword] = useState('');
  const [copiedPass, setCopiedPass] = useState(false);

  // Hash state
  const [inputText, setInputText] = useState('iLoveTools');
  const [hashes, setHashes] = useState({ sha256: '', sha512: '', sha1: '' });
  const [copiedHash, setCopiedHash] = useState(null);

  // Generate Password
  const generatePassword = () => {
    let chars = '';
    if (includeUpper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLower) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) chars += '0123456789';
    if (includeSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (!chars) {
      setPassword('Select at least 1 character type');
      return;
    }

    let res = '';
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      res += chars[array[i] % chars.length];
    }
    setPassword(res);
  };

  useEffect(() => {
    generatePassword();
  }, [length, includeUpper, includeLower, includeNumbers, includeSymbols]);

  // Generate Hashes
  useEffect(() => {
    if (!inputText) {
      setHashes({ sha256: '', sha512: '', sha1: '' });
      return;
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(inputText);

    Promise.all([
      crypto.subtle.digest('SHA-256', data),
      crypto.subtle.digest('SHA-512', data),
      crypto.subtle.digest('SHA-1', data),
    ]).then(([sha256Buf, sha512Buf, sha1Buf]) => {
      const hex = (buf) => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
      setHashes({
        sha256: hex(sha256Buf),
        sha512: hex(sha512Buf),
        sha1: hex(sha1Buf),
      });
    });
  }, [inputText]);

  const copyPassword = () => {
    navigator.clipboard.writeText(password);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2000);
  };

  const copyHash = (hashText, type) => {
    navigator.clipboard.writeText(hashText);
    setCopiedHash(type);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div>

      {/* ──── Section 1: Strong Password Generator ──── */}
      <div style={{ background: 'var(--bg-elevated)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-main)', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <Key size={18} color="var(--accent)" /> Strong Password Generator
        </h3>

        {/* Generated Password Box */}
        <div style={{ background: 'var(--bg-card)', padding: '0.85rem 1.15rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-main)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.15rem', gap: '0.75rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--text-primary)', wordBreak: 'break-all' }}>
            {password}
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
            <button className="btn btn-secondary btn-sm" onClick={generatePassword}>
              <RefreshCw size={13} /> Regenerate
            </button>
            <button className="btn btn-primary btn-sm" onClick={copyPassword}>
              {copiedPass ? <Check size={13} color="#fff" /> : <Copy size={13} />}
              <span>{copiedPass ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Options Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="control-group" style={{ marginBottom: 0 }}>
            <div className="control-label">
              <span>Password Length</span>
              <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{length} characters</span>
            </div>
            <input type="range" className="custom-slider" min="8" max="64" value={length} onChange={e => setLength(+e.target.value)} />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
              <input type="checkbox" checked={includeUpper} onChange={() => setIncludeUpper(!includeUpper)} /> ABC Uppercase
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
              <input type="checkbox" checked={includeLower} onChange={() => setIncludeLower(!includeLower)} /> abc Lowercase
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
              <input type="checkbox" checked={includeNumbers} onChange={() => setIncludeNumbers(!includeNumbers)} /> 123 Numbers
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
              <input type="checkbox" checked={includeSymbols} onChange={() => setIncludeSymbols(!includeSymbols)} /> !@# Symbols
            </label>
          </div>
        </div>
      </div>

      {/* ──── Section 2: Real-time Hash Generator ──── */}
      <div style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-main)' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <Hash size={18} color="var(--purple)" /> Cryptographic Hash Generator
        </h3>

        <div className="control-group" style={{ marginBottom: '1.15rem' }}>
          <label className="control-label">Input Text to Hash</label>
          <input className="form-input" value={inputText} onChange={e => setInputText(e.target.value)} placeholder="Type text to generate hashes..." />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* SHA-256 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-tertiary)' }}>SHA-256 Hash</span>
              <button className="btn btn-secondary btn-sm" onClick={() => copyHash(hashes.sha256, 'sha256')}>
                {copiedHash === 'sha256' ? <Check size={12} color="var(--green)" /> : <Copy size={12} />} Copy
              </button>
            </div>
            <div style={{ background: 'var(--bg-elevated)', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-main)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', wordBreak: 'break-all' }}>
              {hashes.sha256 || '...'}
            </div>
          </div>

          {/* SHA-512 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-tertiary)' }}>SHA-512 Hash</span>
              <button className="btn btn-secondary btn-sm" onClick={() => copyHash(hashes.sha512, 'sha512')}>
                {copiedHash === 'sha512' ? <Check size={12} color="var(--green)" /> : <Copy size={12} />} Copy
              </button>
            </div>
            <div style={{ background: 'var(--bg-elevated)', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-main)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', wordBreak: 'break-all' }}>
              {hashes.sha512 || '...'}
            </div>
          </div>

          {/* SHA-1 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-tertiary)' }}>SHA-1 Hash</span>
              <button className="btn btn-secondary btn-sm" onClick={() => copyHash(hashes.sha1, 'sha1')}>
                {copiedHash === 'sha1' ? <Check size={12} color="var(--green)" /> : <Copy size={12} />} Copy
              </button>
            </div>
            <div style={{ background: 'var(--bg-elevated)', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-main)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', wordBreak: 'break-all' }}>
              {hashes.sha1 || '...'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
